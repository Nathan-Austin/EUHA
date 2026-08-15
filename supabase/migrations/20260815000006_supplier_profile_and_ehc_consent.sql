-- Self-serve producer profile (bio + web presence, for promo/press use — not
-- the hand-curated MAKER_PROFILES editorial content, which is a separate
-- static dataset) and EHC data-sharing consent, collected via the new
-- "Producer Info" dashboard modal.
ALTER TABLE suppliers
  ADD COLUMN bio TEXT,
  ADD COLUMN website TEXT,
  ADD COLUMN instagram TEXT,
  ADD COLUMN logo_path TEXT,
  ADD COLUMN ehc_sync_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN ehc_sync_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN suppliers.bio IS 'Self-serve producer bio/description for promotional and press use';
COMMENT ON COLUMN suppliers.website IS 'Producer website URL';
COMMENT ON COLUMN suppliers.instagram IS 'Producer Instagram handle or URL';
COMMENT ON COLUMN suppliers.logo_path IS 'Storage path (sauce-media bucket) to the producer''s logo/photo';
COMMENT ON COLUMN suppliers.ehc_sync_consent IS 'Supplier has consented to sharing their profile data with EHC for promotional materials and press outreach';
COMMENT ON COLUMN suppliers.ehc_sync_consent_at IS 'Timestamp the consent checkbox was last set (true or false)';
