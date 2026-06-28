FROM node:20-alpine AS builder
WORKDIR /app

# 1. Install + build shared
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm install --ignore-scripts --no-audit --no-fund --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY backend/shared/ ./backend/shared/
RUN cd backend/shared && npm run build

# 2. Install service deps
COPY backend/services/order/package*.json ./backend/services/order/
RUN cd backend/services/order && npm install --ignore-scripts --no-audit --no-fund --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000

# 3. Wire shared into service node_modules
RUN mkdir -p /app/backend/services/order/node_modules/@cannaroute/shared && \
    cp -r /app/backend/shared/dist /app/backend/services/order/node_modules/@cannaroute/shared/dist && \
    cp /app/backend/shared/package.json /app/backend/services/order/node_modules/@cannaroute/shared/package.json

# 4. Copy source + build
COPY backend/services/order/ ./backend/services/order/
RUN cd backend/services/order && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=builder /app/backend/services/order/dist ./dist
COPY --from=builder /app/backend/services/order/node_modules ./node_modules
COPY --from=builder /app/backend/services/order/package.json ./
EXPOSE 3002
CMD ["node", "dist/main"]
