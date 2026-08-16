-- getAvailableYears() fetched every past_results row client-side just to count
-- entries per year, which silently truncates once the table passes PostgREST's
-- ~1000-row default cap. Aggregate server-side instead so the row count never
-- affects correctness.
CREATE OR REPLACE FUNCTION get_past_results_year_counts()
RETURNS TABLE(year integer, count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT year, count(*) AS count
  FROM past_results
  GROUP BY year
  ORDER BY year DESC;
$$;

GRANT EXECUTE ON FUNCTION get_past_results_year_counts() TO anon, authenticated;
