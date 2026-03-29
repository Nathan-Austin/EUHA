-- Add state/province field to judges table to match supplier address structure

ALTER TABLE judges
  ADD COLUMN IF NOT EXISTS state TEXT;

COMMENT ON COLUMN judges.state IS 'State, province, or region (required for US, CA, AU etc.)';
