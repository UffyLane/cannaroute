# CannaRoute

> Cannabis delivery, dispensary management, and grower transparency — one universal platform for every legal state.

---

## What This Is

CannaRoute is a full-stack cannabis delivery platform combining:
- **Real-time delivery logistics** (DoorDash-style, built for cannabis compliance)
- **Dispensary operations** (order management, inventory, driver dispatch, Metrc sync)
- **Grower transparency** (pesticide logs, COAs, certifications — surfaced to the customer at point of sale)
- **Multi-state compliance engine** (state-adaptive rules, seed-to-sale system integration)

No existing platform does all four. That's the gap.

---

## Repo Structure

```
cannaroute/
├── apps/
│   ├── customer/        # React Native — iOS + Android customer app
│   ├── driver/          # React Native — driver delivery app
│   ├── dispensary/      # React.js — dispensary web dashboard
│   ├── grower/          # React.js — grower transparency portal
│   └── admin/           # React.js — internal compliance + admin panel
├── backend/
│   ├── services/
│   │   ├── auth/        # JWT, OAuth2, role management
│   │   ├── order/       # Order lifecycle, state machine
│   │   ├── delivery/    # Driver assignment, GPS tracking, routing
│   │   ├── inventory/   # Menu management, stock, Metrc sync
│   │   ├── compliance/  # State rules engine, license validation
│   │   ├── grower/      # Farm profiles, COA parsing, pesticide logs
│   │   └── notification/ # Push (FCM), SMS (Twilio), email (SendGrid)
│   └── shared/          # Shared types, middleware, utilities
├── database/
│   ├── schema.sql       # Full PostgreSQL schema
│   └── migrations/      # Versioned migrations
├── docs/
│   ├── architecture/    # Full platform architecture blueprint
│   └── decisions/       # ADRs — payment, pilot state, business model, etc.
└── wireframes/          # HTML wireframes for all 5 apps
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Customer App | React Native (iOS + Android) |
| Driver App | React Native |
| Dispensary Dashboard | React.js |
| Grower Portal | React.js |
| Admin Panel | React.js |
| Backend API | Node.js + NestJS |
| Database | PostgreSQL |
| Real-time tracking | Redis + Socket.io (WebSockets) |
| File storage | AWS S3 |
| Payments | Point of Banking (cashless ATM) + ACH via Paybotic |
| Maps / Routing | Google Maps Platform |
| Push notifications | Firebase Cloud Messaging (FCM) |
| SMS | Twilio |
| Auth | Auth0 or Clerk (multi-role, MFA) |
| Seed-to-sale | Metrc API v2 (Phase 1), BioTrack (Phase 3) |
| Hosting | AWS ECS + RDS |

---

## Five Apps, One Backend

```
Customer App ─────┐
Driver App ────────┤
Dispensary Dashboard ─┤──► REST API ──► PostgreSQL + Redis
Grower Portal ────────┤         │
Admin Panel ──────────┘         └──► Metrc / BioTrack / LeafData
```

---

## Pilot State: Michigan

**Why Michigan:**
- $3B+ annual cannabis market (2nd largest in the US)
- 500+ dispensaries, 100+ in Detroit alone
- Open licensing — no caps
- Runs Metrc — same adapter covers ~17 states
- Market oversupply means dispensaries are actively looking for differentiation tools

**Launch sequence:** Detroit metro first → Michigan statewide → Colorado → Pennsylvania (medical-only)

---

## Business Model

| Stream | Details |
|---|---|
| Dispensary SaaS | $299/mo Starter · $599/mo Growth · $999/mo Multi-location |
| Delivery commission | 10% Starter · 7% Growth · 5% Enterprise |
| Grower subscription | Free (basic) · $99/mo Verified · $249/mo Featured |

---

## Key Decisions Made

| Question | Decision |
|---|---|
| Payment processing | Point of Banking (primary) + ACH (secondary) + Cash on delivery |
| Pilot state | Michigan — Detroit launch |
| Business model | Hybrid SaaS + commission + grower subscription |
| Driver employment | Phase 1: Dispensary-as-Employer · Phase 2: CannaRoute W-2 via PEO · Never 1099 |
| Medical vs. adult-use | Both — adult-use primary, medical built into v1 |
| Grower onboarding | Dispensaries first → growers via warm intros → data-driven upsell |

Full decision docs with research in `/docs/decisions/`.

---

## Current Status

- [x] Platform architecture designed
- [x] All key business decisions made and documented
- [x] Wireframes for all 5 apps
- [ ] SQL database schema
- [ ] API endpoint map
- [ ] Backend scaffolding
- [ ] Frontend scaffolding

---

## Setup (coming soon)

Each app will have its own setup instructions in its subdirectory README. The backend will have a root-level `docker-compose.yml` for local development once scaffolding begins.

---

## License

Private — not open source. All rights reserved.
# cannaroute
