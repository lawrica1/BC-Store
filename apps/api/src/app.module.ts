import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./modules/products/products.module";
import { RepairModule } from "./modules/repair/repair.module";
import { ServicesModule } from "./modules/services/services.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { CartModule } from "./modules/cart/cart.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductsModule,
    CartModule,
    RepairModule,
    ServicesModule,
    NotificationsModule
  ]
})
export class AppModule {}
