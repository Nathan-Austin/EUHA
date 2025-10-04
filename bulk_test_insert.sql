-- Seed suppliers, sauces, and judges with live QR code URLs for testing
-- Run this against the Supabase database (SQL editor or psql).

WITH supplier_seed AS (
  INSERT INTO public.suppliers (id, brand_name, contact_name, email, address)
  VALUES
    ('d7c5c1ce-1ce0-4c65-9de4-3e40c6e39a01', 'Solar Scoville Co.',   'Lena Ortiz',    'supplier+solar@test.euha',   '42 Sunrise Ave, Barcelona, ES'),
    ('3db3676a-9b26-456b-9c39-6bf3d6c61da2', 'Molten Mountain',      'Gregor Huber',  'supplier+molten@test.euha',  '77 Bergstraße, Munich, DE'),
    ('44bad6ce-0f8a-4d3f-8a8f-4b4e2e097378', 'Crimson Tide Sauces',  'Florence Keane','supplier+crimson@test.euha', '19 Dockside Way, Dublin, IE'),
    ('8b9b907f-79c9-4a06-8e71-9a52ef462ed1', 'Zen Heat Labs',        'Sumi Watanabe', 'supplier+zen@test.euha',     '5 Quiet Lane, Copenhagen, DK'),
    ('09b99841-1977-4ee1-aa9c-8498e6e3c07d', 'Verdant Inferno',      'Kai Müller',    'supplier+verdant@test.euha', '10 Greenmarket, Vienna, AT'),
    ('f2a8c9d3-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'Thunder Strike Sauce', 'Nikolai Volkov','supplier+thunder@test.euha', '33 Storm Road, Prague, CZ'),
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Island Fire Co.',      'Mariana Costa', 'supplier+island@test.euha',  '88 Tropicana St, Malta, MT'),
    ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Nordic Burn Labs',     'Anders Larsen', 'supplier+nordic@test.euha',  '12 Fjord Lane, Oslo, NO')
  ON CONFLICT (email) DO UPDATE
    SET brand_name = EXCLUDED.brand_name,
        contact_name = EXCLUDED.contact_name,
        address = EXCLUDED.address
  RETURNING id, email
), supplier_lookup AS (
  SELECT id, email FROM supplier_seed
  UNION
  SELECT id, email
  FROM public.suppliers
  WHERE email IN (
    'supplier+solar@test.euha',
    'supplier+molten@test.euha',
    'supplier+crimson@test.euha',
    'supplier+zen@test.euha',
    'supplier+verdant@test.euha',
    'supplier+thunder@test.euha',
    'supplier+island@test.euha',
    'supplier+nordic@test.euha'
  )
), sauce_data AS (
  SELECT * FROM (
    VALUES
      ('5f0a4ad5-6b38-4541-a906-95dd2d404d2c'::uuid, 'supplier+solar@test.euha',   'Solar Flare Mango Habanero', 'Mango, habanero, lime, agave, sea salt',         'None',   'Fruit-forward',  'arrived'::sauce_status,   'F201'),
      ('0f0d41b9-28a4-4652-95f5-908b55a8b861'::uuid, 'supplier+solar@test.euha',   'Noon Ember Pineapple',       'Pineapple, scotch bonnet, turmeric, cider vinegar','None', 'Fruit-forward',  'arrived'::sauce_status,   'F202'),
      ('95dda30f-cc1d-48f2-a0fe-6b7e0cc0b032'::uuid, 'supplier+molten@test.euha',  'Alpine Ghost Reduction',     'Ghost pepper, black garlic, molasses, cocoa',    'Soy',    'Experimental',   'arrived'::sauce_status,   'E301'),
      ('ae551b64-6d3b-4f69-b5f3-38fa38fd1e2a'::uuid, 'supplier+crimson@test.euha', 'Harbor Blaze Sriracha',      'Red jalapeño, garlic, palm sugar, rice vinegar', 'None',   'Classic',        'arrived'::sauce_status,   'C401'),
      ('5a58f4c5-b874-45ad-9e06-13b6f33f27be'::uuid, 'supplier+zen@test.euha',     'Umami Ember Gochujang',      'Gochujang, smoked chili, sesame oil, mirin',     'Sesame', 'Asian-inspired', 'arrived'::sauce_status,   'A501'),
      ('d8f9e4e5-e5aa-484a-97c9-1d965a45e146'::uuid, 'supplier+verdant@test.euha', 'Garden Fury Verde',          'Tomatillo, serrano, cilantro, roasted garlic',   'None',   'Verde',          'arrived'::sauce_status,   'V601'),
      ('a4695716-0dfd-4bee-8f9e-4dd45da0766a'::uuid, 'supplier+verdant@test.euha', 'Greenhouse Blaze',           'Jalapeño, kiwi, parsley, white wine vinegar',    'None',   'Verde',          'arrived'::sauce_status,   'V602'),
      ('7086a4e3-64a3-4d93-9be3-381d61f2cef4'::uuid, 'supplier+molten@test.euha',  'Midnight Ember Espresso',    'Cascabel chili, espresso, cacao nibs, panela',   'None',   'Experimental',   'arrived'::sauce_status,   'E302'),
      ('c5d6e7f8-9a0b-1c2d-3e4f-567890abcdef'::uuid, 'supplier+thunder@test.euha', 'Lightning Strike Carolina',  'Carolina reaper, honey, apple cider, mustard',   'Mustard','Superhot',       'arrived'::sauce_status,   'S701'),
      ('d6e7f8a9-0b1c-2d3e-4f56-7890abcdef01'::uuid, 'supplier+island@test.euha',  'Tropical Thunder Passion',   'Passionfruit, habanero, coconut, lime zest',     'None',   'Fruit-forward',  'arrived'::sauce_status,   'F703'),
      ('e7f8a9b0-1c2d-3e4f-5678-90abcdef0123'::uuid, 'supplier+nordic@test.euha',  'Arctic Blaze Birch Smoke',   'Smoked birch, chipotle, maple syrup, sea salt',  'None',   'Smoke & Wood',   'arrived'::sauce_status,   'S804'),
      ('f8a9b0c1-2d3e-4f56-7890-abcdef012345'::uuid, 'supplier+thunder@test.euha', 'Storm Surge Scorpion',       'Trinidad scorpion, mango, ginger, rice vinegar', 'None',   'Superhot',       'arrived'::sauce_status,   'S702'),
      ('a9b0c1d2-3e4f-5678-90ab-cdef01234567'::uuid, 'supplier+island@test.euha',  'Volcanic Pineapple Heat',    'Pineapple, ghost pepper, brown sugar, allspice', 'None',   'Fruit-forward',  'arrived'::sauce_status,   'F704')
  ) AS t(id, supplier_email, name, ingredients, allergens, category, status, sauce_code)
), sauce_source AS (
  SELECT
    sd.id::uuid,
    COALESCE(sl.id, (SELECT id FROM public.suppliers WHERE email = sd.supplier_email)) AS supplier_id,
    sd.name,
    sd.ingredients,
    sd.allergens,
    sd.category,
    sd.status,
    sd.sauce_code,
    sd.supplier_email
  FROM sauce_data sd
  LEFT JOIN supplier_lookup sl ON sl.email = sd.supplier_email
), sauce_upsert AS (
  INSERT INTO public.sauces (id, supplier_id, name, ingredients, allergens, category, status, sauce_code, qr_code_url)
  SELECT
    id,
    supplier_id,
    name,
    ingredients,
    allergens,
    category,
    status,
    sauce_code,
    'https://api.qrserver.com/v1/create-qr-code/?data=' || id::text || '&size=240x240'
  FROM sauce_source
  ON CONFLICT (sauce_code) DO UPDATE
    SET name = EXCLUDED.name,
        ingredients = EXCLUDED.ingredients,
        allergens = EXCLUDED.allergens,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        qr_code_url = EXCLUDED.qr_code_url
  RETURNING sauce_code
), judge_data AS (
  SELECT * FROM (
    VALUES
      ('3b2fb783-a783-41c7-8bf0-5db67e6feb40'::uuid, 'admin+ella@test.euha',      'admin'::judge_type,     NULL,        true,  'Ella Reinhardt',     '88 Control Way',        'Berlin',    '10115', 'DE', 'Professional Chili Person',                 false, NULL),
      ('b314ad45-2e8d-4724-8f92-7d4f7d65e5e4'::uuid, 'pro+marcus@test.euha',      'pro'::judge_type,       NULL,        true,  'Marcus Leclerc',     '17 Rue des Épices',     'Lyon',      '69002', 'FR', 'Experienced Food / Chili Person',            true,  'Owns boutique hot sauce shop'),
      ('56cbcca1-f3b1-48af-957e-f005a41cdba4'::uuid, 'pro+ines@test.euha',        'pro'::judge_type,       NULL,        true,  'Ines Petrov',        '24 Tasting Terrace',    'Zagreb',    '10000', 'HR', 'Professional Chili Person',                 false, NULL),
      ('6f1f93d3-1f68-4f40-8ff2-92d7dc74b77b'::uuid, 'community+sofia@test.euha', 'community'::judge_type, 'succeeded', true,  'Sofia Lindström',    '3 Pepper Loft',         'Stockholm', '11621', 'SE', 'Very Keen Amateur Food / Chili Person',      false, NULL),
      ('bcb2abde-6dd9-4eb4-8e37-31bd6fd1ed1e'::uuid, 'community+joao@test.euha',  'community'::judge_type, 'succeeded', true,  'João Almeida',       '12 Rua Picante',        'Lisbon',    '1200',  'PT', 'Experienced Food / Chili Person',            false, NULL),
      ('2c303fb4-91d4-46c6-9952-b46e6208905d'::uuid, 'community+amber@test.euha', 'community'::judge_type, 'pending',   false, 'Amber Doyle',        '55 Spice Crescent',     'Belfast',   'BT1',   'UK', 'Very Keen Amateur Food / Chili Person',      false, NULL),
      ('83fe8f54-a58a-4278-9b49-61f910f5f5d9'::uuid, 'community+yara@test.euha',  'community'::judge_type, 'succeeded', true,  'Yara Haddad',        '21 Chili Grove',        'Amsterdam', '1012',  'NL', 'Experienced Food / Chili Person',            false, NULL),
      ('2d1d9a97-77f3-4b6f-8b9a-1cf968850765'::uuid, 'pro+silas@test.euha',       'pro'::judge_type,       NULL,        true,  'Silas Andrade',      '8 Mercado Ave',         'Porto',     '4000',  'PT', 'Professional Chili Person',                 false, NULL)
  ) AS t(id, email, type, stripe_payment_status, active, name, address, city, postal_code, country, experience_level, industry_affiliation, affiliation_details)
), judge_upsert AS (
  INSERT INTO public.judges (
    id,
    email,
    type,
    stripe_payment_status,
    active,
    name,
    address,
    city,
    postal_code,
    country,
    experience_level,
    industry_affiliation,
    affiliation_details,
    qr_code_url
  )
  SELECT
    id,
    email,
    type,
    stripe_payment_status,
    active,
    name,
    address,
    city,
    postal_code,
    country,
    experience_level,
    industry_affiliation,
    affiliation_details,
    'https://api.qrserver.com/v1/create-qr-code/?data=' || id::text || '&size=220x220'
  FROM judge_data
  ON CONFLICT (email) DO UPDATE
    SET type = EXCLUDED.type,
        stripe_payment_status = EXCLUDED.stripe_payment_status,
        active = EXCLUDED.active,
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        postal_code = EXCLUDED.postal_code,
        country = EXCLUDED.country,
        experience_level = EXCLUDED.experience_level,
        industry_affiliation = EXCLUDED.industry_affiliation,
        affiliation_details = EXCLUDED.affiliation_details,
        qr_code_url = EXCLUDED.qr_code_url
  RETURNING email
)
SELECT
  (SELECT COUNT(*) FROM supplier_seed)       AS suppliers_seeded,
  (SELECT COUNT(*) FROM sauce_upsert)        AS sauces_seeded,
  (SELECT COUNT(*) FROM judge_upsert)        AS judges_seeded;
