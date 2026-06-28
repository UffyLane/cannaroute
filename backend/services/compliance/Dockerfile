FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm install --ignore-scripts --no-audit --no-fund --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY backend/shared/ ./backend/shared/
COPY backend/services/compliance/package*.json ./backend/services/compliance/
RUN cd backend/services/compliance && npm install --ignore-scripts --no-audit --no-fund --network-timeout=600000 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY backend/services/compliance/ ./backend/services/compliance/
RUN cd backend/services/compliance && npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache curl 
WORKDIR /app
COPY --from=builder /app/backend/services/compliance/dist ./dist
COPY --from=builder /app/backend/services/compliance/node_modules ./node_modules
COPY --from=builder /app/backend/services/compliance/package.json ./
EXPOSE 3005
CMD ["node", "dist/main"]
