import { Injectable, NotFoundException } from "@nestjs/common";
import { Category, Prisma } from "@prisma/client";
import Redis from "ioredis";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ProductsService {
  private readonly redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 })
    : null;

  constructor(private readonly prisma: PrismaService) {}

  async findMany({ category, search, page }: { category?: string; search?: string; page: number }) {
    const cacheKey = `products:${category ?? "all"}:${search ?? "none"}:${page}`;
    const cachedProducts = await this.redis?.get(cacheKey).catch(() => null);
    if (cachedProducts) {
      return JSON.parse(cachedProducts);
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && Object.values(Category).includes(category as Category) ? { category: category as Category } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
    };

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: Math.max(page - 1, 0) * 24,
      take: 24
    });

    await this.redis?.set(cacheKey, JSON.stringify(products), "EX", 300).catch(() => undefined);
    return products;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product || !product.isActive) {
      throw new NotFoundException("Product not found.");
    }
    return product;
  }
}
