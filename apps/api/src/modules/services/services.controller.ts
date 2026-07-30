import { Body, Controller, Post } from "@nestjs/common";
import { CreateServiceRequestDto } from "./dto/create-service-request.dto";
import { ServicesService } from "./services.service";

@Controller("services/requests")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceRequestDto) {
    return this.servicesService.create(dto);
  }
}
