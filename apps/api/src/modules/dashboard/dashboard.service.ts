import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      productStats,
      categoryBreakdown,
      lowStockProducts,
      clients,
      orderStats,
      recentOrders
    ] = await Promise.all([
      this.getProductStats(),
      this.getCategoryBreakdown(),
      this.getLowStockProducts(),
      this.getUniqueClients(),
      this.getOrderStats(),
      this.getRecentOrders()
    ]);

    return {
      products: {
        ...productStats,
        byCategory: categoryBreakdown,
        lowStock: lowStockProducts
      },
      clients,
      orders: {
        ...orderStats,
        recent: recentOrders
      }
    };
  }

  private async getProductStats() {
    const [total, active, inactive, lowStockCount, stockValue] =
      await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.product.count({ where: { isActive: false } }),
        this.prisma.product.count({
          where: { isActive: true, stock: { lte: 5 } }
        }),
        this.prisma.product.aggregate({
          _sum: { stock: true },
          where: { isActive: true }
        })
      ]);

    return {
      total,
      active,
      inactive,
      lowStockCount,
      totalStock: stockValue._sum.stock ?? 0
    };
  }

  private async getCategoryBreakdown() {
    const groups = await this.prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { isActive: true }
    });

    return groups.map((g) => ({ category: g.category, count: g._count.id }));
  }

  private async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      select: { id: true, name: true, stock: true, category: true },
      orderBy: { stock: "asc" },
      take: 10
    });
  }

  private async getUniqueClients() {
    const [orderClients, ticketClients, serviceClients] = await Promise.all([
      this.prisma.order.findMany({
        select: {
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.repairTicket.findMany({
        select: {
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.serviceRequest.findMany({
        select: {
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const clientMap = new Map<
      string,
      {
        name: string;
        phone: string;
        email: string | null;
        lastSeen: Date;
        orders: number;
        tickets: number;
        serviceRequests: number;
      }
    >();

    for (const c of orderClients) {
      const key = c.customerPhone;
      const existing = clientMap.get(key);
      if (existing) {
        existing.orders++;
        if (c.createdAt > existing.lastSeen) {
          existing.lastSeen = c.createdAt;
          existing.name = c.customerName;
        }
      } else {
        clientMap.set(key, {
          name: c.customerName,
          phone: c.customerPhone,
          email: c.customerEmail,
          lastSeen: c.createdAt,
          orders: 1,
          tickets: 0,
          serviceRequests: 0
        });
      }
    }

    for (const c of ticketClients) {
      const key = c.customerPhone;
      const existing = clientMap.get(key);
      if (existing) {
        existing.tickets++;
        if (c.createdAt > existing.lastSeen) {
          existing.lastSeen = c.createdAt;
          existing.name = c.customerName;
        }
      } else {
        clientMap.set(key, {
          name: c.customerName,
          phone: c.customerPhone,
          email: c.customerEmail,
          lastSeen: c.createdAt,
          orders: 0,
          tickets: 1,
          serviceRequests: 0
        });
      }
    }

    for (const c of serviceClients) {
      const key = c.customerPhone;
      const existing = clientMap.get(key);
      if (existing) {
        existing.serviceRequests++;
        if (c.createdAt > existing.lastSeen) {
          existing.lastSeen = c.createdAt;
          existing.name = c.customerName;
        }
      } else {
        clientMap.set(key, {
          name: c.customerName,
          phone: c.customerPhone,
          email: c.customerEmail,
          lastSeen: c.createdAt,
          orders: 0,
          tickets: 0,
          serviceRequests: 1
        });
      }
    }

    const allClients = [...clientMap.values()].sort(
      (a, b) => b.lastSeen.getTime() - a.lastSeen.getTime()
    );

    return {
      total: allClients.length,
      recent: allClients.slice(0, 10),
      all: allClients
    };
  }

  private async getOrderStats() {
    const [totalOrders, paidOrders, revenueResult] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: "PAID" } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "PAID" }
      })
    ]);

    return {
      totalOrders,
      paidOrders,
      revenue: revenueResult._sum.total?.toString() ?? "0"
    };
  }

  private async getRecentOrders() {
    return this.prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        total: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });
  }
}
