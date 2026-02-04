-- Auto-approve pro judges when set to active
-- When a pro judge is activated, automatically mark them as approved (stripe_payment_status = 'succeeded')

-- Create trigger function
CREATE OR REPLACE FUNCTION auto_approve_pro_judge()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a pro judge being set to active, auto-approve them
  IF NEW.type = 'pro' AND NEW.active = true AND (OLD.active = false OR OLD.active IS NULL) THEN
    NEW.stripe_payment_status := 'succeeded';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on judges table
DROP TRIGGER IF EXISTS trigger_auto_approve_pro_judge ON judges;
CREATE TRIGGER trigger_auto_approve_pro_judge
  BEFORE UPDATE ON judges
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_pro_judge();

-- Also handle pro judges created as active
CREATE OR REPLACE FUNCTION auto_approve_pro_judge_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- If creating a pro judge as active, auto-approve them
  IF NEW.type = 'pro' AND NEW.active = true THEN
    NEW.stripe_payment_status := 'succeeded';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_approve_pro_judge_insert ON judges;
CREATE TRIGGER trigger_auto_approve_pro_judge_insert
  BEFORE INSERT ON judges
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_pro_judge_on_insert();

COMMENT ON FUNCTION auto_approve_pro_judge() IS 'Automatically sets stripe_payment_status to succeeded when a pro judge is activated';
COMMENT ON FUNCTION auto_approve_pro_judge_on_insert() IS 'Automatically sets stripe_payment_status to succeeded when a pro judge is created as active';
