-- Allow judges to update their own existing scores (needed for upsert on resubmission)
CREATE POLICY "Judges can update their own scores"
ON judging_scores FOR UPDATE
USING (
  auth.jwt() ? 'email'
  AND judge_id = (
    SELECT id FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
    LIMIT 1
  )
)
WITH CHECK (
  auth.jwt() ? 'email'
  AND judge_id = (
    SELECT id FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
    LIMIT 1
  )
);
