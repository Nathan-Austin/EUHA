-- Create participation tracking tables for historical data and email campaigns

-- Supplier participation tracking by year
CREATE TABLE supplier_participations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    company_name TEXT,
    year INTEGER NOT NULL,
    sauce_count INTEGER DEFAULT 0,
    has_awards BOOLEAN DEFAULT false,
    source TEXT, -- 'wordpress', 'csv_import', 'manual'
    participated BOOLEAN DEFAULT true,
    invited_date TIMESTAMPTZ,
    responded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(email, year)
);

-- Judge participation tracking by year
CREATE TABLE judge_participations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    year INTEGER NOT NULL,
    application_date TIMESTAMPTZ,
    accepted BOOLEAN,
    judge_type TEXT, -- 'pro', 'community', 'supplier'
    experience_level TEXT,
    source_channel TEXT, -- 'facebook', 'telegram', 'whatsapp', 'wordpress', etc.
    company_affiliation TEXT, -- Company name if affiliated
    invited_date TIMESTAMPTZ,
    responded BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(email, year)
);

-- Indexes for email campaign queries
CREATE INDEX idx_supplier_part_email_year ON supplier_participations(email, year);
CREATE INDEX idx_judge_part_email_year ON judge_participations(email, year);
CREATE INDEX idx_supplier_part_year ON supplier_participations(year);
CREATE INDEX idx_judge_part_year ON judge_participations(year);
CREATE INDEX idx_supplier_part_invited ON supplier_participations(invited_date) WHERE invited_date IS NOT NULL;
CREATE INDEX idx_judge_part_invited ON judge_participations(invited_date) WHERE invited_date IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE supplier_participations IS 'Tracks supplier participation across years for email campaigns and analytics';
COMMENT ON TABLE judge_participations IS 'Tracks judge participation across years for email campaigns and analytics';
COMMENT ON COLUMN supplier_participations.has_awards IS 'True if supplier won any awards (Gold, Silver, Bronze) that year';
COMMENT ON COLUMN judge_participations.judge_type IS 'Type of judge: pro (professional), community (amateur), or supplier (supplier-judge)';
COMMENT ON COLUMN judge_participations.source_channel IS 'How they found out about judging: facebook, telegram, whatsapp, wordpress, etc.';
COMMENT ON COLUMN judge_participations.company_affiliation IS 'Company name if judge is affiliated with a hot sauce company';
