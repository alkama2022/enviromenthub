# Project — Standalone

This project is now standalone (no Lovable Cloud dependency).

## Stack
- TanStack Start + Vite + React 19 + Tailwind CSS 4
- Supabase (auth / data)

## Commands
- `npm run dev` — vite dev (host ::, port 8080)
- `npm run build` — vite build via nitro (cloudflare-module, output `dist/`)
- `npm run preview` — preview build

## Env
Copy `.env` and set:
- `VITE_SUPABASE_URL` / `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY`
- Optional AI gateway for discovery: `AI_GATEWAY_URL` + `AI_GATEWAY_API_KEY` (falls back to local interpreter if unset)
- Optional cron protection: `CRON_SECRET` (+ `CRON_SECRET_PREVIOUS` for rotation)
