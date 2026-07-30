import type { ProductCategory } from "@bc-store/shared-types";
import type { Locale } from "@/lib/i18n";

export interface ProductViewModel {
  id: string;
  name: Record<Locale, string>;
  slug: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  image: string;
  brand: string;
  rating: number;
  description: Record<Locale, string>;
  specs: Record<Locale, string[]>;
}

export const products: ProductViewModel[] = [
  {
    id: "prod-casque-pro",
    name: { fr: "Casque Neon Pro", en: "Neon Pro Headphones" },
    slug: "casque-neon-pro",
    category: "CASQUE",
    price: 45000,
    originalPrice: 53000,
    stock: 12,
    image: "/products/casque-neon-pro.png",
    brand: "BC Audio",
    rating: 4.8,
    description: {
      fr: "Audio Bluetooth, réduction de bruit et autonomie longue durée.",
      en: "Bluetooth audio, noise reduction, and long battery life."
    },
    specs: {
      fr: ["Bluetooth 5.3", "Autonomie 32h", "Réduction de bruit active"],
      en: ["Bluetooth 5.3", "32h battery life", "Active noise reduction"]
    }
  },
  {
    id: "prod-chargeur-usbc",
    name: { fr: "Chargeur USB-C 65W", en: "65W USB-C Charger" },
    slug: "chargeur-usb-c-65w",
    category: "CHARGEUR",
    price: 18000,
    stock: 24,
    image: "/products/chargeur-usb-c.png",
    brand: "Voltix",
    rating: 4.6,
    description: {
      fr: "Charge rapide pour téléphone, tablette et ordinateur compatible.",
      en: "Fast charging for compatible phones, tablets, and computers."
    },
    specs: {
      fr: ["USB-C Power Delivery", "Protection surtension", "Format compact"],
      en: ["USB-C Power Delivery", "Overvoltage protection", "Compact body"]
    }
  },
  {
    id: "prod-powerbank",
    name: { fr: "Powerbank 20 000 mAh", en: "20,000 mAh Power Bank" },
    slug: "powerbank-20000-mah",
    category: "POWERBANK",
    price: 26000,
    originalPrice: 30000,
    stock: 7,
    image: "/products/powerbank.png",
    brand: "Voltix",
    rating: 4.7,
    description: {
      fr: "Batterie externe robuste avec double sortie USB.",
      en: "Durable external battery with dual USB output."
    },
    specs: {
      fr: ["20 000 mAh", "Double sortie USB", "Affichage LED"],
      en: ["20,000 mAh", "Dual USB output", "LED display"]
    }
  },
  {
    id: "prod-phone",
    name: { fr: "Smartphone Android X", en: "Android Smartphone X" },
    slug: "smartphone-android-x",
    category: "TELEPHONE",
    price: 145000,
    stock: 4,
    image: "/products/smartphone-android-x.png",
    brand: "AndroMax",
    rating: 4.5,
    description: {
      fr: "Écran haute définition, double SIM, excellente autonomie.",
      en: "High-definition display, dual SIM, and excellent battery life."
    },
    specs: {
      fr: ["128 Go stockage", "Double SIM", "Batterie 5000 mAh"],
      en: ["128 GB storage", "Dual SIM", "5000 mAh battery"]
    }
  },
  {
    id: "prod-laptop",
    name: { fr: "Laptop Business 14", en: "Business Laptop 14" },
    slug: "laptop-business-14",
    category: "ORDINATEUR",
    price: 320000,
    stock: 0,
    image: "/products/laptop-business-14.png",
    brand: "BC Computing",
    rating: 4.4,
    description: {
      fr: "Ordinateur fiable pour bureau, études et télétravail.",
      en: "Reliable computer for office work, studies, and remote work."
    },
    specs: {
      fr: ["Écran 14 pouces", "SSD 512 Go", "8 Go RAM"],
      en: ["14-inch display", "512 GB SSD", "8 GB RAM"]
    }
  },
  {
    id: "prod-ecouteurs",
    name: { fr: "Écouteurs Air Mini", en: "Air Mini Earbuds" },
    slug: "ecouteurs-air-mini",
    category: "ECOUTEUR",
    price: 22000,
    stock: 16,
    image: "/products/ecouteurs-air-mini.png",
    brand: "BC Audio",
    rating: 4.3,
    description: {
      fr: "Écouteurs compacts avec boîtier de charge rapide.",
      en: "Compact earbuds with a fast-charging case."
    },
    specs: {
      fr: ["Boîtier de charge", "Micro intégré", "Résistance aux éclaboussures"],
      en: ["Charging case", "Built-in microphone", "Splash resistant"]
    }
  }
];

export function findProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
