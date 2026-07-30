import { Injectable } from "@nestjs/common";
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

  async checkout(dto: CheckoutDto) {
    const total = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (dto.deliveryFee ?? 0);

    const order = await this.prisma.order.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        deliveryAddress: dto.deliveryAddress,
        deliveryMethod: dto.deliveryMethod,
        deliveryFee: dto.deliveryFee ?? 0,
        total,
        paymentMethod: dto.paymentMethod,
        paymentReceiverPhone: dto.paymentReceiverPhone,
        items: {
          create: dto.items.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price }))
        }
      }
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
    total: number;
    paymentReceiverPhone: string;
    stripeClientSecret: string | null;
    paymentUrl: string | null;
    providerReference: string | null;
  }) {
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      paymentReceiverPhone: order.paymentReceiverPhone,
      stripeClientSecret: order.stripeClientSecret ?? undefined,
      paymentUrl: order.paymentUrl ?? undefined,
      momoReferenceId: order.providerReference ?? undefined
    };
  }
}
