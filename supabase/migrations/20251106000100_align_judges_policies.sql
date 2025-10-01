-- Ensure admin role exists in judge_type enum
ALTER TYPE judge_type ADD VALUE IF NOT EXISTS 'admin';

-- Refresh judges SELECT policy to work with email-based lookups
DROP POLICY IF EXISTS "Judges can view their own data" ON judges;
CREATE POLICY "Judges can view their own data"
ON judges FOR SELECT
USING (
  auth.uid() = id
  OR (
    auth.jwt() ? 'email'
    AND lower(email) = lower(auth.jwt() ->> 'email')
  )
);

CREATE POLICY "Admins can update sauces"
ON sauces FOR UPDATE
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

-- Replace judging_scores policies so inserts/selects map by email
DROP POLICY IF EXISTS "Judges can insert their own scores" ON judging_scores;
DROP POLICY IF EXISTS "Judges can view their own scores" ON judging_scores;

CREATE POLICY "Judges can insert their own scores"
ON judging_scores FOR INSERT
WITH CHECK (
  auth.jwt() ? 'email'
  AND judge_id = (
    SELECT id FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
    LIMIT 1
  )
);

CREATE POLICY "Judges can view their own scores"
ON judging_scores FOR SELECT
USING (
  (auth.jwt() ? 'email'
   AND judge_id = (
     SELECT id FROM judges
     WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
     LIMIT 1
   ))
  OR (
    auth.jwt() ? 'email'
    AND EXISTS (
      SELECT 1 FROM judges
      WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
        AND judges.type = 'admin'
    )
  )
);

-- Update box_assignments access for admins
DROP POLICY IF EXISTS "Judges can see their own box assignments" ON box_assignments;

CREATE POLICY "Admins can view box assignments"
ON box_assignments FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);

CREATE POLICY "Admins can manage box assignments"
ON box_assignments FOR INSERT
WITH CHECK (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);

CREATE POLICY "Admins can update box assignments"
ON box_assignments FOR UPDATE
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

CREATE POLICY "Admins can delete box assignments"
ON box_assignments FOR DELETE
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);
