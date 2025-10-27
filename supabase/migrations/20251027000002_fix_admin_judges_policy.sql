-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all judges" ON judges;

-- The infinite recursion happens because we can't query 'judges' from within a 'judges' policy.
-- Instead, admin components should use the service role which bypasses RLS.
-- This migration just removes the broken policy.
