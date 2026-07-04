-- ─── CannaRoute — Seed Data ───────────────────────────────────────────────────
-- Run this ONCE after the first deploy to seed reference data.
-- TypeORM synchronize creates the schema; this populates the lookup tables.
--
-- Usage (Render shell or local psql):
--   psql $DATABASE_URL < database/seed.sql
--
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
-- ──────────────────────────────────────────────────────────────────────────────


-- ─── Michigan ─────────────────────────────────────────────────────────────────
-- Adult-use + medical. Delivery permitted 9am–9pm local time.
-- Per-transaction limits: 2.5oz flower (~70.87g), 15g concentrate, 100mg THC edibles.
-- Taxes: 10% excise + 6% state sales = 16% effective rate.

INSERT INTO compliance_rules (
  state_code, state_name,
  is_active, adult_use_allowed, medical_allowed, delivery_allowed,
  adult_use_flower_limit_grams, medical_flower_limit_grams,
  adult_use_concentrate_limit_grams, medical_concentrate_limit_grams,
  adult_use_edible_thc_limit_mg, medical_edible_thc_limit_mg,
  delivery_hours_start, delivery_hours_end,
  delivery_requires_age_verification, delivery_requires_signature,
  excise_tax_rate, sales_tax_rate,
  seed_to_sale_system, license_api_url,
  coa_validity_days, require_pesticide_testing
) VALUES (
  'MI', 'Michigan',
  TRUE, TRUE, TRUE, TRUE,
  70.87, 70.87,
  15.0, 15.0,
  100, 200,
  '09:00', '21:00',
  TRUE, TRUE,
  0.1000, 0.0600,
  'metrc', 'https://aca.cannaroute.io/mi/cra/',
  365, TRUE
)
ON CONFLICT (state_code) DO NOTHING;


-- ─── Add additional states below as CannaRoute expands ────────────────────────
-- Template:
-- INSERT INTO compliance_rules (state_code, state_name, ...) VALUES ('CO', 'Colorado', ...) ON CONFLICT DO NOTHING;
