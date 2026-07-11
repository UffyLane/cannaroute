-- ─── CannaRoute Demo Dispensary + Products ────────────────────────────────────
-- Run ONCE against the Render production database to seed demo inventory data.
--
-- Usage (Render shell or psql):
--   psql $DATABASE_URL < database/seed-demo-dispensary.sql
--
-- Fixed UUIDs so this script is idempotent (safe to re-run).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Demo Dispensary ──────────────────────────────────────────────────────────

INSERT INTO dispensaries (
  id,
  name,
  slug,
  state_code,
  license_number,
  license_type,
  license_verified,
  license_verified_at,
  adult_use_enabled,
  medical_enabled,
  phone,
  email,
  address_line1,
  city,
  state,
  zip,
  lat,
  lng,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-0000-4000-8000-000000000001',
  'Green Leaf Provisioning Center',
  'green-leaf-provisioning',
  'MI',
  'AU-R-000001',
  'Class A Retailer',
  TRUE,
  NOW(),
  TRUE,
  TRUE,
  '(313) 555-0100',
  'info@greenleaf.demo',
  '4200 Telegraph Rd',
  'Detroit',
  'MI',
  '48210',
  42.3314,
  -83.0458,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ── Link demo dispensary_admin user to this dispensary ───────────────────────
-- The dispensary_admin user is looked up by email since their UUID is gen_random_uuid()

INSERT INTO dispensary_users (dispensary_id, user_id, is_owner)
SELECT
  'aaaaaaaa-0000-4000-8000-000000000001',
  u.id,
  TRUE
FROM users u
WHERE u.email = 'dispensary@demo.canna-route.com'
ON CONFLICT (dispensary_id, user_id) DO NOTHING;

-- ── Demo Products ─────────────────────────────────────────────────────────────

INSERT INTO products (
  id,
  dispensary_id,
  grower_id,
  name,
  description,
  category,
  strain,
  strain_type,
  price_cents,
  weight_grams,
  thc_percentage,
  cbd_percentage,
  stock_quantity,
  status,
  created_at,
  updated_at
) VALUES

-- Flower
(
  'bbbbbbbb-0001-4000-8000-000000000001',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Blue Dream',
  'A sativa-dominant hybrid with a sweet berry aroma. Delivers a gentle cerebral invigoration alongside full-body relaxation.',
  'flower',
  'Blue Dream',
  'sativa',
  4500,
  3.5,
  21.4,
  0.8,
  48,
  'active',
  NOW(), NOW()
),
(
  'bbbbbbbb-0001-4000-8000-000000000002',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'OG Kush',
  'Classic indica-dominant hybrid with earthy pine and sour lemon notes. Relieves stress, pain, and sleeplessness.',
  'flower',
  'OG Kush',
  'indica',
  5000,
  3.5,
  24.1,
  0.3,
  32,
  'active',
  NOW(), NOW()
),
(
  'bbbbbbbb-0001-4000-8000-000000000003',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Gelato #33',
  'Balanced hybrid with a dessert-like sweetness and creamy finish. Great for creative focus and mild relaxation.',
  'flower',
  'Gelato #33',
  'hybrid',
  5500,
  3.5,
  26.8,
  0.5,
  20,
  'active',
  NOW(), NOW()
),

-- Pre-rolls
(
  'bbbbbbbb-0001-4000-8000-000000000004',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Sour Diesel Pre-Roll',
  'Energizing sativa pre-roll. Pungent diesel aroma with fast-acting, dreamy cerebral effects.',
  'pre_roll',
  'Sour Diesel',
  'sativa',
  1200,
  1.0,
  22.5,
  0.4,
  60,
  'active',
  NOW(), NOW()
),
(
  'bbbbbbbb-0001-4000-8000-000000000005',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Northern Lights Pre-Roll (3-pack)',
  'Classic pure indica. Resinous buds deliver a full-body relaxation with a mildly euphoric head high.',
  'pre_roll',
  'Northern Lights',
  'indica',
  2800,
  3.0,
  19.8,
  0.6,
  35,
  'active',
  NOW(), NOW()
),

-- Vape
(
  'bbbbbbbb-0001-4000-8000-000000000006',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Wedding Cake Live Resin Cart',
  'Rich and tangy with earthy pepper undertones. Full-spectrum live resin for maximum terpene expression.',
  'vape',
  'Wedding Cake',
  'hybrid',
  5500,
  1.0,
  87.2,
  1.1,
  25,
  'active',
  NOW(), NOW()
),
(
  'bbbbbbbb-0001-4000-8000-000000000007',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Pineapple Express Vape Cart',
  'Tropical citrus and fresh pine. A long-lasting energetic buzz that keeps you alert and creative.',
  'vape',
  'Pineapple Express',
  'sativa',
  4500,
  1.0,
  82.6,
  0.8,
  40,
  'active',
  NOW(), NOW()
),

-- Edibles
(
  'bbbbbbbb-0001-4000-8000-000000000008',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Blueberry Gummies (10-pack)',
  '10mg THC per piece, 100mg total. Precisely dosed, vegan-friendly gummies with natural fruit flavor.',
  'edible',
  'N/A',
  'na',
  2200,
  0.0,
  NULL,
  NULL,
  55,
  'active',
  NOW(), NOW()
),
(
  'bbbbbbbb-0001-4000-8000-000000000009',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Dark Chocolate Bar (1:1)',
  '5mg THC + 5mg CBD per square. 10 squares total. Balanced ratio for relaxation without heavy intoxication.',
  'edible',
  'N/A',
  'na',
  1800,
  0.0,
  NULL,
  NULL,
  8,
  'active',
  NOW(), NOW()
),

-- Concentrate
(
  'bbbbbbbb-0001-4000-8000-000000000010',
  'aaaaaaaa-0000-4000-8000-000000000001',
  NULL,
  'Gorilla Glue #4 Badder',
  'Creamy, easy-to-work wax with an earthy pine aroma. 85.3% THC for experienced consumers.',
  'concentrate',
  'Gorilla Glue #4',
  'hybrid',
  6000,
  1.0,
  85.3,
  0.2,
  18,
  'active',
  NOW(), NOW()
)

ON CONFLICT (id) DO NOTHING;
