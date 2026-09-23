import { Test } from "@nestjs/testing";
import { PrismaService } from "../../prisma/prisma.service";
import { ProductsService } from "./products.service";

describe("ProductsService", () => {
  let service: ProductsService;
  let create: jest.Mock;
  let findMany: jest.Mock;

  beforeEach(async () => {
    create = jest.fn((args) => ({ id: "prod-1", ...args.data }));
    findMany = jest.fn().mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: { product: { create, findMany } }
        }
      ]
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it("slugifies the product name", async () => {
    const product = await service.create({
      name: "Casque Néon Pro",
      category: "CASQUE",
      price: 45000,
      stock: 12
    });

    expect(product.slug).toBe("casque-neon-pro");
  });

  it("appends a numeric suffix when the slug already exists", async () => {
    findMany.mockResolvedValueOnce([{ slug: "casque-neon-pro" }]);

    const product = await service.create({
      name: "Casque Néon Pro",
      category: "CASQUE",
      price: 45000,
      stock: 12
    });

    expect(product.slug).toBe("casque-neon-pro-2");
  });

  it("defaults isActive to true and images to an empty array", async () => {
    const product = await service.create({
      name: "Chargeur",
      category: "CHARGEUR",
      price: 18000,
      stock: 24
    });

    expect(product.isActive).toBe(true);
    expect(product.images).toEqual([]);
  });
});
