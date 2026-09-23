import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AdminGuard, AdminOrTechnicianGuard } from "../../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AssignTicketDto } from "./dto/assign-ticket.dto";
import { CreateRepairTicketDto } from "./dto/create-repair-ticket.dto";
import { RepairService } from "./repair.service";

@Controller("repair/tickets")
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  create(@Body() dto: CreateRepairTicketDto) {
    return this.repairService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminOrTechnicianGuard)
  findMany(
    @Req() request: { user: { userId: string; role: string } },
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string
  ) {
    const parsedPage = page !== undefined ? Number(page) : undefined;
    const parsedPageSize = pageSize !== undefined ? Number(pageSize) : undefined;
    if ((parsedPage !== undefined && !Number.isFinite(parsedPage)) || (parsedPageSize !== undefined && !Number.isFinite(parsedPageSize))) {
      throw new BadRequestException("page and pageSize must be numbers.");
    }

    // Technicians only see the tickets assigned to them; admins see everything.
    const assignedTo = request.user.role === "TECHNICIAN" ? request.user.userId : undefined;
    return this.repairService.findMany({ page: parsedPage, pageSize: parsedPageSize, assignedTo });
  }

  @Patch(":id/assign")
  @UseGuards(JwtAuthGuard, AdminGuard)
  assign(@Param("id") id: string, @Body() dto: AssignTicketDto) {
    return this.repairService.assign(id, dto.technicianId, dto.transportFee);
  }
}
