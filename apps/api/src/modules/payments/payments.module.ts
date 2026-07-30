import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { MomoService } from "./momo.service";
import { OrangeMoneyService } from "./orange-money.service";
import { PaymentsController } from "./payments.controller";
import { StripeService } from "./stripe.service";

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [StripeService, OrangeMoneyService, MomoService],
  exports: [StripeService, OrangeMoneyService, MomoService]
})
export class PaymentsModule {}
