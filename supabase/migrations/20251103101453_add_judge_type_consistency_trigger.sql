-- Migration: Add trigger to ensure judge_participations.judge_type matches judges.type
-- This prevents the type mismatch bug we found with jamesinawood@gmail.com

-- 1. Create a function to validate judge type consistency
CREATE OR REPLACE FUNCTION validate_judge_type_consistency()
RETURNS TRIGGER AS $$
DECLARE
  actual_judge_type TEXT;
BEGIN
  -- Get the judge's actual type from the judges table
  SELECT type::TEXT INTO actual_judge_type
  FROM judges
  WHERE email = NEW.email;

  -- If judge doesn't exist yet, allow the insert (intake functions handle this)
  IF actual_judge_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- If judge exists, ensure types match
  IF actual_judge_type != NEW.judge_type THEN
    RAISE EXCEPTION 'Judge type mismatch: judges.type is "%" but judge_participations.judge_type is "%". Email: %',
      actual_judge_type, NEW.judge_type, NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create trigger on judge_participations INSERT/UPDATE
DROP TRIGGER IF EXISTS enforce_judge_type_consistency ON judge_participations;

CREATE TRIGGER enforce_judge_type_consistency
  BEFORE INSERT OR UPDATE OF judge_type, email
  ON judge_participations
  FOR EACH ROW
  EXECUTE FUNCTION validate_judge_type_consistency();

-- 3. Add a comment explaining the trigger
COMMENT ON TRIGGER enforce_judge_type_consistency ON judge_participations IS
  'Ensures judge_participations.judge_type always matches judges.type for the same email. Prevents data inconsistency bugs.';

-- 4. Create an index to make the validation lookup fast
CREATE INDEX IF NOT EXISTS idx_judges_email_type ON judges(email, type);

-- 5. Optional: Add a function to help detect existing mismatches
CREATE OR REPLACE FUNCTION find_judge_type_mismatches()
RETURNS TABLE(
  email TEXT,
  judges_type TEXT,
  participation_type TEXT,
  year INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.email,
    j.type::TEXT as judges_type,
    jp.judge_type as participation_type,
    jp.year
  FROM judges j
  INNER JOIN judge_participations jp ON j.email = jp.email
  WHERE j.type::TEXT != jp.judge_type
  ORDER BY jp.year DESC, j.email;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_judge_type_mismatches() IS
  'Helper function to find any existing type mismatches. Run: SELECT * FROM find_judge_type_mismatches();';
