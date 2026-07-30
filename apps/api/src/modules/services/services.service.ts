import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateServiceRequestDto } from "./dto/create-service-request.dto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateServiceRequestDto) {
    return this.prisma.serviceRequest.create({ data: dto });
  }
}
