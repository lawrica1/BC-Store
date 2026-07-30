import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findMany(@Query("category") category?: string, @Query("search") search?: string, @Query("page") page = "1") {
    return this.productsService.findMany({ category, search, page: Number(page) });
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
