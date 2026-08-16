-- Supports the 2027 re-entry flow: multi-category re-entry (one row per
-- category, all linked back to the original source sauce so the UI can show
-- which categories a past sauce has already been re-entered into) and a new
-- tasting-notes field suppliers fill in via "Edit sauce info".

ALTER TABLE sauces ADD COLUMN IF NOT EXISTS tasting_notes TEXT;
ALTER TABLE sauces ADD COLUMN IF NOT EXISTS reused_from_sauce_id UUID REFERENCES sauces(id);

CREATE INDEX IF NOT EXISTS sauces_reused_from_sauce_id_idx ON sauces (reused_from_sauce_id);
