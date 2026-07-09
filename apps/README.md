# CannaRoute — Frontend Apps

Five client applications covering every role in the platform.

---

## Apps Overview

| App | Framework | Target | Status |
|---|---|---|---|
| `customer/` | React Native + Expo | iOS + Android | ✅ Built — EAS build in progress |
| `driver/` | React Native + Expo | iOS + Android | ✅ Built — EAS build in progress |
| `dispensary/` | Next.js 14 + Tailwind | Web (Vercel) | ✅ Deployed |
| `grower/` | Next.js 14 + Tailwind | Web (Vercel) | ✅ Deployed |
| `admin/` | Next.js 14 + Tailwind | Web (Vercel) | ✅ Deployed |

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
| Logo mark gradient | `linear-gradient(135deg, #0f4c35, #0c3324)` |
| Loading background | `#060f08` |
| Spinner | `borderTopColor: #f59e0b` |

Portal-specific accents:
- **Dispensary** — Leaf+pin logo mark, emerald "Live" header badge, green avatar
- **Grower** — Sprout logo mark, emerald "Farm Portal" header badge, green avatar
- **Admin** — Lock logo mark, red "Admin" header badge, purple avatar (`#7e22ce`)

No icon library is used — all icons are inline Feather-style SVG strokes.

### Mobile apps (customer, driver)

| Token | Value |
|---|---|
| Background | `#060f08` |
| Surface | `rgba(255,255,255,0.05)` |
| Border | `rgba(255,255,255,0.10)` |
| Brand green | `#0f4c35` |
| Gold accent | `#f59e0b` |
| White | `#ffffff` |
| Muted text | `rgba(255,255,255,0.45)` |
| Tab bar bg | `#080f0a` |

All styles use `StyleSheet.create()` — no NativeWind or className on mobile. Ionicons used in tab bars only.

---

## Customer App (`apps/customer/`)

**React Native + Expo SDK 51**

### Screens
| Screen | Path | Description |
|---|---|---|
| Sign In | `app/(auth)/login.tsx` | Email/password, dark theme |
| Register | `app/(auth)/register.tsx` | New account creation |
| Discover | `app/(tabs)/index.tsx` | Dispensary browsing, search |
| Cart | `app/(tabs)/cart.tsx` | Cart review → routes to checkout |
| Checkout | `app/checkout.tsx` | Payment method selection + order placement |
| Orders | `app/(tabs)/orders.tsx` | Order history with status badges |
| Account | `app/(tabs)/account.tsx` | Profile, medical card, preferences |
| Dispensary | `app/dispensary/[id].tsx` | Dispensary menu + product listing |
| Product | `app/product/[id].tsx` | Product detail, COA info |
| Track | `app/track/[id].tsx` | Live order tracking map |

### Payment Flow
1. Customer adds items → Cart screen
2. Cart → `checkout.tsx` with payment method picker
3. Payment methods: **CanPay** (ACH debit, recommended), **Point of Banking**, **Cash on Delivery**
4. For CanPay: order placed → payment service initiates → `processor_redirect_url` opens CanPay app via `Linking.openURL()`
5. CanPay posts webhook → payment service → order service updates `payment_status`

### Key services
- `services/api.ts` — Axios instance with JWT interceptor
- `services/auth.service.ts` — Login, register, token refresh
- `services/order.service.ts` — Place order, order history
- `services/payment.service.ts` — Initiate payment, check status
- `services/inventory.service.ts` — Dispensary products

### Setup
```bash
cd apps/customer
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_PAYMENT_SERVICE_URL, EXPO_PUBLIC_GOOGLE_MAPS_KEY
npm install
npx expo start
```

### Build (EAS)
```bash
# Preview APK (Android)
eas build --platform android --profile preview --non-interactive

# Production (requires Apple Developer + Google Play accounts)
eas build --platform all --profile production
```

---

## Driver App (`apps/driver/`)

**React Native + Expo SDK 51**

### Screens
| Screen | Path | Description |
|---|---|---|
| Sign In | `app/(auth)/login.tsx` | Driver login |
| Job Queue | `app/(tabs)/index.tsx` | Available deliveries with accept/decline |
| Active Delivery | `app/(tabs)/active.tsx` | Current job map + status controls |
| Earnings | `app/(tabs)/earnings.tsx` | Daily/weekly earnings breakdown |
| History | `app/(tabs)/history.tsx` | Completed delivery log |
| Profile | `app/(tabs)/profile.tsx` | Driver info, vehicle, documents |

### Driver flow
1. Driver logs in → sees open jobs dispatched by dispensary
2. Accepts job → navigates to dispensary for pickup
3. Marks picked up → in transit → delivered
4. Real-time GPS position published to Redis → order tracking updates for customer

### Setup
```bash
cd apps/driver
cp .env.example .env
npm install
npx expo start
```

---

## Dispensary Dashboard (`apps/dispensary/`)

**Next.js 14 + Tailwind CSS — deployed to Vercel**

### Pages
| Page | Route | Description |
|---|---|---|
| Login | `/login` | Split-panel: brand left, form right |
| Dashboard | `/dashboard` | Stats, revenue chart, recent orders |
| Orders | `/orders` | Order management, status transitions |
| Inventory | `/inventory` | Product catalog, stock alerts |
| Drivers | `/drivers` | Driver roster, availability, dispatch |
| Compliance | `/compliance` | Metrc sync status, compliance flags |
| Settings | `/settings` | Store profile, hours, payment config |

### Layout
- Dark sidebar (`#0a1a0f`, 228px) + light main content area
- `Sidebar.tsx` — logo mark, nav items with inline SVG icons, gold active state, user footer
- `Header.tsx` — page title, notification bell, emerald "Live" pulse badge

### Setup
```bash
cd apps/dispensary
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev   # http://localhost:3000
```

---

## Grower Portal (`apps/grower/`)

**Next.js 14 + Tailwind CSS — deployed to Vercel**

### Pages
| Page | Route | Description |
|---|---|---|
| Login | `/login` | Split-panel with green checkmarks |
| Overview | `/dashboard` | Compliance banner, cert chips, lab test summary |
| Farm Profile | `/farm-profile` | USDA cert, growing methods, location |
| Lab Tests & COAs | `/lab-tests` | Upload COAs, Pass/Fail table, PDF links |
| Pesticide Logs | `/pesticide-logs` | Log entries, pesticide-free toggle |
| Compliance | `/compliance` | State compliance status |

### Layout
- Same dark sidebar pattern as dispensary
- Sprout logo mark, "Farm Portal" emerald header badge
- `ComplianceBanner` — per-status config (Compliant/Warning/NonCompliant) with SVG icons

### Setup
```bash
cd apps/grower
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3001
```

---

## Admin Panel (`apps/admin/`)

**Next.js 14 + Tailwind CSS — deployed to Vercel**

### Pages
| Page | Route | Description |
|---|---|---|
| Login | `/login` | Minimal dark centered — "Admin Access Only" red badge |
| Dashboard | `/dashboard` | 6 platform stats (users, orders, revenue, dispensaries, drivers, growers) + order volume bar chart |
| Users | `/users` | Search, role filters, verify/revoke actions, inline-style role badges |
| Dispensaries | `/dispensaries` | Active dispensary management |
| Compliance | `/compliance` | State-grouped compliance rules table |
| Health | `/health` | Service health cards with latency + auto-refresh |

### Layout
- Lock icon logo mark, red "Admin" header badge, purple admin avatar (`#7e22ce`)
- Same dark sidebar — distinguished by color palette, not structure

### Setup
```bash
cd apps/admin
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3002
```

---

## Environment Variables

### All web portals share this pattern:
```env
NEXT_PUBLIC_API_BASE_URL=https://cannaroute-auth.onrender.com
NEXT_PUBLIC_ORDER_SERVICE_URL=https://cannaroute-order.onrender.com
```

### Mobile apps:
```env
EXPO_PUBLIC_API_BASE_URL=https://cannaroute-auth.onrender.com
EXPO_PUBLIC_ORDER_SERVICE_URL=https://cannaroute-order.onrender.com
EXPO_PUBLIC_PAYMENT_SERVICE_URL=https://cannaroute-payment.onrender.com
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```

See each app's `.env.example` for the full variable list.
