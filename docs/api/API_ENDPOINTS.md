# CannaRoute — API Endpoint Map

All services run behind an API Gateway. Every request requires a `Authorization: Bearer <jwt>` header except where noted as **public**.

Base URL pattern: `https://api.cannaroute.com/v1/<service>/...`

Auth roles: `customer` | `driver` | `dispensary_admin` | `grower` | `platform_admin`

---

## 1. Auth Service — port 3001

### POST /auth/register
**Auth:** public  
**Description:** Create a new user account. Role is set by the registration flow (customer self-registers; drivers/growers are invited).

**Request:**
```json
{
  "email": "james@example.com",
  "password": "••••••••",
  "first_name": "James",
  "last_name": "Williams",
  "phone": "+13135550192",
  "role": "customer",
  "state_code": "MI"
}
```

**Response `201`:**
```json
{
  "user_id": "uuid",
  "email": "james@example.com",
  "role": "customer",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900
}
```

---

### POST /auth/login
**Auth:** public

**Request:**
```json
{
  "email": "james@example.com",
  "password": "••••••••"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "role": "customer",
    "first_name": "James",
    "state_code": "MI",
    "age_verified": true,
    "is_medical": false
  }
}
```

**Error `401`:**
```json
{ "error": "invalid_credentials" }
```

---

### POST /auth/refresh
**Auth:** public (refresh token in body)

**Request:**
```json
{ "refresh_token": "eyJ..." }
```

**Response `200`:**
```json
{
  "access_token": "eyJ...",
  "expires_in": 900
}
```

---

### POST /auth/logout
**Auth:** any role  
**Description:** Invalidates the refresh token server-side (stored in Redis blacklist).

**Request:**
```json
{ "refresh_token": "eyJ..." }
```

**Response `204`:** no body

---

### GET /auth/me
**Auth:** any role  
**Description:** Returns the current user's full profile.

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "james@example.com",
  "first_name": "James",
  "last_name": "Williams",
  "phone": "+13135550192",
  "role": "customer",
  "state_code": "MI",
  "age_verified": true,
  "is_medical": false,
  "medical_card_expiry": null,
  "mfa_enabled": false,
  "created_at": "2024-09-01T14:00:00Z"
}
```

---

### PUT /auth/me
**Auth:** any role  
**Description:** Update name, phone, or password.

**Request (any subset):**
```json
{
  "first_name": "James",
  "phone": "+13135550192",
  "current_password": "••••••••",
  "new_password": "••••••••"
}
```

**Response `200`:** updated user object (same shape as GET /auth/me)

---

### POST /auth/verify-age
**Auth:** `customer`  
**Description:** Submit age verification from ID scan (Stripe Identity / Persona SDK). SDK runs client-side and sends a session token here — we verify it server-side and write `age_verified = true` to the users table.

**Request:**
```json
{
  "verification_session_token": "vs_...",
  "dob_confirmed": "1996-03-15"
}
```

**Response `200`:**
```json
{
  "age_verified": true,
  "age_verified_at": "2024-09-01T14:05:00Z"
}
```

**Error `422`:**
```json
{
  "error": "age_verification_failed",
  "message": "Could not confirm 21+ from provided ID"
}
```

---

### POST /auth/medical-card
**Auth:** `customer`  
**Description:** Submit medical patient card. Validates against the state MMMP registry (MI CRA Accela API). Sets `is_medical = true` and stores card number + expiry.

**Request:**
```json
{
  "state_code": "MI",
  "card_number": "P-0012345",
  "card_expiry": "2025-12-31",
  "card_photo_s3_key": "uploads/medical-cards/uuid.jpg"
}
```

**Response `200`:**
```json
{
  "medical_verified": true,
  "card_expiry": "2025-12-31",
  "registry_match": true
}
```

**Error `422`:**
```json
{
  "error": "medical_card_not_found",
  "message": "Card number not found in MI MMMP registry"
}
```

---

### POST /auth/mfa/enable
**Auth:** any role  
**Description:** Returns a TOTP QR code URI for authenticator app setup.

**Response `200`:**
```json
{
  "qr_uri": "otpauth://totp/CannaRoute:james@example.com?secret=BASE32SECRET&issuer=CannaRoute",
  "backup_codes": ["xxxxxxxx", "xxxxxxxx", "xxxxxxxx"]
}
```

---

### POST /auth/mfa/verify
**Auth:** any role  
**Request:**
```json
{ "totp_code": "123456" }
```

**Response `200`:**
```json
{ "mfa_enabled": true }
```

---

---

## 2. Order Service — port 3002

### POST /orders
**Auth:** `customer`  
**Description:** Place an order. Calls compliance service internally to run all checks before persisting. Returns immediately with `status: placed` — compliance check result included.

**Request:**
```json
{
  "dispensary_id": "uuid",
  "items": [
    { "product_id": "uuid", "quantity": 1 },
    { "product_id": "uuid", "quantity": 1 }
  ],
  "delivery_address": "123 Main St",
  "delivery_city": "Detroit",
  "delivery_zip": "48201",
  "delivery_lat": 42.3314,
  "delivery_lng": -83.0458,
  "payment_method": "point_of_banking",
  "delivery_instructions": "Ring doorbell"
}
```

**Response `201`:**
```json
{
  "order_id": "uuid",
  "order_number": "CR-48301",
  "status": "placed",
  "total_cents": 11999,
  "subtotal_cents": 10000,
  "delivery_fee_cents": 399,
  "excise_tax_cents": 1000,
  "sales_tax_cents": 600,
  "compliance_check_passed": true,
  "compliance_check_notes": {
    "age_verified": true,
    "within_purchase_limit": true,
    "delivery_zone_valid": true,
    "within_delivery_hours": true,
    "coas_valid": true
  },
  "payment_method": "point_of_banking",
  "placed_at": "2024-09-01T14:14:00Z"
}
```

**Error `422` — compliance fail:**
```json
{
  "error": "compliance_check_failed",
  "failed_checks": ["purchase_limit_exceeded"],
  "message": "Order would exceed your 2.5 oz daily limit. You have 12g remaining."
}
```

---

### GET /orders
**Auth:** `customer` (own orders) | `dispensary_admin` (their dispensary's orders) | `platform_admin` (all)  
**Description:** List orders. Results filtered by role automatically.

**Query params:**
```
?status=in_transit        # filter by status
?dispensary_id=uuid       # dispensary_admin filter
?from=2024-09-01          # date range
?to=2024-09-30
?limit=20&offset=0
```

**Response `200`:**
```json
{
  "orders": [
    {
      "order_id": "uuid",
      "order_number": "CR-48301",
      "status": "in_transit",
      "total_cents": 11999,
      "placed_at": "2024-09-01T14:14:00Z",
      "dispensary_name": "Green Leaf Provisioning",
      "driver_name": "Marcus T.",
      "item_count": 3
    }
  ],
  "total": 142,
  "limit": 20,
  "offset": 0
}
```

---

### GET /orders/:id
**Auth:** `customer` (own) | `dispensary_admin` (their dispensary) | `driver` (assigned) | `platform_admin`  
**Description:** Full order detail.

**Response `200`:**
```json
{
  "order_id": "uuid",
  "order_number": "CR-48301",
  "status": "placed",
  "order_type": "adult_use",
  "customer": {
    "id": "uuid",
    "first_name": "James",
    "last_name": "Williams",
    "phone": "+13135550192",
    "age_verified": true,
    "is_medical": false
  },
  "dispensary": {
    "id": "uuid",
    "name": "Green Leaf Provisioning"
  },
  "driver": null,
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Blue Dream 3.5g",
      "quantity": 1,
      "unit_price_cents": 3800,
      "total_price_cents": 3800,
      "weight_per_unit_g": 3.5,
      "grower_name": "Sunrise Valley Farm",
      "batch_number": "MV-2024-0847",
      "metrc_package_id": "1A4FF..."
    }
  ],
  "delivery_address": "1842 Woodward Ave, Detroit, MI 48201",
  "delivery_lat": 42.3314,
  "delivery_lng": -83.0458,
  "subtotal_cents": 10000,
  "delivery_fee_cents": 399,
  "excise_tax_cents": 1000,
  "sales_tax_cents": 600,
  "total_cents": 11999,
  "cannaroute_fee_cents": 700,
  "dispensary_net_cents": 9300,
  "payment_method": "point_of_banking",
  "payment_status": "authorized",
  "compliance_check_passed": true,
  "placed_at": "2024-09-01T14:14:00Z",
  "confirmed_at": null
}
```

---

### PATCH /orders/:id/confirm
**Auth:** `dispensary_admin`  
**Description:** Dispensary confirms the order and assigns a driver. Triggers push notification to driver.

**Request:**
```json
{ "driver_id": "uuid" }
```

**Response `200`:**
```json
{
  "order_id": "uuid",
  "status": "confirmed",
  "driver_id": "uuid",
  "confirmed_at": "2024-09-01T14:18:00Z"
}
```

---

### PATCH /orders/:id/pickup
**Auth:** `driver`  
**Description:** Driver confirms they have picked up the order from the dispensary. Triggers customer push notification "Your order is on the way."

**Request:** no body

**Response `200`:**
```json
{
  "order_id": "uuid",
  "status": "in_transit",
  "picked_up_at": "2024-09-01T14:32:00Z"
}
```

---

### PATCH /orders/:id/deliver
**Auth:** `driver`  
**Description:** Driver marks delivery complete. Requires delivery_id with ID scan, signature, and proof photo already submitted to delivery service. Triggers Metrc sale report via compliance service.

**Request:** no body

**Response `200`:**
```json
{
  "order_id": "uuid",
  "status": "delivered",
  "delivered_at": "2024-09-01T14:47:00Z",
  "metrc_reported": true,
  "metrc_sale_id": "SL-MI-00192837"
}
```

---

### PATCH /orders/:id/cancel
**Auth:** `customer` (own, before pickup) | `dispensary_admin` | `platform_admin`

**Request:**
```json
{ "reason": "Customer requested cancellation" }
```

**Response `200`:**
```json
{
  "order_id": "uuid",
  "status": "cancelled",
  "cancelled_at": "2024-09-01T14:20:00Z",
  "refund_initiated": true
}
```

---

### GET /orders/:id/manifest
**Auth:** `dispensary_admin` | `driver` (assigned) | `platform_admin`  
**Description:** Returns the state-compliant delivery manifest PDF as a presigned S3 URL.

**Response `200`:**
```json
{
  "manifest_url": "https://s3.amazonaws.com/cannaroute-manifests/...",
  "manifest_expires_at": "2024-09-01T15:14:00Z"
}
```

---

---

## 3. Delivery Service — port 3003

### GET /deliveries/active
**Auth:** `driver`  
**Description:** Returns the driver's current active delivery, if any. Used by driver app on load and after accepting a job.

**Response `200`:**
```json
{
  "delivery_id": "uuid",
  "order_id": "uuid",
  "order_number": "CR-48301",
  "status": "in_transit",
  "customer": {
    "first_name": "James",
    "phone": "+13135550192",
    "delivery_address": "1842 Woodward Ave, Detroit, MI 48201",
    "delivery_lat": 42.3314,
    "delivery_lng": -83.0458,
    "delivery_instructions": "Ring doorbell"
  },
  "items": [
    { "product_name": "Blue Dream 3.5g", "quantity": 1 },
    { "product_name": "Wedding Cake 7g", "quantity": 1 },
    { "product_name": "Mango Haze Gummies 10pk", "quantity": 1 }
  ],
  "carry_weight_g": 14.0,
  "carry_limit_g": 425.24,
  "order_type": "adult_use",
  "picked_up_at": "2024-09-01T14:32:00Z"
}
```

**Response `204`:** no active delivery

---

### POST /deliveries/:id/gps
**Auth:** `driver`  
**Description:** Append a GPS position to the delivery's route log. Called every 5 seconds from the driver app. Also updates `drivers.last_lat/lng` and publishes to Redis pub/sub so the customer's WebSocket receives real-time updates.

**Request:**
```json
{
  "lat": 42.3401,
  "lng": -83.0512,
  "accuracy_m": 4.2,
  "heading_deg": 187,
  "speed_ms": 8.3
}
```

**Response `200`:**
```json
{ "recorded": true }
```

---

### POST /deliveries/:id/id-verify
**Auth:** `driver`  
**Description:** Submit ID verification result from door scan. Stores age confirmation only — never raw ID data. Required before delivery can be marked complete.

**Request:**
```json
{
  "scan_method": "ocr",
  "age_over_21_confirmed": true,
  "id_expiry_valid": true,
  "scanned_at": "2024-09-01T14:45:00Z"
}
```

**Response `200`:**
```json
{
  "id_verified": true,
  "can_proceed": true
}
```

**Error `422`:**
```json
{
  "error": "age_check_failed",
  "message": "Customer ID indicates under 21 — cannot complete delivery",
  "action": "return_to_dispensary"
}
```

---

### POST /deliveries/:id/signature
**Auth:** `driver`  
**Description:** Upload customer signature image. Stored to S3, key recorded on delivery record.

**Request:** `multipart/form-data`
```
signature_image: <PNG blob — canvas output from driver app>
```

**Response `200`:**
```json
{
  "signature_s3_key": "deliveries/uuid/signature.png",
  "captured_at": "2024-09-01T14:46:00Z"
}
```

---

### POST /deliveries/:id/photo
**Auth:** `driver`  
**Description:** Upload proof-of-delivery photo. Stored to S3.

**Request:** `multipart/form-data`
```
delivery_photo: <JPEG blob from camera>
```

**Response `200`:**
```json
{
  "photo_s3_key": "deliveries/uuid/proof.jpg",
  "captured_at": "2024-09-01T14:46:30Z"
}
```

---

### GET /deliveries/:id
**Auth:** `driver` (assigned) | `dispensary_admin` | `platform_admin`  
**Description:** Full delivery record including GPS route, ID check, signature, photo.

**Response `200`:**
```json
{
  "delivery_id": "uuid",
  "order_id": "uuid",
  "driver_id": "uuid",
  "status": "delivered",
  "gps_route": [
    { "lat": 42.3401, "lng": -83.0512, "ts": "2024-09-01T14:32:10Z" }
  ],
  "carry_weight_g": 14.0,
  "id_scanned": true,
  "id_scan_age_confirmed": true,
  "customer_signature_url": "https://s3.../signature.png",
  "delivery_photo_url": "https://s3.../proof.jpg",
  "picked_up_at": "2024-09-01T14:32:00Z",
  "delivered_at": "2024-09-01T14:47:00Z",
  "delivery_duration_minutes": 15,
  "base_pay_cents": 500,
  "tip_cents": 200,
  "total_pay_cents": 700
}
```

---

### GET /deliveries/driver/:driverId/history
**Auth:** `driver` (own) | `dispensary_admin` | `platform_admin`

**Query params:** `?limit=20&offset=0&from=2024-09-01`

**Response `200`:**
```json
{
  "deliveries": [
    {
      "delivery_id": "uuid",
      "order_number": "CR-48301",
      "delivered_at": "2024-09-01T14:47:00Z",
      "delivery_duration_minutes": 15,
      "total_pay_cents": 700
    }
  ],
  "total": 347,
  "total_earnings_cents": 192300
}
```

---

### GET /deliveries/available-drivers
**Auth:** `dispensary_admin`  
**Description:** Returns drivers currently available for assignment, sorted by proximity to the dispensary. Reads driver positions from Redis.

**Query params:** `?dispensary_id=uuid`

**Response `200`:**
```json
{
  "drivers": [
    {
      "driver_id": "uuid",
      "first_name": "Jordan",
      "last_name": "B.",
      "status": "available",
      "distance_from_dispensary_mi": 0.1,
      "rating": 4.9,
      "total_deliveries": 203,
      "active_order_count": 0
    }
  ]
}
```

---

---

## 4. Inventory Service — port 3004

### GET /inventory/:dispensaryId/menu
**Auth:** `customer` | `dispensary_admin` | `platform_admin`  
**Description:** Returns the live customer-facing menu. For customers: only `status = active` AND `is_on_menu = true` AND non-expired COA. For dispensary_admin: all products including hidden and COA-expired.

**Query params:**
```
?category=flower
?grower_id=uuid
?strain_type=sativa
?limit=20&offset=0
```

**Response `200`:**
```json
{
  "dispensary": {
    "id": "uuid",
    "name": "Green Leaf Provisioning",
    "adult_use_enabled": true,
    "medical_enabled": true
  },
  "products": [
    {
      "product_id": "uuid",
      "name": "Blue Dream (3.5g)",
      "category": "flower",
      "strain_type": "sativa",
      "strain_name": "Blue Dream",
      "thc_pct": 22.3,
      "cbd_pct": 0.4,
      "weight_grams": 3.5,
      "price_cents": 3800,
      "stock_count": 47,
      "grower": {
        "id": "uuid",
        "farm_name": "Sunrise Valley Farm",
        "pesticide_policy": "pesticide_free",
        "clean_green_certified": true,
        "verification_status": "verified"
      },
      "lab_test": {
        "batch_number": "MV-2024-0847",
        "test_date": "2024-09-14",
        "expiry_date": "2025-03-14",
        "overall_pass": true,
        "pesticides_pass": true,
        "microbials_pass": true,
        "heavy_metals_pass": true,
        "coa_pdf_url": "https://s3.../coa.pdf"
      }
    }
  ],
  "total": 48
}
```

---

### POST /inventory/products
**Auth:** `dispensary_admin`  
**Description:** Create a new product. Can be linked to a grower at creation or later via PATCH.

**Request:**
```json
{
  "dispensary_id": "uuid",
  "name": "Blue Dream (3.5g)",
  "sku": "GL-BD-35",
  "category": "flower",
  "strain_type": "sativa",
  "strain_name": "Blue Dream",
  "thc_pct": 22.3,
  "cbd_pct": 0.4,
  "weight_grams": 3.5,
  "price_cents": 3800,
  "stock_count": 50,
  "grower_id": "uuid",
  "metrc_package_id": "1A4FF0A000002AB000000001",
  "batch_number": "MV-2024-0847",
  "is_on_menu": true
}
```

**Response `201`:**
```json
{ "product_id": "uuid", "status": "active" }
```

---

### PATCH /inventory/products/:id
**Auth:** `dispensary_admin`  
**Description:** Update any product field. Use this to link a grower, update price, or toggle menu visibility.

**Request (any subset):**
```json
{
  "price_cents": 3600,
  "grower_id": "uuid",
  "is_on_menu": false,
  "stock_count": 12
}
```

**Response `200`:** updated product object

---

### DELETE /inventory/products/:id
**Auth:** `dispensary_admin`  
**Description:** Soft delete (sets `deleted_at`). Product removed from all menus immediately.

**Response `204`:** no body

---

### PATCH /inventory/products/:id/stock
**Auth:** `dispensary_admin` | `platform_admin` (internal — also called by compliance service on delivery complete)  
**Description:** Adjust stock count. Use `delta` for incremental changes, `absolute` to set exactly.

**Request:**
```json
{
  "delta": -1,
  "reason": "order_delivered",
  "order_id": "uuid"
}
```

**Response `200`:**
```json
{
  "product_id": "uuid",
  "stock_count": 46,
  "low_stock": false
}
```

---

### POST /inventory/sync/metrc
**Auth:** `dispensary_admin` | `platform_admin`  
**Description:** Trigger a full Metrc inventory sync for a dispensary. Pulls current package data from Metrc v2 API and reconciles with local products table. Long-running — returns a job ID; poll `/inventory/sync/status/:jobId` for completion.

**Request:**
```json
{ "dispensary_id": "uuid" }
```

**Response `202`:**
```json
{
  "job_id": "uuid",
  "status": "queued",
  "message": "Sync started — check /inventory/sync/status/uuid for progress"
}
```

---

### GET /inventory/sync/status/:jobId
**Auth:** `dispensary_admin` | `platform_admin`

**Response `200`:**
```json
{
  "job_id": "uuid",
  "status": "completed",
  "started_at": "2024-09-01T14:00:00Z",
  "completed_at": "2024-09-01T14:00:47Z",
  "packages_pulled": 143,
  "products_updated": 38,
  "products_created": 2,
  "errors": []
}
```

---

---

## 5. Compliance Service — port 3005

### POST /compliance/check-order
**Auth:** internal (called by order service only, service-to-service JWT)  
**Description:** Runs all compliance checks before an order is placed. Returns pass/fail per check so the order service can surface the exact failure to the customer.

**Request:**
```json
{
  "customer_id": "uuid",
  "dispensary_id": "uuid",
  "state_code": "MI",
  "order_type": "adult_use",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1,
      "weight_grams": 3.5,
      "lab_test_id": "uuid"
    }
  ],
  "delivery_address": "1842 Woodward Ave, Detroit, MI 48201",
  "delivery_lat": 42.3314,
  "delivery_lng": -83.0458,
  "order_placed_at": "2024-09-01T14:14:00Z"
}
```

**Response `200`:**
```json
{
  "passed": true,
  "checks": {
    "age_verified": { "pass": true },
    "account_type_valid": { "pass": true, "detail": "Adult-use account, no medical card required" },
    "purchase_limit": {
      "pass": true,
      "total_weight_g": 14.0,
      "limit_g": 70.87,
      "remaining_g": 56.87
    },
    "delivery_zone": { "pass": true, "distance_mi": 1.8 },
    "delivery_hours": {
      "pass": true,
      "current_time_local": "14:14",
      "allowed_window": "08:00–21:00"
    },
    "coas_valid": {
      "pass": true,
      "checked": 2,
      "expired": 0
    }
  }
}
```

---

### GET /compliance/rules/:stateCode
**Auth:** `dispensary_admin` | `platform_admin`

**Response `200`:**
```json
{
  "state_code": "MI",
  "state_name": "Michigan",
  "adult_use_enabled": true,
  "medical_enabled": true,
  "adult_use_per_transaction_g": 70.87,
  "medical_daily_limit_g": 56.70,
  "medical_monthly_limit_g": 283.50,
  "driver_carry_limit_g": 425.24,
  "delivery_start_time": "08:00:00",
  "delivery_end_time": "21:00:00",
  "seed_to_sale_system": "metrc",
  "adult_use_excise_tax_rate": 0.1,
  "medical_excise_tax_rate": 0.0,
  "state_sales_tax_rate": 0.06,
  "id_verification_required": true,
  "delivery_manifest_required": true,
  "customer_signature_required": true
}
```

---

### PUT /compliance/rules/:stateCode
**Auth:** `platform_admin` only  
**Description:** Update a state's compliance configuration. This is what the Admin Panel writes to. No code deployment needed — changes take effect immediately at runtime.

**Request (any subset):**
```json
{
  "adult_use_per_transaction_g": 70.87,
  "delivery_end_time": "22:00:00",
  "adult_use_excise_tax_rate": 0.15
}
```

**Response `200`:** full updated rules object

---

### POST /compliance/rules
**Auth:** `platform_admin` only  
**Description:** Add a new state. This is the single action required to expand to a new Metrc state.

**Request:** full `compliance_rules` object (see schema.sql for all fields)

**Response `201`:**
```json
{ "state_code": "CO", "active": true }
```

---

### GET /compliance/purchase-limits/:customerId
**Auth:** `customer` (own) | `dispensary_admin` | `platform_admin`  
**Description:** Returns how much cannabis the customer has purchased today and this month, and how much remains under their limit.

**Query params:** `?state_code=MI`

**Response `200`:**
```json
{
  "customer_id": "uuid",
  "state_code": "MI",
  "order_type": "adult_use",
  "today": {
    "purchased_g": 14.0,
    "limit_g": 70.87,
    "remaining_g": 56.87
  },
  "this_month": null
}
```

---

### POST /compliance/manifest/generate
**Auth:** internal (called by order service)  
**Description:** Generates a state-compliant delivery manifest PDF and stores it to S3. Returns the S3 key.

**Request:**
```json
{
  "order_id": "uuid",
  "state_code": "MI"
}
```

**Response `200`:**
```json
{
  "manifest_s3_key": "manifests/MI/2024-09-01/CR-48301.pdf",
  "manifest_url": "https://s3.../CR-48301.pdf"
}
```

---

### POST /compliance/license/verify
**Auth:** internal | `platform_admin`  
**Description:** Verifies a dispensary or grower license against the state's public database (MI CRA Accela, etc.).

**Request:**
```json
{
  "state_code": "MI",
  "license_number": "MMGR-000234-LIC",
  "license_type": "grower"
}
```

**Response `200`:**
```json
{
  "valid": true,
  "license_number": "MMGR-000234-LIC",
  "license_type": "Class C Grower",
  "licensee_name": "Sunrise Valley Farm LLC",
  "status": "Active",
  "expiry_date": "2025-09-30",
  "verified_at": "2024-09-01T14:00:00Z"
}
```

---

### POST /compliance/metrc/report-sale
**Auth:** internal (called by order service on delivery complete)  
**Description:** Reports the completed sale to Metrc v2. Uses the dispensary's stored Metrc API key and license key.

**Request:**
```json
{
  "order_id": "uuid",
  "dispensary_id": "uuid",
  "state_code": "MI",
  "items": [
    {
      "metrc_package_id": "1A4FF0A000002AB000000001",
      "quantity": 1,
      "unit_of_measure": "Grams",
      "total_price": 38.00
    }
  ],
  "sale_date": "2024-09-01",
  "patient_license_number": null
}
```

**Response `200`:**
```json
{
  "metrc_sale_id": "SL-MI-00192837",
  "reported_at": "2024-09-01T14:47:30Z"
}
```

---

---

## 6. Grower Service — port 3006

### POST /growers
**Auth:** `grower` (self-registration via invite link)  
**Description:** Create a grower profile. Immediately triggers automated license verification against state database.

**Request:**
```json
{
  "farm_name": "Sunrise Valley Farm",
  "state_code": "MI",
  "license_number": "MMGR-000234-LIC",
  "address_city": "Traverse City",
  "grow_type": "indoor",
  "pesticide_policy": "pesticide_free"
}
```

**Response `201`:**
```json
{
  "grower_id": "uuid",
  "verification_status": "license_check",
  "license_verified": true,
  "license_verified_at": "2024-09-01T14:00:05Z"
}
```

---

### GET /growers/:id
**Auth:** `customer` (public profile, verified growers only) | `grower` (own) | `dispensary_admin` | `platform_admin`

**Response `200` (customer-facing):**
```json
{
  "grower_id": "uuid",
  "farm_name": "Sunrise Valley Farm",
  "state_code": "MI",
  "address_city": "Traverse City",
  "grow_type": "indoor",
  "pesticide_policy": "pesticide_free",
  "clean_green_certified": true,
  "sun_earth_certified": false,
  "verification_status": "verified",
  "established_year": 2019,
  "description": "...",
  "photos": ["https://s3.../farm1.jpg"],
  "active_lab_tests": [
    {
      "batch_number": "MV-2024-0847",
      "overall_pass": true,
      "pesticides_pass": true,
      "coa_pdf_url": "https://s3.../coa.pdf"
    }
  ]
}
```

---

### PUT /growers/:id
**Auth:** `grower` (own) | `platform_admin`

**Request (any subset):**
```json
{
  "farm_name": "Sunrise Valley Farm",
  "grow_type": "indoor",
  "pesticide_policy": "pesticide_free",
  "description": "Family-run indoor farm...",
  "farm_size_sqft": 12000
}
```

**Response `200`:** updated grower object

---

### POST /growers/:id/coa
**Auth:** `grower` (own)  
**Description:** Upload a COA PDF. Triggers async OCR parse job. Returns immediately with job ID; poll for parse result.

**Request:** `multipart/form-data`
```
coa_pdf: <PDF file>
batch_number: MV-2024-0847     (optional — OCR will attempt to extract)
```

**Response `202`:**
```json
{
  "lab_test_id": "uuid",
  "parse_status": "pending",
  "coa_s3_key": "growers/uuid/coas/uuid.pdf",
  "message": "COA uploaded — parsing in progress. Poll GET /growers/:id/coa/:labTestId for status."
}
```

---

### GET /growers/:id/coa/:labTestId
**Auth:** `grower` (own) | `dispensary_admin` | `platform_admin`  
**Description:** Poll for COA parse status and extracted data.

**Response `200` — parse complete:**
```json
{
  "lab_test_id": "uuid",
  "parse_status": "parsed",
  "parse_confidence": 0.97,
  "lab_name": "SC Labs",
  "lab_license_number": "STLM-000001",
  "lab_license_verified": true,
  "batch_number": "MV-2024-0847",
  "test_date": "2024-09-14",
  "expiry_date": "2025-03-14",
  "total_thc_pct": 22.3,
  "total_cbd_pct": 0.4,
  "pesticides_pass": true,
  "microbials_pass": true,
  "heavy_metals_pass": true,
  "residual_solvents_pass": true,
  "overall_pass": true,
  "coa_pdf_url": "https://s3.../coa.pdf",
  "confirmed": false
}
```

---

### POST /growers/:id/coa/:labTestId/confirm
**Auth:** `grower` (own)  
**Description:** Grower confirms extracted COA data is correct and publishes it. Products linked to this grower will now show the new COA data. If any field is wrong, grower edits it before confirming.

**Request (optional corrections):**
```json
{
  "batch_number": "MV-2024-0847",
  "total_thc_pct": 22.3
}
```

**Response `200`:**
```json
{
  "lab_test_id": "uuid",
  "parse_status": "verified",
  "published": true
}
```

---

### GET /growers/:id/coas
**Auth:** `grower` (own) | `dispensary_admin` | `platform_admin`

**Response `200`:**
```json
{
  "lab_tests": [
    {
      "lab_test_id": "uuid",
      "batch_number": "MV-2024-0847",
      "test_date": "2024-09-14",
      "expiry_date": "2025-03-14",
      "overall_pass": true,
      "parse_status": "verified",
      "linked_products": ["Blue Dream (3.5g)"]
    }
  ]
}
```

---

### POST /growers/:id/pesticide-logs
**Auth:** `grower` (own)

**Request:**
```json
{
  "no_pesticides_used": false,
  "pesticide_name": "Neem Oil",
  "epa_reg_number": "70051-2",
  "application_date": "2024-08-01",
  "pre_harvest_interval_days": 0,
  "target_pest": "Spider mites",
  "application_method": "Foliar spray",
  "application_rate": "2 fl oz per gallon",
  "strain_name": "Blue Dream",
  "harvest_date": "2024-09-10",
  "batch_number": "MV-2024-0847"
}
```

**Response `201`:**
```json
{
  "pesticide_log_id": "uuid",
  "epa_verified": true,
  "epa_verified_at": "2024-09-01T14:00:03Z"
}
```

---

### GET /growers/:id/pesticide-logs
**Auth:** `grower` (own) | `platform_admin`

**Response `200`:**
```json
{
  "pesticide_logs": [
    {
      "log_id": "uuid",
      "no_pesticides_used": false,
      "pesticide_name": "Neem Oil",
      "epa_reg_number": "70051-2",
      "epa_verified": true,
      "application_date": "2024-08-01",
      "batch_number": "MV-2024-0847"
    }
  ]
}
```

---

---

## 7. Notification Service — port 3007

### POST /notifications/send
**Auth:** internal (service-to-service only)  
**Description:** All other services call this to send notifications. Never called directly by client apps.

**Request:**
```json
{
  "user_id": "uuid",
  "order_id": "uuid",
  "type": "driver_nearby",
  "channel": "push",
  "title": "Marcus is almost there",
  "body": "Your driver is 2 minutes away. Have your ID ready.",
  "data": {
    "order_id": "uuid",
    "screen": "order_tracking"
  }
}
```

**Response `200`:**
```json
{
  "notification_id": "uuid",
  "status": "sent",
  "provider": "fcm",
  "provider_message_id": "projects/cannaroute/messages/uuid"
}
```

**Notification types and their triggers:**

| type | trigger | channel |
|---|---|---|
| `order_placed` | order service: POST /orders | push + email |
| `order_confirmed` | order service: PATCH /orders/:id/confirm | push + sms |
| `driver_assigned` | order service: PATCH /orders/:id/confirm | push |
| `driver_picked_up` | order service: PATCH /orders/:id/pickup | push + sms |
| `driver_nearby` | delivery service: GPS within 0.5mi of customer | push |
| `order_delivered` | order service: PATCH /orders/:id/deliver | push + email |
| `order_cancelled` | order service: PATCH /orders/:id/cancel | push + email |
| `medical_card_expiring` | scheduled job: 30 days before card expiry | push + email |
| `coa_expiring` | scheduled job: 30 days before COA expiry | email (to grower) |
| `low_stock` | inventory service: stock falls below threshold | push (to dispensary_admin) |
| `new_job` | delivery service: driver assigned to order | push (to driver) |

---

### GET /notifications/:userId
**Auth:** any role (own notifications only) | `platform_admin`

**Query params:** `?limit=20&offset=0&type=order_delivered`

**Response `200`:**
```json
{
  "notifications": [
    {
      "notification_id": "uuid",
      "type": "order_delivered",
      "channel": "push",
      "title": "Order delivered!",
      "body": "Your order CR-48301 was delivered.",
      "status": "delivered",
      "sent_at": "2024-09-01T14:47:05Z"
    }
  ],
  "total": 23
}
```

---

### PUT /notifications/preferences/:userId
**Auth:** any role (own)  
**Description:** Customer or driver sets which channels they want for each notification type.

**Request:**
```json
{
  "order_confirmed": { "push": true, "sms": true, "email": false },
  "driver_nearby": { "push": true, "sms": false, "email": false },
  "order_delivered": { "push": true, "sms": false, "email": true }
}
```

**Response `200`:** updated preferences object

---

---

## WebSocket Events (Delivery Service)

Real-time events pushed to connected clients via Socket.io. Clients connect to `wss://api.cannaroute.com/v1/delivery/ws` with their JWT.

### Customer subscribes to: `order:{order_id}`

| Event | Payload | When |
|---|---|---|
| `order.confirmed` | `{ status, confirmed_at, driver_name, driver_rating }` | Dispensary confirms |
| `order.picked_up` | `{ status, picked_up_at, eta_minutes }` | Driver leaves dispensary |
| `driver.position` | `{ lat, lng, eta_minutes, heading_deg }` | Every GPS update (~5s) |
| `order.delivered` | `{ status, delivered_at }` | Delivery complete |
| `order.cancelled` | `{ status, reason }` | Any cancellation |

### Dispensary subscribes to: `dispensary:{dispensary_id}`

| Event | Payload | When |
|---|---|---|
| `order.placed` | `{ order_id, order_number, customer_name, total_cents, item_count }` | New order arrives |
| `driver.position` | `{ driver_id, lat, lng, order_id }` | All active drivers, every 5s |
| `order.delivered` | `{ order_id, delivered_at }` | Delivery confirmed |

### Driver subscribes to: `driver:{driver_id}`

| Event | Payload | When |
|---|---|---|
| `job.new` | `{ order_id, distance_mi, item_count, base_pay_cents, auto_decline_at }` | New job offered |
| `job.cancelled` | `{ order_id, reason }` | Order cancelled while driver en route |
