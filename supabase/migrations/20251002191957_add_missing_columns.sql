-- Add missing columns to judges table
-- Note: judges table is used to store registration info from WordPress webhook
ALTER TABLE judges ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE judges ADD COLUMN IF NOT EXISTS address TEXT;

-- Verify suppliers table has all needed columns (should already exist from initial schema)
-- suppliers table columns: id, brand_name, contact_name, email, address, created_at
-- All required columns already exist, no changes needed

-- Verify sauces table has all needed columns
-- sauces already has: id, supplier_id, name, ingredients, allergens, category, qr_code_url, status, created_at
-- image_path was added in migration 20251106000096
-- payment_id was added in migration 20251106000097
-- All required columns already exist, no changes needed
