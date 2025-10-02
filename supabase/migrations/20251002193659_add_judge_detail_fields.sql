-- Add detailed fields to judges table for complete registration data
ALTER TABLE judges ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS industry_affiliation BOOLEAN DEFAULT false;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS affiliation_details TEXT;

COMMENT ON COLUMN judges.experience_level IS 'The experience level selected: Professional Chili Person, Experienced Food / Chili Person, or Very Keen Amateur Food / Chili Person';
COMMENT ON COLUMN judges.industry_affiliation IS 'True if judge has professional association with chili sauce companies';
COMMENT ON COLUMN judges.affiliation_details IS 'Details of any professional associations with chili sauce companies';
