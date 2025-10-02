-- Add policies to allow service role to insert suppliers and sauces
-- These are needed for the supplier-intake edge function

-- Allow service role to insert suppliers
CREATE POLICY "Service role can insert suppliers"
ON suppliers FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update suppliers
CREATE POLICY "Service role can update suppliers"
ON suppliers FOR UPDATE
TO service_role
USING (true);

-- Allow service role to insert sauces
CREATE POLICY "Service role can insert sauces"
ON sauces FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update sauces
CREATE POLICY "Service role can update sauces"
ON sauces FOR UPDATE
TO service_role
USING (true);

-- Allow suppliers to view their own data
CREATE POLICY "Suppliers can view their own data"
ON suppliers FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND lower(email) = lower(auth.jwt() ->> 'email')
);

-- Allow suppliers to view their own sauces
CREATE POLICY "Suppliers can view their own sauces"
ON sauces FOR SELECT
USING (
  supplier_id IN (
    SELECT id FROM suppliers
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  )
);
