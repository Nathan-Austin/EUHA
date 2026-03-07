-- Migration: Add judge shipping address and DHL fields
-- Description: Adds address_line2 for c/o handling, and DHL label tracking fields to judges table

-- Additional address field for c/o, apartment number etc.
ALTER TABLE judges
  ADD COLUMN IF NOT EXISTS address_line2 TEXT;

-- DHL shipment tracking
ALTER TABLE judges
  ADD COLUMN IF NOT EXISTS dhl_tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS dhl_shipment_id TEXT,
  ADD COLUMN IF NOT EXISTS dhl_label_url TEXT,
  ADD COLUMN IF NOT EXISTS label_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS label_generation_error TEXT;

-- Index for tracking lookups
CREATE INDEX IF NOT EXISTS idx_judges_dhl_tracking
  ON judges(dhl_tracking_number)
  WHERE dhl_tracking_number IS NOT NULL;

COMMENT ON COLUMN judges.address_line2 IS 'Optional second address line (c/o, apartment, floor etc.)';
COMMENT ON COLUMN judges.dhl_tracking_number IS 'DHL tracking number for the judges outgoing box shipment';
COMMENT ON COLUMN judges.dhl_shipment_id IS 'Internal DHL shipment ID from API response';
COMMENT ON COLUMN judges.dhl_label_url IS 'Temporary DHL label PDF URL (expires after 24-48 hours)';
COMMENT ON COLUMN judges.label_generated_at IS 'Timestamp when DHL label was successfully generated';
COMMENT ON COLUMN judges.label_generation_error IS 'Error message if DHL label generation failed';
