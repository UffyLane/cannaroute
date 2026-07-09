# CannaRoute — Backend Services

Eight NestJS microservices powering the full platform. All deployed to Render via Docker.

---

## Services Overview

| Service | Port | Description | Status |
|---|---|---|---|
| `auth` | 3001 | JWT auth, user management, role-based access | ✅ Deployed |
| `order` | 3002 | Order lifecycle, state machine, payment relay | ✅ Deployed |
| `delivery` | 3003 | Driver assignment, GPS tracking, routing | ✅ Deployed |
| `inventory` | 3004 | Menu management, stock, Metrc sync | ✅ Deployed |
| `compliance` | 3005 | State rules engine, purchase limits, license checks | ✅ Deployed |
| `grower` | 3006 | Farm profiles, COA parsing, pesticide logs | ✅ Deployed |
| `notification` | 3007 | Push (FCM / Expo Push), SMS (Twilio) | ✅ Deployed |
| `payment` | 3008 | CanPay ACH, webhooks, refunds | ✅ Deployed |

**Infrastructure:**
- PostgreSQL (Render managed, shared across all services)
- Redis (Render managed, GPS pub/sub + caching)

---

## Architecture

All services follow the same NestJS structure:

```
services/<name>/
├── src/
│   ├── main.ts              # Bootstrap — CORS, global prefix, validation pipe
│   ├── app.module.ts        # Root module — TypeORM, JWT, PassportModule, service modules
│   ├── health.controller.ts # GET /api/v1/health — used by Render health checks
│   └── <domain>/
│       ├── <domain>.entity.ts      # TypeORM entity
│       ├── <domain>.module.ts      # NestJS module
│       ├── <domain>.controller.ts  # REST endpoints
│       ├── <domain>.service.ts     # Business logic
│       └── dto/                    # class-validator DTOs
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Shared Package (`backend/shared/`)

All services import from `@cannaroute/shared`:

```typescript
import { JwtAuthGuard, RolesGuard, JwtStrategy } from '@cannaroute/shared';
import { Public, Roles, CurrentUser }             from '@cannaroute/shared';
import { RequestUser, OrderStatus, PaymentMethod } from '@cannaroute/shared';
```

| Export | Type | Description |
|---|---|---|
| `JwtAuthGuard` | Guard | Global JWT validation — applied in `APP_GUARD` |
| `RolesGuard` | Guard | Checks `@Roles()` decorator against JWT role |
| `JwtStrategy` | Strategy | Stateless Passport JWT strategy |
| `@Public()` | Decorator | Bypasses JWT guard for public routes |
| `@Roles(...roles)` | Decorator | Restricts endpoint to specific roles |
| `@CurrentUser()` | Decorator | Injects `RequestUser` from JWT payload |
| `RequestUser` | Type | `{ id, email, role, dispensaryId? }` |
| `OrderStatus` | Enum | `placed → confirmed → preparing → picked_up → in_transit → delivered → cancelled` |
| `PaymentMethod` | Enum | `canpay \| aeropay \| point_of_banking \| cash` |

---

## Service Details

### Auth Service (`auth/`)

**Handles:** Registration, login, JWT issuance, token refresh, password reset

Key endpoints:
```
POST /api/v1/auth/register        # Create account (customer, dispensary_staff, driver, grower)
POST /api/v1/auth/login           # Returns access_token + refresh_token
POST /api/v1/auth/refresh         # Rotate refresh token
POST /api/v1/auth/logout          # Invalidate refresh token
PATCH /api/v1/users/me            # Update profile
GET  /api/v1/admin/users          # Platform admin — list all users
PATCH /api/v1/admin/users/:id     # Verify/update user (admin only)
GET  /api/v1/admin/stats          # Platform stats for admin dashboard
```

JWT payload: `{ sub: userId, email, role, dispensaryId? }`
Token TTL: 15 min access, 7 day refresh

---

### Order Service (`order/`)

**Handles:** Order creation, state machine transitions, compliance check relay, manifest generation, payment status updates

Order state machine:
```
placed → confirmed → preparing → picked_up → in_transit → delivered
                ↘                        ↘
              cancelled              cancelled (before picked_up only)
```

Key endpoints:
```
POST  /api/v1/orders                      # Customer places order
GET   /api/v1/orders                      # List orders (filtered by role)
GET   /api/v1/orders/:id                  # Get order detail
PATCH /api/v1/orders/:id/confirm          # Dispensary confirms + assigns driver
PATCH /api/v1/orders/:id/pickup           # Driver marks picked up
PATCH /api/v1/orders/:id/deliver          # Driver marks delivered
PATCH /api/v1/orders/:id/cancel           # Cancel order
GET   /api/v1/orders/:id/manifest         # Delivery manifest (driver + dispensary)
PATCH /api/v1/orders/:id/payment-status   # Internal — called by payment service
```

On order creation:
1. Calls inventory service to resolve product data + price snapshot
2. Calls compliance service to check purchase limits
3. Persists order + items in a single transaction
4. Emits WebSocket event to dispensary dashboard

Platform fee: 10% of subtotal (280E-compliant structuring)

---

### Delivery Service (`delivery/`)

**Handles:** Driver assignment, GPS tracking (Redis pub/sub), delivery status, routing

Key endpoints:
```
GET   /api/v1/delivery/jobs                    # Available jobs for driver
POST  /api/v1/delivery/jobs/:id/accept         # Driver accepts job
PATCH /api/v1/delivery/jobs/:id/status         # Update delivery status
POST  /api/v1/delivery/location                # Driver publishes GPS position
GET   /api/v1/delivery/track/:orderId          # Customer polls for driver location
```

GPS flow: Driver app publishes position → Redis pub/sub → order service WebSocket → customer app

---

### Inventory Service (`inventory/`)

**Handles:** Product catalog, stock management, Metrc sync, batch tracking

Key endpoints:
```
GET   /api/v1/inventory/products              # List products (by dispensary)
POST  /api/v1/inventory/products              # Add product
PATCH /api/v1/inventory/products/:id          # Update product / stock
POST  /api/v1/inventory/products/bulk         # Internal — batch product lookup (called by order service)
GET   /api/v1/inventory/batches               # Batch/lot tracking
POST  /api/v1/inventory/metrc/sync            # Trigger Metrc inventory sync
```

---

### Compliance Service (`compliance/`)

**Handles:** State purchase limit rules, daily purchase tracking, license validation, compliance rule management

Key endpoints:
```
GET  /api/v1/compliance/rules                 # List rules (by state)
POST /api/v1/compliance/rules                 # Create rule (admin only)
POST /api/v1/compliance/check-order           # Internal — validates order against state limits
GET  /api/v1/compliance/customer/:id/history  # Customer daily purchase history
```

Michigan rules seeded: flower, concentrate, edible, tincture purchase limits. Same structure supports all Metrc states.

---

### Grower Service (`grower/`)

**Handles:** Farm profiles, lab test / COA uploads, pesticide logs, certifications

Key endpoints:
```
GET   /api/v1/grower/profile                  # Get farm profile
PUT   /api/v1/grower/profile                  # Update farm profile
GET   /api/v1/grower/lab-tests                # List lab tests / COAs
POST  /api/v1/grower/lab-tests                # Upload COA
GET   /api/v1/grower/pesticide-logs           # List pesticide log entries
POST  /api/v1/grower/pesticide-logs           # Add log entry
GET   /api/v1/grower/compliance               # Compliance summary
```

---

### Notification Service (`notification/`)

**Handles:** Push notifications (Expo Push + FCM), SMS (Twilio)

Key endpoints:
```
POST /api/v1/notifications/push               # Send push notification
POST /api/v1/notifications/sms                # Send SMS
POST /api/v1/notifications/order-update       # Internal — triggered by order status changes
```

Notification triggers:
- Order placed → dispensary push
- Order confirmed → customer push + SMS
- Driver assigned → customer push with ETA
- Order delivered → customer push + SMS
- Compliance issue → dispensary email

---

### Payment Service (`payment/`)

**Handles:** CanPay ACH integration, payment initiation, webhook handling, refunds

Key endpoints:
```
POST /api/v1/payments/initiate               # Customer initiates payment after order placed
GET  /api/v1/payments/order/:orderId         # Get payment status for order
POST /api/v1/payments/webhook/canpay         # CanPay webhook (public — HMAC verified)
POST /api/v1/payments/refund                 # Admin/dispensary issues refund
```

Payment flow:
1. Customer places order → `POST /api/v1/orders` → order created with `payment_status: pending`
2. Customer initiates payment → `POST /api/v1/payments/initiate`
3. For CanPay: returns `processor_redirect_url` → customer app opens CanPay app via deep-link
4. Customer authorizes in CanPay app
5. CanPay posts webhook to `/api/v1/payments/webhook/canpay`
6. Payment service verifies HMAC signature, updates `payment.status = captured`
7. Payment service calls `PATCH /api/v1/orders/:id/payment-status` on order service
8. For cash/POB: steps 3–7 skipped, payment marked based on delivery/pickup

**To activate CanPay:** sign up at canpay.com/merchant, set `CANPAY_API_KEY`, `CANPAY_MERCHANT_ID`, `CANPAY_WEBHOOK_SECRET` in environment.
Dev mode: runs without credentials, returns mock `transaction_id` and `redirect_url`.

---

## Database

Single shared PostgreSQL instance. Key tables:

| Table | Service | Description |
|---|---|---|
| `users` | auth | All platform users — all roles |
| `dispensary_users` | auth | Dispensary staff assignments |
| `orders` | order | Order records with full pricing breakdown |
| `order_items` | order | Individual line items with price snapshot |
| `products` | inventory | Dispensary product catalog |
| `batches` | inventory | Inventory lots/batches (Metrc-linked) |
| `compliance_rules` | compliance | Per-state purchase limits |
| `daily_purchases` | compliance | Customer purchase tracking |
| `grower_profiles` | grower | Farm profiles |
| `lab_tests` | grower | COA records |
| `pesticide_logs` | grower | Pesticide application log |
| `payments` | payment | Payment records — processor, status, refunds |

Full schema: `database/schema.sql`
Michigan seed data: `database/seed.sql`

---

## Local Development

Prerequisites: Docker, Node 20+

```bash
# 1. Start PostgreSQL + Redis
docker-compose up -d

# 2. Start a service (example: auth)
cd backend/services/auth
cp .env.example .env
npm install
npm run start:dev

# 3. Verify health
curl http://localhost:3001/api/v1/health
```

Run all services at once with docker-compose (each has a defined service in `docker-compose.yml`):
```bash
docker-compose up
```

---

## Deployment (Render)

The root `render.yaml` is a Render Blueprint that deploys everything in one click:
- 1 PostgreSQL database
- 1 Redis instance
- 8 NestJS web services (Docker)

```bash
# From Render dashboard: New → Blueprint → point to this repo
```

After first deploy:
1. Set all `sync: false` env vars in the Render dashboard:
   - `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate with `openssl rand -hex 32`
   - `CANPAY_API_KEY`, `CANPAY_MERCHANT_ID`, `CANPAY_WEBHOOK_SECRET`
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
   - `CORS_ORIGINS` — comma-separated Vercel deployment URLs
2. Seed Michigan compliance data:
   ```bash
   psql $DATABASE_URL < database/seed.sql
   ```
3. Once schema is stable, set `DB_SYNC=false` on all services to prevent accidental schema changes.

---

## Authentication & Authorization

All services use a shared stateless JWT strategy. No session storage.

**Roles:**
- `customer` — place orders, track delivery
- `dispensary_staff` / `dispensary_admin` — manage orders, inventory, drivers
- `driver` — accept jobs, update delivery status
- `grower` — manage farm profile, COAs, pesticide logs
- `platform_admin` — full access, user management, compliance rules

**Decorators:**
```typescript
@Public()              // Skip JWT guard entirely
@Roles('driver')       // Only drivers can access
@CurrentUser() user    // Inject JWT payload as RequestUser
```

Service-to-service calls use the `X-Internal-Service` header for identification (not JWT). This is upgraded to service-to-service JWT in Phase 2.
