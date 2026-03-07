-- Mark all suppliers as having received the shipping address email,
-- then reset the 16 who still have incomplete judge address fields
-- so only they get picked up on the next send.

update suppliers
set shipping_address_email_sent_at = now()
where shipping_address_email_sent_at is null;

update suppliers
set shipping_address_email_sent_at = null
where lower(email) in (
  'chilliphoria@gmail.com',
  'cyrilfiggie@gmail.com',
  'ferment.island@gmail.com',
  'geral@artsoce.com',
  'hello@mojaberlin.com',
  'info@lachipotlera.es',
  'info@lapapette.ch',
  'info@thesauceman.es',
  'nutshotsauce@gmail.com',
  'pikopepers@gmail.com',
  'podrumsuperliga@gmail.com',
  'ranchofever@gmail.com',
  'ravensfeuer@email.de',
  'sandomaxo@gmail.com',
  'ventas@chilefiestadediablitos.com',
  'vincent.veenenberg@gmail.com'
);
