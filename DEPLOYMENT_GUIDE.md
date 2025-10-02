# EU Hot Sauce Awards - Deployment & Configuration Guide

This document provides complete setup instructions for deploying the EU Hot Sauce Awards platform from scratch.

## Architecture Overview

- **Frontend**: Next.js 14 (App Router) deployed on Vercel
- **Backend**: Supabase (PostgreSQL + Edge Functions + Storage + Auth)
- **Payments**: Stripe (live mode)
- **Domain**: awards.heatawards.eu

## Prerequisites

- Node.js installed
- Supabase CLI installed (`npm install -g supabase`)
- Git installed
- Stripe account (live keys)
- Vercel account

## 1. Supabase Project Setup

### 1.1 Link to Project

```bash
cd /path/to/EUHA
supabase login
supabase link --project-ref csweurtdldauwrthqafo
```

### 1.2 Configure Supabase Secrets

All edge functions require these environment variables:

```bash
# Core Supabase credentials
supabase secrets set PROJECT_URL="https://csweurtdldauwrthqafo.supabase.co"
supabase secrets set SERVICE_ROLE_KEY="your-service-role-key"

# Stripe credentials
supabase secrets set STRIPE_SECRET_KEY="your-stripe-secret-key"
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET="whsec_..."

# Judge payment redirect URLs
supabase secrets set JUDGE_PAYMENT_BASE_URL="https://awards.heatawards.eu"

# Supplier payment redirect URLs
supabase secrets set SUPPLIER_PAYMENT_SUCCESS_URL="https://awards.heatawards.eu/payment-success"
supabase secrets set SUPPLIER_PAYMENT_CANCEL_URL="https://awards.heatawards.eu/payment-cancelled"

# Storage configuration
supabase secrets set SAUCE_IMAGE_BUCKET="sauce-media"
```

**Where to find values:**
- `SERVICE_ROLE_KEY`: Supabase Dashboard → Project Settings → API → service_role (secret)
- `STRIPE_SECRET_KEY`: Stripe Dashboard → Developers → API keys → Secret key
- `STRIPE_WEBHOOK_SIGNING_SECRET`: Stripe Dashboard → Developers → Webhooks → [Your webhook] → Signing secret

### 1.3 Deploy Database Migrations

```bash
supabase db push --include-all
```

This creates:
- All database tables (suppliers, sauces, judges, judging_categories, judging_scores, box_assignments, supplier_payments)
- RLS policies
- Storage bucket (`sauce-media`) with policies
- Judging categories data

### 1.4 Deploy Edge Functions

```bash
supabase functions deploy
```

This deploys:
- `judge-intake`: Handles judge registration from frontend form
- `supplier-intake`: Handles supplier registration with multi-sauce entry
- `stripe-checkout`: Creates Stripe sessions for community judge payments
- `supplier-checkout`: Creates Stripe sessions for supplier payments
- `stripe-webhook`: Receives Stripe payment confirmations and updates database

**Important**: All payment-related functions have JWT verification disabled in `supabase/config.toml` to allow Stripe webhooks and public access.

### 1.5 Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. Set Endpoint URL: `https://csweurtdldauwrthqafo.supabase.co/functions/v1/stripe-webhook`
4. Select event: `checkout.session.completed`
5. Click "Add endpoint"
6. Reveal the signing secret and add it to Supabase secrets (see step 1.2)

### 1.6 Configure Supabase Auth

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL**: `https://awards.heatawards.eu`
3. Add to **Redirect URLs**:
   - `https://awards.heatawards.eu/auth/callback`
   - `https://awards.heatawards.eu/**`
4. Save changes

### 1.7 Create Storage Bucket (if not auto-created)

If the `sauce-media` bucket wasn't created by the migration:

1. Go to Supabase Dashboard → Storage
2. Create new bucket: `sauce-media`
3. Make it public
4. The policies should be automatically created by the migration

## 2. Vercel Frontend Setup

### 2.1 Environment Variables

Set these in Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://csweurtdldauwrthqafo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SAUCE_IMAGE_BUCKET=sauce-media
```

**Where to find values:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Dashboard → Project Settings → API → anon/public key

### 2.2 Deploy to Vercel

1. Connect GitHub repository to Vercel
2. Set environment variables (see above)
3. Deploy from `main` branch
4. Set custom domain: `awards.heatawards.eu`

## 3. Create First Admin User

After deployment, create the first admin user manually:

```sql
-- Run in Supabase SQL Editor
INSERT INTO judges (email, type, active)
VALUES ('admin@example.com', 'admin', true)
ON CONFLICT (email) DO UPDATE SET type = 'admin', active = true;
```

Then:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Invite user"
3. Enter the same email address
4. User will receive an invite email to set their password

Once logged in, this admin can add other admins via the dashboard.

## 4. Price Configuration

### Current Prices (Testing Mode)

**IMPORTANT**: Prices are currently set to €1 for testing. Before going live, update:

**Judge Fee:**
```typescript
// File: supabase/functions/stripe-checkout/index.ts
// Line 31
unit_amount: 1500, // Change 100 to 1500 (€15.00)
```

**Sauce Entry Fee:**
```typescript
// File: supabase/functions/supplier-intake/index.ts
// Line 21
const BASE_PRICE_CENTS = 50_00; // Change 100 to 50_00 (€50.00)

// File: eu-hot-sauce-awards/src/app/apply/supplier/page.tsx
// Line 50
const ENTRY_PRICE_CENTS = 50_00; // Change 100 to 50_00 (€50.00)
```

After updating, redeploy:
```bash
supabase functions deploy stripe-checkout
supabase functions deploy supplier-intake
# Frontend will auto-deploy via Vercel
```

## 5. Application Flow

### Judge Registration
1. Visit `/apply/judge`
2. Fill out form (includes conflict of interest declaration)
3. Submit → creates judge record in database
4. Receive magic link email
5. Click magic link → log in
6. **Pro judges**: See full dashboard immediately
7. **Community judges**: Prompted to pay €15 (currently €1)
8. Pay via Stripe
9. Webhook updates `stripe_payment_status` to 'succeeded'
10. Dashboard unlocks judging features

### Supplier Registration
1. Visit `/apply/supplier`
2. Fill out brand info + multiple sauces (with optional images)
3. Submit → creates supplier, sauces, and payment record
4. Images uploaded to `pending/` then moved to `suppliers/{supplier_id}/{sauce_id}.webp`
5. Receive magic link email
6. See payment summary with total (including volume discounts)
7. Click "Proceed to Payment"
8. Pay via Stripe
9. Webhook updates `stripe_payment_status` to 'succeeded'
10. Sauces are officially registered

### Admin Functions
- View all sauces and update status (registered → arrived → boxed → judged)
- Assign sauces to judging boxes
- Export results as CSV with weighted scoring
- Add other admin users

## 6. Database Schema

### Key Tables

**judges**
- `id`, `email`, `name`, `address`, `city`, `postal_code`, `country`
- `type` (admin | pro | community | supplier)
- `experience_level`, `industry_affiliation`, `affiliation_details`
- `stripe_payment_status`, `active`

**suppliers**
- `id`, `brand_name`, `contact_name`, `email`, `address`

**sauces**
- `id`, `supplier_id`, `name`, `ingredients`, `allergens`, `category`
- `qr_code_url`, `image_path`, `payment_id`
- `status` (registered | arrived | boxed | judged)

**supplier_payments**
- `id`, `supplier_id`, `entry_count`, `discount_percent`
- `subtotal_cents`, `discount_cents`, `amount_due_cents`
- `stripe_session_id`, `stripe_payment_status`

**judging_scores**
- `id`, `judge_id`, `sauce_id`, `category_id`, `score`, `comments`

## 7. Scoring System

Results are calculated with weighted averages:
- **Pro judges**: 0.8 weight
- **Community judges**: 1.5 weight
- **Supplier judges**: 0.8 weight

Formula: `(Σ(avg_score × count × weight)) / (Σ(count × weight))`

Export includes: Brand, Sauce, Final Weighted Score, Avg Pro Score, Avg Community Score, Avg Supplier Score

## 8. Troubleshooting

### Webhook Not Working
1. Check logs: Supabase Dashboard → Edge Functions → stripe-webhook → Logs
2. Verify signing secret is correct
3. Test by resending webhook event in Stripe Dashboard
4. Ensure `verify_jwt = false` in `supabase/config.toml`

### Storage Upload Failing
1. Check bucket exists: Supabase Dashboard → Storage
2. Verify policies exist: Storage → sauce-media → Policies
3. Should have policies for: authenticated uploads to pending, public reads, service role full access

### Login/Magic Link Issues
1. Check Site URL and Redirect URLs in Supabase Auth settings
2. Verify email templates are configured (Supabase Dashboard → Authentication → Email Templates)
3. Check spam folder

### Payment Not Updating Database
1. Verify webhook received event: Stripe Dashboard → Webhooks → [Your webhook]
2. Check Supabase logs for errors
3. Verify metadata includes `type` and `judge_id` or `payment_id`
4. Check RLS policies allow service role updates

## 9. Maintenance Commands

```bash
# View secrets
supabase secrets list

# Update a secret
supabase secrets set SECRET_NAME="new-value"

# Deploy specific function
supabase functions deploy function-name

# Push new migrations
supabase db push --include-all

# View function logs
# Go to: Supabase Dashboard → Edge Functions → [function] → Logs
```

## 10. Pre-Launch Checklist

- [ ] Update prices from €1 to production values
- [ ] Test complete registration flows (judge + supplier)
- [ ] Test payment flows end-to-end
- [ ] Verify webhook working in live mode
- [ ] Test admin functions (add admin, update sauce status, export results)
- [ ] Configure email templates (Supabase Dashboard → Authentication → Email Templates)
- [ ] Test magic link emails
- [ ] Verify all redirect URLs point to production domain
- [ ] Create initial admin user
- [ ] Populate judging categories if not auto-populated
- [ ] Test image uploads and storage access
- [ ] Verify QR code generation for sauces

---

**Last Updated**: October 2, 2025
**Platform Version**: Production
**Contact**: For issues, check Supabase logs and Stripe webhook events first.
