import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "../notify/mail.service";
import { CreateServiceRequestDto } from "./dto/create-service-request.dto";

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  async create(dto: CreateServiceRequestDto) {
    const request = await this.prisma.serviceRequest.create({ data: dto });

    if (dto.customerEmail) {
      void this.mailService.send({
        to: dto.customerEmail,
        subject: "BC Store — request received",
        text: `Hi ${dto.customerName}, we've received your request. A specialist will contact you within 24h.`
      });
    }

    return request;
  }
}
