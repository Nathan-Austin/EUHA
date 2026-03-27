-- Add open_judging flag to judges table
-- Used for judges whose boxes were shipped without sauce assignments (label swap incident)
-- These judges can score any sauce up to a limit of 10, without pre-assignment
ALTER TABLE judges ADD COLUMN IF NOT EXISTS open_judging boolean NOT NULL DEFAULT false;

-- Flag the 6 judges whose boxes were shipped without assignments
UPDATE judges SET open_judging = true WHERE email IN (
  'jb2231@cantab.ac.uk',
  'info@shadowreapers.com',
  'dinny@chilifcktory.fi',
  'kvdort@gmail.com',
  'd.list@live.de',
  'dennis.walter00@gmail.com'
);
