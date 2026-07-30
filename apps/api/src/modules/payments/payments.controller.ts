import { BadRequestException, Body, Controller, Get, Headers, NotFoundException, Param, Post, RawBodyRequest, Req } from "@nestjs/common";
import type { Request } from "express";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { MomoService } from "./momo.service";
import { StripeService } from "./stripe.service";

@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly momoService: MomoService,
    private readonly notificationsGateway: NotificationsGateway
  ) {}

  @Get("order/:orderNumber")
  async orderStatus(@Param("orderNumber") orderNumber: string) {
    const order = await this.prisma.order.findFirst({ where: { orderNumber } });
    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return { orderNumber: order.orderNumber, status: order.status };
  }

  @Post("stripe/webhook")
  async stripeWebhook(@Req() request: RawBodyRequest<Request>, @Headers("stripe-signature") signature: string) {
    if (!request.rawBody) {
      throw new BadRequestException("Missing raw body for Stripe webhook.");
    }

    const event = this.stripeService.constructEvent(request.rawBody, signature);

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as { id: string };
      const order = await this.prisma.order.findFirst({ where: { stripePaymentIntentId: intent.id } });
      if (order) {
        const updated = await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.PAID } });
        this.notificationsGateway.emitOrderUpdated(updated);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as { id: string };
      const order = await this.prisma.order.findFirst({ where: { stripePaymentIntentId: intent.id } });
      if (order) {
        const updated = await this.prisma.order.update({ where: { id: order.id }, data: { status: OrderStatus.FAILED } });
        this.notificationsGateway.emitOrderUpdated(updated);
      }
    }

    return { received: true };
  }

  @Post("orange/callback")
  async orangeCallback(@Body() body: { order_id?: string; status?: string }) {
    const order = await this.prisma.order.findFirst({ where: { orderNumber: body.order_id } });
    if (!order) {
      return { received: true };
    }

    const status = body.status === "SUCCESS" ? OrderStatus.PAID : OrderStatus.FAILED;
    const updated = await this.prisma.order.update({ where: { id: order.id }, data: { status } });
    this.notificationsGateway.emitOrderUpdated(updated);
    return { received: true };
  }

  @Post("momo/callback")
  async momoCallback(@Body() body: { referenceId?: string }) {
    if (!body.referenceId) {
      return { received: true };
    }

    const order = await this.prisma.order.findFirst({ where: { providerReference: body.referenceId } });
    if (!order) {
      return { received: true };
    }

    const momoStatus = await this.momoService.getStatus(body.referenceId);
    const status = momoStatus.status === "SUCCESSFUL" ? OrderStatus.PAID : momoStatus.status === "FAILED" ? OrderStatus.FAILED : OrderStatus.PENDING_PAYMENT;
    const updated = await this.prisma.order.update({ where: { id: order.id }, data: { status } });
    this.notificationsGateway.emitOrderUpdated(updated);
    return { received: true };
  }
}
