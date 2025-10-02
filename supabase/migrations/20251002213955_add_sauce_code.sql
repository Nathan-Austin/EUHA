-- Add sauce_code column to sauces table
ALTER TABLE sauces ADD COLUMN sauce_code TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX idx_sauce_code ON sauces(sauce_code);

-- Add comment
COMMENT ON COLUMN sauces.sauce_code IS 'Category prefix + 3-digit sequential number (e.g., D001, M042, H123)';
