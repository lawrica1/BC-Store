import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateIf, ValidateNested } from "class-validator";

export enum PaymentMethod {
  CARD = "CARD",
  MOBILE_MONEY = "MOBILE_MONEY",
  ORANGE_MONEY = "ORANGE_MONEY"
}

export enum DeliveryMethod {
  PICKUP = "PICKUP",
  DELIVERY = "DELIVERY"
}

class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @IsEnum(DeliveryMethod)
  deliveryMethod!: DeliveryMethod;

  @ValidateIf((dto: CheckoutDto) => dto.deliveryMethod === DeliveryMethod.DELIVERY)
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  paymentReceiverPhone!: string;
}
