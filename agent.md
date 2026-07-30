# Agent Context: BC Store - Modern & Scalable Platform

## 1. Project Identity & Core Mission

- **Agent Role:** You are a Senior Full-Stack TypeScript Engineer building **BC Store**.
- **Project Name:** BC Store (Unified Digital Platform)
- **Core Mission:** Build a high-performance, scalable, single-page application (SPA) that seamlessly combines **E-commerce (selling electronics)** and **Technical Services (repairs, installations, maintenance)** under one roof.
- **Key Psychological Rule:** The user must be able to buy a product AND book a technician on the same site without confusion. To achieve this, use a strict **Cyan (Buy) vs. Orange (Repair)** visual dichotomy to guide the user instantly.

---

## 2. Visual Identity & Design System ("Neon Tech" Theme)

BC Store uses a **Dark Tech (Cyber/Neon)** theme to project premium quality, reliability, and cutting-edge style.

### Color Palette (Strict)
| Element | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Background** | `#080C14` | Main site background (deep void). |
| **Secondary Background** | `#0F172A` | Cards, Modals, Sidebars (slate dark). |
| **Card/Glass Effect** | `rgba(255,255,255, 0.03)` | Frosted glass with `backdrop-blur` and `border-[#1E293B]`. |
| **Primary Accent (E-commerce)** | `#00E5FF` to `#007BFF` (Cyan/Blue) | "Buy" buttons, Product highlights, Active links, Price tags. |
| **Secondary Accent (Services)** | `#FF6B35` (Neon Orange) | "Repair" buttons, Technician dispatch, Warning badges, SOS actions. |
| **Success / Installed** | `#10B981` (Emerald) | "In Stock" or "Installation Complete" statuses. |
| **Text Primary** | `#F8FAFC` | Headings and main body text. |
| **Text Muted** | `#64748B` | Descriptions, prices, secondary info. |
| **Borders** | `#1E293B` | Dividers, input fields, card strokes. |
| **Glow Effect** | `0 0 30px rgba(0, 229, 255, 0.15)` | Hover states for product cards (cyan glow). |

### Typography
- **Font Family:** Inter or Geist Sans (clean, modern, highly legible).
- **Headings:** Semi-bold, spaced tightly.
- **Body:** Regular weight, 16px baseline.

### Micro-interactions (UX Rules)
- **Hover States:** All interactive elements lift by `-2px` and intensify their glow filter.
- **Loading Skeletons:** Use pulsing grey slate skeletons instead of traditional spinners for product lists and tables.
- **Toast Notifications:** Dark glass toasts sliding from the bottom-right, bordered with cyan (for sales) or orange (for service requests).
- **Buttons:** Rounded-full (`rounded-full`) for primary CTAs; ghost/outline for secondary actions.

---

## 3. User Screens & UI Definitions (Frontend Specifications)

The frontend must implement these exact screens with the specified behaviors.

### Screen 1: Homepage (Landing Page)
- **Mega-Menu:** Sticky header with BC Store logo (neon cyan). Menu items clearly separate "Boutique" (Blue hover) and "Réparation" (Orange hover).
- **Hero Section:** Full-width gradient background (dark to slate). Text: *"Bienvenue chez BC Store – La Tech à votre porte."* 
- **Dual CTAs:** Side-by-side massive buttons: **[🛒 Acheter Maintenant]** (Cyan gradient) and **[🔧 Réparer un Appareil]** (Orange gradient).
- **Popular Categories:** 6 icon cards (Casque, Chargeur, etc.) with cyan hover glows.
- **Service Highlight:** Horizontal scroll of "Nos Services" (Caméra, Électricité, Sonorisation) with orange badges.
- **Footer:** Dark slate with customer service number highlighted in neon orange (`tel:` link).

### Screen 2: Product Listing Page (Boutique)
- **Layout:** Filter sidebar (left) and product grid (right).
- **Filters:** Collapsible accordions for "Catégorie," "Prix," and "Marque" with cyan checkboxes.
- **Product Cards:** Glass-morphism (`bg-[#0F172A]/50` + `backdrop-blur`). On hover: lift and emit a **cyan glow** border.
- **Badges:** "En Stock" (Emerald) or "Rupture" (Red). 
- **CTA:** "Ajouter au Panier" – solid cyan gradient button.

### Screen 3: Product Detail Page (PDP)
- **Breadcrumb:** e.g., *Accueil > Boutique > Casques > Sony XM5*.
- **Gallery:** Large main image with thumbnail carousel below.
- **Info Panel:** Name, star ratings, price (large cyan text), stock status.
- **Action:** Quantity stepper + **[Ajouter au Panier]** (Cyan).
- **Bottom Tabs:** Accordion system for "Description," "Spécifications Techniques," and "Avis Clients."

### Screen 4: Shopping Cart & Checkout (Stepper)
- **Cart Table:** Product thumbnails, prices, quantity adjusters. Total price is sticky (cyan).
- **Promo Code:** Input with "Appliquer" (Cyan outline).
- **Checkout Flow:**
  1. **Livraison:** Address form (dark inputs with cyan focus states).
  2. **Paiement:** Toggle between "Carte" (Stripe) and "Mobile Money" (Orange/MTN). Selected method gets a cyan border.
  3. **Confirmation:** Summary modal with neon cyan **"Confirmer la Commande"** button.

### Screen 5: Repair Service Form (Réparation) - **CRITICAL**
- **Header:** Orange neon banner: *"Diagnostic & Réparation Express."*
- **Step 1 (Device):** Dropdowns for "Type (Téléphone/Ordinateur)", "Marque", "Modèle", and a textarea for "Description de la panne."
- **Step 2 (The Toggle - Segmented Control):** Two equal pills:
  - Left Pill (Cyan): *"📍 Passer à la boutique"*.
  - Right Pill (Orange): *"🏠 Technicien à domicile"*.
- **Conditional Rendering Logic:**
  - *If "Boutique":* Show static Google Map iframe with the BC Store pin. Hide `homeAddress` and `visitDate` fields.
  - *If "Domicile":* Hide map. Show input fields for "Adresse complète" and "Date/Heure préférée" (required).
- **Submit:** Large Orange gradient button: **"Envoyer la demande de réparation"**.

### Screen 6: Services Page (Caméra, Électricité, Sonorisation)
- **Hero:** Orange accent line with the service name.
- **Content Grid:** Left: Checklist of benefits (e.g., "Certifié," "Garantie 1 an") with orange checkmarks. Right: **"Devis Gratuit"** mini-form (Name, Phone, Address). Submit is solid orange.
- **Portfolio:** Carousel at the bottom showing previous installations with dark borders and orange hover effects.

### Screen 7: "Autre" (Custom Service Request)
- **Minimalist Card:** Centralized card.
- **Fields:** "Nom complet," "Téléphone," and a large **Textarea** for *"Décrivez ce que vous souhaitez..."*.
- **Upload:** Drag-and-drop zone (dashed white border) for attaching a photo.
- **Action:** Neutral "Envoyer" button (cyan outline). On success: Toast notification *"Un spécialiste vous contactera sous 24h"*.

### Screen 8: Admin / Technician Dashboard (Backend)
- **Layout:** Vertical dark sidebar (`#0F172A`) with icons: Dashboard, Tickets, Products, Users.
- **KPI Cards:** 4 metric cards (Total Tickets, Pending Home Visits, Revenue, Low Stock). Numbers in cyan/orange based on urgency.
- **Ticket Table (Real-time):** WebSocket-powered table. Columns: Ticket #, Client, Device, Type (At-Home/In-Store), Status.
- **Status Badges:** `PENDING` (Yellow), `ASSIGNED` (Blue), `IN_PROGRESS` (Orange), `COMPLETED` (Emerald).
- **Action:** "Assigner" dropdown next to each ticket to pick a technician (updates via Socket.io).

### Screen 9: Support / Contact Page
- **Split Screen:** Left (60%): Map & address. Right (40%): Contact form.
- **Click-to-Call:** Phone number in massive orange text with a pulse animation.

---

## 4. Technical Architecture (Tech Stack - Strict)

| Layer | Technology | Version |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router) + React | 14.x |
| **UI Library** | Tailwind CSS + Shadcn/ui | Latest |
| **State Management** | Zustand (Client) & TanStack Query (Server State) | Latest |
| **Backend** | NestJS (Express adapter) | 10.x |
| **Database ORM** | Prisma ORM | 5.x |
| **Database** | PostgreSQL | 15.x |
| **Caching & Sessions** | Redis (Upstash or self-hosted) | 7.x |
| **Real-time** | Socket.io (NestJS Gateway) | 4.x |
| **Validation** | Zod (FE) & class-validator (BE) | Latest |
| **Payments** | Stripe SDK + Orange Money / MTN MoMo API | Latest |
| **Email/SMS** | Nodemailer + Twilio (or Africa's Talking) | Latest |
| **Maps** | Google Maps JavaScript API | Latest |
| **Package Manager** | PNPM (Workspaces - Monorepo) | 8.x |

---

## 5. Database Schema (Prisma - Strict)

Define these models in `/apps/api/prisma/schema.prisma`. Do not deviate without approval.

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String?  // Nullable for OAuth
  role          Role     @default(CUSTOMER) // ADMIN, TECHNICIAN, CUSTOMER
  name          String
  phone         String?
  technicians   TechnicianAssignment[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  category    Category // CASQUE, ECOUTEUR, CHARGEUR, POWERBANK, TELEPHONE, ORDINATEUR
  price       Float
  stock       Int
  images      String[] // Cloudinary/ImageKit URLs
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RepairTicket {
  id            String   @id @default(cuid())
  ticketNumber  String   @unique @default(cuid()) // e.g., "BCR-001"
  deviceType    String   // "TELEPHONE" or "ORDINATEUR"
  brand         String
  model         String
  faultDesc     String   @db.Text
  serviceType   String   // "IN_STORE" or "AT_HOME"
  
  // Conditional Fields (Mutually Exclusive based on serviceType)
  storeAddress  String?  // Pre-filled map link if IN_STORE
  homeAddress   String?  // Full address if AT_HOME
  visitDate     DateTime? // Preferred date if AT_HOME
  
  customerName  String
  customerPhone String
  customerEmail String? 
  
  status        TicketStatus @default(PENDING) // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
  assignedTo    String?      // User ID of the technician
  assignedUser  User?        @relation(fields: [assignedTo], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ServiceRequest {
  id          String   @id @default(cuid())
  serviceType String   // CAMERA, ELECTRICITE, SONORISATION, AUTRE
  description String   @db.Text
  customerName String
  customerPhone String
  customerEmail String?
  status      String   @default("PENDING")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  ADMIN
  TECHNICIAN
  CUSTOMER
}

enum Category {
  CASQUE
  ECOUTEUR
  CHARGEUR
  POWERBANK
  TELEPHONE
  ORDINATEUR
}

enum TicketStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
6. Folder Structure (Monorepo - PNPM Workspaces)
text
/bc-store
├── /apps
│   ├── /web                   # Next.js Frontend
│   │   ├── /src/app           # App Router (Pages: /boutique, /reparation, /services, /admin)
│   │   ├── /src/components    # React Components
│   │   │   ├── /ui            # Shadcn primitives (Button, Card, Dialog)
│   │   │   ├── /store         # Product Cards, Cart Widgets
│   │   │   └── /services      # Repair Toggle, Technician Dispatch Form
│   │   ├── /src/lib           # API Client (Axios + TanStack Query hooks)
│   │   ├── /src/store         # Zustand Slices (Cart, UI Theme)
│   │   └── /src/styles        # Tailwind globals (with the Neon Tech theme)
│   │
│   └── /api                   # NestJS Backend
│       ├── /src
│       │   ├── /modules
│       │   │   ├── /products  # CRUD, Stock management
│       │   │   ├── /repair    # Ticket generation, Assignment logic
│       │   │   ├── /auth      # JWT Authentication
│       │   │   └── /notifications # WebSocket Gateway (Socket.io)
│       │   ├── /prisma        # Prisma schema & migrations
│       │   └── /common        # Guards, Interceptors, Rate Limiting
│       └── /test              # E2E Tests
├── /packages
│   └── /shared-types          # TypeScript interfaces shared between FE/BE
├── docker-compose.yml         # PostgreSQL + Redis
└── package.json               # Root PNPM workspace
7. Critical Business Logic (The "BC Store" Rules)
Repair Toggle (Frontend): The segmented control must be two equal pills. If "Boutique" is selected, homeAddress and visitDate must be null in the DB. If "Domicile" is selected, those fields are required.

Real-Time Technician Dispatch: When an "À Domicile" request is submitted, the NestJS backend must emit a new-home-visit WebSocket event to the Admin dashboard and trigger a background job (BullMQ + Redis) to send an SMS to the on-duty technician.

Caching Strategy: Cache products in Redis for 5 minutes. Store the cart in Zustand + LocalStorage (persist middleware) to survive page refreshes.

Admin Restriction: Only users with role: ADMIN or TECHNICIAN can access the /admin/* routes.

8. API Contracts (REST & WebSocket)
RESTful Endpoints (NestJS Controllers)
GET /api/products (Query: category, search, page)

GET /api/products/:slug

POST /api/cart/checkout (Process payment)

POST /api/repair/tickets (Validates conditional fields via class-validator)

GET /api/repair/tickets (Admin only)

PATCH /api/repair/tickets/:id/assign (Admin only)

POST /api/services/requests (For "Autre" and installations)

WebSocket Events (Socket.io)
Client emits: join-admin-room (Authenticates admin/tech listeners).

Server emits: ticket-created (Broadcasts new repair tickets).

Server emits: ticket-updated (Broadcasts status changes).

9. Environment Variables
Frontend (.env.local):

env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_STORE_LATITUDE=3.8480
NEXT_PUBLIC_STORE_LONGITUDE=11.5021
Backend (.env):

env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="..."
SMTP_HOST="..."
SMTP_USER="..."
SMTP_PASS="..."
ADMIN_EMAIL="admin@bcstore.cm"
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
10. AI Coding Instructions & Constraints
Language: Write all UI text in French. Write code comments, Git commits, and TypeScript interfaces in English.

UI Implementation: All cards must use the glass-morphism effect (bg-white/5 + backdrop-blur). Implement the "Neon Tech" Tailwind theme strictly as defined in Section 2.

Error Handling: All API errors must return a standardized JSON shape: { statusCode: number, message: string, timestamp: string }.

Form Resilience: When the user toggles between "In-Store" and "At-Home" on the repair form, the validation state for hidden fields must reset immediately via react-hook-form.

Testing: Write unit tests for the NestJS service layer (Jest). Write E2E tests for the repair form submission flow (Cypress/Playwright).

Performance: Use Next.js next/image for product images. Implement Infinite Scrolling on the product listing page.

Agent Initialization Complete. You are now fully equipped with the vision, design, architecture, and rules for BC Store. Build a world-class, scalable platform for Cameroonian tech enthusiasts. 🚀