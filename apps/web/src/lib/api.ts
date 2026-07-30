import type { ProductCategory, RepairTicketDto, UserRole } from "@bc-store/shared-types";
import type { ProductViewModel } from "@/lib/products";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const USE_API_PRODUCTS = import.meta.env.VITE_USE_API_PRODUCTS === "true";
const USE_API_CHECKOUT = import.meta.env.VITE_USE_API_CHECKOUT === "true";
export const PAYMENT_RECEIVER_PHONE = "659870906";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  stock: number;
  images: string[];
  description?: string | null;
  isActive: boolean;
}

interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface CreateRepairTicketPayload {
  deviceType: "TELEPHONE" | "ORDINATEUR" | "AUTRE";
  brand: string;
  model: string;
  faultDesc: string;
  serviceType: "IN_STORE" | "AT_HOME";
  homeAddress?: string | null;
  visitDate?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  transportZone?: "NEAR" | "FAR" | "UNKNOWN" | null;
  transportFee?: number | null;
}

export interface CreateServiceRequestPayload {
  serviceType: "CAMERA" | "ELECTRICITE" | "SONORISATION" | "AUTRE";
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number; price: number }>;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  deliveryFee: number;
  paymentMethod: "CARD" | "MOBILE_MONEY" | "ORANGE_MONEY";
  paymentReceiverPhone: string;
}

interface CheckoutResult {
  orderNumber: string;
  status: string;
  total: number;
  paymentReceiverPhone: string;
}

const REQUEST_TIMEOUT_MS = 8000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

function mapApiProduct(product: ApiProduct): ProductViewModel {
  return {
    id: product.id,
    name: { fr: product.name, en: product.name },
    slug: product.slug,
    category: product.category,
    price: product.price,
    stock: product.stock,
    image: product.images[0] ?? "",
    brand: "BC Store",
    rating: 4.6,
    description: {
      fr: product.description ?? "",
      en: product.description ?? ""
    },
    specs: {
      fr: ["Produit vérifié", "Garantie boutique", "Support BC Store"],
      en: ["Verified product", "Store warranty", "BC Store support"]
    }
  };
}

export function fetchProducts(category?: ProductCategory | "ALL") {
  if (import.meta.env.DEV && !USE_API_PRODUCTS) {
    return Promise.resolve([]);
  }

  const query = category && category !== "ALL" ? `?category=${category}` : "";
  return request<ApiProduct[]>(`/products${query}`)
    .then((items) => items.map(mapApiProduct))
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.info("Using local product data because the API is unavailable.", error);
      }
      return [];
    });
}

export function createRepairTicket(payload: CreateRepairTicketPayload) {
  return request<RepairTicketDto>("/repair/tickets", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchRepairTickets(role: UserRole) {
  return request<RepairTicketDto[]>("/repair/tickets", {
    headers: { "x-user-role": role }
  });
}

export function assignRepairTicket(id: string, technicianId: string, role: UserRole, transportFee?: number) {
  return request<RepairTicketDto>(`/repair/tickets/${id}/assign`, {
    method: "PATCH",
    headers: { "x-user-role": role },
    body: JSON.stringify({ technicianId, ...(transportFee !== undefined ? { transportFee } : {}) })
  });
}

export function createServiceRequest(payload: CreateServiceRequestPayload) {
  return request<{ id: string }>("/services/requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function checkout(payload: CheckoutPayload) {
  if (import.meta.env.DEV && !USE_API_CHECKOUT) {
    return Promise.resolve({
      orderNumber: `LOCAL-${Date.now()}`,
      status: "PENDING_PAYMENT",
      total: payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + payload.deliveryFee,
      paymentReceiverPhone: payload.paymentReceiverPhone
    });
  }

  return request<CheckoutResult>("/cart/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
