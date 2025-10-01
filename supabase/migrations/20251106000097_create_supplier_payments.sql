-- Create supplier payments table to track multi-entry submissions and payments
CREATE TABLE supplier_payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
    entry_count INTEGER NOT NULL,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    subtotal_cents INTEGER NOT NULL,
    discount_cents INTEGER NOT NULL,
    amount_due_cents INTEGER NOT NULL,
    stripe_session_id TEXT,
    stripe_payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE supplier_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view their payments"
ON supplier_payments FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND supplier_id IN (
    SELECT id FROM suppliers
    WHERE lower(suppliers.email) = lower(auth.jwt() ->> 'email')
  )
);

CREATE POLICY "Admins can view supplier payments"
ON supplier_payments FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);

CREATE POLICY "Admins can modify supplier payments"
ON supplier_payments FOR UPDATE
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
)
WITH CHECK (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);

ALTER TABLE sauces
ADD COLUMN payment_id uuid REFERENCES supplier_payments(id);
