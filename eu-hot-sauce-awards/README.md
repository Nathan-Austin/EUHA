# EU Hot Sauce Awards — Next.js App

Developer reference for the `eu-hot-sauce-awards/` Next.js application. See the [root README](../README.md) for full project overview, architecture, and deployment docs.

## Quick Start

```bash
# From this directory
npm install
cp .env.local.example .env.local   # fill in credentials
npm run dev                         # http://localhost:3000
```

## Commands

```bash
npm run dev      # Dev server (hot reload)
npm run build    # Production build
npm run lint     # ESLint
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Storage
NEXT_PUBLIC_SAUCE_IMAGE_BUCKET=sauce-media

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

## Route Map

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page |
| `/apply/supplier` | Public | Supplier registration |
| `/apply/judge` | Public | Judge registration |
| `/apply/event-judge` | Public | Event judge registration |
| `/login` | Public | Magic link login |
| `/dashboard` | Auth | Role-based dashboard (admin/judge/supplier) |
| `/judge/start` | Judge | Judging onboarding |
| `/judge/ready` | Judge | Pre-judging checklist |
| `/judge/scan` | Judge | QR code scanner |
| `/judge/score/[sauceId]` | Judge | Per-sauce scoring |
| `/results/[year]` | Public | Competition results by year |
| `/rankings` | Public | Live rankings |
| `/events` | Public | Live tasting events |
| `/events/[id]` | Public/Judge | Single event view |
| `/packing-sheet` | Admin | Sauce packing labels |
| `/judges` | Admin | Judge listing |
| `/payment-success` | Auth | Stripe success callback |
| `/payment-cancelled` | Auth | Stripe cancel callback |

## API Routes

| Route | Description |
|-------|-------------|
| `POST /api/auth/email-link` | Send magic link |
| `POST /api/auth/set-session` | Establish auth session |
| `POST /api/auth/verify-otp` | Verify OTP token |
| `POST /api/send-email` | General email dispatch |
| `POST /api/event-judge-register` | Event judge intake |
| `POST /api/results-email-worker` | Background results email sender |

## Key Libraries

| Library | Use |
|---------|-----|
| `@supabase/ssr` | Auth + server-side data access |
| `nodemailer` | Transactional email via Gmail SMTP |
| `jspdf` | PDF generation (stickers, certificates, labels) |
| `qrcode` + `@yudiel/react-qr-scanner` | QR code generation and scanning |
| `csv-parse` | CSV import for historical results |
| `fuse.js` | Fuzzy search |

## Server Actions (`src/app/actions.ts`)

The 4,600-line `actions.ts` file contains all server-side mutations. Key groups:

- **Sauce**: `updateSauceStatus`, `assignSaucesToBox`, `createSauceEntry`, `deleteSauce`
- **Scoring**: `submitAllScores`, `exportResults`, `getJudgeScoredSauces`
- **Judge management**: `approveProJudge`, `rejectProJudge`, `sendJudgingReminders`, `checkConflictOfInterest`
- **Shipping**: `generateJudgeShippingLabel`, `submitTrackingInfo`, `markPackageReceived`, `sendShippingAddressRequests`
- **Email**: `sendSupplierInvitations`, `sendJudgeInvitations`, `sendAllResultsFeedbackEmails`, `getEmailTemplates`, `updateEmailTemplate`
- **Events**: `openEventJudging`, `closeEventJudging`
- **Admin**: `addAdminUser`, `generateStickerData`, `generateJudgeQRCodes`, `checkProCoverage`

## Scripts (`scripts/`)

Run with `npx ts-node scripts/<name>.ts` from this directory.

| Script | Description |
|--------|-------------|
| `import-2025-results.ts` | Import 2025 competition results into DB |
| `import-historical-data.ts` | Bulk import historical results |
| `send-results-emails.ts` | Trigger results emails for all suppliers |
| `seed-events.ts` | Seed live tasting events |
| `seed-past-results.ts` | Seed past winner data |
| `seed-sponsors.ts` | Seed sponsor entries |

See [`scripts/README.md`](scripts/README.md) for prerequisites and usage.

## Tech Stack

- **Next.js 14** (App Router, Server Actions, Server Components)
- **React 18** + **TypeScript** + **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Storage, Edge Functions)
- **Stripe** (Checkout + Webhooks)
- **Vercel** (hosting, `waitUntil` for background tasks)
