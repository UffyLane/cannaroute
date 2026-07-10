-- ─── CannaRoute Demo / Test Accounts ────────────────────────────────────────
-- Password for ALL accounts: Demo1234!
--
-- Run against production DB:
--   psql $DATABASE_URL < database/seed-demo-users.sql
--
-- Accounts:
--   customer@demo.canna-route.com   → Customer app
--   dispensary@demo.canna-route.com → Dispensary dashboard  (app.canna-route.com)
--   driver@demo.canna-route.com     → Driver app
--   grower@demo.canna-route.com     → Grower portal         (grow.canna-route.com)
--   admin@demo.canna-route.com      → Admin panel           (admin.canna-route.com)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (
  id,
  email,
  password_hash,
  role,
  first_name,
  last_name,
  phone,
  age_verified,
  age_verified_at,
  is_medical,
  state_code,
  mfa_enabled,
  created_at,
  updated_at
) VALUES

-- ── Customer ──────────────────────────────────────────────────────────────────
(
  gen_random_uuid(),
  'customer@demo.canna-route.com',
  '$2b$10$h19j9c19aMmGq5Ia37D7Y.W.1.DtPls.S/x5iGOXAeu.mOeWWOAeO',
  'customer',
  'Demo',
  'Customer',
  '+15551110001',
  true,
  NOW(),
  false,
  'MI',
  false,
  NOW(),
  NOW()
),

-- ── Dispensary Admin ──────────────────────────────────────────────────────────
(
  gen_random_uuid(),
  'dispensary@demo.canna-route.com',
  '$2b$10$FTp4J.jY9SA9h4YZTr6djegbLILD3yRdMOfSi19pw6kD.sD.D1/6S',
  'dispensary_admin',
  'Demo',
  'Dispensary',
  '+15551110002',
  true,
  NOW(),
  false,
  'MI',
  false,
  NOW(),
  NOW()
),

-- ── Driver ────────────────────────────────────────────────────────────────────
(
  gen_random_uuid(),
  'driver@demo.canna-route.com',
  '$2b$10$Oy8dokPWTRnQdZYB6rSRQeTJUopduQ/qdXXJxNtCC6YZDhdn7jyOC',
  'driver',
  'Demo',
  'Driver',
  '+15551110003',
  true,
  NOW(),
  false,
  'MI',
  false,
  NOW(),
  NOW()
),

-- ── Grower ────────────────────────────────────────────────────────────────────
(
  gen_random_uuid(),
  'grower@demo.canna-route.com',
  '$2b$10$HE8kkkvscw/PJukBUJ0D5.7TMjLvLB1ZMLZZkiR/gi3E34miKYDmm',
  'grower',
  'Demo',
  'Grower',
  '+15551110004',
  true,
  NOW(),
  false,
  'MI',
  false,
  NOW(),
  NOW()
),

-- ── Platform Admin ────────────────────────────────────────────────────────────
(
  gen_random_uuid(),
  'admin@demo.canna-route.com',
  '$2b$10$OigY1gcggvS/XyiODEJ2Yu.YzBrGlVSBIeHeeP23.jY2tFIHQbS.m',
  'platform_admin',
  'Demo',
  'Admin',
  '+15551110005',
  true,
  NOW(),
  false,
  'MI',
  false,
  NOW(),
  NOW()
)

ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at    = NOW();
