-- Create table to track bottle scans during packing process
CREATE TABLE bottle_scans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sauce_id uuid REFERENCES sauces(id) ON DELETE CASCADE NOT NULL,
    scanned_at TIMESTAMPTZ DEFAULT now(),
    scanned_by TEXT
);

-- Index for fast lookups
CREATE INDEX idx_bottle_scans_sauce ON bottle_scans(sauce_id);

-- Comment
COMMENT ON TABLE bottle_scans IS 'Tracks QR code scans during bottle packing. When 7 scans reached, sauce auto-updates to boxed status.';
