CREATE TABLE past_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,

  -- Core identification
  area TEXT, -- 'EURO' or 'INT'
  code TEXT UNIQUE NOT NULL, -- e.g., 'B593', 'X499'
  category TEXT NOT NULL,
  award TEXT, -- 'GOLD (winner)', 'GOLD', 'SILVER', 'BRONZE'
  position INTEGER, -- 1, 2, 3 within category
  global_rank INTEGER, -- 1-20 for Top 20, NULL otherwise

  -- Company information
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  website TEXT,
  country TEXT,
  company_description TEXT,
  company_logo_url TEXT,

  -- Product details
  entry_name TEXT NOT NULL, -- Product name
  short_description TEXT,
  flavor_profile TEXT,
  chilli_types TEXT,
  pairings TEXT,
  bottle_size TEXT,
  retail_price TEXT,
  product_url TEXT,
  product_image_url TEXT, -- From CSV or drive

  -- Legacy fields (deprecated, kept for compatibility)
  sauce_name TEXT, -- Same as entry_name
  supplier_name TEXT, -- Same as company_name
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  award_type TEXT, -- Deprecated, use 'award' instead
  score DECIMAL(4,2),
  image_url TEXT, -- Deprecated, use 'product_image_url' instead

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_past_results_year ON past_results(year);
CREATE INDEX idx_past_results_category ON past_results(category);
CREATE INDEX idx_past_results_code ON past_results(code);
CREATE INDEX idx_past_results_rank ON past_results(global_rank) WHERE global_rank IS NOT NULL;
CREATE INDEX idx_past_results_area ON past_results(area);

-- RLS Policies
ALTER TABLE past_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON past_results
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access" ON past_results
  FOR ALL USING (auth.role() = 'service_role');
