import { IsDateString, IsEmail, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from "class-validator";

export enum RepairServiceType {
  IN_STORE = "IN_STORE",
  AT_HOME = "AT_HOME"
}

export class CreateRepairTicketDto {
  @IsString()
  @IsNotEmpty()
  deviceType!: string;

  @IsString()
  @IsNotEmpty()
  brand!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsNotEmpty()
  faultDesc!: string;

  @IsEnum(RepairServiceType)
  serviceType!: RepairServiceType;

  @ValidateIf((dto: CreateRepairTicketDto) => dto.serviceType === RepairServiceType.AT_HOME)
  @IsString()
  @IsNotEmpty()
  homeAddress?: string;

  @IsDateString()
  visitDate!: string;

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ValidateIf((dto: CreateRepairTicketDto) => dto.serviceType === RepairServiceType.AT_HOME)
  @IsIn(["NEAR", "FAR", "UNKNOWN"])
  transportZone?: string;

  @ValidateIf((dto: CreateRepairTicketDto) => dto.serviceType === RepairServiceType.AT_HOME)
  @IsNumber()
  @Min(0)
  transportFee?: number;
}
