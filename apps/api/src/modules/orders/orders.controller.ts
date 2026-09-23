import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("orders")
export class OrdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  async mine(@Req() request: { user: { userId: string } }) {
    const orders = await this.prisma.order.findMany({
      where: { userId: request.user.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { items: { include: { product: { select: { name: true } } } } }
    });

    return orders.map((order) => ({
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      deliveryMethod: order.deliveryMethod,
      deliveryAddress: order.deliveryAddress,
      customerName: order.customerName,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: Number(item.price)
      }))
    }));
  }
}
