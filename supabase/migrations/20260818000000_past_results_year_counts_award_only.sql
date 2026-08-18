-- The 2024 legacy import carried every entrant (not just medalists), unlike
-- 2025/2026 which only ever had award rows inserted. This function feeds the
-- "X award-winning entries" count shown on the results archive index, so it
-- needs to filter to award rows the same way src/app/results/[year]/page.tsx
-- now does — otherwise 2024 shows 193 (all entrants) instead of the true 50
-- award-winning entries.
CREATE OR REPLACE FUNCTION get_past_results_year_counts()
RETURNS TABLE(year integer, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT year, count(*) AS count
  FROM past_results
  WHERE award IS NOT NULL AND award <> ''
  GROUP BY year
  ORDER BY year DESC;
$$;
