-- Add 'event' judge type for in-person event judges (no payment, no box limit)
ALTER TYPE judge_type ADD VALUE IF NOT EXISTS 'event';

-- Add event_open flag to sauces
-- This temporarily makes a sauce scannable by event judges regardless of payment_status.
-- Set to true now to open all sauces for the event; run closeEventJudging() (admin button)
-- on Thursday to revert without affecting the original payment_status values.
ALTER TABLE sauces ADD COLUMN IF NOT EXISTS event_open BOOLEAN NOT NULL DEFAULT false;

-- Open ALL sauces for tomorrow's event
UPDATE sauces SET event_open = true;
