-- ============================================================
-- Migration 001 — Initial Schema
-- CannaRoute · PostgreSQL · Michigan Pilot
--
-- Apply:  psql $DATABASE_URL -f database/migrations/001_initial.sql
-- Safe:   All statements use IF NOT EXISTS — safe to re-run
-- Note:   Seed data (Michigan compliance_rules row) is in database/seed.sql
--         Run seed.sql once after this migration.
-- ============================================================

BEGIN;

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── updated_at trigger function ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. COMPLIANCE_RULES ─────────────────────────────────────────────────────
-- One row per state. The compliance engine reads exclusively from this table.
-- Adding a new state = INSERT one row. No code changes required.

CREATE TABLE IF NOT EXISTS compliance_rules (
  state_code                          VARCHAR(2)     PRIMARY KEY,
  state_name                          VARCHAR(64)    NOT NULL,

  is_active                           BOOLEAN        NOT NULL DEFAULT TRUE,
  adult_use_allowed                   BOOLEAN        NOT NULL DEFAULT FALSE,
  medical_allowed                     BOOLEAN        NOT NULL DEFAULT FALSE,
  delivery_allowed                    BOOLEAN        NOT NULL DEFAULT FALSE,

  -- Per-transaction purchase limits (grams)
  adult_use_flower_limit_grams        NUMERIC(8,3),
  medical_flower_limit_grams          NUMERIC(8,3),
  adult_use_concentrate_limit_grams   NUMERIC(8,3),
  medical_concentrate_limit_grams     NUMERIC(8,3),

  -- Edible limits (mg THC per transaction)
  adult_use_edible_thc_limit_mg       INTEGER,
  medical_edible_thc_limit_mg         INTEGER,

  -- Delivery hours (24h, e.g. '09:00', '21:00')
  delivery_hours_start                VARCHAR(5),
  delivery_hours_end                  VARCHAR(5),

  delivery_requires_age_verification  BOOLEAN        NOT NULL DEFAULT TRUE,
  delivery_requires_signature         BOOLEAN        NOT NULL DEFAULT TRUE,

  -- Tax rates (decimal: 0.10 = 10%)
  excise_tax_rate                     NUMERIC(5,4)   NOT NULL DEFAULT 0,
  sales_tax_rate                      NUMERIC(5,4)   NOT NULL DEFAULT 0,

  -- Seed-to-sale system: 'metrc' | 'biotrack' | 'leaf' | NULL
  seed_to_sale_system                 VARCHAR(16),

  -- License verification API (state licensing authority)
  license_api_url                     VARCHAR(255),

  -- COA requirements
  coa_validity_days                   INTEGER        NOT NULL DEFAULT 365,
  require_pesticide_testing           BOOLEAN        NOT NULL DEFAULT FALSE,

  updated_at                          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─── 2. USERS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     VARCHAR(255)  NOT NULL UNIQUE,
  phone                     VARCHAR(20),
  password_hash             VARCHAR(255),
  -- Roles: customer | driver | dispensary_admin | grower | platform_admin
  role                      VARCHAR(32)   NOT NULL,
  first_name                VARCHAR(128)  NOT NULL,
  last_name                 VARCHAR(128)  NOT NULL,

  -- Age / ID verification
  age_verified              BOOLEAN       NOT NULL DEFAULT FALSE,
  age_verified_at           TIMESTAMPTZ,
  dob                       DATE,

  -- Medical patient
  is_medical                BOOLEAN       NOT NULL DEFAULT FALSE,
  medical_card_number       VARCHAR(128),
  medical_card_state        VARCHAR(2),
  medical_card_expiry       DATE,
  medical_verified          BOOLEAN       NOT NULL DEFAULT FALSE,

  state_code                VARCHAR(2)    REFERENCES compliance_rules(state_code),

  -- Auth
  mfa_enabled               BOOLEAN       NOT NULL DEFAULT FALSE,
  last_login_at             TIMESTAMPTZ,
  password_reset_token      VARCHAR(255),
  password_reset_expires    TIMESTAMPTZ,

  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state_code);

-- ─── 3. DISPENSARIES ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dispensaries (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      VARCHAR(255)  NOT NULL,
  slug                      VARCHAR(128)  NOT NULL UNIQUE,
  state_code                VARCHAR(2)    NOT NULL REFERENCES compliance_rules(state_code),

  license_number            VARCHAR(128)  NOT NULL,
  license_type              VARCHAR(64),
  license_verified          BOOLEAN       NOT NULL DEFAULT FALSE,
  license_verified_at       TIMESTAMPTZ,

  adult_use_enabled         BOOLEAN       NOT NULL DEFAULT FALSE,
  medical_enabled           BOOLEAN       NOT NULL DEFAULT FALSE,

  address_street            VARCHAR(255)  NOT NULL,
  address_city              VARCHAR(128)  NOT NULL,
  address_zip               VARCHAR(20)   NOT NULL,
  lat                       NUMERIC(10,7),
  lng                       NUMERIC(10,7),
  delivery_radius_mi        NUMERIC(5,2)  NOT NULL DEFAULT 10.0,

  -- [{day:0-6, open:"09:00", close:"21:00"}]
  hours                     JSONB         NOT NULL DEFAULT '[]',

  -- Metrc integration
  metrc_api_key_enc         VARCHAR(512),
  metrc_license_key         VARCHAR(128),
  metrc_connected           BOOLEAN       NOT NULL DEFAULT FALSE,
  metrc_last_sync           TIMESTAMPTZ,

  -- SaaS tier: 'starter' | 'growth' | 'enterprise'
  saas_tier                 VARCHAR(32)   NOT NULL DEFAULT 'starter',
  commission_rate           NUMERIC(4,3)  NOT NULL DEFAULT 0.100,

  logo_url                  VARCHAR(512),
  banner_url                VARCHAR(512),
  description               TEXT,

  active                    BOOLEAN       NOT NULL DEFAULT FALSE,
  onboarded_at              TIMESTAMPTZ,

  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

-- Links dispensary admins to their dispensary
CREATE TABLE IF NOT EXISTS dispensary_users (
  dispensary_id             UUID          NOT NULL REFERENCES dispensaries(id),
  user_id                   UUID          NOT NULL REFERENCES users(id),
  is_owner                  BOOLEAN       NOT NULL DEFAULT FALSE,
  PRIMARY KEY (dispensary_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dispensaries_state    ON dispensaries(state_code);
CREATE INDEX IF NOT EXISTS idx_dispensaries_location ON dispensaries(lat, lng);

-- ─── 4. GROWERS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS growers (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID          NOT NULL REFERENCES users(id) UNIQUE,
  farm_name                 VARCHAR(255)  NOT NULL,
  state_code                VARCHAR(2)    NOT NULL REFERENCES compliance_rules(state_code),

  license_number            VARCHAR(128)  NOT NULL,
  license_type              VARCHAR(128),
  license_verified          BOOLEAN       NOT NULL DEFAULT FALSE,
  license_verified_at       TIMESTAMPTZ,

  address_city              VARCHAR(128),
  address_state             VARCHAR(2),
  lat                       NUMERIC(10,7),
  lng                       NUMERIC(10,7),

  -- grow_type: 'indoor' | 'outdoor' | 'greenhouse'
  grow_type                 VARCHAR(32),
  -- pesticide_policy: 'pesticide_free' | 'ipm' | 'conventional'
  pesticide_policy          VARCHAR(32),
  farm_size_sqft            INTEGER,
  established_year          INTEGER,

  -- Certifications (auto-verified against public directories)
  clean_green_certified     BOOLEAN       NOT NULL DEFAULT FALSE,
  clean_green_verified_at   TIMESTAMPTZ,
  sun_earth_certified       BOOLEAN       NOT NULL DEFAULT FALSE,
  sun_earth_verified_at     TIMESTAMPTZ,

  description               TEXT,
  photos                    JSONB         DEFAULT '[]',

  -- SaaS tier: 'free' | 'verified' | 'premium'
  saas_tier                 VARCHAR(32)   NOT NULL DEFAULT 'free',

  -- 'pending' | 'license_check' | 'coa_pending' | 'pesticide_pending' | 'verified' | 'rejected'
  verification_status       VARCHAR(32)   NOT NULL DEFAULT 'pending',
  verification_notes        TEXT,

  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_growers_state        ON growers(state_code);
CREATE INDEX IF NOT EXISTS idx_growers_verification ON growers(verification_status);

-- ─── 5. PRODUCTS ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  dispensary_id             UUID          NOT NULL REFERENCES dispensaries(id),
  grower_id                 UUID          REFERENCES growers(id),

  name                      VARCHAR(255)  NOT NULL,
  sku                       VARCHAR(128),
  description               TEXT,
  -- category: 'flower' | 'edible' | 'concentrate' | 'vape' | 'tincture' | 'topical' | 'pre_roll' | 'other'
  category                  VARCHAR(32)   NOT NULL,
  -- strain_type: 'indica' | 'sativa' | 'hybrid' | 'cbd'
  strain_type               VARCHAR(16),
  strain_name               VARCHAR(128),

  thc_pct                   NUMERIC(5,2),
  cbd_pct                   NUMERIC(5,2),
  thca_pct                  NUMERIC(5,2),

  weight_grams              NUMERIC(8,3),
  mg_thc                    NUMERIC(8,2),

  price_cents               INTEGER       NOT NULL,

  stock_count               INTEGER       NOT NULL DEFAULT 0,
  low_stock_threshold       INTEGER       NOT NULL DEFAULT 5,

  metrc_package_id          VARCHAR(128),
  batch_number              VARCHAR(128),

  photo_urls                JSONB         DEFAULT '[]',

  -- 'active' | 'hidden' | 'out_of_stock' | 'coa_expired'
  status                    VARCHAR(32)   NOT NULL DEFAULT 'active',
  is_on_menu                BOOLEAN       NOT NULL DEFAULT TRUE,

  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_products_dispensary ON products(dispensary_id);
CREATE INDEX IF NOT EXISTS idx_products_grower     ON products(grower_id);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status     ON products(status);

-- ─── 6. LAB TESTS (COAs) ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lab_tests (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id                 UUID          NOT NULL REFERENCES growers(id),
  product_id                UUID          REFERENCES products(id),

  lab_name                  VARCHAR(255)  NOT NULL,
  lab_license_number        VARCHAR(128)  NOT NULL,
  lab_license_verified      BOOLEAN       NOT NULL DEFAULT FALSE,

  batch_number              VARCHAR(128)  NOT NULL,
  test_date                 DATE          NOT NULL,
  expiry_date               DATE          NOT NULL,

  total_thc_pct             NUMERIC(5,2),
  total_cbd_pct             NUMERIC(5,2),
  thca_pct                  NUMERIC(5,2),
  cbda_pct                  NUMERIC(5,2),
  terpenes                  JSONB         DEFAULT '{}',

  -- Panel results: 'pass' | 'fail' | 'not_tested'
  pesticides_result         VARCHAR(16),
  pesticides_pass           BOOLEAN,
  microbials_result         VARCHAR(16),
  microbials_pass           BOOLEAN,
  heavy_metals_result       VARCHAR(16),
  heavy_metals_pass         BOOLEAN,
  residual_solvents_result  VARCHAR(16),
  residual_solvents_pass    BOOLEAN,
  mycotoxins_result         VARCHAR(16),
  mycotoxins_pass           BOOLEAN,

  overall_pass              BOOLEAN       NOT NULL DEFAULT FALSE,

  coa_pdf_s3_key            VARCHAR(512),

  -- 'pending' | 'parsed' | 'manual_review' | 'verified'
  parse_status              VARCHAR(32)   NOT NULL DEFAULT 'pending',
  parse_confidence          NUMERIC(4,3),
  parsed_at                 TIMESTAMPTZ,

  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_tests_grower  ON lab_tests(grower_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_product ON lab_tests(product_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_expiry  ON lab_tests(expiry_date);
CREATE INDEX IF NOT EXISTS idx_lab_tests_batch   ON lab_tests(batch_number);

-- ─── 7. PESTICIDE LOGS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pesticide_logs (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id                 UUID          NOT NULL REFERENCES growers(id),

  no_pesticides_used        BOOLEAN       NOT NULL DEFAULT FALSE,

  pesticide_name            VARCHAR(255),
  epa_reg_number            VARCHAR(64),
  epa_verified              BOOLEAN       NOT NULL DEFAULT FALSE,
  epa_verified_at           TIMESTAMPTZ,
  application_date          DATE,
  pre_harvest_interval_days INTEGER,
  target_pest               VARCHAR(255),
  application_method        VARCHAR(128),
  application_rate          VARCHAR(128),

  strain_name               VARCHAR(128),
  harvest_date              DATE,
  batch_number              VARCHAR(128),
  notes                     TEXT,

  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pesticide_logs_grower ON pesticide_logs(grower_id);
CREATE INDEX IF NOT EXISTS idx_pesticide_logs_batch  ON pesticide_logs(batch_number);

-- ─── 8. DRIVERS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS drivers (
  id                              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID        NOT NULL REFERENCES users(id) UNIQUE,
  dispensary_id                   UUID        REFERENCES dispensaries(id),

  license_number                  VARCHAR(128) NOT NULL,
  license_state                   VARCHAR(2)   NOT NULL,
  license_expiry                  DATE        NOT NULL,
  dob                             DATE        NOT NULL,
  age_at_hire                     INTEGER,

  -- 'pending' | 'clear' | 'review' | 'failed'
  background_check_status         VARCHAR(32) NOT NULL DEFAULT 'pending',
  background_check_provider       VARCHAR(64) DEFAULT 'checkr',
  background_check_id             VARCHAR(128),
  background_checked_at           TIMESTAMPTZ,

  vehicle_make                    VARCHAR(64),
  vehicle_model                   VARCHAR(64),
  vehicle_year                    INTEGER,
  vehicle_plate                   VARCHAR(32),
  vehicle_state                   VARCHAR(2),
  vehicle_insurance_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
  vehicle_registration_verified   BOOLEAN     NOT NULL DEFAULT FALSE,

  last_lat                        NUMERIC(10,7),
  last_lng                        NUMERIC(10,7),
  last_gps_update                 TIMESTAMPTZ,

  -- 'offline' | 'available' | 'en_route_pickup' | 'en_route_delivery' | 'break'
  status                          VARCHAR(32) NOT NULL DEFAULT 'offline',

  rating                          NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  total_deliveries                INTEGER     NOT NULL DEFAULT 0,

  -- 'dispensary_w2' | 'cannaroute_w2' | 'cannaroute_peo'
  employment_type                 VARCHAR(32) NOT NULL DEFAULT 'dispensary_w2',
  base_pay_per_delivery_cents     INTEGER     NOT NULL DEFAULT 500,

  active                          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_drivers_dispensary ON drivers(dispensary_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status     ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_location   ON drivers(last_lat, last_lng);

-- ─── 9. ORDERS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number                VARCHAR(32) NOT NULL UNIQUE,
  customer_id                 UUID        NOT NULL REFERENCES users(id),
  dispensary_id               UUID        NOT NULL REFERENCES dispensaries(id),
  driver_id                   UUID        REFERENCES drivers(id),
  state_code                  VARCHAR(2)  NOT NULL REFERENCES compliance_rules(state_code),

  -- 'adult_use' | 'medical'
  order_type                  VARCHAR(16) NOT NULL,

  delivery_address            VARCHAR(255) NOT NULL,
  delivery_city               VARCHAR(128) NOT NULL,
  delivery_zip                VARCHAR(20)  NOT NULL,
  delivery_lat                NUMERIC(10,7),
  delivery_lng                NUMERIC(10,7),

  subtotal_cents              INTEGER     NOT NULL,
  delivery_fee_cents          INTEGER     NOT NULL DEFAULT 399,
  excise_tax_cents            INTEGER     NOT NULL DEFAULT 0,
  sales_tax_cents             INTEGER     NOT NULL DEFAULT 0,
  total_cents                 INTEGER     NOT NULL,
  cannaroute_fee_cents        INTEGER     NOT NULL,
  dispensary_net_cents        INTEGER     NOT NULL,

  -- 'point_of_banking' | 'ach' | 'cash'
  payment_method              VARCHAR(32) NOT NULL,
  -- 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
  payment_status              VARCHAR(32) NOT NULL DEFAULT 'pending',

  -- State machine: placed → confirmed → preparing → picked_up → in_transit → delivered | cancelled
  status                      VARCHAR(32) NOT NULL DEFAULT 'placed',
  placed_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at                TIMESTAMPTZ,
  preparing_at                TIMESTAMPTZ,
  picked_up_at                TIMESTAMPTZ,
  delivered_at                TIMESTAMPTZ,
  cancelled_at                TIMESTAMPTZ,
  cancellation_reason         TEXT,

  total_cannabis_weight_g     NUMERIC(8,3) NOT NULL DEFAULT 0,

  compliance_check_passed     BOOLEAN     NOT NULL DEFAULT FALSE,
  compliance_check_notes      JSONB       DEFAULT '{}',

  metrc_sale_id               VARCHAR(128),
  metrc_reported_at           TIMESTAMPTZ,

  delivery_instructions       TEXT,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                    UUID        NOT NULL REFERENCES orders(id),
  product_id                  UUID        NOT NULL REFERENCES products(id),
  grower_id                   UUID        REFERENCES growers(id),
  lab_test_id                 UUID        REFERENCES lab_tests(id),

  quantity                    INTEGER     NOT NULL DEFAULT 1,
  unit_price_cents            INTEGER     NOT NULL,
  total_price_cents           INTEGER     NOT NULL,
  weight_per_unit_g           NUMERIC(8,3),
  total_weight_g              NUMERIC(8,3),

  -- Snapshots of product data at time of order (immutable audit record)
  product_name_snapshot       VARCHAR(255),
  batch_number_snapshot       VARCHAR(128),
  metrc_package_id_snapshot   VARCHAR(128),

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer   ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_dispensary ON orders(dispensary_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver     ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at  ON orders(placed_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── 10. DELIVERIES ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS deliveries (
  id                              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                        UUID        NOT NULL REFERENCES orders(id) UNIQUE,
  driver_id                       UUID        NOT NULL REFERENCES drivers(id),

  gps_route                       JSONB       NOT NULL DEFAULT '[]',

  carry_weight_g                  NUMERIC(8,3),
  carry_limit_ok                  BOOLEAN,

  id_scanned                      BOOLEAN     NOT NULL DEFAULT FALSE,
  id_scan_age_confirmed           BOOLEAN     NOT NULL DEFAULT FALSE,
  id_scan_timestamp               TIMESTAMPTZ,
  customer_age_confirmed_over_21  BOOLEAN,

  customer_signature_s3_key       VARCHAR(512),
  delivery_photo_s3_key           VARCHAR(512),
  signature_captured_at           TIMESTAMPTZ,
  photo_captured_at               TIMESTAMPTZ,

  assigned_at                     TIMESTAMPTZ,
  picked_up_at                    TIMESTAMPTZ,
  delivered_at                    TIMESTAMPTZ,
  delivery_duration_minutes       INTEGER,

  base_pay_cents                  INTEGER,
  tip_cents                       INTEGER     NOT NULL DEFAULT 0,
  total_pay_cents                 INTEGER,

  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order  ON deliveries(order_id);

-- ─── 11. PAYMENTS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payments (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                    UUID        NOT NULL REFERENCES orders(id),
  customer_id                 UUID        NOT NULL REFERENCES users(id),

  -- 'point_of_banking' | 'ach' | 'cash'
  method                      VARCHAR(32) NOT NULL,
  amount_cents                INTEGER     NOT NULL,

  processor                   VARCHAR(64),
  processor_transaction_id    VARCHAR(255),
  processor_response          JSONB       DEFAULT '{}',

  -- 'initiated' | 'authorized' | 'captured' | 'failed' | 'refunded'
  status                      VARCHAR(32) NOT NULL DEFAULT 'initiated',

  atm_network_id              VARCHAR(128),
  atm_surcharge_cents         INTEGER     DEFAULT 0,

  bank_account_token          VARCHAR(255),
  ach_trace_number            VARCHAR(128),

  cash_amount_tendered_cents  INTEGER,
  cash_change_due_cents       INTEGER,

  initiated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at                TIMESTAMPTZ,
  failed_at                   TIMESTAMPTZ,
  failure_reason              TEXT,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order  ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ─── 12. NOTIFICATIONS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID        NOT NULL REFERENCES users(id),
  order_id                    UUID        REFERENCES orders(id),

  type                        VARCHAR(64) NOT NULL,
  -- 'push' | 'sms' | 'email'
  channel                     VARCHAR(16) NOT NULL,

  title                       VARCHAR(255),
  body                        TEXT        NOT NULL,

  -- 'pending' | 'sent' | 'delivered' | 'failed'
  status                      VARCHAR(32) NOT NULL DEFAULT 'pending',

  provider                    VARCHAR(64),
  provider_message_id         VARCHAR(255),

  sent_at                     TIMESTAMPTZ,
  failed_at                   TIMESTAMPTZ,
  failure_reason              TEXT,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type   ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- ─── 13. PURCHASE LIMITS ──────────────────────────────────────────────────────
-- Tracks cumulative cannabis purchases per customer per calendar day.
-- Compliance service reads this on every order to enforce daily limits.

CREATE TABLE IF NOT EXISTS purchase_limits (
  id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                 UUID        NOT NULL REFERENCES users(id),
  order_id                    UUID        NOT NULL REFERENCES orders(id),
  state_code                  VARCHAR(2)  NOT NULL REFERENCES compliance_rules(state_code),

  purchase_date               DATE        NOT NULL DEFAULT CURRENT_DATE,

  flower_grams                NUMERIC(8,3) NOT NULL DEFAULT 0,
  concentrate_grams           NUMERIC(8,3) NOT NULL DEFAULT 0,
  edible_thc_mg               INTEGER     NOT NULL DEFAULT 0,

  is_medical                  BOOLEAN     NOT NULL DEFAULT FALSE,

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_limits_customer_state_date
  ON purchase_limits(customer_id, state_code, purchase_date);

-- ─── updated_at triggers ──────────────────────────────────────────────────────
-- Wrapped in DO blocks so re-running the migration doesn't error on duplicate triggers.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_users') THEN
    CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_dispensaries') THEN
    CREATE TRIGGER set_updated_at_dispensaries
      BEFORE UPDATE ON dispensaries FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_growers') THEN
    CREATE TRIGGER set_updated_at_growers
      BEFORE UPDATE ON growers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_products') THEN
    CREATE TRIGGER set_updated_at_products
      BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_lab_tests') THEN
    CREATE TRIGGER set_updated_at_lab_tests
      BEFORE UPDATE ON lab_tests FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_drivers') THEN
    CREATE TRIGGER set_updated_at_drivers
      BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_orders') THEN
    CREATE TRIGGER set_updated_at_orders
      BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_deliveries') THEN
    CREATE TRIGGER set_updated_at_deliveries
      BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_payments') THEN
    CREATE TRIGGER set_updated_at_payments
      BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_compliance_rules') THEN
    CREATE TRIGGER set_updated_at_compliance_rules
      BEFORE UPDATE ON compliance_rules FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;

COMMIT;
