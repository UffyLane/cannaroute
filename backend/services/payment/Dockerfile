FROM node:20-alpine AS builder
WORKDIR /app

# Copy shared package first
COPY backend/shared ./backend/shared
COPY backend/services/payment/package.json ./backend/services/payment/package.json

# Install deps
WORKDIR /app/backend/services/payment
RUN npm install --legacy-peer-deps

# Copy source
COPY backend/services/payment/src ./src
COPY backend/services/payment/tsconfig.json ./tsconfig.json

# Build
RUN npx nest build

# ── Runtime ──────────────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/backend/services/payment/dist ./dist
COPY --from=builder /app/backend/services/payment/node_modules ./node_modules
COPY --from=builder /app/backend/shared ./backend/shared

EXPOSE 3006

CMD ["node", "dist/main"]
