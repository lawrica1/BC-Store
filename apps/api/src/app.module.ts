import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { RepairModule } from "./modules/repair/repair.module";
import { ServicesModule } from "./modules/services/services.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { CartModule } from "./modules/cart/cart.module";
import { PaymentsModule } from "./modules/payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    RepairModule,
    ServicesModule,
    NotificationsModule,
    PaymentsModule
  ]
})
export class AppModule {}
