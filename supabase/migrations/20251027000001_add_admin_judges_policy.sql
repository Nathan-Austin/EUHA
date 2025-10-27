-- Add policy for admins to view all judges
CREATE POLICY "Admins can view all judges"
ON judges FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges admin_check
    WHERE lower(admin_check.email) = lower(auth.jwt() ->> 'email')
      AND admin_check.type = 'admin'
  )
);
