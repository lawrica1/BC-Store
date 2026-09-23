# Build from the repo root:  docker build -f apps/client/Dockerfile -t bc-store-client .
# NEXT_PUBLIC_* values are inlined at build time, so pass them as build args.
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/client/package.json apps/client/
COPY packages/shared-types/package.json packages/shared-types/
RUN pnpm install --frozen-lockfile --filter @bc-store/client...
COPY apps/client apps/client
COPY packages/shared-types packages/shared-types
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_WS_URL=ws://localhost:4000
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
ENV NEXT_OUTPUT=standalone \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN pnpm --filter @bc-store/client build

FROM node:20-alpine AS runtime
ENV NODE_ENV=production PORT=3010 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/apps/client/.next/standalone ./
COPY --from=build /repo/apps/client/.next/static ./apps/client/.next/static
COPY --from=build /repo/apps/client/public ./apps/client/public
EXPOSE 3010
CMD ["node", "apps/client/server.js"]
