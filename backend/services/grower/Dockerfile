FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts --network-timeout=300000
COPY backend/shared/ ./backend/shared/
COPY backend/services/grower/package*.json ./backend/services/grower/
RUN cd backend/services/grower && npm ci --ignore-scripts --network-timeout=300000
COPY backend/services/grower/ ./backend/services/grower/
RUN cd backend/services/grower && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=builder /app/backend/services/grower/dist ./dist
COPY --from=builder /app/backend/services/grower/node_modules ./node_modules
COPY --from=builder /app/backend/services/grower/package.json ./
EXPOSE 3006
CMD ["node", "dist/main"]
