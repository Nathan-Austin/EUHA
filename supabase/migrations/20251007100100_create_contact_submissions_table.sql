CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert access" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access" ON contact_submissions
  FOR ALL USING (auth.role() = 'service_role');
