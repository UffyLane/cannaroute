# CannaRoute — Grower Portal

React.js (web)

## Screens
- Farm profile — Name, location, cultivation method, pesticide policy, certifications, photos
- COA upload — PDF upload + auto-parse (OCR extracts cannabinoids, terpenes, pass/fail results)
- Pesticide log — Per-crop application entries with EPA registration cross-check
- Product linking — Link harvest batches to dispensary products
- Analytics (Verified tier) — Page views, product engagement, traffic by dispensary

## Verification Pipeline
1. License number → validated against Michigan CRA Accela public database (automated)
2. COA PDF → parsed via OCR, lab license cross-referenced against state-licensed lab list
3. Pesticide log → EPA registration number validated against EPA public API
4. Certifications → auto-verified against Clean Green Certified + Sun+Earth public directories
5. Dispensary sign-off → dispensary partner confirms grower-product link before it goes live

## Key Dependencies (planned)
- `react` + `vite`
- `react-dropzone` — COA PDF upload
- `pdf-lib` or `pdfjs-dist` — client-side PDF preview
- `react-query` — data fetching

## Wireframe
See `/wireframes/wireframe_driver_grower_admin.html`
