-- insertSauceEntry generated the next sauce_code by scanning the current max
-- code among existing rows for that category prefix. Deleting a sauce (e.g.
-- an unpaid entry removed before payment) freed its code for reissue to a
-- completely different sauce later, and concurrent inserts could race to the
-- same code. A persistent per-category counter fixes both: codes only ever
-- move forward, and the atomic UPDATE...RETURNING removes the race.

CREATE TABLE IF NOT EXISTS sauce_code_counters (
  category_code TEXT PRIMARY KEY,
  next_number INTEGER NOT NULL DEFAULT 1
);

-- Seed each counter one past the highest code currently in use, so existing
-- codes are never reissued.
INSERT INTO sauce_code_counters (category_code, next_number)
SELECT left(sauce_code, 1), max(substring(sauce_code from 2)::int) + 1
FROM sauces
WHERE sauce_code IS NOT NULL AND sauce_code ~ '^[A-Z][0-9]+$'
GROUP BY 1
ON CONFLICT (category_code) DO UPDATE SET next_number = GREATEST(sauce_code_counters.next_number, EXCLUDED.next_number);

ALTER TABLE sauce_code_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages sauce code counters" ON sauce_code_counters
  FOR ALL
  TO service_role
  USING (true);
