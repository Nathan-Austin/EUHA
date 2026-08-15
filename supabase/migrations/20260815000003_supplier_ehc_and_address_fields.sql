-- EHC membership verification (2027 EHC-membership discount) and a properly
-- split delivery address for printing DHL award-shipping labels later. The
-- existing `address` column is a single combined "street + house number"
-- string (parsed apart at label time elsewhere via parseStreetAddress()) —
-- deliberately not reused here since that parsing is fragile; new address
-- collection stores street and house number separately from the start.
-- The old `address` column is left untouched for the 116 suppliers who
-- already have it populated.
ALTER TABLE suppliers
  ADD COLUMN ehc_id TEXT,
  ADD COLUMN ehc_status TEXT,
  ADD COLUMN ehc_verified_at TIMESTAMPTZ,
  ADD COLUMN address_street TEXT,
  ADD COLUMN address_house_number TEXT,
  ADD COLUMN phone TEXT;

COMMENT ON COLUMN suppliers.ehc_id IS 'EHC membership ID entered by the supplier, format EHC-2026-00001';
COMMENT ON COLUMN suppliers.ehc_status IS 'Mirrors EHC''s member_interest.status at last verification: new/pending/member/lapsed/declined, or null if never verified';
COMMENT ON COLUMN suppliers.ehc_verified_at IS 'Timestamp of the last successful call to the EHC verify endpoint';
COMMENT ON COLUMN suppliers.address_street IS 'Street name only (no house number) — for DHL award-shipping labels';
COMMENT ON COLUMN suppliers.address_house_number IS 'House/building number only — for DHL award-shipping labels';
COMMENT ON COLUMN suppliers.phone IS 'Optional contact phone for delivery issues';
