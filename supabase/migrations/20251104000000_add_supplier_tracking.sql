-- Add tracking and status fields to suppliers table
ALTER TABLE suppliers
ADD COLUMN tracking_number TEXT,
ADD COLUMN postal_service_name TEXT,
ADD COLUMN package_received_at TIMESTAMPTZ,
ADD COLUMN package_status TEXT DEFAULT 'pending' CHECK (package_status IN ('pending', 'shipped', 'received'));

-- Add index for faster lookups
CREATE INDEX idx_suppliers_package_status ON suppliers(package_status);

COMMENT ON COLUMN suppliers.tracking_number IS 'Tracking number provided by supplier for their sauce shipment';
COMMENT ON COLUMN suppliers.postal_service_name IS 'Name of postal service used (e.g., DHL, UPS, An Post)';
COMMENT ON COLUMN suppliers.package_received_at IS 'Timestamp when admin marked package as received';
COMMENT ON COLUMN suppliers.package_status IS 'pending: awaiting tracking info, shipped: tracking submitted, received: package arrived';
