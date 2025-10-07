CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  tier TEXT, -- 'platinum', 'gold', 'silver', 'bronze', 'partner'
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active sponsors" ON sponsors
  FOR SELECT USING (active = true);

CREATE POLICY "Allow admin full access" ON sponsors
  FOR ALL USING (auth.role() = 'service_role');
