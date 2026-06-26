# CannaRoute — Driver App

React Native (iOS + Android)

## Screens
- Job queue — Incoming delivery cards with accept/decline + carry limit check
- Active delivery — Google Maps turn-by-turn navigation
- Arrival — ID scan (OCR), customer signature capture, proof-of-delivery photo
- Delivery complete — Earnings summary, Metrc auto-report confirmation
- Earnings dashboard
- Profile / Documents (license, background check status)

## Key Dependencies (planned)
- `react-native` — core framework
- `@react-navigation/native` — navigation
- `react-native-maps` — Google Maps navigation
- `socket.io-client` — real-time job dispatch
- `react-native-camera` — ID scan + delivery photo
- `react-native-signature-canvas` — customer signature

## Compliance Notes
- App enforces 15 oz carry limit per trip (Michigan)
- GPS must be active to accept deliveries (state requirement)
- Delivery manifest auto-generated per order
- ID scan extracts DOB via OCR — driver sees age only, never full ID number

## Wireframe
See `/wireframes/wireframe_driver_grower_admin.html`
