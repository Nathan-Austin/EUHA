-- Create email audit table for tracking sent emails
-- Includes invoice numbering for VAT emails

CREATE TABLE email_audit (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email_type TEXT NOT NULL, -- 'vat_invoice', 'payment_reminder', etc.
  invoice_number TEXT UNIQUE, -- Sequential invoice number for VAT emails (e.g., 'INV-2026-001')
  recipient_email TEXT NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  year INTEGER, -- Competition year for filtering
  total_entries INTEGER, -- Total number of entries in this email
  gross_amount_cents INTEGER, -- Total gross amount
  net_amount_cents INTEGER, -- Net amount (excluding VAT)
  vat_amount_cents INTEGER, -- VAT amount
  sent_at TIMESTAMPTZ DEFAULT now(),
  sent_by_email TEXT, -- Admin who triggered the email
  status TEXT DEFAULT 'sent', -- 'sent', 'failed'
  error_message TEXT,
  metadata JSONB -- Store additional data (payment IDs, etc.)
);

-- Create indexes for efficient querying
CREATE INDEX idx_email_audit_supplier_id ON email_audit(supplier_id);
CREATE INDEX idx_email_audit_sent_at ON email_audit(sent_at);
CREATE INDEX idx_email_audit_email_type ON email_audit(email_type);
CREATE INDEX idx_email_audit_year ON email_audit(year);
CREATE INDEX idx_email_audit_invoice_number ON email_audit(invoice_number) WHERE invoice_number IS NOT NULL;

-- Enable RLS
ALTER TABLE email_audit ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "Admins can view email audit logs"
ON email_audit FOR SELECT
USING (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);

-- Admin-only write access
CREATE POLICY "Admins can insert email audit logs"
ON email_audit FOR INSERT
WITH CHECK (
  auth.jwt() ? 'email'
  AND EXISTS (
    SELECT 1 FROM judges
    WHERE lower(judges.email) = lower(auth.jwt() ->> 'email')
      AND judges.type = 'admin'
  )
);

-- Function to generate next invoice number for a given year
CREATE OR REPLACE FUNCTION generate_invoice_number(p_year INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_number INTEGER;
  v_invoice_number TEXT;
BEGIN
  -- Get the highest invoice number for this year
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)')
        AS INTEGER
      )
    ),
    0
  ) + 1
  INTO v_next_number
  FROM email_audit
  WHERE invoice_number LIKE 'INV-' || p_year || '-%';

  -- Format as INV-YYYY-XXX (zero-padded to 3 digits)
  v_invoice_number := 'INV-' || p_year || '-' || LPAD(v_next_number::TEXT, 3, '0');

  RETURN v_invoice_number;
END;
$$;

-- Add comments
COMMENT ON TABLE email_audit IS 'Audit log for all sent emails, including VAT invoices with sequential numbering';
COMMENT ON COLUMN email_audit.invoice_number IS 'Sequential invoice number for VAT emails (format: INV-YYYY-XXX)';
COMMENT ON FUNCTION generate_invoice_number IS 'Generates the next sequential invoice number for a given year';
