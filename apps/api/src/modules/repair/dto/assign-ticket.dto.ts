import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class AssignTicketDto {
  @IsString()
  @IsNotEmpty()
  technicianId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportFee?: number;
}
