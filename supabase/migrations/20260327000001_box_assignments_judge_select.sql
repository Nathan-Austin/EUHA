-- Allow judges to read their own box assignments
CREATE POLICY "Judges can view their own box assignments"
  ON box_assignments
  FOR SELECT
  USING (
    (auth.jwt() ? 'email') AND
    EXISTS (
      SELECT 1 FROM judges
      WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
        AND judges.id = box_assignments.judge_id
    )
  );
