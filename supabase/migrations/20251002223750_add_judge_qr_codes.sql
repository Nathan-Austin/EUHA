-- Add qr_code_url column to judges table
ALTER TABLE judges ADD COLUMN qr_code_url TEXT;

-- Comment
COMMENT ON COLUMN judges.qr_code_url IS 'QR code URL linking to judge ID for box assignment scanning';
