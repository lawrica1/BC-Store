import { Injectable } from "@nestjs/common";
import { CheckoutDto } from "./dto/checkout.dto";

interface CheckoutResult {
  orderNumber: string;
  status: "PENDING_PAYMENT";
  paymentMethod: CheckoutDto["paymentMethod"];
  paymentReceiverPhone: string;
  total: number;
}

@Injectable()
export class CartService {
  checkout(dto: CheckoutDto): CheckoutResult {
    return {
      orderNumber: `BCO-${Date.now()}`,
      status: "PENDING_PAYMENT",
      paymentMethod: dto.paymentMethod,
      paymentReceiverPhone: dto.paymentReceiverPhone,
      total: dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (dto.deliveryFee ?? 0)
    };
  }
}
