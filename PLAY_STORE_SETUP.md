# Google Play Store Setup Guide

Both apps are configured and ready to build. Follow these steps to get them live on the Play Store.

---

## Step 1 — Google Play Developer Account

If you don't have one yet:
1. Go to https://play.google.com/console
2. Sign in with a Google account (use a business one, not personal)
3. Pay the $25 one-time registration fee
4. Complete the developer profile (name, address, contact email)

> Allow 24–48 hours for the account to be approved before you can publish.

---

## Step 2 — Create Both App Listings in Play Console

For each app, do this:

1. In Play Console → **"Create app"**
2. Fill in:
   - **App name**: `CannaRoute` / `CannaRoute Driver`
   - **Default language**: English (US)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept the declarations and click **"Create app"**

> The package names are already locked in:
> - Customer: `com.cannaroute.customer`
> - Driver: `com.cannaroute.driver`

---

## Step 3 — Create a Google Play API Service Account

EAS Submit needs this to upload builds automatically.

1. In Play Console → **Setup → API access**
2. Click **"Link to a Google Cloud project"** (create a new one if needed)
3. Click **"Create new service account"** → follow the Google Cloud Console link
4. In Cloud Console: **IAM & Admin → Service Accounts → Create Service Account**
   - Name: `eas-submit`
   - Role: **Service Account User**
5. After creating, click the account → **Keys → Add Key → JSON** → download the file
6. Back in Play Console → **Grant access** to the service account
   - Role: **Release manager**
7. Rename the downloaded file to `google-service-account.json` and place it in:
   - `apps/customer/google-service-account.json`
   - `apps/driver/google-service-account.json`

> **Never commit this file to git.** It's already in `.gitignore` (add it if not).

---

## Step 4 — Add to .gitignore

Make sure `google-service-account.json` is ignored:

```bash
echo "google-service-account.json" >> apps/customer/.gitignore
echo "google-service-account.json" >> apps/driver/.gitignore
```

---

## Step 5 — Content Rating & Store Listing

In Play Console for each app, complete these sections:

### Store listing
Copy from `apps/customer/store-listing.md` and `apps/driver/store-listing.md`:
- Short description (80 chars)
- Full description
- Category: **Shopping** (customer) / **Business** (driver)
- Email contact: your email

### Content rating
Run the questionnaire. Select:
- **Regulated goods** → Yes (cannabis)
- This will assign a **Mature 17+** rating
- That's correct — leave it

### Target audience
- Minimum age: **21**
- Enable **"Does your app target users under 13?"** → **No**

### Data safety
Fill out what data you collect (location, account info, purchase history).

---

## Step 6 — Build Production AABs

From your terminal, run these one at a time:

```bash
# Customer app
cd ~/Desktop/CannaRoute/apps/customer
eas build --platform android --profile production

# Driver app (after customer finishes or in a second terminal)
cd ~/Desktop/CannaRoute/apps/driver
eas build --platform android --profile production
```

Each build takes ~10–15 minutes on EAS cloud. You'll get a link to monitor progress.

> Make sure you're logged in: `eas login` (use the `uffylane` Expo account)

---

## Step 7 — Submit to Play Store

After both builds complete:

```bash
# Customer app
cd ~/Desktop/CannaRoute/apps/customer
eas submit --platform android --profile production

# Driver app
cd ~/Desktop/CannaRoute/apps/driver
eas submit --platform android --profile production
```

This uploads the AAB to the **internal testing track** in draft status.

---

## Step 8 — Add Internal Testers

1. In Play Console → **Testing → Internal testing**
2. Click **"Add testers"** → paste email addresses (up to 100)
3. Share the opt-in link with testers

Testers can install within minutes — no review required for the internal track.

---

## Step 9 — Promote to Production (later)

When you're ready for public release:
1. Play Console → **Release → Production → Create new release**
2. Promote the internal build
3. Submit for Google review (~3–7 days)

> **Cannabis policy note**: Google prohibits apps that "facilitate the sale of marijuana." Weedmaps and Leafly survive by framing themselves as informational. For production release, consider removing in-app checkout and framing CannaRoute as a "menu discovery and order status" app — the actual transaction confirmation happens at the dispensary level. This is the standard workaround used by cannabis apps on Android.

---

## Quick Reference — Commands

```bash
# Login to Expo
eas login

# Build (takes 10–15 min each)
cd apps/customer && eas build --platform android --profile production
cd apps/driver  && eas build --platform android --profile production

# Submit (after builds complete)
cd apps/customer && eas submit --platform android --profile production
cd apps/driver  && eas submit --platform android --profile production

# Check build status
eas build:list
```

---

## Screenshots Needed

Play Store requires at least 2 screenshots (recommend 4–8) per app.

Generate them from the Expo Go preview or an Android emulator:
- **Customer**: Home/Discover, Product Detail, Cart, Order Tracking
- **Driver**: Dashboard (available runs), Active Delivery map, Delivery confirmation

Size: **1080 × 1920px** or **1080 × 2400px** (portrait)

Feature graphic (required): **1024 × 500px** — a banner-style image of the app

---

## Files Reference

```
apps/
  customer/
    app.json                  ← Android config (package, versionCode)
    eas.json                  ← Build + submit profiles
    store-listing.md          ← Copy/paste content for Play Console
    google-service-account.json  ← YOU create this (see Step 3)
  driver/
    app.json
    eas.json
    store-listing.md
    google-service-account.json
```
