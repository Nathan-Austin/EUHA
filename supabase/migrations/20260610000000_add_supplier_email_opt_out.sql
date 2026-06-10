-- Add opt-out flag to suppliers for email sending
ALTER TABLE suppliers ADD COLUMN email_opted_out BOOLEAN NOT NULL DEFAULT false;

-- Mark Catford Fire as opted out (incorrect email, they wish to be removed)
UPDATE suppliers SET email_opted_out = true WHERE lower(email) = 'hello@catfordfire.com';

-- Grant access consistent with other supplier columns
GRANT SELECT, UPDATE (email_opted_out) ON public.suppliers TO anon, authenticated;
