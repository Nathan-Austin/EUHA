-- VAT number + a separate invoice/billing address, distinct from the
-- delivery address (for shipping the physical award) added earlier. A
-- supplier's legal billing entity/address can genuinely differ from where
-- they want the trophy shipped. Drives the reverse-charge/outside-scope VAT
-- determination in lib/company.ts — last year's flat-rate-for-everyone VAT
-- invoice had to be walked back and reissued as a plain payment receipt,
-- so this data was never collected before.
ALTER TABLE suppliers
  ADD COLUMN vat_number TEXT,
  ADD COLUMN invoice_company_name TEXT,
  ADD COLUMN invoice_address_street TEXT,
  ADD COLUMN invoice_address_house_number TEXT,
  ADD COLUMN invoice_address_line2 TEXT,
  ADD COLUMN invoice_city TEXT,
  ADD COLUMN invoice_state TEXT,
  ADD COLUMN invoice_postal_code TEXT,
  ADD COLUMN invoice_country TEXT;

COMMENT ON COLUMN suppliers.vat_number IS 'Supplier''s own VAT registration number, if any — required for EU cross-border reverse charge to apply';
COMMENT ON COLUMN suppliers.invoice_company_name IS 'Legal entity name for invoicing, if different from brand_name';
COMMENT ON COLUMN suppliers.invoice_country IS 'Billing country — used with vat_number to determine VAT treatment (standard/reverse_charge/outside_scope)';
