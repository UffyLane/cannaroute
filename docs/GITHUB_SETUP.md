# Pushing CannaRoute to GitHub

Run these commands in Terminal from your Desktop folder.

## Step 1 — Initialize the repo

```bash
cd ~/Desktop/CannaRoute
git init
git add .
git commit -m "feat: initial CannaRoute blueprint — architecture, wireframes, SQL schema, backend stubs"
git branch -M main
```

## Step 2 — Create the GitHub repo

1. Go to https://github.com/new
2. Repository name: `cannaroute`
3. Description: `Cannabis delivery + dispensary management platform with grower transparency`
4. Set to **Private** (until you're ready to share)
5. Do NOT check "Add a README" — you already have one
6. Click **Create repository**

## Step 3 — Connect and push

GitHub will show you the remote URL after creation. Run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/cannaroute.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 4 — Verify

Go to `https://github.com/YOUR_USERNAME/cannaroute` and confirm:
- All folders are visible (apps/, backend/, database/, docs/, wireframes/)
- README.md renders on the homepage
- `database/schema.sql` is there (your first real schema file)

## What's in the repo right now

| Path | Status |
|---|---|
| `README.md` | ✅ Full project overview |
| `.gitignore` | ✅ Node, Python, secrets, env files |
| `wireframes/wireframe_customer_app.html` | ✅ 8 screens |
| `wireframes/wireframe_dispensary_dashboard.html` | ✅ 3 screens |
| `wireframes/wireframe_driver_grower_admin.html` | ✅ Driver + Grower + Admin |
| `database/schema.sql` | ✅ Full PostgreSQL schema (13 tables) |
| `database/migrations/001_initial.sql` | ✅ Migration stub |
| `apps/customer/README.md` | ✅ React Native spec |
| `apps/driver/README.md` | ✅ React Native spec |
| `apps/dispensary/README.md` | ✅ React.js spec |
| `apps/grower/README.md` | ✅ React.js spec |
| `apps/admin/README.md` | ✅ React.js spec |
| `backend/README.md` | ✅ Service architecture |
| `backend/services/auth/package.json` | ✅ NestJS stub |
| `backend/services/order/package.json` | ✅ NestJS stub |
| `backend/services/delivery/package.json` | ✅ NestJS stub |
| `backend/services/inventory/package.json` | ✅ NestJS stub |
| `backend/services/compliance/package.json` | ✅ NestJS stub |
| `backend/services/grower/package.json` | ✅ NestJS stub |
| `backend/services/notification/package.json` | ✅ NestJS stub |
| `docs/decisions/README.md` | ✅ ADR index |
| `docs/GITHUB_SETUP.md` | ✅ This file |

## Next steps after push

1. **API endpoint map** — every route across all 7 services (method, path, auth role, request/response shape)
2. **Backend scaffolding** — NestJS modules, controllers, services for the auth + order services first
3. **Frontend scaffolding** — React Native setup for customer app
