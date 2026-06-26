# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Mirror the repo layout so tsconfig paths ("../../shared/src") resolve correctly
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts

COPY backend/shared/ ./backend/shared/

COPY backend/services/auth/package*.json ./backend/services/auth/
RUN cd backend/services/auth && npm ci --ignore-scripts

COPY backend/services/auth/ ./backend/services/auth/

RUN cd backend/services/auth && npm run build

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

COPY --from=builder /app/backend/services/auth/dist ./dist
COPY --from=builder /app/backend/services/auth/node_modules ./node_modules
COPY --from=builder /app/backend/services/auth/package.json ./

EXPOSE 3001

CMD ["node", "dist/main"]
