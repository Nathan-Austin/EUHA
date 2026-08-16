-- supplier_participations only had an admin-only RLS policy, so a supplier
-- could never read their own opt-in row through the normal authenticated
-- client. dashboard/page.tsx's hasOptedIn check silently fell back to false
-- whenever the supplier had opted in but not yet added any sauces, showing
-- the "Enter competition" gate again on every fresh page load. Matches the
-- existing "Suppliers can view their own data" pattern on suppliers/sauces.

CREATE POLICY "Suppliers can view their own participation" ON supplier_participations
  FOR SELECT
  TO public
  USING (
    (auth.jwt() ? 'email') AND lower(email) = lower(auth.jwt() ->> 'email')
  );
