# Scripts

## invite-judges-to-auth.ts

This script fixes the magic link login issue by creating Supabase Auth accounts for judges who were registered but don't have auth accounts.

### Problem

The edge functions (`judge-intake` and `supplier-intake`) were correctly populating the `judges` and `judge_participations` tables, but not creating users in Supabase's `auth.users` table. This meant judges couldn't receive magic links to log in.

### Solution

This script:
1. Finds all accepted judges for 2026 who don't have auth accounts
2. Creates auth accounts for them using Supabase Admin API
3. Auto-confirms their email so they can log in immediately

### Usage

```bash
# From the project root directory
cd /home/nathan/EUHA

# Set environment variables (or use .env file)
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the script
npx tsx scripts/invite-judges-to-auth.ts
```

### Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (has admin permissions)

You can find these in:
1. Supabase Dashboard → Project Settings → API
2. Or in your `eu-hot-sauce-awards/.env.local` file

### What It Does

1. **Finds affected judges**: Queries the database for judges who are:
   - In `judge_participations` table for 2026
   - Marked as `accepted: true`
   - NOT in `auth.users` table

2. **Creates auth accounts**: For each affected judge:
   - Creates a new user in Supabase Auth
   - Auto-confirms their email (no verification needed)
   - Adds metadata (name, judge type) to their profile
   - Uses `createUser()` with `email_confirm: true`

3. **Reports results**: Shows success/failure for each judge

### After Running

Once the script completes, all affected judges will be able to:
1. Visit the login page
2. Enter their email
3. Receive a magic link
4. Click the link to log in
5. Access their appropriate dashboard (pro/community/supplier)

### Edge Functions Updated

The following edge functions have been updated to prevent this issue in the future:
- `/home/nathan/EUHA/supabase/functions/judge-intake/index.ts`
- `/home/nathan/EUHA/supabase/functions/supplier-intake/index.ts`

Both now create auth accounts automatically during registration.
