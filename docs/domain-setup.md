# CannaRoute — Custom Domain Setup Guide

This guide walks through buying a domain and pointing it at every part of the CannaRoute stack. All config files in this repo are already prepared — you just need to swap in your real domain name and follow the steps below.

---

## Step 1 — Buy Your Domain

**Recommended:** `cannaroute.com`
**Backup options:** `cannaroute.io`, `cannaroute.app`, `getcannaroute.com`

Buy at: [namecheap.com](https://namecheap.com) (recommended — clean UI, free WHOIS privacy) or any registrar.

> If you already own it through Google Domains / Squarespace, your DNS management is at [domains.squarespace.com](https://domains.squarespace.com)

---

## Step 2 — Plan Your Subdomain Structure

Once you have `cannaroute.com`, you'll create these subdomains:

| Subdomain | Points to | What it is |
|---|---|---|
| `app.cannaroute.com` | Vercel | Dispensary dashboard |
| `grow.cannaroute.com` | Vercel | Grower portal |
| `admin.cannaroute.com` | Vercel | Admin panel |
| `api.cannaroute.com` | Render | Auth service (main API entry) |
| `cannaroute.com` | Vercel (optional) | Marketing site (future) |

The mobile apps (customer + driver) don't need a domain — they talk directly to the Render service URLs.

---

## Step 3 — Add Domains in Vercel

Do this **once per web app** (dispensary, grower, admin).

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open the project (e.g. `cannaroute-dispensary`)
3. **Settings → Domains → Add**
4. Type `app.cannaroute.com` → click Add
5. Vercel shows you a DNS record to add — it looks like:

```
Type:  CNAME
Name:  app
Value: cname.vercel-dns.com
```

6. Copy those values. Go to your DNS provider and add the CNAME record.
7. Wait 1–10 minutes for DNS to propagate.
8. Vercel automatically provisions an SSL certificate (Let's Encrypt). ✅

**Repeat for grower portal:**
- Domain: `grow.cannaroute.com`
- Project: `cannaroute-grower`

**Repeat for admin panel:**
- Domain: `admin.cannaroute.com`
- Project: `cannaroute-admin`

---

## Step 4 — Add Custom Domain on Render

For the API, you'll add a custom domain to the **auth service** on Render (this is the main entry point — the one all frontends call first for login/auth).

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Open the `cannaroute-auth` service
3. **Settings → Custom Domains → Add Custom Domain**
4. Type `api.cannaroute.com` → Save
5. Render shows you a CNAME record:

```
Type:  CNAME
Name:  api
Value: cannaroute-auth.onrender.com
```

6. Add that to your DNS provider.
7. Render auto-provisions SSL. ✅

> **Note:** The other 7 services (order, delivery, inventory, etc.) keep their `*.onrender.com` URLs for internal service-to-service calls — only the auth service needs the public `api.cannaroute.com` domain since it's the only one called directly from browsers/apps for login. All other service calls go from the web apps server-side.

---

## Step 5 — Update Environment Variables

### Web portals (Vercel dashboard)

After adding custom domains, update env vars in each Vercel project:

**Dispensary dashboard** (`app.cannaroute.com`):
```
NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.cannaroute.com
NEXT_PUBLIC_ORDER_SERVICE_URL=https://cannaroute-order.onrender.com
NEXT_PUBLIC_INVENTORY_SERVICE_URL=https://cannaroute-inventory.onrender.com
NEXT_PUBLIC_DELIVERY_SERVICE_URL=https://cannaroute-delivery.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://cannaroute-order.onrender.com
```

**Grower portal** (`grow.cannaroute.com`):
```
NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.cannaroute.com
NEXT_PUBLIC_GROWER_SERVICE_URL=https://cannaroute-grower.onrender.com
```

**Admin panel** (`admin.cannaroute.com`):
```
NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.cannaroute.com
NEXT_PUBLIC_ORDER_SERVICE_URL=https://cannaroute-order.onrender.com
NEXT_PUBLIC_INVENTORY_SERVICE_URL=https://cannaroute-inventory.onrender.com
NEXT_PUBLIC_DELIVERY_SERVICE_URL=https://cannaroute-delivery.onrender.com
NEXT_PUBLIC_COMPLIANCE_SERVICE_URL=https://cannaroute-compliance.onrender.com
NEXT_PUBLIC_GROWER_SERVICE_URL=https://cannaroute-grower.onrender.com
```

### Mobile apps (Expo EAS secrets)

In your EAS project dashboard or `eas.json`, update the `preview` and `production` env vars:

```
EXPO_PUBLIC_API_BASE_URL=https://api.cannaroute.com
EXPO_PUBLIC_ORDER_SERVICE_URL=https://cannaroute-order.onrender.com
EXPO_PUBLIC_INVENTORY_SERVICE_URL=https://cannaroute-inventory.onrender.com
EXPO_PUBLIC_DELIVERY_SERVICE_URL=https://cannaroute-delivery.onrender.com
EXPO_PUBLIC_SOCKET_URL=https://cannaroute-order.onrender.com
EXPO_PUBLIC_PAYMENT_SERVICE_URL=https://cannaroute-payment.onrender.com
```

### Render — update CORS_ORIGINS

All 8 Render services need `CORS_ORIGINS` updated to allow requests from your real domains.

Go to each service in the Render dashboard → **Environment → CORS_ORIGINS** and set:

```
https://app.cannaroute.com,https://grow.cannaroute.com,https://admin.cannaroute.com
```

This is a comma-separated list. Do this for **all 8 services**.

---

## Step 6 — Update CanPay Webhook URL

If you're using CanPay, update your webhook URL in the CanPay merchant dashboard to:

```
https://cannaroute-payment.onrender.com/api/v1/payments/webhook/canpay
```

(The payment service doesn't need a custom domain — the webhook URL just needs to be reachable, and Render URLs are stable.)

---

## Step 7 — Rebuild & Redeploy Mobile Apps

After updating EAS env vars, trigger new builds so the APKs use the real domain:

```bash
cd apps/customer && eas build --platform android --profile preview --non-interactive
cd apps/driver && eas build --platform android --profile preview --non-interactive
```

---

## Step 8 — Verify Everything

Run through this checklist after DNS propagates:

```
[ ] https://app.cannaroute.com    → loads dispensary login page
[ ] https://grow.cannaroute.com   → loads grower login page
[ ] https://admin.cannaroute.com  → loads admin login page
[ ] https://api.cannaroute.com/api/v1/health → returns { status: 'ok' }
[ ] SSL padlock shows on all 4 URLs (no certificate warnings)
[ ] Customer app login works (hits https://api.cannaroute.com)
[ ] Driver app login works
[ ] Placing a test order → push notification received
[ ] CanPay webhook test → payment status updates on order
```

---

## DNS Record Summary

All records to add in your DNS provider at once:

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `app` | `cname.vercel-dns.com` | 3600 |
| CNAME | `grow` | `cname.vercel-dns.com` | 3600 |
| CNAME | `admin` | `cname.vercel-dns.com` | 3600 |
| CNAME | `api` | `cannaroute-auth.onrender.com` | 3600 |

> The exact `Value` for Vercel CNAMEs is shown in the Vercel dashboard after you add the domain. It's always `cname.vercel-dns.com` unless Vercel assigns you a different value — always check the dashboard.

---

## Squarespace DNS — Where to Add Records

1. Go to [domains.squarespace.com](https://domains.squarespace.com)
2. Click your domain → **DNS Settings**
3. Scroll to **Custom Records**
4. Click **Add Record** for each row in the table above
5. Save — records propagate in 1–10 minutes

---

## Troubleshooting

**"SSL certificate pending" on Vercel for more than 10 minutes**
DNS hasn't fully propagated yet. Check propagation at [dnschecker.org](https://dnschecker.org) — type your subdomain and confirm the CNAME resolves globally.

**API calls returning CORS errors after domain switch**
`CORS_ORIGINS` on Render is missing your new domain. Go to each Render service → Environment → update the value and redeploy.

**Mobile app still hitting old Render URLs after rebuild**
EAS caches build profiles. Run `eas build --clear-cache --platform android --profile preview` to force a clean build.

**Auth service returns 401 after domain switch**
If you're using the `cannaroute-auth.onrender.com` URL anywhere in web apps and switched to `api.cannaroute.com`, make sure you redeploy the Vercel apps after updating env vars — Vercel bakes `NEXT_PUBLIC_*` vars at build time.
