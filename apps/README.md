# CannaRoute — Frontend Apps

Five client applications covering every role in the platform.

---

## Apps Overview

| App | Framework | URL / Distribution | Demo Login |
|---|---|---|---|
| `customer/` | React Native + Expo | Android APK (EAS) | `customer@demo.canna-route.com` |
| `driver/` | React Native + Expo | Android APK (EAS) | `driver@demo.canna-route.com` |
| `dispensary/` | Next.js 14 + Tailwind | [app.canna-route.com](https://app.canna-route.com) | `dispensary@demo.canna-route.com` |
| `grower/` | Next.js 14 + Tailwind | [grow.canna-route.com](https://grow.canna-route.com) | `grower@demo.canna-route.com` |
| `admin/` | Next.js 14 + Tailwind | [admin.canna-route.com](https://admin.canna-route.com) | `admin@demo.canna-route.com` |

All demo accounts use password `Demo1234!`

---

## Design System

All five apps share a consistent premium dark design language.

### Web portals (dispensary, grower, admin)

| Token | Value |
|---|---|
| Sidebar background | `#0a1a0f` |
| Sidebar border | `rgba(255,255,255,0.07)` |
| Active nav item | `rgba(245,158,11,0.12)` bg / `#f59e0b` text |
| Sidebar width | `228px` |
| Green accent | `#0f4c35` |
| Gold accent | `#f59e0b` |
| Body background | `#060f08` |
| Card background | `rgba(255,255,255,0.03)` |
| Card border | `rgba(255,255,255,0.07)` |

Icons: inline Feather-style SVGs only — no icon library dependency (avoids bundle bloat and Tailwind purging issues).

### Mobile apps (customer, driver)

| Token | Value |
|---|---|
| Background | `#060f08` |
| Surface | `rgba(255,255,255,0.05)` |
| Gold | `#f59e0b` |
| Green | `#0f4c35` |
| Text primary | `#ffffff` |
| Text secondary | `rgba(255,255,255,0.6)` |
| Border | `rgba(255,255,255,0.08)` |

Styling: `StyleSheet.create()` only — no styled-components or NativeWind.

---

## Customer App (`apps/customer/`)

React Native + Expo — cannabis ordering for end customers.

### Screens

| Screen | Path | Description |
|---|---|---|
| Welcome | `app/index.tsx` | Splash + auth entry |
| Login | `app/login.tsx` | Email/password login |
| Register | `app/register.tsx` | New account + age verification |
| Home | `app/(tabs)/index.tsx` | Product discovery, featured dispensaries |
| Cart | `app/(tabs)/cart.tsx` | Cart review, proceed to checkout |
| Checkout | `app/checkout.tsx` | Payment method selection (CanPay / POB / Cash) |
| Orders | `app/(tabs)/orders.tsx` | Order history + status |
| Track | `app/track/[orderId].tsx` | Live GPS order tracking |
| Account | `app/(tabs)/account.tsx` | Profile, medical card, preferences |
| Product Detail | `app/product/[id].tsx` | COAs, grower info, lab results |

### Key Features
- CanPay ACH checkout — places order then deep-links to CanPay app
- Live GPS tracking via WebSocket connection to order service
- Expo Push notifications for all order lifecycle events
- Deep-link tap handling → navigates to correct screen per notification
- Age verification gate on registration

### Setup

```bash
cd apps/customer
cp .env.example .env
npm install
npx expo start
```

### Env vars

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_ORDER_SERVICE_URL=http://localhost:3002
EXPO_PUBLIC_INVENTORY_SERVICE_URL=http://localhost:3003
EXPO_PUBLIC_DELIVERY_SERVICE_URL=http://localhost:3004
EXPO_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3008
EXPO_PUBLIC_SOCKET_URL=http://localhost:3002
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

---

## Driver App (`apps/driver/`)

React Native + Expo — delivery management for drivers.

### Screens

| Screen | Path | Description |
|---|---|---|
| Login | `app/login.tsx` | Driver login |
| Job Queue | `app/(tabs)/index.tsx` | Available delivery jobs |
| Active Delivery | `app/delivery/[orderId].tsx` | Current job — map, status controls |
| Earnings | `app/(tabs)/earnings.tsx` | Daily/weekly earnings breakdown |
| History | `app/(tabs)/history.tsx` | Completed deliveries |
| Profile | `app/(tabs)/profile.tsx` | License, vehicle, documents |

### Key Features
- Real-time job offers via WebSocket
- GPS location broadcast to Redis (customer tracking)
- Push notifications: new job offers, assignment confirmations
- Deep-link tap: job offer → `/delivery/[orderId]`

### Setup

```bash
cd apps/driver
cp .env.example .env
npm install
npx expo start
```

---

## Dispensary Dashboard (`apps/dispensary/`)

Next.js 14 — order management, inventory, driver coordination.

### Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Dispensary staff login |
| Dashboard | `/dashboard` | Live order feed, stats |
| Orders | `/orders` | Order queue, status management |
| Inventory | `/inventory` | Product catalog, stock levels |
| Drivers | `/drivers` | Driver roster, availability |
| Compliance | `/compliance` | State rules, daily limits |
| Settings | `/settings` | Dispensary profile, API keys |

### Setup

```bash
cd apps/dispensary
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

---

## Grower Portal (`apps/grower/`)

Next.js 14 — farm profile, COA management, pesticide logs.

### Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Grower login |
| Dashboard | `/dashboard` | Overview, recent activity |
| Lab Tests | `/lab-tests` | COA uploads, batch tracking |
| Pesticide Logs | `/pesticide-logs` | Spray records, compliance |
| Profile | `/profile` | Farm info, certifications |
| Products | `/products` | Products linked to this farm |

### Setup

```bash
cd apps/grower
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3001
```

---

## Admin Panel (`apps/admin/`)

Next.js 14 — platform-wide oversight for CannaRoute staff only.

### Pages

| Page | Route | Description |
|---|---|---|
| Login | `/login` | Admin-only login (red "Admin Access Only" badge) |
| Dashboard | `/dashboard` | Platform stats, order volume chart |
| Users | `/users` | All users, role badges, verify/revoke |
| Compliance | `/compliance` | State rules table, edit limits |
| Health | `/health` | All 8 service statuses, latency |

### Setup

```bash
cd apps/admin
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3002
```

---

## Payment Flow

```
Customer selects CanPay at checkout
        ↓
POST /payments/initiate  →  Payment Service
        ↓
CanPay API returns processor_redirect_url
        ↓
Linking.openURL(redirect_url)  →  Customer's CanPay app
        ↓
Customer authorizes payment in CanPay app
        ↓
CanPay POSTs HMAC-signed webhook  →  POST /payments/webhook/canpay
        ↓
Payment Service verifies signature, updates payment status
        ↓
PATCH /orders/:id/payment-status  →  Order Service
        ↓
Order Service emits push notification to customer
```

---

## Push Notification Flow

```
Order state changes in Order Service
        ↓
notify() helper  →  POST /notifications/order-update  →  Notification Service
        ↓
Notification Service resolves push token from Auth Service
        ↓
Sends Expo Push API request
        ↓
Notification delivered to customer/driver device
        ↓
User taps notification  →  deep-link navigates to correct screen
```

---

## Building APKs

```bash
# Install EAS CLI
npm install -g eas-cli

# Customer APK (production)
cd apps/customer
eas build --platform android --profile production

# Driver APK (production)
cd apps/driver
eas build --platform android --profile production
```

Both apps are configured in `eas.json`. Builds run in the cloud — no Android SDK required locally.
