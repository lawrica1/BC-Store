import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TicketStatus } from "@prisma/client";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { MailService } from "../notify/mail.service";
import { SmsService } from "../notify/sms.service";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRepairTicketDto, RepairServiceType } from "./dto/create-repair-ticket.dto";

@Injectable()
export class RepairService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly mailService: MailService,
    private readonly smsService: SmsService
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
        visitDate: dto.serviceType === RepairServiceType.AT_HOME ? new Date(dto.visitDate!) : null,
        transportZone: dto.serviceType === RepairServiceType.AT_HOME ? (dto.transportZone ?? "UNKNOWN") : null,
        // The client computes this estimate from on-device geolocation we can't verify server-side, so it is
        // informational only (the technician sets the real `transportFee` at assignment time) — but the NEAR
        // zone is defined as free, so a mismatched client value for it is always clamped to 0.
        estimatedTransportFee:
          dto.serviceType === RepairServiceType.AT_HOME ? (dto.transportZone === "NEAR" ? 0 : (dto.transportFee ?? null)) : null,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail
      }
    });

    this.notificationsGateway.emitTicketCreated(ticket);
    if (dto.serviceType === RepairServiceType.AT_HOME) {
      this.notificationsGateway.emitNewHomeVisit(ticket);

      const opsPhone = process.env.OPS_ALERT_PHONE;
      if (opsPhone) {
        void this.smsService.send(
          opsPhone,
          `New home-visit ticket ${ticket.ticketNumber}: ${ticket.brand} ${ticket.model} for ${ticket.customerName} (${ticket.customerPhone}).`
        );
      }
    }

    if (dto.customerEmail) {
      void this.mailService.send({
        to: dto.customerEmail,
        subject: `BC Store — ticket ${ticket.ticketNumber} received`,
        text: `Hi ${ticket.customerName}, we've received your repair request (${ticket.ticketNumber}) for your ${ticket.brand} ${ticket.model}. A specialist will contact you within 24h.`
      });
    }

    return ticket;
  }

  async findMany({ page = 1, pageSize = 50, assignedTo }: { page?: number; pageSize?: number; assignedTo?: string } = {}) {
    const take = Math.min(Math.max(pageSize, 1), 100);
    const skip = Math.max(page - 1, 0) * take;
    const where = assignedTo ? { assignedTo } : {};

    const [tickets, total] = await Promise.all([
      this.prisma.repairTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { assignedUser: true },
        skip,
        take
      }),
      this.prisma.repairTicket.count({ where })
    ]);

    return { tickets, total, page: Math.max(page, 1), pageSize: take };
  }

  async assign(id: string, technicianId: string, transportFee?: number) {
    const ticket = await this.prisma.repairTicket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException("Ticket not found.");
    }

    if (ticket.status === TicketStatus.COMPLETED || ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException(`Cannot reassign a ticket that is already ${ticket.status}.`);
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
