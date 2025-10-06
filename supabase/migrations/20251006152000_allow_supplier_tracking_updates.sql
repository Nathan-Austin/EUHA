-- Allow suppliers to update their own tracking information
CREATE POLICY "Suppliers can update their own tracking info"
ON suppliers FOR UPDATE
USING (
  auth.jwt() ? 'email'
  AND lower(email) = lower(auth.jwt() ->> 'email')
)
WITH CHECK (
  auth.jwt() ? 'email'
  AND lower(email) = lower(auth.jwt() ->> 'email')
);
