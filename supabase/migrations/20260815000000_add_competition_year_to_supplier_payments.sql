-- supplier_payments had no competition_year column, so a supplier's abandoned
-- payment from a prior season couldn't be distinguished from a current-season
-- one. createPaymentBatch's "delete existing pending payment" cleanup and the
-- dashboard's pending-payment lookup both matched across all seasons.
ALTER TABLE supplier_payments ADD COLUMN competition_year INTEGER;

-- Backfill from the sauces each payment is linked to (a payment's season is
-- the season of the sauces it was created to cover).
UPDATE supplier_payments sp
SET competition_year = sub.year
FROM (
  SELECT DISTINCT ON (payment_id) payment_id, competition_year AS year
  FROM sauces
  WHERE payment_id IS NOT NULL
  ORDER BY payment_id, competition_year DESC
) sub
WHERE sp.id = sub.payment_id;

-- A handful of older succeeded payments have no linked sauces left (the sauce
-- rows were since deleted); fall back to the year the payment was created in.
UPDATE supplier_payments
SET competition_year = EXTRACT(YEAR FROM created_at)::INTEGER
WHERE competition_year IS NULL;

ALTER TABLE supplier_payments ALTER COLUMN competition_year SET NOT NULL;
