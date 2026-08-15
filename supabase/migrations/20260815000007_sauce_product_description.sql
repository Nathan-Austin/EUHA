-- Market-facing product description (what a producer would put on their own
-- product page) — distinct from `ingredients` (a factual list) and
-- `tasting_notes` (judge-facing: "what should judges experience"). Feeds the
-- EHC compendium for trade buyers/retailers, same purpose as the producer
-- profile fields on `suppliers`.
ALTER TABLE sauces ADD COLUMN product_description TEXT;

COMMENT ON COLUMN sauces.product_description IS 'Market-facing product description, as the producer would describe it on their own site — for trade/press/compendium use, distinct from tasting_notes (judge-facing)';
