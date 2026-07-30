import { Module } from "@nestjs/common";
import { PaymentsModule } from "../payments/payments.module";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [PaymentsModule],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
