# The Kadawala Collection

An interactive 3D design museum in the browser — the graphic work of Amin Kadawala,
organized as a zoomable museum floor plan and hung in first-person walkable galleries.

## The two rooms

- **Floor plan (`/`)** — a pan/zoomable architectural plan. Five category "wings" run as
  lanes along a brass time axis; each work is a numbered medallion placed by year.
  Zoom in and medallions bloom into placards. Click one for its engraved brass plaque,
  then enter the wing.
- **Gallery (`/gallery/<wing>`)** — a walkable 3D hall (WASD + mouse, click to lock the
  pointer). Every piece is framed, individually spotlit, and clickable for a
  high-resolution inspect view with its catalog record.

## Stack

Next.js 15 (App Router) · React 19 · three.js + @react-three/fiber + drei · GSAP ·
Tailwind v4 · Neon Postgres (optional) · Playwright for QA.

## Content is data, not code

All content lives in [`data/seed.json`](data/seed.json): museum info, the five wings,
and all 24 pieces (title, year, image, catalog number, description). **Years and
descriptions are currently placeholders** — every one is flagged with
`yearIsPlaceholder` / `descriptionIsPlaceholder` and shows a "DRAFT RECORD" chip in the
UI until replaced. Edit the JSON with the real facts; nothing is AI-invented.

### Optional: Neon Postgres

The site reads `DATABASE_URL` when present and falls back to `seed.json` when it isn't.

1. Copy `.env.example` to `.env.local` and paste your Neon connection string.
2. `npm run db:seed` — creates the schema and upserts everything from `seed.json`.
3. Add `DATABASE_URL` to the Vercel project's environment variables for production.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
node scripts/qa-shots.mjs   # Playwright screenshot pass (BASE_URL=… for deployed)
```
