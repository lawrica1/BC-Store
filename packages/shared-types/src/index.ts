export type UserRole = "ADMIN" | "TECHNICIAN" | "CUSTOMER";

export type ProductCategory =
  | "CASQUE"
  | "ECOUTEUR"
  | "CHARGEUR"
  | "POWERBANK"
  | "TELEPHONE"
  | "ORDINATEUR";

export type TicketStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RepairServiceType = "IN_STORE" | "AT_HOME";

export interface ProductDto {
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

export interface RepairTicketDto {
  id: string;
  ticketNumber: string;
  deviceType: "TELEPHONE" | "ORDINATEUR" | "AUTRE";
  brand: string;
  model: string;
  faultDesc: string;
  serviceType: RepairServiceType;
  storeAddress?: string | null;
  homeAddress?: string | null;
  visitDate?: string | null;
  transportZone?: "NEAR" | "FAR" | "UNKNOWN" | null;
  estimatedTransportFee?: number | null;
  transportFee?: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  status: TicketStatus;
  assignedTo?: string | null;
}

export interface PaginatedRepairTickets {
  tickets: RepairTicketDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorShape {
  statusCode: number;
  message: string;
  timestamp: string;
}
