/*
  # Add Department Details Fields

  1. Changes
    - Add new fields to cases table for department details:
      - person_in_charge
      - sample_count
      - sample_receiver
      - expected_finish_date
      - case_entered_by
*/

DO $$ 
BEGIN
  ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS person_in_charge TEXT,
    ADD COLUMN IF NOT EXISTS sample_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS sample_receiver TEXT,
    ADD COLUMN IF NOT EXISTS expected_finish_date DATE,
    ADD COLUMN IF NOT EXISTS case_entered_by TEXT;
END $$;