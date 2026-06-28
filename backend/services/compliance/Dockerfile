FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/shared/package*.json ./backend/shared/
RUN cd backend/shared && npm ci --ignore-scripts --network-timeout=300000
COPY backend/shared/ ./backend/shared/
COPY backend/services/compliance/package*.json ./backend/services/compliance/
RUN cd backend/services/compliance && npm ci --ignore-scripts --network-timeout=300000
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
