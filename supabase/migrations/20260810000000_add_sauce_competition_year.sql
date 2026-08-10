-- Add competition_year to sauces so historical entries persist across seasons
-- instead of being wiped on reset, enabling returning suppliers to reuse
-- previously-entered sauces in later years.

ALTER TABLE sauces ADD COLUMN competition_year INTEGER NOT NULL DEFAULT 2026;

CREATE INDEX idx_sauces_competition_year ON sauces (competition_year);
CREATE INDEX idx_sauces_supplier_competition_year ON sauces (supplier_id, competition_year);

COMMENT ON COLUMN sauces.competition_year IS 'The competition season this sauce entry was submitted for. Sauces persist across years so suppliers can reuse prior entries.';
