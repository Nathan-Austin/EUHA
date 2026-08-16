-- Atomically consumes the next number for a category's sauce_code counter.
-- INSERT ... ON CONFLICT DO UPDATE takes a row lock, so concurrent callers
-- never get the same number.
CREATE OR REPLACE FUNCTION increment_sauce_code_counter(p_category_code TEXT)
RETURNS INTEGER
LANGUAGE sql
AS $$
  INSERT INTO sauce_code_counters (category_code, next_number)
  VALUES (p_category_code, 2)
  ON CONFLICT (category_code) DO UPDATE SET next_number = sauce_code_counters.next_number + 1
  RETURNING next_number - 1;
$$;
