ALTER TABLE supplier_payments ADD COLUMN ehc_discount_cents INTEGER NOT NULL DEFAULT 0;
COMMENT ON COLUMN supplier_payments.ehc_discount_cents IS 'Portion of discount_cents attributable to the EHC free-3rd-entry discount, kept separate from the volume-count discount for auditability';
