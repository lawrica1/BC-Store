import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";

// Placeholder values shipped in .env.example — fine for local dev, never for a real deployment.
const KNOWN_DEV_SECRETS = ["change-me", "ChangeMe123!"];

function assertProductionSecretsAreRotated() {
  if (process.env.NODE_ENV !== "production") return;

  const insecure = ["JWT_SECRET", "ADMIN_PASSWORD", "TECH_PASSWORD"].filter((name) =>
    KNOWN_DEV_SECRETS.includes(process.env[name] ?? "")
  );
  if (insecure.length > 0) {
    throw new Error(
      `Refusing to start in production with placeholder value(s) still set for: ${insecure.join(", ")}. Set real secrets before deploying.`
    );
  }
}

async function bootstrap() {
  assertProductionSecretsAreRotated();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  // Uploaded product images are served from this API origin but embedded by the web app on another origin,
  // which helmet's default `same-origin` resource policy would block.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  const uploadsDir = join(process.cwd(), "uploads");
  mkdirSync(join(uploadsDir, "products"), { recursive: true });
  app.useStaticAssets(uploadsDir, { prefix: "/uploads" });

  const webOrigin = process.env.WEB_ORIGIN;
  if (!webOrigin) {
    console.warn("WARNING: WEB_ORIGIN is not set. CORS defaults to http://localhost:3000");
  }

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: webOrigin ?? "http://localhost:3000",
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

void bootstrap();
