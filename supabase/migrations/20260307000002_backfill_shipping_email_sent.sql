-- Mark all suppliers as already emailed (backfill for the 96 that succeeded)
update suppliers
set shipping_address_email_sent_at = now()
where shipping_address_email_sent_at is null;

-- Reset the 48 that failed so they get picked up on the next send
update suppliers
set shipping_address_email_sent_at = null
where lower(email) in (
  'sales@chilli-wine.com',
  'info@thesauceman.es',
  'kandamanozanda@gmail.com',
  'chilidise@gmail.com',
  'info@khaofoods.nl',
  'borgundchili@gmail.com',
  'info@gastonchilli.cz',
  'nutshotsauce@gmail.com',
  'b.orto.pepper@gmail.com',
  'shopczilli@gmail.com',
  'ventas@chilefiestadediablitos.com',
  'info@nachtgarten.at',
  'kerri@chilisaus.be',
  'moesauceco@gmail.com',
  'ljutistra.opg@gmail.com',
  'hello@biggingersauce.com',
  'evoatis@gmail.com',
  'zuza.mihai@gmail.com',
  'contact@swedishpepper.se',
  'info@feuerwerkchilis.de',
  'info@shadowreapers.com',
  'ribastisalsapicante@gmail.com',
  'princeanfas7690@gmail.com',
  'nomadchillico@gmail.com',
  'salsasdoncabron@gmail.com',
  'gerd.ihle@chilma.de',
  'shane@littleredssauces.com',
  'info@chookshotsauce.com',
  'lukaszach50@gmail.com',
  'boldizsarszendrey@gmail.com',
  'achilipusalsaspicantes@gmail.com',
  'heychilli.opg@gmail.com',
  'justin@notthatspicy.com',
  'info@volimljuto.com',
  'salsastiafelisa@gmail.com',
  'albert@deverguldetong.nl',
  'david@torcathabbq.com',
  'martina.wastl@gmail.com',
  'ravensfeuer@email.de',
  'vincent.veenenberg@gmail.com',
  'm.byloff@brizz.group',
  'info@chilibolaget.ax',
  'hola@yaresauce.com',
  'info@happyhatterhotsauce.com',
  'alan@thechilliexperience.com',
  'vaanee.telfair@gmail.com',
  'info@filflachilli.co',
  'geral@artsoce.com'
);
