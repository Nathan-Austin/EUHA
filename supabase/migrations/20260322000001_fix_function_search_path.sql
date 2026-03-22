-- Fix mutable search_path security warning on all public functions.
-- Adding SET search_path = public prevents search_path hijacking attacks.

CREATE OR REPLACE FUNCTION public.auto_approve_pro_judge()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  IF NEW.type = 'pro' AND NEW.active = true AND (OLD.active = false OR OLD.active IS NULL) THEN
    NEW.stripe_payment_status := 'succeeded';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_approve_pro_judge_on_insert()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  IF NEW.type = 'pro' AND NEW.active = true THEN
    NEW.stripe_payment_status := 'succeeded';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.find_judge_type_mismatches()
  RETURNS TABLE(email text, judges_type text, participation_type text, year integer)
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    j.email,
    j.type::TEXT AS judges_type,
    jp.judge_type AS participation_type,
    jp.year
  FROM judges j
  INNER JOIN judge_participations jp ON j.email = jp.email
  WHERE j.type::TEXT != jp.judge_type
  ORDER BY jp.year DESC, j.email;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_year integer)
  RETURNS text
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
DECLARE
  v_next_number INTEGER;
  v_invoice_number TEXT;
BEGIN
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_number FROM 'INV-\d{4}-(\d+)')
        AS INTEGER
      )
    ),
    0
  ) + 1
  INTO v_next_number
  FROM email_audit
  WHERE invoice_number LIKE 'INV-' || p_year || '-%';

  v_invoice_number := 'INV-' || p_year || '-' || LPAD(v_next_number::TEXT, 3, '0');
  RETURN v_invoice_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_judge_type_consistency()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public
AS $function$
DECLARE
  actual_judge_type TEXT;
BEGIN
  SELECT type::TEXT INTO actual_judge_type
  FROM judges
  WHERE email = NEW.email;

  IF actual_judge_type IS NULL THEN
    RETURN NEW;
  END IF;

  IF actual_judge_type != NEW.judge_type THEN
    RAISE EXCEPTION 'Judge type mismatch: judges.type is "%" but judge_participations.judge_type is "%". Email: %',
      actual_judge_type, NEW.judge_type, NEW.email;
  END IF;

  RETURN NEW;
END;
$function$;
