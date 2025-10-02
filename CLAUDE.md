# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EU Hot Sauce Awards judging platform - A Next.js application with Supabase backend for managing hot sauce competitions. The system handles supplier/judge registration, payment processing, QR-code-based judging, and results export.

## Working Directory

The main Next.js application is in `eu-hot-sauce-awards/` subdirectory. Always run commands from that directory.

```bash
cd eu-hot-sauce-awards
```

## Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

### Supabase (run from project root `/home/nathan/EUHA`)
```bash
supabase login                              # Authenticate CLI
supabase link --project-ref <project-ref>   # Link to remote project
supabase functions deploy                   # Deploy all edge functions
supabase functions deploy <function-name>   # Deploy specific function
supabase db push                            # Push migrations to remote
supabase db reset                           # Reset local database
```

## Architecture

### Application Flow

1. **Registration**: External WordPress site sends webhook to Supabase Edge Functions (`supplier-intake`, `judge-intake`) which populate database
2. **Authentication**: Users log in via Supabase Auth, role-based routing to dashboards
3. **Payments**: Community judges pay via Stripe Checkout (managed by `stripe-checkout` and `stripe-webhook` functions)
4. **Judging**: QR codes → scoring page → local storage → bulk submission to `judging_scores` table
5. **Admin**: Sauce status management, box assignment, CSV export with weighted scoring

### Key Database Tables

- `suppliers`: Brand info and contact details
- `sauces`: Sauce entries with status enum (`registered`, `arrived`, `boxed`, `judged`)
- `judges`: Email-based auth with type (`supplier`, `pro`, `community`, `admin`)
- `judging_categories`: Scoring categories with weights
- `judging_scores`: Individual scores (unique constraint on judge_id + sauce_id + category_id)
- `box_assignments`: Maps sauces to physical judging boxes

### Directory Structure

```
eu-hot-sauce-awards/src/
├── app/
│   ├── actions.ts              # Server actions (updateSauceStatus, assignSaucesToBox, submitAllScores, exportResults)
│   ├── page.tsx                # Landing page
│   ├── login/                  # Auth pages
│   ├── dashboard/              # Role-based dashboard
│   ├── judge/
│   │   ├── scan/               # QR scanner
│   │   └── score/[sauceId]/    # Scoring interface
│   └── apply/                  # Application forms
├── lib/
│   └── supabase/
│       ├── client.ts           # Client-side Supabase
│       └── server.ts           # Server-side Supabase with cookie handling
└── hooks/                      # Custom React hooks

supabase/
├── functions/                  # Edge functions (supplier-intake, judge-intake, stripe-checkout, stripe-webhook, supplier-checkout)
└── migrations/                 # Database migrations
```

### Server Actions

Located in `src/app/actions.ts`:
- `updateSauceStatus`: Admin-only sauce status updates
- `assignSaucesToBox`: Batch assign sauces to boxes and update status to 'boxed'
- `submitAllScores`: Bulk insert from local storage to database (handles duplicate detection)
- `exportResults`: CSV export with weighted averages by judge type (pro: 0.8, community: 1.5, supplier: 0.8)

### Authentication Pattern

Server actions verify admin access by:
1. Getting user from `supabase.auth.getUser()`
2. Querying `judges` table by email
3. Checking `type` field equals 'admin'

### Local Storage Usage

Judging scores are stored in browser local storage before bulk submission to prevent data loss. Key pattern: `sauce_${sauceId}`.

### Supabase Edge Functions

- `supplier-intake`: Webhook receiver for supplier registrations
- `judge-intake`: Webhook receiver for judge registrations
- `stripe-checkout`: Creates Stripe sessions for community judge payments
- `stripe-webhook`: Handles Stripe events, updates `judges.stripe_payment_status`
- `supplier-checkout`: Creates Stripe sessions for supplier multi-entry payments

### Environment Variables

**Frontend (.env in eu-hot-sauce-awards/):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SAUCE_IMAGE_BUCKET`

**Supabase Secrets (via `supabase secrets set`):**
- `PROJECT_URL`
- `SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SIGNING_SECRET`
- `SUPPLIER_PAYMENT_SUCCESS_URL`
- `SUPPLIER_PAYMENT_CANCEL_URL`
- `SAUCE_IMAGE_BUCKET`

### Image Uploads

Sauce images are uploaded to Supabase Storage bucket (configured via `SAUCE_IMAGE_BUCKET` env var). The `sauces` table has `image_path` column for storage paths.

### Payment Flow

1. Community judges pay via Stripe Checkout session created by `stripe-checkout` function
2. Stripe webhook posts to `stripe-webhook` function
3. Function updates `judges.stripe_payment_status` to grant access
4. Suppliers can pay for multiple entries via `supplier-checkout` function

### Scoring System

Results export uses weighted averaging:
- Pro judges: 0.8 weight
- Community judges: 1.5 weight
- Supplier judges: 0.8 weight

Final weighted score = (Σ(avg_score × count × weight)) / (Σ(count × weight))

## Path Aliases

TypeScript paths configured with `@/*` mapping to `./src/*` in tsconfig.json.
