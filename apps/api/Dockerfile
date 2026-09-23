# Build from the repo root:  docker build -f apps/api/Dockerfile -t bc-store-api .
FROM node:20-alpine AS base
RUN corepack enable && apk add --no-cache openssl
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared-types/package.json packages/shared-types/
RUN pnpm install --frozen-lockfile --filter @bc-store/api...
COPY apps/api apps/api
COPY packages/shared-types packages/shared-types
RUN pnpm --filter @bc-store/api prisma:generate && pnpm --filter @bc-store/api build

FROM base AS runtime
ENV NODE_ENV=production PORT=4000
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 4000
# NODE_ENV=production makes the API refuse to start with placeholder JWT_SECRET/ADMIN_PASSWORD values.
CMD ["node", "dist/src/main.js"]
