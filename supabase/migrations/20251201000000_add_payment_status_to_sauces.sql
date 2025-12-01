-- Add payment status tracking to sauces table
-- This enables filtering paid vs unpaid entries in admin views

-- Create enum for payment status
CREATE TYPE sauce_payment_status AS ENUM ('pending_payment', 'paid', 'payment_waived');

-- Add payment_status column to sauces table
ALTER TABLE sauces
ADD COLUMN payment_status sauce_payment_status DEFAULT 'pending_payment' NOT NULL;

-- Backfill existing sauces based on their linked payment records
-- If sauce has a payment_id and that payment is 'succeeded', mark as 'paid'
-- If sauce has a payment_id and that payment is 'pending', mark as 'pending_payment'
-- If sauce has no payment_id (legacy data), mark as 'payment_waived'
UPDATE sauces
SET payment_status = CASE
  WHEN payment_id IS NULL THEN 'payment_waived'::sauce_payment_status
  WHEN EXISTS (
    SELECT 1 FROM supplier_payments sp
    WHERE sp.id = sauces.payment_id
    AND sp.stripe_payment_status = 'succeeded'
  ) THEN 'paid'::sauce_payment_status
  ELSE 'pending_payment'::sauce_payment_status
END;

-- Create index for efficient filtering
CREATE INDEX idx_sauces_payment_status ON sauces(payment_status);

-- Add comment for documentation
COMMENT ON COLUMN sauces.payment_status IS 'Tracks whether the supplier has paid for this sauce entry. pending_payment = awaiting payment, paid = payment confirmed via Stripe, payment_waived = manual override (e.g. bank transfer, comp entry)';
