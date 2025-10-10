-- Drop existing admin policy
DROP POLICY IF EXISTS "Allow admin full access" ON events;

-- Create new admin policies that check if the user is an admin in the judges table
CREATE POLICY "Allow admin insert access to events" ON events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.email = auth.jwt()->>'email'
      AND judges.type = 'admin'
    )
  );

CREATE POLICY "Allow admin update access to events" ON events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.email = auth.jwt()->>'email'
      AND judges.type = 'admin'
    )
  );

CREATE POLICY "Allow admin delete access to events" ON events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM judges
      WHERE judges.email = auth.jwt()->>'email'
      AND judges.type = 'admin'
    )
  );

-- Update the public read policy to allow admins to see all events (not just active ones)
DROP POLICY IF EXISTS "Allow public read access to active events" ON events;

CREATE POLICY "Allow public read access to active events" ON events
  FOR SELECT
  USING (
    active = true
    OR EXISTS (
      SELECT 1 FROM judges
      WHERE judges.email = auth.jwt()->>'email'
      AND judges.type = 'admin'
    )
  );
