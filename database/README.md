# CannaRoute — Database

PostgreSQL · Primary data store

## Files
- `schema.sql` — Full CREATE TABLE statements for all tables (coming next)
- `migrations/` — Versioned migration files (001_initial.sql, 002_..., etc.)

## Core Tables

| Table | Description |
|---|---|
| `users` | All user types — customer, driver, dispensary_admin, grower, platform_admin |
| `dispensaries` | Licensed dispensary locations with compliance config |
| `products` | Product catalog per dispensary with grower links |
| `growers` | Licensed cultivator profiles |
| `pesticide_logs` | Per-crop pesticide application records |
| `lab_tests` | COA data — cannabinoids, terpenes, pass/fail panels |
| `orders` | Order lifecycle with full item + pricing data |
| `deliveries` | Delivery records — driver, GPS route, signature, proof photo |
| `compliance_rules` | Per-state rule configuration (purchase limits, hours, tax rates, S2S system) |
| `drivers` | Driver profiles, license info, vehicle GPS |
| `payments` | Payment records per order |
| `notifications` | Notification log |

## Design Principles
- Every compliance rule lives in `compliance_rules` — adding a state = inserting one row
- No hard-coded state logic in application code
- All timestamps in UTC
- Soft deletes where applicable (`deleted_at` column)
- UUIDs for primary keys (not sequential integers — prevents enumeration)
