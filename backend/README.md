# CannaRoute — Backend Services

8 NestJS microservices deployed on Render (Docker, Oregon region).

---

## Services Overview

| Service | Port | Render URL | Description |
|---|---|---|---|
| `auth` | 3001 | cannaroute-auth.onrender.com | JWT auth, users, push tokens |
| `order` | 3002 | cannaroute-order.onrender.com | Order lifecycle, WebSocket gateway |
| `delivery` | 3004 | cannaroute-delivery.onrender.com | Driver assignment, GPS tracking |
| `inventory` | 3003 | cannaroute-inventory.onrender.com | Menu, stock, Metrc sync |
| `compliance` | 3005 | cannaroute-compliance.onrender.com | State rules engine |
| `grower` | 3006 | cannaroute-grower.onrender.com | Farm profiles, COAs, pesticide logs |
| `notification` | 3007 | cannaroute-notification.onrender.com | Expo Push, FCM, Twilio SMS |
| `payment` | 3008 | cannaroute-payment.onrender.com | CanPay ACH, webhooks, refunds |

API gateway / public entry point: **api.canna-route.com** → `cannaroute-auth.onrender.com`

---

## Shared Package (`backend/shared/`)

Imported by all 8 services. Never published to npm — wired in via Dockerfile at build time.

### Exports

| Export | Description |
|---|---|
| `JwtStrategy` | Stateless JWT validation (reads `JWT_SECRET` from env) |
| `JwtAuthGuard` | Route guard — attach with `@UseGuards(JwtAuthGuard)` |
| `RolesGuard` | Role-based access — attach with `@UseGuards(JwtAuthGuard, RolesGuard)` |
| `@Roles(...)` | Decorator — `@Roles('platform_admin', 'dispensary_admin')` |
| `@Public()` | Marks a route as unauthenticated |
| `RequestUser` | Type attached to `req.user` after JWT validation |
| `UserRole` | Union type of all valid roles |
| `NotificationType` | Union of all notification event strings |
| `ISendNotificationPayload` | Payload shape for notification service |
| `IOrderItem`, `IComplianceCheckResult` | Shared order types |

### Roles

| Role | Access |
|---|---|
| `customer` | Customer app only |
| `driver` | Driver app only |
| `dispensary_admin` | Dispensary dashboard |
| `grower` | Grower portal |
| `platform_admin` | Admin panel + all services |

### Service-to-Service Auth

Internal calls between services use the `X-Internal-Service` header instead of JWT. Controllers verify it manually:

```typescript
const internalHeader = req.headers['x-internal-service'];
if (!internalHeader) throw new UnauthorizedException();
```

---

## Service Details

### Auth Service (`:3001`)

**Endpoints**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Returns JWT + refresh token |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| GET | `/api/v1/auth/me` | JWT | Current user profile |
| PUT | `/api/v1/auth/me` | JWT | Update profile |
| POST | `/api/v1/auth/push-token` | JWT | Register Expo push token |
| GET | `/api/v1/auth/users/:id/push-token` | Internal | Resolve push token (notification service) |
| GET | `/api/v1/health` | Public | Health check |

---

### Order Service (`:3002`)

Order lifecycle state machine + WebSocket gateway for real-time tracking.

**Order States:** `placed → confirmed → preparing → picked_up → in_transit → delivered` (or `cancelled`)

**Endpoints**

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/orders` | customer | Place order |
| GET | `/api/v1/orders` | JWT | List orders (filtered by role) |
| GET | `/api/v1/orders/:id` | JWT | Get order |
| PATCH | `/api/v1/orders/:id/confirm` | dispensary_admin | Confirm order |
| PATCH | `/api/v1/orders/:id/picked-up` | driver | Mark picked up |
| PATCH | `/api/v1/orders/:id/in-transit` | driver | Mark in transit |
| PATCH | `/api/v1/orders/:id/delivered` | driver | Mark delivered |
| PATCH | `/api/v1/orders/:id/cancel` | JWT | Cancel order |
| PATCH | `/api/v1/orders/:id/payment-status` | Internal | Update payment status |
| GET | `/api/v1/health` | Public | Health check |

WebSocket events: `order:confirmed`, `driver:position`, `order:delivered`, `job:new`

Notification triggers: every state transition calls the notification service (fire-and-forget).

---

### Delivery Service (`:3004`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/delivery/assign` | dispensary_admin | Assign driver to order |
| GET | `/api/v1/delivery/active` | driver | Active delivery for current driver |
| POST | `/api/v1/delivery/position` | driver | Broadcast GPS position → Redis |
| GET | `/api/v1/delivery/position/:orderId` | JWT | Get latest driver position |
| GET | `/api/v1/health` | Public | Health check |

---

### Inventory Service (`:3003`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/inventory/products` | Public | Browse products |
| GET | `/api/v1/inventory/products/:id` | Public | Product detail + COA |
| POST | `/api/v1/inventory/products` | dispensary_admin | Create product |
| PUT | `/api/v1/inventory/products/:id` | dispensary_admin | Update product |
| DELETE | `/api/v1/inventory/products/:id` | dispensary_admin | Archive product |
| GET | `/api/v1/health` | Public | Health check |

---

### Compliance Service (`:3005`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/compliance/rules` | JWT | All state rules |
| GET | `/api/v1/compliance/rules/:state` | JWT | Rules for a specific state |
| POST | `/api/v1/compliance/check` | JWT | Run compliance check for an order |
| PUT | `/api/v1/compliance/rules/:state` | platform_admin | Update state rules |
| GET | `/api/v1/health` | Public | Health check |

---

### Grower Service (`:3006`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/growers` | Public | Browse grower profiles |
| GET | `/api/v1/growers/:id` | Public | Grower profile + products |
| POST | `/api/v1/growers` | grower | Create farm profile |
| PUT | `/api/v1/growers/:id` | grower | Update profile |
| POST | `/api/v1/growers/:id/lab-tests` | grower | Upload COA |
| GET | `/api/v1/growers/:id/lab-tests` | Public | List COAs |
| POST | `/api/v1/growers/:id/pesticide-logs` | grower | Log pesticide application |
| GET | `/api/v1/health` | Public | Health check |

---

### Notification Service (`:3007`)

Channels: Expo Push (primary) → FCM (fallback, optional) → Twilio SMS (optional)

**Order events:**

| Event | Recipient |
|---|---|
| `order_placed` | Dispensary |
| `order_confirmed`, `order_preparing`, `order_picked_up`, `order_in_transit`, `order_delivered`, `order_cancelled` | Customer |
| `new_job`, `job_assigned` | Driver |
| `payment_captured`, `payment_failed` | Customer |

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/notifications/order-update` | Internal | Triggered by order service |
| POST | `/api/v1/notifications/send` | platform_admin | Manual send |
| GET | `/api/v1/notifications/history/:userId` | JWT | Notification history |
| GET | `/api/v1/health` | Public | Health check |

Firebase (`FIREBASE_SERVICE_ACCOUNT_JSON`) is optional — Expo Push works without it.

---

### Payment Service (`:3008`)

Payment methods: `canpay` | `point_of_banking` | `cash`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/payments/initiate` | customer | Start payment, returns CanPay redirect URL |
| GET | `/api/v1/payments/order/:orderId` | JWT | Get payment status |
| POST | `/api/v1/payments/webhook/canpay` | Public (HMAC) | CanPay signed webhook |
| POST | `/api/v1/payments/refund` | dispensary_admin, platform_admin | Refund |
| GET | `/api/v1/health` | Public | Health check |

Dev mock mode: if `CANPAY_API_KEY` is not set, returns a mock redirect URL so the service runs without credentials.

---

## Database Tables

| Table | Owner Service | Description |
|---|---|---|
| `users` | Auth | All accounts, roles, expo push tokens |
| `compliance_rules` | Compliance | One row per state |
| `orders` | Order | Order records + state |
| `order_items` | Order | Line items per order |
| `delivery_jobs` | Delivery | Driver assignments |
| `driver_positions` | Delivery | Latest GPS coordinates |
| `products` | Inventory | Product catalog |
| `growers` | Grower | Farm profiles |
| `lab_tests` | Grower | COA records |
| `pesticide_logs` | Grower | Spray records |
| `notifications` | Notification | Notification log |
| `payments` | Payment | Payment records |

---

## Render Deployment

### First deploy

1. Push repo to GitHub
2. Render dashboard → Blueprints → New Blueprint → connect repo → `render.yaml` auto-detected
3. Click **Apply** — all 8 services + PostgreSQL + Redis are created

### Required env vars after deploy

| Variable | Services | Notes |
|---|---|---|
| `JWT_SECRET` | All 8 | Any strong random string |
| `JWT_REFRESH_SECRET` | Auth | Different from JWT_SECRET |
| `CORS_ORIGINS` | All 8 | `https://app.canna-route.com,https://grow.canna-route.com,https://admin.canna-route.com` |
| `CANPAY_API_KEY` | Payment | From CanPay merchant portal |
| `CANPAY_MERCHANT_ID` | Payment | From CanPay merchant portal |
| `CANPAY_WEBHOOK_SECRET` | Payment | From CanPay merchant portal |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Notification | Optional — FCM fallback |
| `TWILIO_ACCOUNT_SID` | Notification | Optional — SMS |
| `TWILIO_AUTH_TOKEN` | Notification | Optional |
| `TWILIO_PHONE_NUMBER` | Notification | Optional |
| `AWS_ACCESS_KEY_ID` | Inventory, Delivery, Grower | S3 uploads |
| `AWS_SECRET_ACCESS_KEY` | Inventory, Delivery, Grower | S3 |
| `S3_BUCKET_NAME` | Inventory, Delivery, Grower | S3 |

### Post-deploy database setup

```bash
# Seed Michigan compliance data
psql $DATABASE_URL < database/seed.sql

# Seed demo accounts (all 5 roles, password: Demo1234!)
psql $DATABASE_URL < database/seed-demo-users.sql

# Disable schema sync once stable
# Set DB_SYNC=false on all 8 services in Render dashboard
```

---

## Local Development

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# Start any service
cd backend/services/auth
cp .env.example .env
npm install
npm run start:dev
```

All services watch for file changes and hot-reload in dev mode.
