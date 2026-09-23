import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { RepairModule } from "./modules/repair/repair.module";
import { ServicesModule } from "./modules/services/services.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { CartModule } from "./modules/cart/cart.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { NotifyModule } from "./modules/notify/notify.module";
import { OrdersModule } from "./modules/orders/orders.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // DISABLE_RATE_LIMIT is only set by the automated browser tests, which log in many times a minute.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 30 }],
      skipIf: () => process.env.DISABLE_RATE_LIMIT === "true"
    }),
    PrismaModule,
    NotifyModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    RepairModule,
    ServicesModule,
    NotificationsModule,
    PaymentsModule,
    DashboardModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
