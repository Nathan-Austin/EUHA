-- Explicit grants for all public schema tables ahead of Supabase's October 30, 2026
-- enforcement change. All tables have RLS enabled, so RLS policies remain the
-- actual access gate; these grants just satisfy the new Data API requirement.

GRANT ALL ON public.suppliers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO anon, authenticated;

GRANT ALL ON public.sauces TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sauces TO anon, authenticated;

GRANT ALL ON public.judges TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judges TO anon, authenticated;

GRANT ALL ON public.judging_categories TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judging_categories TO anon, authenticated;

GRANT ALL ON public.judging_scores TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judging_scores TO anon, authenticated;

GRANT ALL ON public.box_assignments TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.box_assignments TO anon, authenticated;

GRANT ALL ON public.sponsors TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO anon, authenticated;

GRANT ALL ON public.contact_submissions TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO anon, authenticated;

GRANT ALL ON public.bottle_scans TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bottle_scans TO anon, authenticated;

GRANT ALL ON public.events TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO anon, authenticated;

GRANT ALL ON public.newsletter_subscribers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newsletter_subscribers TO anon, authenticated;

GRANT ALL ON public.past_results TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.past_results TO anon, authenticated;

GRANT ALL ON public.supplier_participations TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_participations TO anon, authenticated;

GRANT ALL ON public.judge_participations TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_participations TO anon, authenticated;

GRANT ALL ON public.email_templates TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO anon, authenticated;

GRANT ALL ON public.email_audit TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_audit TO anon, authenticated;

GRANT ALL ON public.supplier_payments TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_payments TO anon, authenticated;
