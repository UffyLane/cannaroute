# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts

COPY backend/shared/ ./backend/shared/

COPY backend/services/notification/package*.json ./backend/services/notification/
RUN cd backend/services/notification && npm ci --ignore-scripts

COPY backend/services/notification/ ./backend/services/notification/

RUN cd backend/services/notification && npm run build

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/backend/services/notification/dist ./dist
COPY --from=builder /app/backend/services/notification/node_modules ./node_modules
COPY --from=builder /app/backend/services/notification/package.json ./

EXPOSE 3007

CMD ["node", "dist/main"]
