/*
  # Add Registration Case Fields

  1. Changes
    - Add new fields to cases table for registration department:
      - received_date
      - received_time
      - person_name
      - cpr_no
      - passport_no
      - gender
      - nationality
      - sender_name
      - from_dept
      - police_no
      - sender_case_no
      - police_station
      - submitted_by
      - submitter_police_no
*/

DO $$ 
BEGIN
  ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS received_date DATE,
    ADD COLUMN IF NOT EXISTS received_time TIME,
    ADD COLUMN IF NOT EXISTS person_name TEXT,
    ADD COLUMN IF NOT EXISTS cpr_no TEXT,
    ADD COLUMN IF NOT EXISTS passport_no TEXT,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS nationality TEXT,
    ADD COLUMN IF NOT EXISTS sender_name TEXT,
    ADD COLUMN IF NOT EXISTS from_dept TEXT,
    ADD COLUMN IF NOT EXISTS police_no TEXT,
    ADD COLUMN IF NOT EXISTS sender_case_no TEXT,
    ADD COLUMN IF NOT EXISTS police_station TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by TEXT,
    ADD COLUMN IF NOT EXISTS submitter_police_no TEXT;
END $$;