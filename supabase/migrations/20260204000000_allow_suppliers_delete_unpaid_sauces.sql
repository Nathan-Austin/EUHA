-- Allow suppliers to delete their own unpaid sauce entries
-- This enables self-service management of pending entries before payment

CREATE POLICY "Suppliers can delete their own unpaid sauces"
ON sauces FOR DELETE
USING (
  auth.jwt() ? 'email'
  AND payment_status = 'pending_payment'
  AND EXISTS (
    SELECT 1 FROM suppliers
    WHERE suppliers.id = sauces.supplier_id
      AND lower(suppliers.email) = lower(auth.jwt() ->> 'email')
  )
);
