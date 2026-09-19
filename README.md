# TerraLens — AI Environmental Intelligence

Environmental intelligence for Nigerian locations: safety, health, business and infrastructure insights to help you decide where to live, visit or invest.

## Stack
- TanStack Start (Vite) + React 19 + TypeScript
- Tailwind CSS 4
- Supabase

## Development

Requires Node.js 20+ and npm.

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
cp .env.example .env  # if present, or create .env with VITE_SUPABASE_* vars
npm run dev
```

Dev server runs at `http://localhost:8080`.

## Build

```sh
npm run build
npm run preview
```

Output is `dist/` (nitro `cloudflare-module` preset: `dist/server` + `dist/client`).

## Environment

- `VITE_SUPABASE_URL` / `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY`
- Optional AI discovery gateway: `AI_GATEWAY_URL` + `AI_GATEWAY_API_KEY` (falls back to local rule-based interpreter if unset)
- Optional cron auth: `CRON_SECRET` (and `CRON_SECRET_PREVIOUS` for rotation)

## Deployment

Any Node or Cloudflare Workers target that can serve the `dist/` nitro output.
