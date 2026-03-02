# CampTrack MVP

CampTrack is a multi-tenant summer camp attendance app with QR/Barcode-driven scanning, parent drop-off/pick-up guardrails, and out-of-area safety tracking.

## Architecture overview
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS.
- **Auth**: NextAuth Credentials provider against Prisma users.
- **Data**: Prisma ORM + PostgreSQL models for organizations, roles, attendance events, scan tokens, stations, and out-of-area events.
- **Security**: Opaque card tokens are hashed in DB (`ScanToken.tokenHash`); scanner verifies token server-side.
- **Scanning**: Browser camera via `@zxing/browser` with manual code fallback.
- **Reporting**: CSV endpoint at `/reports/attendance.csv` and print-friendly roster page at `/reports/daily-roster`.

## Local run (Docker)
1. Copy env file
   ```bash
   cp .env.example .env
   ```
2. Start services
   ```bash
   docker-compose up --build
   ```
3. Open app: `http://localhost:3000`

## Local run (without Docker)
```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
npm run dev
```

## Seed credentials
- admin@camptrack.local / Password123!
- counselor@camptrack.local / Password123!
- parent@camptrack.local / Password123!

## Key routes
- `/login`
- `/staff/dashboard`
- `/staff/campers/[id]`
- `/staff/campers/[id]/card`
- `/staff/weeks`
- `/parent/home`
- `/kiosk`
- `/scan`
- `/admin/users`
- `/admin/settings`
- `/reports/attendance.csv`
- `/reports/daily-roster`


> CI uses `npm ci` when `package-lock.json` exists, and falls back to `npm install` otherwise.

## Commands
- `npm run dev`
- `npm run build`
- `npm run test`
