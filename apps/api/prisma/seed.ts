import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as bcrypt from "bcrypt";
import { Category, PrismaClient, Role } from "@prisma/client";

function loadLocalEnv() {
  const envPath = resolve(__dirname, "../.env");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1).replace(/^"|"$/g, "");
    process.env[key] ??= value;
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 10);
  const techPassword = await bcrypt.hash(process.env.TECH_PASSWORD ?? "ChangeMe123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@bcstore.cm" },
    update: { password: adminPassword },
    create: {
      id: "admin-001",
      email: "admin@bcstore.cm",
      password: adminPassword,
      name: "BC Admin",
      phone: "+237650000000",
      role: Role.ADMIN
    }
  });

  await prisma.user.upsert({
    where: { email: "tech-a@bcstore.cm" },
    update: { password: techPassword },
    create: {
      id: "tech-001",
      email: "tech-a@bcstore.cm",
      password: techPassword,
      name: "Technicien A",
      phone: "+237650000001",
      role: Role.TECHNICIAN
    }
  });

  await prisma.user.upsert({
    where: { email: "tech-b@bcstore.cm" },
    update: { password: techPassword },
    create: {
      id: "tech-002",
      email: "tech-b@bcstore.cm",
      password: techPassword,
      name: "Technicien B",
      phone: "+237650000002",
      role: Role.TECHNICIAN
    }
  });

  const products = [
    {
      name: "Casque Neon Pro",
      slug: "casque-neon-pro",
      category: Category.CASQUE,
      price: 45000,
      stock: 12,
      description: "Audio Bluetooth, réduction de bruit et autonomie longue durée."
    },
    {
      name: "Chargeur USB-C 65W",
      slug: "chargeur-usb-c-65w",
      category: Category.CHARGEUR,
      price: 18000,
      stock: 24,
      description: "Charge rapide pour téléphone, tablette et ordinateur compatible."
    },
    {
      name: "Powerbank 20 000 mAh",
      slug: "powerbank-20000-mah",
      category: Category.POWERBANK,
      price: 26000,
      stock: 7,
      description: "Batterie externe robuste avec double sortie USB."
    },
    {
      name: "Smartphone Android X",
      slug: "smartphone-android-x",
      category: Category.TELEPHONE,
      price: 145000,
      stock: 4,
      description: "Écran haute définition, double SIM, excellente autonomie."
    },
    {
      name: "Laptop Business 14",
      slug: "laptop-business-14",
      category: Category.ORDINATEUR,
      price: 320000,
      stock: 0,
      description: "Ordinateur fiable pour bureau, études et télétravail."
    },
    {
      name: "Écouteurs Air Mini",
      slug: "ecouteurs-air-mini",
      category: Category.ECOUTEUR,
      price: 22000,
      stock: 16,
      description: "Écouteurs compacts avec boîtier de charge rapide."
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: {
        ...product,
        images: [`/products/${product.slug}.png`]
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
