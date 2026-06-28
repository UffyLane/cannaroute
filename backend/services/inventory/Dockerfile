FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts --network-timeout=300000
COPY backend/shared/ ./backend/shared/
COPY backend/services/inventory/package*.json ./backend/services/inventory/
RUN cd backend/services/inventory && npm ci --ignore-scripts --network-timeout=300000
COPY backend/services/inventory/ ./backend/services/inventory/
RUN cd backend/services/inventory && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl 
WORKDIR /app
COPY --from=builder /app/backend/services/inventory/dist ./dist
COPY --from=builder /app/backend/services/inventory/node_modules ./node_modules
COPY --from=builder /app/backend/services/inventory/package.json ./
EXPOSE 3004
CMD ["node", "dist/main"]
