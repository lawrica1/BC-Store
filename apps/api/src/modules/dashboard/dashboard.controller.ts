import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";

@Controller("admin/dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  getStats() {
    return this.dashboardService.getStats();
  }
}
