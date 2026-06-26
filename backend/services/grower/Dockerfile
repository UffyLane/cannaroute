# ─── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts

COPY backend/shared/ ./backend/shared/

COPY backend/services/grower/package*.json ./backend/services/grower/
RUN cd backend/services/grower && npm ci --ignore-scripts

COPY backend/services/grower/ ./backend/services/grower/

RUN cd backend/services/grower && npm run build

# ─── Runtime stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# tesseract-ocr required for COA PDF parsing (grower service only)
RUN apk add --no-cache curl tesseract-ocr tesseract-ocr-data-eng

WORKDIR /app

COPY --from=builder /app/backend/services/grower/dist ./dist
COPY --from=builder /app/backend/services/grower/node_modules ./node_modules
COPY --from=builder /app/backend/services/grower/package.json ./

EXPOSE 3006

CMD ["node", "dist/main"]
