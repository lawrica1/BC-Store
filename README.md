# BC Store

BC Store is a PNPM workspace for a unified electronics store and technical services platform.

## Apps

- `apps/web`: Vite + React PWA frontend with React Router and the Neon Tech cyan/orange design system.
- `apps/api`: NestJS API with Prisma, PostgreSQL, Redis-ready product caching, repair tickets, checkout, services, guarded admin routes, and Socket.io notifications.
- `packages/shared-types`: Shared TypeScript contracts for frontend/backend boundaries.

## Local Setup

1. Install dependencies with `corepack pnpm install`.
2. Copy `apps/web/.env.example` to `apps/web/.env`.
3. Copy `apps/api/.env.example` to `apps/api/.env`.
4. Start PostgreSQL and Redis with `docker compose up -d`.
5. Generate Prisma client with `corepack pnpm prisma:generate`.
6. Push the schema and seed data with `corepack pnpm prisma:migrate` and `corepack pnpm prisma:seed`.
7. Run both apps with `corepack pnpm dev`.

`prisma:migrate` uses `prisma db push` for local non-interactive setup.

## Implemented Flows

- Browser language detection with manual French/English switching.
- Product listing fetches `/api/products` with local fallback data for frontend-only work.
- Cart persists in Zustand + LocalStorage.
- Checkout posts to `/api/cart/checkout`.
- Repair requests post to `/api/repair/tickets` and enforce the in-store/home-visit field rules.
- Services and "Autre" forms post to `/api/services/requests`.
- Admin dashboard fetches `/api/repair/tickets`, listens for Socket.io `ticket-created` and `ticket-updated`, and supports technician assignment.
- Prisma seed creates admin, technicians, and launch products.

## Key Rules

- Cyan is reserved for buying, products, prices, checkout, and e-commerce actions.
- Orange is reserved for repair, services, technician dispatch, and support urgency.
- Browser language is detected automatically and users can switch between French and English.
- Repair tickets enforce mutually exclusive service fields:
  - `IN_STORE`: `homeAddress` and `visitDate` are null.
  - `AT_HOME`: `homeAddress` and `visitDate` are required.

## Authentication

- Admin/technician routes require a JWT obtained via `POST /api/auth/login` (email + password).
- Seeded accounts (`admin@bcstore.cm`, `tech-a@bcstore.cm`, `tech-b@bcstore.cm`) use the password from `ADMIN_PASSWORD`/`TECH_PASSWORD` in `apps/api/.env` (default `ChangeMe123!` — change before any shared deployment).
- The web app's `/admin` route shows a login form until a valid token is stored, then loads the dashboard.

## Payments

- Checkout persists an `Order`/`OrderItem` record and branches by `paymentMethod`:
  - `CARD`: creates a Stripe PaymentIntent and returns a `clientSecret` for Stripe Elements; `POST /api/payments/stripe/webhook` confirms/fails the order.
  - `ORANGE_MONEY`: requests an Orange Money web payment URL; `POST /api/payments/orange/callback` updates order status.
  - `MOBILE_MONEY`: requests an MTN MoMo collection (request-to-pay); `POST /api/payments/momo/callback` polls status and updates the order.
- Without `STRIPE_SECRET_KEY` / Orange / MTN credentials configured, each provider service returns a stub reference so local development still works end-to-end.
- `GET /api/payments/order/:orderNumber` lets the frontend poll for status while a redirect/mobile confirmation is pending.

## Production Notes

- Product visuals and maps are UI-ready placeholders until real assets and Google Maps keys are configured.
