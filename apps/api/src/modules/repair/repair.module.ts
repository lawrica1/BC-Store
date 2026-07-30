import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { RepairController } from "./repair.controller";
import { RepairService } from "./repair.service";

@Module({
  imports: [NotificationsModule, AuthModule],
  controllers: [RepairController],
  providers: [RepairService]
})
export class RepairModule {}
