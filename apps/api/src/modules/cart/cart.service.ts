import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { MomoService } from "../payments/momo.service";
import { OrangeMoneyService } from "../payments/orange-money.service";
import { StripeService } from "../payments/stripe.service";
import { CheckoutDto, PaymentMethod } from "./dto/checkout.dto";

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly orangeMoneyService: OrangeMoneyService,
    private readonly momoService: MomoService
  ) {}

  async checkout(dto: CheckoutDto, userId?: string) {
    const quantityByProductId = new Map<string, number>();
    for (const item of dto.items) {
      quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) ?? 0) + item.quantity);
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: [...quantityByProductId.keys()] } }
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    for (const [productId, quantity] of quantityByProductId) {
      const product = productById.get(productId);
      if (!product || !product.isActive) {
        throw new BadRequestException(`Product ${productId} is not available.`);
      }
      if (product.stock < quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}.`);
      }
    }

    const total =
      dto.items.reduce((sum, item) => sum + Number(productById.get(item.productId)!.price) * item.quantity, 0) +
      (dto.deliveryFee ?? 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          deliveryAddress: dto.deliveryAddress,
          deliveryMethod: dto.deliveryMethod,
          deliveryFee: dto.deliveryFee ?? 0,
          total,
          paymentMethod: dto.paymentMethod,
          paymentReceiverPhone: dto.paymentReceiverPhone,
          userId,
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productById.get(item.productId)!.price
            }))
          }
        }
      });

      // Guarded decrement: only applies if stock is still sufficient at commit time, closing the
      // check-then-decrement race between the pre-transaction validation above and this update.
      for (const [productId, quantity] of quantityByProductId) {
        const result = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } }
        });
        if (result.count === 0) {
          throw new BadRequestException(`Insufficient stock for product ${productId}.`);
        }
      }

      return created;
    });

    if (dto.paymentMethod === PaymentMethod.CARD) {
      const intent = await this.stripeService.createPaymentIntent(total, "xaf", { orderNumber: order.orderNumber });
      const updated = await this.prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: intent.id, stripeClientSecret: intent.clientSecret }
      });
      return this.toResult(updated);
    }

    if (dto.paymentMethod === PaymentMethod.ORANGE_MONEY) {
      const payment = await this.orangeMoneyService.createPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: total
      });
      const updated = await this.prisma.order.update({
        where: { id: order.id },
        data: { providerReference: payment.payToken, paymentUrl: payment.paymentUrl }
      });
      return this.toResult(updated);
    }

    const momoPayment = await this.momoService.requestToPay({
      orderNumber: order.orderNumber,
      amount: total,
      payerPhone: dto.paymentReceiverPhone
    });
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { providerReference: momoPayment.referenceId }
    });
    return this.toResult(updated);
  }

  private toResult(order: {
    orderNumber: string;
    status: string;
    total: { toString(): string };
    paymentReceiverPhone: string;
    stripeClientSecret: string | null;
    paymentUrl: string | null;
    providerReference: string | null;
  }) {
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      paymentReceiverPhone: order.paymentReceiverPhone,
      stripeClientSecret: order.stripeClientSecret ?? undefined,
      paymentUrl: order.paymentUrl ?? undefined,
      momoReferenceId: order.providerReference ?? undefined
    };
  }
}
