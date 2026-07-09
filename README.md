# CannaRoute

> Cannabis delivery, dispensary management, and grower transparency — one universal platform for every legal state.

---

## What This Is

CannaRoute is a full-stack cannabis delivery platform combining:

- **Real-time delivery logistics** — DoorDash-style order flow, GPS tracking, driver dispatch, built for cannabis compliance
- **Dispensary operations** — order management, inventory, driver coordination, Metrc sync
- **Grower transparency** — pesticide logs, COAs, certifications surfaced to the customer at point of sale
- **Multi-state compliance engine** — state-adaptive purchase limits, license validation, seed-to-sale integration
- **Cannabis-compliant payments** — CanPay ACH debit, Point of Banking, and cash on delivery

No existing platform does all four. That's the gap.

---

## Repo Structure

```
cannaroute/
├── apps/
│   ├── customer/        # React Native (Expo) — iOS + Android customer app
│   ├── driver/          # React Native (Expo) — driver delivery app
│   ├── dispensary/      # Next.js + Tailwind — dispensary web dashboard
│   ├── grower/          # Next.js + Tailwind — grower transparency portal
│   └── admin/           # Next.js + Tailwind — platform admin panel
├── backend/
│   ├── services/
│   │   ├── auth/        # JWT auth, user management, role-based access
│   │   ├── order/       # Order lifecycle state machine, payment status relay
│   │   ├── delivery/    # Driver assignment, GPS tracking, routing
│   │   ├── inventory/   # Menu management, stock levels, Metrc sync
│   │   ├── compliance/  # State rules engine, purchase limits, license checks
│   │   ├── grower/      # Farm profiles, COA parsing, pesticide logs
│   │   ├── notification/ # Push (FCM), SMS (Twilio)
│   │   └── payment/     # CanPay ACH integration, webhook handling, refunds
│   └── shared/          # Types, JWT guard, roles decorator, request user
├── database/
│   ├── schema.sql       # Full PostgreSQL schema
│   ├── seed.sql         # Michigan compliance seed data
│   └── migrations/      # Versioned migrations
├── docs/
│   ├── architecture/    # Full platform architecture blueprint
│   └── decisions/       # ADRs — payment, pilot state, business model, drivers, growers
├── wireframes/          # HTML wireframes for all 5 apps
├── docker-compose.yml   # Local development environment
└── render.yaml          # Render Blueprint — deploys all 8 services + DB + Redis
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Customer App | React Native + Expo (iOS + Android) |
| Driver App | React Native + Expo |
| Dispensary Dashboard | Next.js 14 + Tailwind CSS |
| Grower Portal | Next.js 14 + Tailwind CSS |
| Admin Panel | Next.js 14 + Tailwind CSS |
| Backend Services | NestJS (TypeScript) — 8 microservices |
| Database | PostgreSQL (Render managed) |
| Real-time tracking | Redis + Socket.io (WebSockets) |
| File storage | AWS S3 |
| Payments | CanPay ACH debit + Point of Banking + Cash |
| Maps / Routing | Google Maps Platform |
| Push notifications | Expo Push + Firebase Cloud Messaging |
| SMS | Twilio |
| Seed-to-sale | Metrc API v2 |
| Backend hosting | Render (Docker) |
| Web portal hosting | Vercel |
| Mobile builds | Expo EAS (cloud builds) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Clients                           │
│  Customer App   Driver App   Dispensary   Grower  Admin  │
│  (React Native) (React Native) (Next.js) (Next.js)(Next) │
└──────────┬──────────┬─────────────┬──────────┬──────────┘
           │          │             │          │
           └──────────┴─────────────┴──────────┘
                              │
                     REST API + WebSockets
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
     ┌────▼────┐        ┌─────▼─────┐      ┌─────▼──────┐
     │  Auth   │        │   Order   │      │  Payment   │
     │ Service │        │  Service  │      │  Service   │
     └─────────┘        └─────┬─────┘      └─────┬──────┘
                              │                   │
          ┌───────────────────┼───────────────────┘
          │                   │
     ┌────▼──────┐    ┌───────▼────┐    ┌─────────────┐
     │ Inventory │    │ Compliance │    │  Delivery   │
     │  Service  │    │  Service   │    │   Service   │
     └───────────┘    └────────────┘    └─────────────┘
          │                                    │
     ┌────▼──────┐    ┌──────────────┐   ┌────▼────────┐
     │  Grower   │    │ Notification │   │    Redis    │
     │  Service  │    │   Service    │   │  (GPS/cache)│
     └───────────┘    └──────────────┘   └─────────────┘
          │                   │
     ┌────▼──────────────────▼────────────────────────┐
     │              PostgreSQL (shared)               │
     └────────────────────────────────────────────────┘
```

---

## Pilot State: Michigan

**Why Michigan:**
- $3B+ annual cannabis market (2nd largest in the US)
- 500+ dispensaries, 100+ in Detroit metro
- Open licensing — no caps on dispensary or delivery licenses
- Runs Metrc — same API adapter covers 17 other states
- Market oversupply → dispensaries actively seeking differentiation tools

**Launch sequence:** Detroit metro → Michigan statewide → Colorado → Pennsylvania

---

## Business Model

| Revenue Stream | Tiers |
|---|---|
| Dispensary SaaS | $299/mo Starter · $599/mo Growth · $999/mo Enterprise |
| Delivery commission | 10% (Starter) · 7% (Growth) · 5% (Enterprise) |
| Grower subscription | Free (basic) · $99/mo Verified · $249/mo Featured |

Platform fee is built into the order total — not a separate line item to the customer. Compliant with 280E structuring guidance.

---

## Key Decisions

| Question | Decision |
|---|---|
| Payment processing | CanPay ACH debit (primary) + Point of Banking + Cash |
| Pilot state | Michigan — Detroit launch |
| Business model | Hybrid SaaS + delivery commission + grower subscription |
| Driver employment | Phase 1: Dispensary-as-Employer · Phase 2: CannaRoute W-2 via PEO |
| Medical vs. adult-use | Both — adult-use primary, medical built into v1 |
| Grower onboarding | Dispensaries first → growers via warm intros → data upsell |

Full research docs with citations in `/docs/decisions/`.

---

## Current Status

### ✅ Complete

**Architecture & Planning**
- Platform architecture designed and documented
- All key business decisions researched and documented (6 ADRs)
- HTML wireframes built for all 5 apps

**Backend (all deployed to Render)**
- 8 NestJS microservices: auth, order, delivery, inventory, compliance, grower, notification, payment
- Shared package: JWT strategy, auth guards, roles decorator, shared types
- PostgreSQL schema + Michigan seed data
- Redis for GPS pub/sub and caching
- WebSocket gateway for real-time order updates
- Health check endpoints on all services
- Docker + `render.yaml` Blueprint for one-click deploy

**Web Portals (all deployed to Vercel)**
- Dispensary Dashboard — orders, inventory, drivers, compliance, settings
- Grower Portal — farm profile, lab tests/COAs, pesticide logs, compliance
- Admin Panel — users, dispensaries, compliance rules, system health
- All three: premium dark sidebar design, SVG icons, no icon library dependency

**Mobile Apps**
- Customer app — full premium dark theme: auth, home/discover, cart, checkout (with CanPay), orders, account, product detail, order tracking
- Driver app — full premium dark theme: auth, job queue, active delivery, navigation, earnings, history, profile

**Payment Processing**
- CanPay ACH debit integration (webhook + HMAC signature verification)
- Point of Banking support
- Cash on delivery support
- Checkout screen with payment method selection
- Payment service → order service payment status sync
- Dev mock mode when CanPay credentials not set

### 🔄 In Progress
- APK builds via Expo EAS (customer + driver)

### 📋 Remaining
- Push notifications (Expo Push + FCM)
- Custom domain configuration (Vercel + Render)

---

## Local Development

```bash
# Prerequisites: Docker, Node 20+

# 1. Start database + Redis
docker-compose up -d

# 2. Start a service
cd backend/services/auth
cp .env.example .env   # fill in values
npm install
npm run start:dev

# 3. Start a web portal
cd apps/dispensary
cp .env.example .env.local
npm install
npm run dev

# 4. Start mobile app
cd apps/customer
cp .env.example .env
npx expo start
```

See each app's README for service-specific setup details.

---

## Deployment

**Backend → Render**
The `render.yaml` Blueprint in the root deploys all 8 services, PostgreSQL, and Redis in one click.

After first deploy:
1. Set all `sync: false` env vars in the Render dashboard (JWT secret, CanPay credentials, Twilio, Firebase, etc.)
2. Run `psql $DATABASE_URL < database/seed.sql` to seed Michigan compliance data
3. Set `DB_SYNC=false` on all services once schema is stable

**Web Portals → Vercel**
Import each `apps/dispensary`, `apps/grower`, and `apps/admin` repo directory as a separate Vercel project. Set the `NEXT_PUBLIC_*` env vars for each.

**Mobile → Expo EAS**
```bash
# Customer APK
cd apps/customer && eas build --platform android --profile preview

# Driver APK
cd apps/driver && eas build --platform android --profile preview
```

---

## License

Private — not open source. All rights reserved.
