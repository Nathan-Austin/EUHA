-- Add webshop_link column to sauces table
ALTER TABLE sauces ADD COLUMN webshop_link TEXT;

-- Add comment for clarity
COMMENT ON COLUMN sauces.webshop_link IS 'URL to the supplier''s product page for this sauce';
