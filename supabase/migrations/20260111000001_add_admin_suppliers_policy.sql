-- Add policy to allow admins to view all suppliers
-- This is needed for the VAT email feature supplier dropdown

CREATE POLICY "Admins can view all suppliers"
ON suppliers FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);
