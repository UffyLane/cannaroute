# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts

COPY backend/shared/ ./backend/shared/

COPY backend/services/order/package*.json ./backend/services/order/
RUN cd backend/services/order && npm ci --ignore-scripts

COPY backend/services/order/ ./backend/services/order/

RUN cd backend/services/order && npm run build

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/backend/services/order/dist ./dist
COPY --from=builder /app/backend/services/order/node_modules ./node_modules
COPY --from=builder /app/backend/services/order/package.json ./

EXPOSE 3002

CMD ["node", "dist/main"]
