-- ============================================================
-- CannaRoute — PostgreSQL Database Schema
-- Version: 0.1.0 (Michigan pilot)
-- All timestamps UTC · UUIDs for PKs · Soft deletes via deleted_at
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. COMPLIANCE RULES
-- One row per state. The entire compliance engine reads from here.
-- Adding a new state = INSERT one row. No code changes.
-- ============================================================

CREATE TABLE compliance_rules (
  state_code                   CHAR(2)         PRIMARY KEY,  -- 'MI', 'CO', 'CA', etc.
  state_name                   VARCHAR(64)     NOT NULL,

  -- Market type
  adult_use_enabled            BOOLEAN         NOT NULL DEFAULT FALSE,
  medical_enabled              BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Purchase limits (stored in grams)
  adult_use_per_transaction_g  NUMERIC(8,2)    NOT NULL DEFAULT 70.87,  -- 2.5 oz
  medical_daily_limit_g        NUMERIC(8,2)    NOT NULL DEFAULT 56.70,  -- 2 oz
  medical_monthly_limit_g      NUMERIC(8,2)    NOT NULL DEFAULT 283.50, -- 10 oz
  driver_carry_limit_g         NUMERIC(8,2)    NOT NULL DEFAULT 425.24, -- 15 oz

  -- Delivery hours (local time, stored as TIME)
  delivery_start_time          TIME            NOT NULL DEFAULT '08:00:00',
  delivery_end_time            TIME            NOT NULL DEFAULT '21:00:00',

  -- Seed-to-sale system
  -- Options: 'metrc', 'biotrack', 'leafdata', 'none'
  seed_to_sale_system          VARCHAR(16)     NOT NULL DEFAULT 'metrc',
  s2s_api_endpoint             VARCHAR(255),   -- e.g. 'https://api.metrc.com/v2/'
  s2s_sync_on_delivery         BOOLEAN         NOT NULL DEFAULT TRUE,

  -- Tax rates (stored as decimal, e.g. 0.10 = 10%)
  adult_use_excise_tax_rate    NUMERIC(5,4)    NOT NULL DEFAULT 0.1000,
  medical_excise_tax_rate      NUMERIC(5,4)    NOT NULL DEFAULT 0.0000,
  state_sales_tax_rate         NUMERIC(5,4)    NOT NULL DEFAULT 0.0600,

  -- Compliance flags
  id_verification_required     BOOLEAN         NOT NULL DEFAULT TRUE,
  gps_tracking_required        BOOLEAN         NOT NULL DEFAULT TRUE,
  delivery_manifest_required   BOOLEAN         NOT NULL DEFAULT TRUE,
  customer_signature_required  BOOLEAN         NOT NULL DEFAULT TRUE,
  proof_of_delivery_photo_req  BOOLEAN         NOT NULL DEFAULT TRUE,

  -- License verification API
  license_api_url              VARCHAR(255),   -- e.g. MI CRA Accela endpoint
  license_api_key_env_var      VARCHAR(128),   -- name of env var holding the key

  -- Metadata
  active                       BOOLEAN         NOT NULL DEFAULT TRUE,
  created_at                   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Seed: Michigan
INSERT INTO compliance_rules (
  state_code, state_name,
  adult_use_enabled, medical_enabled,
  adult_use_per_transaction_g, medical_daily_limit_g, medical_monthly_limit_g, driver_carry_limit_g,
  delivery_start_time, delivery_end_time,
  seed_to_sale_system, s2s_api_endpoint, s2s_sync_on_delivery,
  adult_use_excise_tax_rate, medical_excise_tax_rate, state_sales_tax_rate,
  license_api_url, license_api_key_env_var
) VALUES (
  'MI', 'Michigan',
  TRUE, TRUE,
  70.87, 56.70, 283.50, 425.24,
  '08:00:00', '21:00:00',
  'metrc', 'https://api.metrc.com/v2/', TRUE,
  0.1000, 0.0000, 0.0600,
  'https://aca.cannaroute.io/mi/cra/', 'MI_CRA_API_KEY'
);


-- ============================================================
-- 2. USERS
-- All account types share this table. Role drives access.
-- ============================================================

CREATE TABLE users (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255)    NOT NULL UNIQUE,
  phone             VARCHAR(20),
  password_hash     VARCHAR(255),   -- NULL if SSO-only
  -- Roles: customer | driver | dispensary_admin | grower | platform_admin
  role              VARCHAR(32)     NOT NULL,
  first_name        VARCHAR(128)    NOT NULL,
  last_name         VARCHAR(128)    NOT NULL,

  -- Age/ID verification (customers)
  age_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
  age_verified_at   TIMESTAMPTZ,
  dob               DATE,           -- stored after ID scan

  -- Medical patient (customers only)
  is_medical        BOOLEAN         NOT NULL DEFAULT FALSE,
  medical_card_number VARCHAR(128),
  medical_card_state  CHAR(2),
  medical_card_expiry DATE,
  medical_verified  BOOLEAN         NOT NULL DEFAULT FALSE,

  -- State / jurisdiction
  state_code        CHAR(2)         REFERENCES compliance_rules(state_code),

  -- Auth
  mfa_enabled       BOOLEAN         NOT NULL DEFAULT FALSE,
  last_login_at     TIMESTAMPTZ,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMPTZ,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ     -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_state ON users(state_code);


-- ============================================================
-- 3. DISPENSARIES
-- ============================================================

CREATE TABLE dispensaries (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255)    NOT NULL,
  slug              VARCHAR(128)    NOT NULL UNIQUE, -- for URL paths
  state_code        CHAR(2)         NOT NULL REFERENCES compliance_rules(state_code),

  -- License
  license_number    VARCHAR(128)    NOT NULL,
  license_type      VARCHAR(64),    -- e.g. 'Class A Retailer'
  license_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
  license_verified_at TIMESTAMPTZ,

  -- Market types enabled (subset of what state allows)
  adult_use_enabled BOOLEAN         NOT NULL DEFAULT FALSE,
  medical_enabled   BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Location
  address_street    VARCHAR(255)    NOT NULL,
  address_city      VARCHAR(128)    NOT NULL,
  address_zip       VARCHAR(20)     NOT NULL,
  lat               NUMERIC(10,7),
  lng               NUMERIC(10,7),
  delivery_radius_mi NUMERIC(5,2)   NOT NULL DEFAULT 10.0,

  -- Hours (stored as JSON array of {day:0-6, open:"09:00", close:"21:00"})
  hours             JSONB           NOT NULL DEFAULT '[]',

  -- Metrc integration
  metrc_api_key_enc VARCHAR(512),   -- encrypted at rest
  metrc_license_key VARCHAR(128),   -- Metrc-issued license key
  metrc_connected   BOOLEAN         NOT NULL DEFAULT FALSE,
  metrc_last_sync   TIMESTAMPTZ,

  -- SaaS tier: 'starter' | 'growth' | 'enterprise'
  saas_tier         VARCHAR(32)     NOT NULL DEFAULT 'starter',
  -- Commission rate (override from tier default)
  commission_rate   NUMERIC(4,3)    NOT NULL DEFAULT 0.100, -- 10%

  -- Branding
  logo_url          VARCHAR(512),
  banner_url        VARCHAR(512),
  description       TEXT,

  -- Status
  active            BOOLEAN         NOT NULL DEFAULT FALSE, -- set TRUE after onboarding
  onboarded_at      TIMESTAMPTZ,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- Dispensary admins link
CREATE TABLE dispensary_users (
  dispensary_id     UUID            NOT NULL REFERENCES dispensaries(id),
  user_id           UUID            NOT NULL REFERENCES users(id),
  is_owner          BOOLEAN         NOT NULL DEFAULT FALSE,
  PRIMARY KEY (dispensary_id, user_id)
);

CREATE INDEX idx_dispensaries_state ON dispensaries(state_code);
CREATE INDEX idx_dispensaries_location ON dispensaries(lat, lng);


-- ============================================================
-- 4. GROWERS
-- ============================================================

CREATE TABLE growers (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES users(id) UNIQUE,
  farm_name         VARCHAR(255)    NOT NULL,
  state_code        CHAR(2)         NOT NULL REFERENCES compliance_rules(state_code),

  -- License
  license_number    VARCHAR(128)    NOT NULL,
  license_type      VARCHAR(128),   -- e.g. 'Class C Grower'
  license_verified  BOOLEAN         NOT NULL DEFAULT FALSE,
  license_verified_at TIMESTAMPTZ,

  -- Location
  address_city      VARCHAR(128),
  address_state     CHAR(2),
  lat               NUMERIC(10,7),
  lng               NUMERIC(10,7),

  -- Cultivation
  -- grow_type: 'indoor' | 'outdoor' | 'greenhouse'
  grow_type         VARCHAR(32),
  -- pesticide_policy: 'pesticide_free' | 'ipm' | 'conventional'
  pesticide_policy  VARCHAR(32),
  farm_size_sqft    INTEGER,
  established_year  INTEGER,

  -- Certifications (auto-verified against public directories)
  clean_green_certified    BOOLEAN  NOT NULL DEFAULT FALSE,
  clean_green_verified_at  TIMESTAMPTZ,
  sun_earth_certified      BOOLEAN  NOT NULL DEFAULT FALSE,
  sun_earth_verified_at    TIMESTAMPTZ,

  -- Branding
  description       TEXT,
  photos            JSONB           DEFAULT '[]', -- array of S3 URLs

  -- SaaS tier: 'free' | 'verified' | 'premium'
  saas_tier         VARCHAR(32)     NOT NULL DEFAULT 'free',

  -- Verification pipeline status
  -- 'pending' | 'license_check' | 'coa_pending' | 'pesticide_pending' | 'verified' | 'rejected'
  verification_status VARCHAR(32)   NOT NULL DEFAULT 'pending',
  verification_notes  TEXT,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_growers_state ON growers(state_code);
CREATE INDEX idx_growers_verification ON growers(verification_status);


-- ============================================================
-- 5. PRODUCTS
-- ============================================================

CREATE TABLE products (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  dispensary_id     UUID            NOT NULL REFERENCES dispensaries(id),
  grower_id         UUID            REFERENCES growers(id), -- nullable — not all products linked

  -- Identity
  name              VARCHAR(255)    NOT NULL,
  sku               VARCHAR(128),
  description       TEXT,
  -- category: 'flower' | 'edible' | 'concentrate' | 'vape' | 'tincture' | 'topical' | 'pre_roll' | 'other'
  category          VARCHAR(32)     NOT NULL,
  -- strain_type: 'indica' | 'sativa' | 'hybrid' | 'cbd'
  strain_type       VARCHAR(16),
  strain_name       VARCHAR(128),

  -- Cannabinoids (as %)
  thc_pct           NUMERIC(5,2),
  cbd_pct           NUMERIC(5,2),
  thca_pct          NUMERIC(5,2),

  -- Weight / quantity (for compliance weight tracking)
  weight_grams      NUMERIC(8,3),   -- per unit, NULL for non-flower (edibles use mg_thc)
  mg_thc            NUMERIC(8,2),   -- for edibles

  -- Pricing
  price_cents       INTEGER         NOT NULL, -- stored in cents to avoid float issues
  -- e.g. for 3.5g flower at $38.00 → 3800

  -- Inventory (units in stock)
  stock_count       INTEGER         NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER       NOT NULL DEFAULT 5,

  -- Metrc
  metrc_package_id  VARCHAR(128),   -- Metrc package tag
  batch_number      VARCHAR(128),

  -- Media
  photo_urls        JSONB           DEFAULT '[]',

  -- Status
  -- 'active' | 'hidden' | 'out_of_stock' | 'coa_expired'
  status            VARCHAR(32)     NOT NULL DEFAULT 'active',
  is_on_menu        BOOLEAN         NOT NULL DEFAULT TRUE,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_products_dispensary ON products(dispensary_id);
CREATE INDEX idx_products_grower ON products(grower_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);


-- ============================================================
-- 6. LAB TESTS (COAs)
-- ============================================================

CREATE TABLE lab_tests (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id         UUID            NOT NULL REFERENCES growers(id),
  product_id        UUID            REFERENCES products(id), -- linked after dispensary confirms

  -- Lab info
  lab_name          VARCHAR(255)    NOT NULL,
  lab_license_number VARCHAR(128)   NOT NULL,
  lab_license_verified BOOLEAN      NOT NULL DEFAULT FALSE,

  -- Batch
  batch_number      VARCHAR(128)    NOT NULL,
  test_date         DATE            NOT NULL,
  expiry_date       DATE            NOT NULL, -- typically test_date + 6 months

  -- Cannabinoids
  total_thc_pct     NUMERIC(5,2),
  total_cbd_pct     NUMERIC(5,2),
  thca_pct          NUMERIC(5,2),
  cbda_pct          NUMERIC(5,2),
  terpenes          JSONB           DEFAULT '{}', -- {linalool: 0.12, myrcene: 0.31, ...}

  -- Panel results: 'pass' | 'fail' | 'not_tested'
  pesticides_result      VARCHAR(16),
  pesticides_pass        BOOLEAN,
  microbials_result      VARCHAR(16),
  microbials_pass        BOOLEAN,
  heavy_metals_result    VARCHAR(16),
  heavy_metals_pass      BOOLEAN,
  residual_solvents_result VARCHAR(16),
  residual_solvents_pass BOOLEAN,
  mycotoxins_result      VARCHAR(16),
  mycotoxins_pass        BOOLEAN,

  -- Overall
  overall_pass      BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Raw COA file
  coa_pdf_s3_key    VARCHAR(512),   -- S3 object key
  coa_pdf_url       VARCHAR(512),   -- public or presigned URL

  -- Parse metadata
  -- 'pending' | 'parsed' | 'manual_review' | 'verified'
  parse_status      VARCHAR(32)     NOT NULL DEFAULT 'pending',
  parse_confidence  NUMERIC(4,3),   -- 0.0–1.0, OCR confidence score
  parsed_at         TIMESTAMPTZ,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lab_tests_grower ON lab_tests(grower_id);
CREATE INDEX idx_lab_tests_product ON lab_tests(product_id);
CREATE INDEX idx_lab_tests_expiry ON lab_tests(expiry_date);
CREATE INDEX idx_lab_tests_batch ON lab_tests(batch_number);


-- ============================================================
-- 7. PESTICIDE LOGS
-- ============================================================

CREATE TABLE pesticide_logs (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id         UUID            NOT NULL REFERENCES growers(id),

  -- What was applied (or null if claiming none)
  no_pesticides_used BOOLEAN        NOT NULL DEFAULT FALSE,

  -- If pesticide was used:
  pesticide_name    VARCHAR(255),
  epa_reg_number    VARCHAR(64),    -- e.g. '4787-12'
  epa_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
  epa_verified_at   TIMESTAMPTZ,
  application_date  DATE,
  pre_harvest_interval_days INTEGER, -- PHI from label
  target_pest       VARCHAR(255),
  application_method VARCHAR(128),
  application_rate  VARCHAR(128),   -- e.g. '2 fl oz per 1000 sq ft'

  -- Crop linkage
  strain_name       VARCHAR(128),
  harvest_date      DATE,
  batch_number      VARCHAR(128),

  -- Notes
  notes             TEXT,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pesticide_logs_grower ON pesticide_logs(grower_id);
CREATE INDEX idx_pesticide_logs_batch ON pesticide_logs(batch_number);


-- ============================================================
-- 8. DRIVERS
-- ============================================================

CREATE TABLE drivers (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES users(id) UNIQUE,
  -- Dispensary the driver is employed by (Phase 1: dispensary W-2)
  -- NULL if CannaRoute W-2 (Phase 2)
  dispensary_id     UUID            REFERENCES dispensaries(id),

  -- Identity
  license_number    VARCHAR(128)    NOT NULL, -- driver's license
  license_state     CHAR(2)         NOT NULL,
  license_expiry    DATE            NOT NULL,
  dob               DATE            NOT NULL,
  age_at_hire       INTEGER,        -- must be 21+

  -- Background check
  background_check_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  -- 'pending' | 'clear' | 'review' | 'failed'
  background_check_provider VARCHAR(64) DEFAULT 'checkr',
  background_check_id VARCHAR(128),
  background_checked_at TIMESTAMPTZ,

  -- Vehicle
  vehicle_make      VARCHAR(64),
  vehicle_model     VARCHAR(64),
  vehicle_year      INTEGER,
  vehicle_plate     VARCHAR(32),
  vehicle_state     CHAR(2),
  vehicle_insurance_verified BOOLEAN NOT NULL DEFAULT FALSE,
  vehicle_registration_verified BOOLEAN NOT NULL DEFAULT FALSE,

  -- Current GPS position (updated every ~5s via Redis, persisted here periodically)
  last_lat          NUMERIC(10,7),
  last_lng          NUMERIC(10,7),
  last_gps_update   TIMESTAMPTZ,

  -- Status: 'offline' | 'available' | 'en_route_pickup' | 'en_route_delivery' | 'break'
  status            VARCHAR(32)     NOT NULL DEFAULT 'offline',

  -- Ratings
  rating            NUMERIC(3,2)    NOT NULL DEFAULT 5.00,
  total_deliveries  INTEGER         NOT NULL DEFAULT 0,

  -- Employment type: 'dispensary_w2' | 'cannaroute_w2' | 'cannaroute_peo'
  employment_type   VARCHAR(32)     NOT NULL DEFAULT 'dispensary_w2',

  -- Pay (Phase 1: dispensary sets pay; Phase 2: CannaRoute sets)
  base_pay_per_delivery_cents INTEGER NOT NULL DEFAULT 500, -- $5.00

  -- Metadata
  active            BOOLEAN         NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_drivers_dispensary ON drivers(dispensary_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_location ON drivers(last_lat, last_lng);


-- ============================================================
-- 9. ORDERS
-- ============================================================

CREATE TABLE orders (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      VARCHAR(32)     NOT NULL UNIQUE, -- human-readable, e.g. 'CR-48301'
  customer_id       UUID            NOT NULL REFERENCES users(id),
  dispensary_id     UUID            NOT NULL REFERENCES dispensaries(id),
  driver_id         UUID            REFERENCES drivers(id),
  state_code        CHAR(2)         NOT NULL REFERENCES compliance_rules(state_code),

  -- Order type: 'adult_use' | 'medical'
  order_type        VARCHAR(16)     NOT NULL,

  -- Delivery address
  delivery_address  VARCHAR(255)    NOT NULL,
  delivery_city     VARCHAR(128)    NOT NULL,
  delivery_zip      VARCHAR(20)     NOT NULL,
  delivery_lat      NUMERIC(10,7),
  delivery_lng      NUMERIC(10,7),

  -- Pricing (all in cents)
  subtotal_cents        INTEGER     NOT NULL,
  delivery_fee_cents    INTEGER     NOT NULL DEFAULT 399,
  excise_tax_cents      INTEGER     NOT NULL DEFAULT 0,
  sales_tax_cents       INTEGER     NOT NULL DEFAULT 0,
  total_cents           INTEGER     NOT NULL,
  cannaroute_fee_cents  INTEGER     NOT NULL, -- platform commission
  dispensary_net_cents  INTEGER     NOT NULL, -- dispensary keeps this

  -- Payment
  -- method: 'point_of_banking' | 'ach' | 'cash'
  payment_method    VARCHAR(32)     NOT NULL,
  payment_status    VARCHAR(32)     NOT NULL DEFAULT 'pending',
  -- 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'

  -- Order status state machine:
  -- placed → confirmed → preparing → picked_up → in_transit → delivered | cancelled
  status            VARCHAR(32)     NOT NULL DEFAULT 'placed',
  placed_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ,
  preparing_at      TIMESTAMPTZ,
  picked_up_at      TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Total cannabis weight (for compliance purchase limit check)
  total_cannabis_weight_g NUMERIC(8,3) NOT NULL DEFAULT 0,

  -- Compliance checks (logged at order placement)
  compliance_check_passed BOOLEAN   NOT NULL DEFAULT FALSE,
  compliance_check_notes  JSONB     DEFAULT '{}',

  -- Metrc
  metrc_sale_id     VARCHAR(128),   -- returned by Metrc after sale report
  metrc_reported_at TIMESTAMPTZ,

  -- Instructions
  delivery_instructions TEXT,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Order line items
CREATE TABLE order_items (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID            NOT NULL REFERENCES orders(id),
  product_id        UUID            NOT NULL REFERENCES products(id),
  grower_id         UUID            REFERENCES growers(id), -- denormalized for fast access
  lab_test_id       UUID            REFERENCES lab_tests(id), -- COA in effect at time of order

  quantity          INTEGER         NOT NULL DEFAULT 1,
  unit_price_cents  INTEGER         NOT NULL,
  total_price_cents INTEGER         NOT NULL,
  weight_per_unit_g NUMERIC(8,3),  -- for compliance weight tracking
  total_weight_g    NUMERIC(8,3),

  -- Snapshot of product name / batch at time of order (for audit)
  product_name_snapshot  VARCHAR(255),
  batch_number_snapshot  VARCHAR(128),
  metrc_package_id_snapshot VARCHAR(128),

  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_dispensary ON orders(dispensary_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_placed_at ON orders(placed_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);


-- ============================================================
-- 10. DELIVERIES
-- ============================================================

CREATE TABLE deliveries (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID            NOT NULL REFERENCES orders(id) UNIQUE,
  driver_id         UUID            NOT NULL REFERENCES drivers(id),

  -- GPS route log (array of {lat, lng, ts} — appended every ~30s)
  gps_route         JSONB           NOT NULL DEFAULT '[]',

  -- Carry limit check at pickup
  carry_weight_g    NUMERIC(8,3),   -- total weight driver is carrying for this delivery
  carry_limit_ok    BOOLEAN,

  -- ID verification at door
  id_scanned        BOOLEAN         NOT NULL DEFAULT FALSE,
  id_scan_age_confirmed BOOLEAN     NOT NULL DEFAULT FALSE,
  id_scan_timestamp TIMESTAMPTZ,
  -- We store age bucket, not raw ID data
  customer_age_confirmed_over_21 BOOLEAN,

  -- Proof of delivery
  customer_signature_s3_key VARCHAR(512),
  delivery_photo_s3_key     VARCHAR(512),
  signature_captured_at     TIMESTAMPTZ,
  photo_captured_at         TIMESTAMPTZ,

  -- Timing
  assigned_at       TIMESTAMPTZ,
  picked_up_at      TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  delivery_duration_minutes INTEGER, -- calculated on completion

  -- Driver earnings for this delivery
  base_pay_cents    INTEGER,
  tip_cents         INTEGER         NOT NULL DEFAULT 0,
  total_pay_cents   INTEGER,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);


-- ============================================================
-- 11. PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID            NOT NULL REFERENCES orders(id),
  customer_id       UUID            NOT NULL REFERENCES users(id),

  -- method: 'point_of_banking' | 'ach' | 'cash'
  method            VARCHAR(32)     NOT NULL,
  amount_cents      INTEGER         NOT NULL,

  -- External payment processor reference
  processor         VARCHAR(64),    -- 'paytender' | 'hypur' | 'dwolla' | null (cash)
  processor_transaction_id VARCHAR(255),
  processor_response JSONB          DEFAULT '{}',

  -- status: 'initiated' | 'authorized' | 'captured' | 'failed' | 'refunded'
  status            VARCHAR(32)     NOT NULL DEFAULT 'initiated',

  -- For Point of Banking: ATM transaction metadata
  atm_network_id    VARCHAR(128),
  atm_surcharge_cents INTEGER       DEFAULT 0,

  -- For ACH: bank account reference (tokenized, never raw)
  bank_account_token VARCHAR(255),
  ach_trace_number  VARCHAR(128),

  -- For cash: collected at door by driver
  cash_amount_tendered_cents INTEGER,
  cash_change_due_cents      INTEGER,

  initiated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_reason    TEXT,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);


-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID            NOT NULL REFERENCES users(id),
  order_id          UUID            REFERENCES orders(id),

  -- type: 'order_placed' | 'order_confirmed' | 'driver_assigned' | 'driver_nearby'
  --        | 'delivered' | 'medical_card_expiring' | 'coa_expiring' | 'low_stock'
  type              VARCHAR(64)     NOT NULL,

  -- channel: 'push' | 'sms' | 'email'
  channel           VARCHAR(16)     NOT NULL,

  title             VARCHAR(255),
  body              TEXT            NOT NULL,

  -- Delivery status
  -- 'pending' | 'sent' | 'delivered' | 'failed'
  status            VARCHAR(32)     NOT NULL DEFAULT 'pending',

  -- External reference
  provider          VARCHAR(64),    -- 'fcm' | 'twilio' | 'sendgrid'
  provider_message_id VARCHAR(255),

  sent_at           TIMESTAMPTZ,
  failed_at         TIMESTAMPTZ,
  failure_reason    TEXT,

  -- Metadata
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);


-- ============================================================
-- 13. PURCHASE LIMITS (daily/monthly tracking for medical patients)
-- Used by compliance service to enforce purchase limits
-- ============================================================

CREATE TABLE purchase_limits (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID            NOT NULL REFERENCES users(id),
  state_code        CHAR(2)         NOT NULL REFERENCES compliance_rules(state_code),
  order_id          UUID            NOT NULL REFERENCES orders(id),

  -- What was purchased
  cannabis_weight_g NUMERIC(8,3)   NOT NULL,
  purchase_date     DATE            NOT NULL DEFAULT CURRENT_DATE,

  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- For fast purchase limit lookups (compliance service uses this constantly)
CREATE INDEX idx_purchase_limits_customer_state_date
  ON purchase_limits(customer_id, state_code, purchase_date);


-- ============================================================
-- VIEWS: Useful precomputed queries
-- ============================================================

-- Active products with grower + latest COA info
CREATE VIEW vw_products_with_grower AS
SELECT
  p.id,
  p.dispensary_id,
  p.name,
  p.category,
  p.strain_type,
  p.strain_name,
  p.thc_pct,
  p.cbd_pct,
  p.weight_grams,
  p.price_cents,
  p.stock_count,
  p.status,
  p.is_on_menu,
  g.id AS grower_id,
  g.farm_name,
  g.grow_type,
  g.pesticide_policy,
  g.clean_green_certified,
  g.sun_earth_certified,
  g.verification_status AS grower_verification_status,
  lt.id AS lab_test_id,
  lt.batch_number,
  lt.test_date,
  lt.expiry_date,
  lt.overall_pass AS coa_pass,
  lt.coa_pdf_url,
  CASE WHEN lt.expiry_date < CURRENT_DATE THEN TRUE ELSE FALSE END AS coa_expired
FROM products p
LEFT JOIN growers g ON p.grower_id = g.id
LEFT JOIN lab_tests lt ON lt.product_id = p.id
  AND lt.expiry_date = (
    SELECT MAX(expiry_date) FROM lab_tests
    WHERE product_id = p.id
  )
WHERE p.deleted_at IS NULL;


-- Active orders with driver GPS position
CREATE VIEW vw_active_orders AS
SELECT
  o.id,
  o.order_number,
  o.dispensary_id,
  o.customer_id,
  o.driver_id,
  o.status,
  o.total_cents,
  o.placed_at,
  o.confirmed_at,
  o.picked_up_at,
  o.delivery_address,
  o.delivery_lat,
  o.delivery_lng,
  d.last_lat AS driver_lat,
  d.last_lng AS driver_lng,
  d.last_gps_update,
  u.first_name || ' ' || u.last_name AS driver_name,
  drv.rating AS driver_rating,
  drv.total_deliveries AS driver_total_deliveries
FROM orders o
LEFT JOIN drivers drv ON o.driver_id = drv.id
LEFT JOIN users u ON drv.user_id = u.id
LEFT JOIN drivers d ON o.driver_id = d.id
WHERE o.status NOT IN ('delivered', 'cancelled');


-- ============================================================
-- FUNCTIONS: Common operations
-- ============================================================

-- Auto-update updated_at on any table that uses it
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_dispensaries
  BEFORE UPDATE ON dispensaries
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_growers
  BEFORE UPDATE ON growers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_lab_tests
  BEFORE UPDATE ON lab_tests
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_drivers
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_deliveries
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_compliance_rules
  BEFORE UPDATE ON compliance_rules
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ============================================================
-- MIGRATIONS PATTERN (for reference)
-- All schema changes go through numbered migration files:
-- migrations/001_initial.sql  ← this file
-- migrations/002_add_indexes.sql
-- migrations/003_add_state_co.sql  ← INSERT into compliance_rules only
-- etc.
-- ============================================================
