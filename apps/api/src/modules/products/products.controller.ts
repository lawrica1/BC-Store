import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { AdminGuard } from "../../common/guards/roles.guard";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProductDto, UpdateProductDto } from "./dto/create-product.dto";
import { ProductsService } from "./products.service";

const UPLOAD_DIR = join(process.cwd(), "uploads", "products");
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("admin/list")
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAllForAdmin() {
    return this.productsService.findAllForAdmin();
  }

  @Post("upload-image")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`)
      }),
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          callback(new BadRequestException("Only JPEG, PNG, WEBP or AVIF images are allowed."), false);
          return;
        }
        callback(null, true);
      }
    })
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded.");
    }

    const baseUrl = process.env.API_PUBLIC_URL ?? "http://localhost:4000";
    return { url: `${baseUrl}/uploads/products/${file.filename}` };
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  deactivate(@Param("id") id: string) {
    return this.productsService.deactivate(id);
  }

  @Get()
  findMany(@Query("category") category?: string, @Query("search") search?: string, @Query("page") page = "1") {
    const parsedPage = Number(page);
    return this.productsService.findMany({ category, search, page: Number.isFinite(parsedPage) ? parsedPage : 1 });
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
