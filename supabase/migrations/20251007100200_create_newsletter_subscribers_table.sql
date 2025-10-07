CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access" ON newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role');
