import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt-auth.guard";
import { CartService } from "./cart.service";
import { CheckoutDto } from "./dto/checkout.dto";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Guests can check out; a logged-in customer's order is linked to their account.
  @Post("checkout")
  @UseGuards(OptionalJwtAuthGuard)
  checkout(@Body() dto: CheckoutDto, @Req() request: { user: { userId: string } | null }): ReturnType<CartService["checkout"]> {
    return this.cartService.checkout(dto, request.user?.userId);
  }
}
