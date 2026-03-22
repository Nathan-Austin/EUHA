-- Enable RLS on tables that were previously unprotected.
--
-- Access rules:
--   bottle_scans         → admins only (judges access this via server actions using service role)
--   judge_participations → judges can SELECT their own row (needed by middleware for /judge route guard)
--                          admins can do everything
--   supplier_participations → admins only

-- =====================================================================
-- bottle_scans
-- =====================================================================

ALTER TABLE public.bottle_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bottle_scans"
  ON public.bottle_scans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.judges
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
        AND type = 'admin'
    )
  );

-- =====================================================================
-- judge_participations
-- =====================================================================

ALTER TABLE public.judge_participations ENABLE ROW LEVEL SECURITY;

-- Judges need to read their own participation row — the middleware checks
-- this to gate access to /judge routes for the current competition year.
CREATE POLICY "Judges can read their own participation"
  ON public.judge_participations
  FOR SELECT
  TO authenticated
  USING (lower(email) = lower(auth.jwt() ->> 'email'));

-- Admins need full access for invitation management, approval workflows, etc.
CREATE POLICY "Admins can manage judge_participations"
  ON public.judge_participations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.judges
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
        AND type = 'admin'
    )
  );

-- =====================================================================
-- supplier_participations
-- =====================================================================

ALTER TABLE public.supplier_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage supplier_participations"
  ON public.supplier_participations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.judges
      WHERE lower(email) = lower(auth.jwt() ->> 'email')
        AND type = 'admin'
    )
  );
