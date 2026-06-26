# CannaRoute — Admin / Compliance Panel

React.js (web) — Internal CannaRoute team only

## Screens
- Platform overview — Active states, dispensary count, order volume, revenue
- State compliance config — compliance_rules table UI (purchase limits, delivery hours, tax rates, seed-to-sale system, compliance flags)
- License verification queue — Pending dispensary + grower license reviews
- Dispensary management — Onboarding, SaaS tier, Metrc API key management
- Grower management — Verification status, COA review, flagged inconsistencies
- Metrc sync logs — Per-dispensary sync history, error alerts
- Manifest audit — Searchable delivery manifest archive

## Key Design Principle
Every compliance rule is a field in the `compliance_rules` database table.
Adding a new Metrc state = insert one row + select the Metrc adapter.
No code changes, no deployments.

## Wireframe
See `/wireframes/wireframe_driver_grower_admin.html`
