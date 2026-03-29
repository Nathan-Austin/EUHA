-- Add structured address columns to suppliers table for DHL/shipping compatibility

ALTER TABLE suppliers
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

COMMENT ON COLUMN suppliers.address IS 'Street address line 1 (street name and number)';
COMMENT ON COLUMN suppliers.address_line2 IS 'Optional second address line (c/o, unit, floor etc.)';
COMMENT ON COLUMN suppliers.city IS 'City or town';
COMMENT ON COLUMN suppliers.state IS 'State, province, or region (required for US, CA, AU etc.)';
COMMENT ON COLUMN suppliers.postal_code IS 'Postal / ZIP code';
COMMENT ON COLUMN suppliers.country IS 'ISO 3166-1 alpha-2 country code';
