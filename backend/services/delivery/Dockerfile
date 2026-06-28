FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm install --ignore-scripts --no-audit --no-fund --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY backend/shared/ ./backend/shared/
COPY backend/services/delivery/package*.json ./backend/services/delivery/
RUN cd backend/services/delivery && npm install --ignore-scripts --no-audit --no-fund --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY backend/services/delivery/ ./backend/services/delivery/
RUN cd backend/services/delivery && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl 
WORKDIR /app
COPY --from=builder /app/backend/services/delivery/dist ./dist
COPY --from=builder /app/backend/services/delivery/node_modules ./node_modules
COPY --from=builder /app/backend/services/delivery/package.json ./
EXPOSE 3003
CMD ["node", "dist/main"]
