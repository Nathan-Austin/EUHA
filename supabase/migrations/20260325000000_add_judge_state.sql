-- Add state/province field to judges for countries that require it (USA, Canada)
ALTER TABLE judges ADD COLUMN IF NOT EXISTS state text;
