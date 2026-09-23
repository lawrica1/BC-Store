import type { PaginatedRepairTickets, ProductCategory, ProductDto, RepairTicketDto } from "@bc-store/shared-types";
import type { ProductViewModel } from "@/lib/products";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const IS_DEV = process.env.NODE_ENV !== "production";
const USE_API_PRODUCTS = process.env.NEXT_PUBLIC_USE_API_PRODUCTS === "true";
const USE_API_CHECKOUT = process.env.NEXT_PUBLIC_USE_API_CHECKOUT === "true";
export const PAYMENT_RECEIVER_PHONE = "659870906";
export const PRODUCTS_PAGE_SIZE = 24;

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
  photoUrl?: string;
}

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
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
  stripeClientSecret?: string;
  paymentUrl?: string;
  momoReferenceId?: string;
}

const REQUEST_TIMEOUT_MS = 8000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

// Separate from request(): a multipart body must not carry a "Content-Type: application/json"
// header, and the browser needs to set its own multipart boundary.
async function uploadRequest<T>(path: string, form: FormData): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.message ?? "Upload failed");
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

export function fetchProducts(category?: ProductCategory | "ALL", page = 1) {
  if (IS_DEV && !USE_API_PRODUCTS) {
    return Promise.resolve([]);
  }

  const params = new URLSearchParams({ page: String(page) });
  if (category && category !== "ALL") params.set("category", category);

  return request<ApiProduct[]>(`/products?${params.toString()}`)
    .then((items) => items.map(mapApiProduct))
    .catch((error) => {
      if (IS_DEV) {
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

export function fetchRepairTickets() {
  return request<PaginatedRepairTickets>("/repair/tickets");
}

export function assignRepairTicket(id: string, technicianId: string, transportFee?: number) {
  return request<RepairTicketDto>(`/repair/tickets/${id}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ technicianId, ...(transportFee !== undefined ? { transportFee } : {}) })
  });
}

export function createServiceRequest(payload: CreateServiceRequestPayload) {
  return request<{ id: string }>("/services/requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
  if (IS_DEV && !USE_API_CHECKOUT) {
    return Promise.resolve({
      orderNumber: `LOCAL-${Date.now()}`,
      status: "PENDING_PAYMENT",
      total: payload.deliveryFee, // local stub only — the real API computes totals from DB prices
      paymentReceiverPhone: payload.paymentReceiverPhone
    });
  }

  return request<CheckoutResult>("/cart/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchOrderStatus(orderNumber: string) {
  return request<{ orderNumber: string; status: string }>(`/payments/order/${orderNumber}`);
}

export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/uploads", { method: "POST", body: form });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message ?? "Upload failed");
  }
  return response.json() as Promise<{ url: string }>;
}

// ---- Admin: product management ----

export interface CreateProductPayload {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  isActive?: boolean;
}

export function fetchAdminProducts() {
  return request<ProductDto[]>("/products/admin/list");
}

export function createProduct(payload: CreateProductPayload) {
  return request<ProductDto>("/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProduct(id: string, payload: Partial<CreateProductPayload>) {
  return request<ProductDto>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deactivateProduct(id: string) {
  return request<ProductDto>(`/products/${id}`, { method: "DELETE" });
}

export function uploadProductImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return uploadRequest<{ url: string }>("/products/upload-image", form);
}

// ---- Admin: technicians & dashboard ----

export interface TechnicianDto {
  id: string;
  name: string;
}

export function fetchTechnicians() {
  return request<TechnicianDto[]>("/auth/technicians");
}

export interface DashboardStats {
  products: {
    total: number;
    active: number;
    inactive: number;
    lowStockCount: number;
    totalStock: number;
    byCategory: Array<{ category: ProductCategory; count: number }>;
    lowStock: Array<{ id: string; name: string; stock: number; category: ProductCategory }>;
  };
  clients: {
    total: number;
    recent: Array<{ name: string; phone: string; email: string | null; lastSeen: string; orders: number; tickets: number; serviceRequests: number }>;
  };
  orders: {
    totalOrders: number;
    paidOrders: number;
    revenue: string;
    recent: Array<{ id: string; orderNumber: string; customerName: string; customerPhone: string; total: number; status: string; createdAt: string }>;
  };
}

export function fetchDashboardStats() {
  return request<DashboardStats>("/admin/dashboard");
}

// ---- Order lookup ----

export interface OrderDetail {
  orderNumber: string;
  status: string;
  total: number;
  deliveryMethod: string;
  deliveryAddress: string;
  customerName: string;
  createdAt: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
}

export function fetchMyOrders() {
  return request<OrderDetail[]>("/orders/mine");
}

export function fetchOrder(orderNumber: string) {
  return request<OrderDetail>(`/payments/order/${orderNumber}`);
}
