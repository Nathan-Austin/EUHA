-- Verified media coverage of EHSA, for the public /press page.
--
-- One-time import of manually-verified pickups (is_false_positive = false,
-- campaign_slug = 'ehsa_2026') from the European Heat Council's press
-- tracking database (../EHC/ehc, Neon Postgres `pickups` table), pulled
-- 2026-08-14. That table is the source of truth for what actually ran —
-- unlike a raw press-release draft, every row here has a manually-checked
-- outbound article_url. Not a live sync: refresh manually as new coverage
-- is confirmed. press_value_eur is deliberately not carried over — EHC
-- treats it as internal-only and it's never shown publicly there either.

CREATE TABLE IF NOT EXISTS press_pickups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_date DATE,
  outlet_name TEXT NOT NULL,
  outlet_url TEXT,
  article_url TEXT,
  country TEXT,
  language TEXT,
  maker_slug TEXT,
  maker_name TEXT,
  campaign TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS press_pickups_pickup_date_idx ON press_pickups (pickup_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS press_pickups_campaign_idx ON press_pickups (campaign);

ALTER TABLE press_pickups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON press_pickups
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin full access" ON press_pickups
  FOR ALL
  TO public
  USING (auth.role() = 'service_role'::text);

INSERT INTO press_pickups (pickup_date, outlet_name, outlet_url, article_url, country, language, maker_slug, maker_name, campaign) VALUES
('2026-08-07', 'falstaff PROFI (CH, print)', 'https://www.falstaff.com/ch/profi', 'https://www.falstaff.com/ch/profi#print-jul-sep-2026-p8-9-kuechenlatein', 'CH', 'de', 'yare-sauce', 'Yare Sauce GmbH', 'ehsa_2026'),
('2026-08-07', 'falstaff PROFI (CH, print)', 'https://www.falstaff.com/ch/profi', 'https://www.falstaff.com/ch/profi#print-jul-sep-2026-p8-9-kuechenlatein', 'CH', 'de', 'spicepunk', 'Spicepunk', 'ehsa_2026'),
('2026-07-23', 'Frankenpost', 'https://www.frankenpost.de', 'https://www.frankenpost.de/inhalt.gold-fuer-familien-betrieb-wie-burnin-benze-europa-scharf-macht.a104e9f0-6110-4b39-a884-25724630c182.html', 'DE', 'de', 'burnin-benzes', 'Burnin Benzes Chilimanufaktur', 'ehsa_2026'),
('2026-07-21', 'Sul Informação', 'https://www.sulinformacao.pt', 'https://www.sulinformacao.pt/2026/07/amor-em-tempos-de-crise-de-meia-idade-ou-um-picante-do-alentejo-ao-camboja/', 'PT', 'pt', 'temple-spicy', 'Temple Spicy', 'ehsa_2026'),
('2026-07-07', 'facebook.com', 'https://www.facebook.com', 'https://www.facebook.com/share/p/18c6redrhn/', 'BZ', 'en', 'rancho-fever', 'Rancho Fever Pepper Sauce', 'ehsa_2026'),
('2026-07-05', 'El Español', 'https://www.elespanol.com', 'https://www.elespanol.com/viajes/cocinillas-gastro/actualidad-gastronomica/20260730/salsas-picantes-adictivas-debes-probar/1003744288151_0.html', 'ES', 'es', 'ribasti', 'RIBASTI', 'ehsa_2026'),
('2026-06-28', 'Ideal', 'https://www.ideal.es', 'https://www.ideal.es/economia/factoria-de-empresas/llamarada-baza-cima-picante-europeo-20260629233904-nt.html', 'ES', 'es', 'ribasti', 'RIBASTI', 'ehsa_2026'),
('2026-06-22', 'Visit Fredrikstad & Hvaler', 'https://visitfredrikstadhvaler.com', 'https://visitfredrikstadhvaler.com/no/forretning/lokken-gard-hvaler', 'NO', 'no', 'lokken-hvaler', 'Løkken Gård Hvaler', 'ehsa_2026'),
('2026-06-18', 'CZILLI', 'https://czilli.at', 'https://czilli.at/blogs/news/zweimal-gold-zweimal-bronze-czilli-gewinnt-vier-european-hot-sauce-awards-2026', NULL, 'de', 'czilli', 'CZILLI', 'ehsa_2026'),
('2026-06-18', 'Lloyd & Melón', 'https://lloydmelon.com', 'https://lloydmelon.com/nb-du/blogs/news/bedriftsgaver-med-smak-hot-sauce-til-hele-teamet', 'NO', 'nb', 'lloyd-melon', 'Lloyd & Melón', 'ehsa_2026'),
('2026-06-13', 'Backnanger Kreiszeitung', 'https://www.bkz.de', 'https://www.bkz.de/nachrichten/der-chilipapst-von-siegelsberg-342623.html', 'DE', 'de', 'chilma', 'Chilma', 'ehsa_2026'),
('2026-06-11', 'Indulge Magazine', 'https://www.indulge.com.mt', 'https://www.indulge.com.mt/zebbug-kitchen-wins-at-the-european-hot-sauce-awards-2026/', 'MT', 'en', 'jungle-jams', 'Jungle Jams and More', 'ehsa_2026'),
('2026-06-11', 'Südwest Presse', 'https://www.swp.de', 'https://www.swp.de/lokales/gaildorf/murrhardter-mag-scharfe-sachen-der-chilipapst-von-siegelsberg-79164196.html', 'DE', 'de', 'chilma', 'Chilma', 'ehsa_2026'),
('2026-06-10', 'Omroep Flevoland', 'https://www.omroepflevoland.nl', 'https://www.omroepflevoland.nl/gemist/radio/473733/almeerse-hete-jams-in-de-prijzen?id=473733', 'NL', 'nl', 'chardys', 'Chardy''s', 'ehsa_2026'),
('2026-06-09', 'maribor24.si', 'https://maribor24.si', 'https://maribor24.si/lokalno/mariborski-cili-napoji-odnesli-dve-medalji-z-evropskega-tekmovanja-pekocih-omak/', 'SI', 'sl', 'cili-napoj', 'Cili Napoj', 'ehsa_2026'),
('2026-06-08', 'Koroške Novice', 'https://www.koroskenovice.si', 'https://www.koroskenovice.si/novice/meziska-cili-kuhinja-osvojila-bronasto-medaljo-na-european-hot-sauce-awards-2026/', 'SI', 'sl', 'cili-roza', 'ČILI ROŽA', 'ehsa_2026'),
('2026-06-08', 'RTV LOVE (TV broadcast)', 'https://www.rtvlove.nl', 'https://www.rtvlove.nl/lokaal-nieuws/de-lekkerste-sambal-van-europa-komt-uit-volendam/#tv-segment-2026-06-08', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-06-08', 'RTV LOVE (Volendam-Edam)', 'https://www.rtvlove.nl', 'https://www.rtvlove.nl/lokaal-nieuws/de-lekkerste-sambal-van-europa-komt-uit-volendam/', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-06-07', 'Filfla Chilli Co.', 'https://filflachilli.co', 'https://filflachilli.co/products/filfli', 'MT', 'en', 'filfla-chilli', 'filfla-chilli', 'ehsa_2026'),
('2026-06-06', 'Hampshire Chronicle', 'https://www.hampshirechronicle.co.uk', 'https://www.hampshirechronicle.co.uk/news/26138427.sauce-maker-celebrates-success-european-hot-sauce-awards/', 'GB', 'en', 'callaloo-corner', 'Callaloo Corner Ltd', 'ehsa_2026'),
('2026-06-06', 'Headliner.nl (Noord-Holland)', 'https://noord-holland.headliner.nl', 'https://noord-holland.headliner.nl/item/zoete-sambal-van-albert-uit-volendam-lekkerste-van-europa-nhnieuws-17885', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-06-06', 'MeinBezirk.at', 'https://www.meinbezirk.at', 'https://www.meinbezirk.at/neusiedl-am-see/c-wirtschaft/chili-manufaktur-holt-mit-schaerfe-zwei-medaillen-nach-moenchhof_a8678499', 'AT', 'de', 'nachtgarten', 'Nachtgarten OG', 'ehsa_2026'),
('2026-06-06', 'NH Nieuws', 'https://www.nhnieuws.nl', 'https://www.nhnieuws.nl/nieuws/360433/de-lekkerste-sambal-van-europa-komt-uit-volendam', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-06-06', 'NH Nieuws (TV broadcast)', 'https://www.nhnieuws.nl', 'https://www.nhnieuws.nl/nieuws/360433/de-lekkerste-sambal-van-europa-komt-uit-volendam#tv-segment-2026-06-06', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-06-06', 'hodpress.hu', 'https://www.hodpress.hu', 'https://www.hodpress.hu/a-nagymagocsi-evoatis-oromkert-aranyermet-szerzett-europa-szakmai-csipos-szosz-versenyen/', 'HU', 'hu', 'evoatis', 'Evoatis Örömkert', 'ehsa_2026'),
('2026-06-05', 'Istra24', 'https://www.istra24.hr', 'https://www.istra24.hr/krasna-zemlja/istarska-opg-ovska-kuhinja-s-ljutim-umacima-osvojila-cetiri-medalje-na-european-hot-sauce-awards-2026', 'HR', 'hr', 'opg-hey-chilli', 'OPG Hey Chilli', 'ehsa_2026'),
('2026-06-05', 'Istra24', 'https://www.istra24.hr', 'https://www.istra24.hr/krasna-zemlja/istarska-opg-ovska-kuhinja-s-ljutim-umacima-osvojila-cetiri-medalje-na-european-hot-sauce-awards-2026', 'HR', 'hr', 'opg-ljutistra', 'OPG LJUTISTRA', 'ehsa_2026'),
('2026-06-04', 'Glas Istre HR', 'https://www.glasistre.hr', 'https://www.glasistre.hr/istra/2026/06/04/istarski-umaci-osvojili-europu-dva-opg-a-uzela-cetiri-medalje-na-velikom-natjecanju-1073271', 'HR', 'hr', 'opg-ljutistra', 'OPG LJUTISTRA', 'ehsa_2026'),
('2026-06-04', 'Glas Istre HR', 'https://www.glasistre.hr', 'https://www.glasistre.hr/istra/2026/06/04/istarski-umaci-osvojili-europu-dva-opg-a-uzela-cetiri-medalje-na-velikom-natjecanju-1073271', 'HR', 'hr', 'opg-hey-chilli', 'OPG Hey Chilli', 'ehsa_2026'),
('2026-06-04', 'poduzetnistvo.org', 'https://www.poduzetnistvo.org', 'https://www.poduzetnistvo.org/news/pulski-opg-osvojio-tri-zlatne-medalje-na-vodecem-europskom-natjecanju', 'HR', 'hr', 'opg-ljutistra', 'OPG LJUTISTRA', 'ehsa_2026'),
('2026-06-03', 'Algarve Daily News', 'https://algarvedailynews.com', 'https://algarvedailynews.com/food-wine/27055-algarve-piri-piri-farm-takes-two-golds-at-the-european-hot-sauce-awards-2026', 'PT', 'en', 'piri-piri-co', 'Piri-Piri & Co', 'ehsa_2026'),
('2026-06-03', 'Delo - Odprta Kuhinja', 'https://odprtakuhinja.delo.si', 'https://odprtakuhinja.delo.si/brbotanje/evropa-izbrala-najboljse-pekoce-omake-med-nagrajenci-tudi-trije-slovenci', 'SI', 'sl', 'cili-napoj', 'Cili Napoj', 'ehsa_2026'),
('2026-06-03', 'Delo - Odprta Kuhinja', 'https://odprtakuhinja.delo.si', 'https://odprtakuhinja.delo.si/brbotanje/evropa-izbrala-najboljse-pekoce-omake-med-nagrajenci-tudi-trije-slovenci', 'SI', 'sl', 'cili-roza', 'ČILI ROŽA', 'ehsa_2026'),
('2026-06-03', 'Delo - Odprta Kuhinja', 'https://odprtakuhinja.delo.si', 'https://odprtakuhinja.delo.si/brbotanje/evropa-izbrala-najboljse-pekoce-omake-med-nagrajenci-tudi-trije-slovenci', 'SI', 'sl', 'pohorc', 'POHORC BIO CHILI', 'ehsa_2026'),
('2026-06-03', 'La Voz Digital (Gurme Cádiz)', 'https://www.lavozdigital.es', 'https://www.lavozdigital.es/gurme/cadiz/teresa-emilio-achilipu-ganas-introducir-picante-sello-20260603104935-ntv.html', 'ES', 'es', 'achilipu', 'Achilipú salsas picantes.', 'ehsa_2026'),
('2026-06-02', 'Nieuw-Volendam', 'https://www.nieuw-volendam.nl', 'https://www.nieuw-volendam.nl/albert-veerman-pakt-goud-op-europese-hotsaucewedstrijd/', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-05-30', 'EuroStar Umag', 'https://www.eurostarumag.hr', 'https://www.eurostarumag.hr/novosti/detaljno/obiteljski-opg-iz-umaga-osvojio-broncu-u-kategoriji-sambal-na-european-hot-sauce-awards-2026', 'HR', 'hr', 'opg-hey-chilli', 'OPG Hey Chilli', 'ehsa_2026'),
('2026-05-28', 'Noticias y actualidad de Segovia | Segoviaudaz', 'https://segoviaudaz.es', 'https://segoviaudaz.es/un-pueblo-de-segovia-pone-el-picante-de-moda-en-europa-con-una-salsa-made-in-segovia/', 'ES', 'es', 'la-chipotlera', 'La Chipotlera S.L.', 'ehsa_2026'),
('2026-05-28', 'Stadt Murrhardt', 'https://www.murrhardt.de', 'https://www.murrhardt.de/aktuelles/Artikel?view=publish&item=article&id=7760', 'DE', 'de', 'chilma', 'Chilma', 'ehsa_2026'),
('2026-05-28', 'Valkenswaard24', 'https://valkenswaard24.nl', 'https://valkenswaard24.nl/home/artikel/119883/Gertjan-uit-Valkenswaard-wint-twee-keer-zilver-bij-internationale-wedstrijd-voor-hete-sauzen', 'NL', 'nl', 'qudo-tjes', 'Qudo''tjes', 'ehsa_2026'),
('2026-05-28', 'Woking News and Mail', 'https://www.wokingnewsandmail.co.uk', 'https://www.wokingnewsandmail.co.uk/news/wokings-hottest-firm-claims-hat-trick-in-saucy-euro-competition-911824', 'UK', 'en', 'big-ginger-sauce-co', 'big-ginger-sauce-co', 'ehsa_2026'),
('2026-05-28', 'noordhollandsdagblad.nl', 'https://www.noordhollandsdagblad.nl', 'https://www.noordhollandsdagblad.nl/regio/zaanstreek-waterland/waterland/hete-saus-van-hobbyist-albert-veerman-uit-volendam-verkozen-tot-beste-van-europa-ik-probeer-laagjes-aan-te-brengen-in-een-sambal/153581514.html', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-05-27', '15min.lt', 'https://www.15min.lt', 'https://www.15min.lt/gyvenimas/naujiena/maistas/kauniecio-kurtas-padazas-tarp-geriausiu-europoje-nuskyne-laurus-tarptautiniame-konkurse-1632-2692556', 'LT', 'lt', 'kanda-zanda', 'Kanda žandą', 'ehsa_2026'),
('2026-05-27', '5 Minuten', 'https://www.5min.at', 'https://www.5min.at/graz/5202605271437/grazer-manufaktur-raeumt-bei-europaeischen-chili-awards-ab/', 'AT', 'de', 'czilli', 'CZILLI', 'ehsa_2026'),
('2026-05-27', 'CosasDeCome Cádiz', 'https://cadiz.cosasdecome.es', 'https://cadiz.cosasdecome.es/las-salsas-conilenas-achilipo-premiadas-en-europa/', 'ES', 'es', 'achilipu', 'Achilipú salsas picantes.', 'ehsa_2026'),
('2026-05-27', 'Friuli Oggi', 'https://www.friulioggi.it', 'https://www.friulioggi.it/gemona-del-friuli/b-orto-gemona-premio-europeo-salse-piccanti-peperoncino-27-maggio-2026/', 'IT', 'it', 'b-orto-peppers', 'B-Orto Peppers', 'ehsa_2026'),
('2026-05-27', 'Glas Istre HR', 'https://www.glasistre.hr', 'https://www.glasistre.hr/pula/2026/05/27/pulski-opg-osvojio-tri-zlatne-medalje-na-vodecem-europskom-natjecanju-1071640', 'HR', 'hr', 'opg-ljutistra', 'OPG LJUTISTRA', 'ehsa_2026'),
('2026-05-27', 'Magazín Patriot', 'https://www.patriotmagazin.cz', 'https://www.patriotmagazin.cz/dalsi-uspech-pro-gaston-chilli-palive-omacky-z-ostravy-uspely-i-v-nemecku', 'CZ', 'cs', 'gaston-chilli', 'GASTON CHILLI', 'ehsa_2026'),
('2026-05-27', 'Postal Algarve', 'https://postal.pt', 'https://postal.pt/algarve/molhos-produzidos-pela-piri-piri-co-em-albufeira-conquistaram-ouro-na-europa/', 'PT', 'pt', 'piri-piri-co', 'Piri-Piri & Co', 'ehsa_2026'),
('2026-05-27', 'esCuellar', 'https://escuellar.es', 'https://escuellar.es/la-salsa-macha-picona-de-la-chiplotera-se-lleva-un-oro-en-los-european-hot-sauce-awards-2026/', 'ES', 'es', 'la-chipotlera', 'La Chipotlera S.L.', 'ehsa_2026'),
('2026-05-27', 'groot-waterland.nl', 'https://groot-waterland.nl', 'https://groot-waterland.nl/2026/05/27/albert-veerman-wint-met-de-vergulde-tong-european-hot-sauce-awards-2026/', 'NL', 'nl', 'de-vergulde-tong', 'De Vergulde Tong', 'ehsa_2026'),
('2026-05-27', 'lavozdelsur.es', 'https://www.lavozdelsur.es', 'https://www.lavozdelsur.es/ediciones/provincia-cadiz/janda/achilipu-las-salsas-picantes-de-conil-que-han-conquistado-europa-con-pedro-ximenez-chile-caribeno-y-tecnica-andaluza.html', 'ES', 'es', 'achilipu', 'Achilipú salsas picantes.', 'ehsa_2026'),
('2026-05-27', 'Ålandstidningen', 'https://www.alandstidningen.ax', 'https://www.alandstidningen.ax/notis/chilisaser-plockade-hem-medaljer/1267956', 'FI', 'sv', 'chilibolaget', 'Chilibolaget', 'ehsa_2026'),
('2026-05-21', 'Agrobiznis', 'https://www.finance.si', 'https://www.finance.si/prisla-je-ljubezen-in-z-njo-pekoce-omake-pohorc-bio-cili/a/9047442', 'SI', 'sl', 'pohorc', 'POHORC BIO CHILI', 'ehsa_2026'),
('2026-05-21', 'Agrobiznis', 'https://agrobiznis.finance.si', 'https://agrobiznis.finance.si/agro-podjetnik/prisla-je-ljubezen-in-z-njo-pekoce-omake-znamke-pohorc-bio-cili/a/9047442', 'SI', 'sl', 'pohorc', 'POHORC BIO CHILI', 'ehsa_2026'),
('2026-05-21', 'Best of Cayo', 'https://www.facebook.com/bestofcayo', 'https://www.facebook.com/bestofcayo/posts/congratulations-ranchofeverpeppersauce-they-won-gold-at-the-european-hot-sauce-a/1409334501224145/', 'BZ', 'en', 'rancho-fever', 'Rancho Fever Pepper Sauce', 'ehsa_2026'),
('2026-05-20', 'Belize', 'https://www.facebook.com', 'https://www.facebook.com/hotoffthepressbz/posts/rancho-fever-pepper-sauce-earns-gold-at-2026-european-hot-sauce-awardsbelize-riv/1456769523132162/', 'BZ', 'en', 'rancho-fever', 'Rancho Fever Pepper Sauce', 'ehsa_2026'),
('2026-05-20', 'Trechter', 'https://trechter.ch', 'https://trechter.ch/preisgekroente_hot_sauce_aus_sursee/', 'CH', 'de', 'spicepunk', 'Spicepunk', 'ehsa_2026'),
('2026-05-19', 'Gazzetta dell''Adda', 'https://gazzettadelladda.it', 'https://gazzettadelladda.it/attualita/la-salsa-piccante-di-brembate-conquista-l-europa/', 'IT', 'it', 'ornitodrinko', 'Ornitodrinko', 'ehsa_2026');
