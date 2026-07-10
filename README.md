# CannaRoute

> Cannabis delivery, dispensary management, and grower transparency — one universal platform for every legal state.

**Live at [canna-route.com](https://canna-route.com)**

---

## What This Is

CannaRoute is a full-stack cannabis delivery platform combining:

- **Real-time delivery logistics** — DoorDash-style order flow, GPS tracking, driver dispatch, built for cannabis compliance
- **Dispensary operations** — order management, inventory, driver coordination, Metrc sync
- **Grower transparency** — pesticide logs, COAs, certifications surfaced to the customer at point of sale
- **Multi-state compliance engine** — state-adaptive purchase limits, license validation, seed-to-sale integration
- **Cannabis-compliant payments** — CanPay ACH debit, Point of Banking, and cash on delivery
- **Push notifications** — real-time order lifecycle alerts via Expo Push, with deep-link tap handling

No existing platform does all four. That's the gap.

---

## Live Platform

| Portal | URL | Credentials |
|---|---|---|
| Dispensary Dashboard | [app.canna-route.com](https://app.canna-route.com) | `dispensary@demo.canna-route.com` / `Demo1234!` |
| Grower Portal | [grow.canna-route.com](https://grow.canna-route.com) | `grower@demo.canna-route.com` / `Demo1234!` |
| Admin Panel | [admin.canna-route.com](https://admin.canna-route.com) | `admin@demo.canna-route.com` / `Demo1234!` |
| API Gateway | [api.canna-route.com](https://api.canna-route.com) | — |
| Customer App | Android APK (EAS build) | `customer@demo.canna-route.com` / `Demo1234!` |
| Driver App | Android APK (EAS build) | `driver@demo.canna-route.com` / `Demo1234!` |

---

## Repo Structure

```
cannaroute/
├── apps/
│   ├── customer/        # React Native (Expo) — iOS + Android customer app
│   ├── driver/          # React Native (Expo) — driver delivery app
│   ├── dispensary/      # Next.js 14 + Tailwind — dispensary web dashboard
│   ├── grower/          # Next.js 14 + Tailwind — grower transparency portal
│   └── admin/           # Next.js 14 + Tailwind — platform admin panel
├── backend/
│   ├── services/
│   │   ├── auth/        # JWT auth, user management, push token storage
│   │   ├── order/       # Order lifecycle state machine, notification triggers
│   │   ├── delivery/    # Driver assignment, GPS tracking, routing
│   │   ├── inventory/   # Menu management, stock levels, Metrc sync
│   │   ├── compliance/  # State rules engine, purchase limits, license checks
│   │   ├── grower/      # Farm profiles, COA parsing, pesticide logs
│   │   ├── notification/ # Expo Push + FCM + Twilio SMS
│   │   └── payment/     # CanPay ACH integration, webhook handling, refunds
│   └── shared/          # Types, JWT guard, roles decorator, request user
├── assets/
│   └── logo/            # SVG logo files (dark + light versions)
├── database/
│   ├── schema.sql            # Full PostgreSQL schema
│   ├── seed.sql              # Michigan compliance seed data
│   ├── seed-demo-users.sql   # Demo accounts for all 5 roles
│   └── migrations/           # Versioned migrations
├── docs/
│   ├── architecture/    # Full platform architecture blueprint
│   ├── decisions/       # ADRs — payment, pilot state, business model, drivers, growers
│   └── domain-setup.md  # Custom domain configuration guide
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
| Database | PostgreSQL 18 (Render managed) |
| Real-time tracking | Redis (Valkey 8) + Socket.io WebSockets |
| File storage | AWS S3 |
| Payments | CanPay ACH debit + Point of Banking + Cash |
| Maps / Routing | Google Maps Platform |
| Push notifications | Expo Push API + Firebase Cloud Messaging (optional) |
| SMS | Twilio |
| Seed-to-sale | Metrc API v2 |
| Backend hosting | Render (Docker, Oregon region) |
| Web portal hosting | Vercel |
| Mobile builds | Expo EAS (cloud builds) |
| Custom domain | canna-route.com (Squarespace DNS) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            Clients                              │
│   Customer App    Driver App    Dispensary   Grower    Admin    │
│  (React Native) (React Native)  (Next.js)  (Next.js) (Next.js) │
│  customer.        driver.       app.         grow.    admin.    │
│  (APK)           (APK)         canna-route.com                  │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST + WebSockets
                             │
                  api.canna-route.com
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     ┌────▼────┐       ┌─────▼─────┐     ┌─────▼──────┐
     │  Auth   │       │   Order   │     │  Payment   │
     │ :3001   │       │  :3002    │     │  :3008     │
     └─────────┘       └─────┬─────┘     └─────┬──────┘
                             │ notify           │ update status
          ┌──────────────────┼──────────────────┘
          │                  │
     ┌────▼──────┐   ┌───────▼────┐   ┌─────────────┐
     │ Inventory │   │ Compliance │   │  Delivery   │
     │  :3003    │   │  :3005     │   │  :3004      │
     └───────────┘   └────────────┘   └─────────────┘
          │                                   │
     ┌────▼──────┐   ┌──────────────┐   ┌────▼────────┐
     │  Grower   │   │ Notification │   │    Redis    │
     │  :3006    │   │  :3007       │   │ (GPS/cache) │
     └───────────┘   └──────────────┘   └─────────────┘
          │                  │
     ┌────▼──────────────────▼──────────────────────────┐
     │                PostgreSQL (shared)               │
     └──────────────────────────────────────────────────┘
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

**Backend — all 8 services deployed to Render**
- Auth, Order, Delivery, Inventory, Compliance, Grower, Notification, Payment
- Shared package: JWT strategy, auth guards, roles decorator, shared types
- PostgreSQL schema + Michigan seed data + demo user accounts
- Redis (Valkey 8) for GPS pub/sub and caching
- WebSocket gateway for real-time order updates
- Push notification service — Expo Push API, 11 order event templates, deep-link routing
- Health check endpoints on all services
- Docker + `render.yaml` Blueprint for one-click deploy

**Web Portals — all deployed to Vercel with custom domain**
- Dispensary Dashboard → app.canna-route.com
- Grower Portal → grow.canna-route.com
- Admin Panel → admin.canna-route.com
- Premium dark sidebar design, SVG icons, no icon library dependency
- Security headers via `vercel.json` on all three portals

**Mobile Apps — APKs built via Expo EAS**
- Customer app — auth, home/discover, cart, checkout (CanPay), orders, account, tracking, push notifications
- Driver app — auth, job queue, active delivery, navigation, earnings, history, profile, push notifications
- Both apps: Expo Push token registration, deep-link tap handling, Android notification channels

**Payments**
- CanPay ACH debit integration (webhook + HMAC-SHA256 verification)
- Point of Banking + Cash on delivery
- Checkout screen with payment method selector
- Dev mock mode when CanPay credentials not set

**Domain**
- canna-route.com registered and configured
- 4 CNAME records in Squarespace DNS
- CORS_ORIGINS set on all 8 Render services

### 📋 Next Up
- Google Play Store submission (Android APKs ready)
- Apple App Store (requires $99/yr Apple Developer account)
- CanPay merchant account (apply at canpay.com)
- Metrc API credentials (per-state)
- First dispensary pilot onboarding

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

See `apps/README.md` and `backend/README.md` for detailed setup.

---

## Deployment

**Backend → Render**
The `render.yaml` Blueprint deploys all 8 services, PostgreSQL, and Redis in one click.

After first deploy:
1. Set all `sync: false` env vars in the Render dashboard (JWT secret, CanPay, Twilio, Firebase, AWS)
2. Set `CORS_ORIGINS` on every service to your production domain list
3. Run `psql $DATABASE_URL < database/seed.sql` to seed Michigan compliance data
4. Run `psql $DATABASE_URL < database/seed-demo-users.sql` to create demo accounts
5. Set `DB_SYNC=false` on all services once schema is stable

**Web Portals → Vercel**
Import each `apps/dispensary`, `apps/grower`, and `apps/admin` directory as a separate Vercel project. Set `NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.canna-route.com` and redeploy.

**Mobile → Expo EAS**
```bash
cd apps/customer && eas build --platform android --profile production
cd apps/driver  && eas build --platform android --profile production
```

See `docs/domain-setup.md` for the full custom domain configuration guide.

---

## License

Private — not open source. All rights reserved.
