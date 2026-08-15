-- First DB-backed, admin-togglable feature gate in this app (previous gates
-- like JUDGING_OPEN are hardcoded code constants requiring a deploy to flip).
-- Key/value per competition year so gates reset to closed each new season
-- without relying on admin remembering to flip them back manually.
CREATE TABLE competition_settings (
  competition_year INTEGER NOT NULL,
  key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by_email TEXT,
  PRIMARY KEY (competition_year, key)
);

ALTER TABLE competition_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read competition settings"
ON competition_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can modify competition settings"
ON competition_settings FOR ALL
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
)
WITH CHECK (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);
