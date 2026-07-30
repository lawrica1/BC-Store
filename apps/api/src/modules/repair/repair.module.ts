import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { RepairController } from "./repair.controller";
import { RepairService } from "./repair.service";

@Module({
  imports: [NotificationsModule],
  controllers: [RepairController],
  providers: [RepairService]
})
export class RepairModule {}
