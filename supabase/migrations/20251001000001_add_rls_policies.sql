-- Enable RLS for all tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sauces ENABLE ROW LEVEL SECURITY;
ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for the 'judges' table
CREATE POLICY "Judges can view their own data" 
ON judges FOR SELECT 
USING (auth.uid() = id);

-- Policies for the 'sauces' table
CREATE POLICY "Authenticated users can view sauces" 
ON sauces FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policies for the 'judging_categories' table
CREATE POLICY "Authenticated users can view judging categories" 
ON judging_categories FOR SELECT 
USING (auth.role() = 'authenticated');

-- Policies for the 'judging_scores' table
CREATE POLICY "Judges can insert their own scores" 
ON judging_scores FOR INSERT 
WITH CHECK (auth.uid() = judge_id);

CREATE POLICY "Judges can view their own scores" 
ON judging_scores FOR SELECT 
USING (auth.uid() = judge_id);

-- Policies for the 'box_assignments' table
CREATE POLICY "Judges can see their own box assignments" 
ON box_assignments FOR SELECT 
USING (auth.uid() = judge_id);

-- Admins (not yet defined) will have broader access through a specific 'admin' role or by bypassing RLS.
-- The service_role_key used in edge functions already bypasses RLS.
