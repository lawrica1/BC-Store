import { Injectable, NotFoundException, OnModuleDestroy } from "@nestjs/common";
import { Category, Prisma } from "@prisma/client";
import Redis from "ioredis";
import { PrismaService } from "../../prisma/prisma.service";
import type { CreateProductDto, UpdateProductDto } from "./dto/create-product.dto";

@Injectable()
export class ProductsService implements OnModuleDestroy {
  private readonly redis: Redis | null;

  constructor(private readonly prisma: PrismaService) {
    this.redis = process.env.REDIS_URL
      ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 })
      : null;
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }

  async findMany({ category, search, page }: { category?: string; search?: string; page: number }) {
    const safePage = Number.isFinite(page) && page >= 1 ? page : 1;
    const cacheKey = `products:${category ?? "all"}:${search ?? "none"}:${safePage}`;

    const cached = await this.redis?.get(cacheKey).catch(() => null);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Corrupted cache — fall through to DB query
      }
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && Object.values(Category).includes(category as Category) ? { category: category as Category } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
    };

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: Math.max(safePage - 1, 0) * 24,
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

  findAllForAdmin() {
    return this.prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(dto: CreateProductDto) {
    const slug = await this.generateUniqueSlug(dto.name);
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        category: dto.category,
        price: dto.price,
        stock: dto.stock,
        description: dto.description ?? null,
        images: dto.images ?? [],
        isActive: dto.isActive ?? true
      }
    });
    await this.invalidateCache();
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Product not found.");
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {})
      }
    });
    await this.invalidateCache();
    return product;
  }

  async deactivate(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Product not found.");
    }

    const product = await this.prisma.product.update({ where: { id }, data: { isActive: false } });
    await this.invalidateCache();
    return product;
  }

  private async generateUniqueSlug(name: string) {
    const base =
      name
        .normalize("NFD")
        .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "produit";

    const existing = await this.prisma.product.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true }
    });
    const slugSet = new Set(existing.map((p) => p.slug));

    if (!slugSet.has(base)) return base;

    let suffix = 2;
    while (slugSet.has(`${base}-${suffix}`)) {
      suffix += 1;
    }
    return `${base}-${suffix}`;
  }

  private async invalidateCache() {
    if (!this.redis) return;
    try {
      let cursor = "0";
      const keysToDelete: string[] = [];
      do {
        const [nextCursor, keys] = await this.redis.scan(cursor, "MATCH", "products:*", "COUNT", 100);
        cursor = nextCursor;
        keysToDelete.push(...keys);
      } while (cursor !== "0");
      if (keysToDelete.length) {
        await this.redis.del(...keysToDelete);
      }
    } catch {
      // Best-effort: stale cache entries expire on their own within the 5-minute TTL.
    }
  }
}
