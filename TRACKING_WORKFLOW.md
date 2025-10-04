# Supplier Tracking & Email Workflow

## Overview

This document describes the supplier tracking and email notification system implemented for the EU Hot Sauce Awards platform.

## Workflow

### 1. Supplier Registration & Payment

**When a supplier registers and completes payment:**

1. Stripe webhook receives `checkout.session.completed` event
2. System updates `supplier_payments` table with `stripe_payment_status: 'succeeded'`
3. System creates/updates judge profile:
   - Creates entry in `judges` table
   - Sets `type: 'supplier'`
   - Sets `active: true`
4. ✉️ **TODO**: Send payment confirmation email with:
   - Payment receipt
   - Login instructions (magic link)
   - Next steps (submit tracking info)

### 2. Supplier Dashboard - Tracking Submission

**When supplier logs in:**

- Dashboard shows their current package status
- Form to submit:
  - Tracking number
  - Postal service name (DHL, UPS, An Post, etc.)

**When supplier submits tracking:**

1. Updates `suppliers` table:
   - `tracking_number`
   - `postal_service_name`
   - `package_status: 'shipped'`
2. ✉️ **TODO**: Send tracking confirmation email

### 3. Admin Workflow - Package Receipt

**Admin dashboard shows:**

- **In Transit**: Suppliers who submitted tracking (priority view)
- **Pending**: Suppliers awaiting tracking info
- **Received**: Collapsed list of received packages

**When admin marks package as received:**

1. Updates `suppliers` table:
   - `package_status: 'received'`
   - `package_received_at: [timestamp]`
2. ✉️ **TODO**: Send package received email to supplier
3. Updates supplier dashboard to show confirmation

## Database Schema

### New Fields Added to `suppliers` Table

```sql
tracking_number TEXT
postal_service_name TEXT
package_received_at TIMESTAMPTZ
package_status TEXT DEFAULT 'pending'
  CHECK (package_status IN ('pending', 'shipped', 'received'))
```

**Package Status Values:**
- `pending`: Awaiting tracking info from supplier
- `shipped`: Tracking submitted, package in transit
- `received`: Package arrived at judging location

## Email System (To Be Configured)

### Current Status: Placeholder Implementation

Email templates are defined in `/src/lib/email.ts` but not yet connected to an email service.

### Recommended Options:

#### Option 1: Gmail SMTP (Simple, Free)
```bash
# Add to .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**Setup:**
1. Create new Gmail account or use existing
2. Enable 2FA on Gmail account
3. Generate app-specific password
4. Install nodemailer: `npm install nodemailer`
5. Uncomment email code in:
   - `supabase/functions/stripe-webhook/index.ts` (lines 204-213)
   - `src/app/actions.ts` (lines 1024-1038, 1095-1102)

#### Option 2: Transactional Email Service (Production Ready)
- **Resend** (recommended for Next.js)
- **SendGrid**
- **Postmark**
- **Customer.io**

### Email Templates Included:

1. **Payment Confirmation**
   - Subject: "EU Hot Sauce Awards - Payment Confirmed"
   - Sent: After successful Stripe payment
   - Contains: Receipt, login link, next steps

2. **Tracking Confirmation**
   - Subject: "EU Hot Sauce Awards - Tracking Information Received"
   - Sent: After supplier submits tracking
   - Contains: Tracking number, postal service

3. **Package Received**
   - Subject: "EU Hot Sauce Awards - Package Received!"
   - Sent: When admin marks package as received
   - Contains: Confirmation, list of sauces

## Files Modified/Created

### Database
- `/supabase/migrations/20251104000000_add_supplier_tracking.sql` - New migration

### Backend
- `/src/lib/email.ts` - Email service & templates (NEW)
- `/src/app/actions.ts` - Added `submitTrackingInfo()` and `markPackageReceived()`
- `/supabase/functions/stripe-webhook/index.ts` - Enhanced supplier payment handling

### Frontend
- `/src/app/dashboard/SupplierDashboard.tsx` - Supplier tracking form (NEW)
- `/src/app/dashboard/PackageTracker.tsx` - Admin package management (NEW)
- `/src/app/dashboard/AdminDashboard.tsx` - Added package tracker
- `/src/app/dashboard/page.tsx` - Added supplier dashboard routing

## Usage Instructions

### For Suppliers:

1. **After Payment:**
   - Check email for payment confirmation
   - Click magic link to log in
   - Access supplier dashboard

2. **Submit Tracking:**
   - Enter tracking number
   - Enter postal service name
   - Submit form
   - Receive confirmation email

3. **Track Status:**
   - Dashboard shows current status:
     - Yellow: Awaiting shipment
     - Blue: In transit
     - Green: Received

### For Admins:

1. **Monitor Packages:**
   - View "In Transit" section for packages to receive
   - See tracking numbers and postal services
   - Check "Pending" for suppliers who haven't shipped

2. **Mark as Received:**
   - Click "Mark Received" button
   - System sends confirmation email
   - Package moves to "Received" section

## Migration Deployment

To apply the database changes:

```bash
# From /home/nathan/EUHA directory
supabase db push

# Or for remote deployment
supabase link --project-ref <your-project-ref>
supabase db push
```

## Next Steps

### To Complete Email Integration:

1. **Choose email service** (Gmail SMTP or transactional service)

2. **Add environment variables:**
   ```bash
   # For Gmail SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Update email.ts:**
   - Uncomment and complete `sendEmail()` function
   - Test with your chosen service

4. **Uncomment email calls:**
   - Stripe webhook (payment confirmation)
   - submitTrackingInfo (tracking confirmation)
   - markPackageReceived (package received)

5. **Test the flow:**
   - Make test payment
   - Submit tracking info
   - Mark package received
   - Verify emails sent

### Future Enhancements:

- [ ] Magic link authentication for suppliers
- [ ] Webhook to update status from tracking APIs
- [ ] SMS notifications for critical updates
- [ ] Automated reminders for pending shipments
- [ ] Shipment timeline visualization

## Security Notes

- Email sending is server-side only
- Admin actions require authentication
- Suppliers can only update their own tracking
- All database operations use RLS policies
