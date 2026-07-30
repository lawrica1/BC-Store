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

## Production Notes

- Admin API calls currently use an `x-user-role` header until full JWT auth is implemented.
- Payments return a pending payment order stub; Stripe, Orange Money, and MTN MoMo credentials still need provider integration.
- Product visuals and maps are UI-ready placeholders until real assets and Google Maps keys are configured.
