import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TicketStatus } from "@prisma/client";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRepairTicketDto, RepairServiceType } from "./dto/create-repair-ticket.dto";

@Injectable()
export class RepairService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  async create(dto: CreateRepairTicketDto) {
    if (dto.serviceType === RepairServiceType.IN_STORE && dto.homeAddress) {
      throw new BadRequestException("homeAddress must be null for in-store tickets.");
    }

    if (dto.serviceType === RepairServiceType.AT_HOME && !dto.homeAddress) {
      throw new BadRequestException("homeAddress is required for at-home tickets.");
    }

    const ticket = await this.prisma.repairTicket.create({
      data: {
        deviceType: dto.deviceType,
        brand: dto.brand,
        model: dto.model,
        faultDesc: dto.faultDesc,
        serviceType: dto.serviceType,
        storeAddress: dto.serviceType === RepairServiceType.IN_STORE ? "BC Store Douala" : null,
        homeAddress: dto.serviceType === RepairServiceType.AT_HOME ? dto.homeAddress : null,
        visitDate: new Date(dto.visitDate),
        transportZone: dto.serviceType === RepairServiceType.AT_HOME ? (dto.transportZone ?? "UNKNOWN") : null,
        estimatedTransportFee: dto.serviceType === RepairServiceType.AT_HOME ? (dto.transportFee ?? null) : null,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail
      }
    });

    this.notificationsGateway.emitTicketCreated(ticket);
    if (dto.serviceType === RepairServiceType.AT_HOME) {
      this.notificationsGateway.emitNewHomeVisit(ticket);
    }

    return ticket;
  }

  findMany() {
    return this.prisma.repairTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: { assignedUser: true }
    });
  }

  async assign(id: string, technicianId: string, transportFee?: number) {
    const ticket = await this.prisma.repairTicket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    const updated = await this.prisma.repairTicket.update({
      where: { id },
      data: {
        assignedTo: technicianId,
        status: TicketStatus.ASSIGNED,
        ...(transportFee !== undefined ? { transportFee } : {})
      }
    });

    this.notificationsGateway.emitTicketUpdated(updated);
    return updated;
  }
}
