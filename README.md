# EU Hot Sauce Awards Platform

A comprehensive Next.js application for managing the European Hot Sauce Awards competition, handling registration, payments, judging, and results.

## Overview

The EU Hot Sauce Awards platform is a full-stack judging system built with Next.js 14, Supabase, and Stripe. The platform manages the entire competition lifecycle from supplier/judge registration through to results export with weighted scoring.

**Live Site:** [heatawards.eu](https://heatawards.eu)

## Migration History

This platform was completely rebuilt from a WordPress-based system to a modern Next.js application:

- **Previous System (2024-2025):** 100% WordPress - handled all registrations, payments, judging, and data management internally
- **Current System (2026):** Purpose-built Next.js application with Supabase backend, replacing WordPress entirely

The migration to a custom-built platform provided:
- Improved user experience with a modern, responsive interface
- Better control over registration and judging workflows
- Real-time data synchronization and auto-save features
- Advanced admin tools (QR scanning, PDF generation, conflict checking)
- Scalable architecture for future competitions

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Edge Functions, Storage, Auth)
- **Payments:** Stripe Checkout & Webhooks
- **Hosting:** Vercel (frontend), Supabase (backend)
- **QR Generation:** Built-in QR code system for sauce tracking and judging

## Key Features

### Registration & Payment
- **Supplier Registration:** Multi-sauce entry forms with image uploads, automatic pricing with volume discounts
- **Judge Registration:** Application forms with conflict of interest declarations
- **Payment Processing:** Stripe integration for community judges (€15) and supplier entries (€50/sauce with discounts)
- **Magic Link Authentication:** Email-based passwordless login via Supabase Auth

### Judging System
- **QR Code Scanning:** Mobile-optimized scanner for sauce identification
- **Category-Based Scoring:** Multiple scoring categories with weighted calculations
- **Local Storage Backup:** Auto-saves scores to prevent data loss
- **Bulk Submission:** Submit all pending scores at once
- **Judge Types:** Pro, Community, Supplier, and Admin roles with different weights

### Admin Features
- **Sauce Status Management:** Track sauces through registration → arrived → boxed → judged
- **Box Assignment Scanner:** Physical box packing with QR scanning and conflict of interest checking
- **Label Generation:** PDF generation for sauce stickers (Avery 4780) and judge labels
- **Results Export:** CSV export with weighted scoring algorithms
- **User Management:** Add/manage admin users

### Competition Management
- **18 Categories:** From Mild to Extract-Based, BBQ, Ketchup, Jam, Honey, and more
- **Unique Sauce Codes:** Auto-generated codes (e.g., D001, H042) based on category
- **Box Tracking:** Track which sauces are packed in which judge boxes
- **Bottle Scan Tracking:** Monitor individual bottle scans during packing (7 per sauce type)
- **Historical Results:** Display past competition winners with filtering

## Architecture

### Application Structure

```
eu-hot-sauce-awards/
├── src/
│   ├── app/
│   │   ├── actions.ts              # Server actions
│   │   ├── page.tsx                # Landing page
│   │   ├── login/                  # Auth pages
│   │   ├── dashboard/              # Role-based dashboard
│   │   ├── judge/
│   │   │   ├── scan/               # QR scanner
│   │   │   └── score/[sauceId]/    # Scoring interface
│   │   ├── apply/
│   │   │   ├── supplier/           # Supplier registration
│   │   │   └── judge/              # Judge registration
│   │   └── results/                # Past winners
│   ├── components/                 # Reusable components
│   ├── lib/
│   │   └── supabase/               # Supabase client config
│   └── hooks/                      # Custom React hooks
└── public/                         # Static assets

supabase/
├── functions/                      # Edge functions
│   ├── judge-intake/              # Judge registration handler
│   ├── supplier-intake/           # Supplier registration handler
│   ├── stripe-checkout/           # Judge payment sessions
│   ├── supplier-checkout/         # Supplier payment sessions
│   └── stripe-webhook/            # Payment confirmations
└── migrations/                     # Database schema
```

### Database Schema

**Key Tables:**
- `suppliers` - Brand information and contact details
- `sauces` - Sauce entries with status, codes, QR codes, images
- `judges` - Judge profiles with type, payment status, QR codes
- `judging_categories` - Scoring categories with weights
- `judging_scores` - Individual category scores (judge × sauce × category)
- `box_assignments` - Maps sauces to physical judging boxes
- `supplier_payments` - Payment tracking with discounts
- `bottle_scans` - Individual bottle scan tracking during packing
- `past_results` - Historical competition winners

### Sauce Code System

Each sauce receives a unique code: `[Category Letter][3-digit number]`

**Examples:** `D001` (Mild), `H042` (Hot), `X015` (Extra Hot)

**Category Codes:**
- D = Mild | M = Medium | H = Hot | X = Extra Hot
- E = Extract Based | B = BBQ | K = Ketchup | J = Jam
- R = Honey | Z = Maple Syrup | G = Garlic | L = Pickle
- C = Chutney | T = Oil | F = Freestyle | S = Sweet/Sour
- P = Paste | A = Salt & Condiments

### Weighted Scoring System

Results use weighted averages based on judge type:
- **Pro Judges:** 2.0 weight (2:1 ratio - industry experts carry double weight)
- **Community Judges:** 1.0 weight (consumer perspective)
- **Supplier Judges:** 1.0 weight (industry peers)

**Formula:** `(Σ(avg_score × count × weight)) / (Σ(count × weight))`

## User Flows

### Supplier Flow
1. Visit `/apply/supplier` and fill out registration form
2. Add multiple sauces with details and images
3. Submit → creates supplier, sauces, and payment record
4. Images uploaded to Supabase Storage
5. Receive magic link email
6. Log in and see payment summary with discounts
7. Complete Stripe checkout
8. Webhook updates payment status
9. Sauces officially registered

### Judge Flow
1. Visit `/apply/judge` and fill out application
2. Submit → creates judge record with conflict of interest data
3. Receive magic link email
4. Log in → role-based dashboard
5. **Pro/Admin judges:** Full access immediately
6. **Community judges:** Prompted to pay €15
7. Complete payment → access unlocked
8. Scan sauce QR codes → score sauces
9. Scores auto-save to local storage
10. Submit all scores when complete

### Admin Flow
1. Log in with admin credentials
2. View all sauces and update statuses
3. Generate sauce stickers and judge labels (PDF)
4. Use box packing scanner:
   - Scan judge QR code
   - Scan 12 sauce bottles for their box
   - System checks conflicts and tracks bottles
5. Export weighted results to CSV
6. Manage admin users

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase CLI
- Stripe account
- Vercel account (for deployment)

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd EUHA/eu-hot-sauce-awards

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SAUCE_IMAGE_BUCKET=sauce-media
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
```

**Supabase Secrets:**
```bash
supabase secrets set PROJECT_URL="your_supabase_url"
supabase secrets set SERVICE_ROLE_KEY="your_service_role_key"
supabase secrets set STRIPE_SECRET_KEY="your_stripe_secret"
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET="whsec_..."
supabase secrets set JUDGE_PAYMENT_BASE_URL="https://your-domain.com"
supabase secrets set SUPPLIER_PAYMENT_SUCCESS_URL="https://your-domain.com/payment-success"
supabase secrets set SUPPLIER_PAYMENT_CANCEL_URL="https://your-domain.com/payment-cancelled"
supabase secrets set SAUCE_IMAGE_BUCKET="sauce-media"
```

### Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions including:
- Supabase project setup
- Database migrations
- Edge function deployment
- Stripe webhook configuration
- Vercel deployment
- Creating admin users

## Payment Configuration

### Volume Discounts for Suppliers
- 1-5 sauces: €50 each (0% discount)
- 6-10 sauces: €47.50 each (5% discount)
- 11-15 sauces: €45 each (10% discount)
- 16+ sauces: €42.50 each (15% discount)

### Judge Fees
- Community judges: €15 (required before judging access)
- Pro judges: Free (industry professionals)
- Supplier judges: Free (included with entry)
- Admin judges: Free

## Project Structure

The main application is located in the `eu-hot-sauce-awards/` subdirectory. Always run commands from that directory:

```bash
cd eu-hot-sauce-awards
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
```

Supabase commands run from the project root:

```bash
cd /path/to/EUHA
supabase functions deploy              # Deploy all edge functions
supabase functions deploy <name>       # Deploy specific function
supabase db push                       # Push migrations
```

## Contributing

This is a private project for the EU Hot Sauce Awards. For questions or issues, please contact the development team.

## License

Proprietary - All rights reserved

## Contact

- Website: [heatawards.eu](https://heatawards.eu)
- Email: heataward@gmail.com

---

**Last Updated:** October 2025
**Platform Version:** 2026 Competition System
