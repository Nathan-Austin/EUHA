alter table suppliers
  add column if not exists shipping_address_email_sent_at timestamptz;
