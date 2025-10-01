-- Create custom enum types
CREATE TYPE sauce_status AS ENUM ('registered', 'arrived', 'boxed', 'judged');
CREATE TYPE judge_type AS ENUM ('supplier', 'pro', 'community');

-- suppliers table
CREATE TABLE suppliers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- sauces table
CREATE TABLE sauces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ingredients TEXT,
    allergens TEXT,
    category TEXT,
    qr_code_url TEXT,
    status sauce_status DEFAULT 'registered',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- judges table
CREATE TABLE judges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    type judge_type NOT NULL,
    stripe_payment_status TEXT,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- judging_categories table
CREATE TABLE judging_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    weight INTEGER NOT NULL
);

-- judging_scores table
CREATE TABLE judging_scores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    judge_id uuid REFERENCES judges(id) ON DELETE CASCADE,
    sauce_id uuid REFERENCES sauces(id) ON DELETE CASCADE,
    category_id uuid REFERENCES judging_categories(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- box_assignments table
CREATE TABLE box_assignments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    box_label TEXT NOT NULL,
    sauce_id uuid REFERENCES sauces(id) ON DELETE CASCADE,
    judge_id uuid REFERENCES judges(id) ON DELETE SET NULL
);

-- Indexes
CREATE UNIQUE INDEX unique_score ON judging_scores (judge_id, sauce_id, category_id);

-- Comments for clarity
COMMENT ON COLUMN sauces.status IS 'Enum: registered, arrived, boxed, judged';
COMMENT ON COLUMN judges.type IS 'Enum: supplier, pro, community';
COMMENT ON TABLE judging_scores IS 'A judge can score a sauce across multiple categories, but only once per category.';
COMMENT ON INDEX unique_score IS 'Ensures a judge cannot submit multiple scores for the same sauce in the same category.';
