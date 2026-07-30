import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminOrTechnicianGuard } from "../../common/guards/roles.guard";
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
  @UseGuards(AdminOrTechnicianGuard)
  findMany() {
    return this.repairService.findMany();
  }

  @Patch(":id/assign")
  @UseGuards(AdminOrTechnicianGuard)
  assign(@Param("id") id: string, @Body() dto: AssignTicketDto) {
    return this.repairService.assign(id, dto.technicianId, dto.transportFee);
  }
}
