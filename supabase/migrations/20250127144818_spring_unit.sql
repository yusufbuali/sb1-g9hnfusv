/*
  # Case Management System Schema

  1. New Tables
    - `cases`
      - Primary case information
      - Tracks status, priority, assignments
    - `evidence`
      - Digital evidence files
      - Links to cases
    - `specimens`
      - Physical specimens
      - Links to cases
    - `tests`
      - Tests performed on specimens
      - Links to specimens
    
  2. Security
    - Enable RLS on all tables
    - Policies for:
      - Registration department can create and manage cases
      - Forensics department can view cases and manage evidence/specimens
      - Admin can access everything
*/

-- Create enum types for status and priority
CREATE TYPE case_status AS ENUM ('new', 'in_progress', 'completed');
CREATE TYPE case_priority AS ENUM ('normal', 'urgent');

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status case_status NOT NULL DEFAULT 'new',
  priority case_priority NOT NULL DEFAULT 'normal',
  department TEXT NOT NULL,
  assigned_to TEXT,
  expected_completion_date TIMESTAMPTZ,
  tags TEXT[],
  created_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evidence table for digital files
CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Specimens table for physical evidence
CREATE TABLE IF NOT EXISTS specimens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  collection_date TIMESTAMPTZ NOT NULL,
  collected_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tests table for specimen analysis
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specimen_id uuid REFERENCES specimens(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  repeats INTEGER NOT NULL DEFAULT 1,
  status case_status NOT NULL DEFAULT 'new',
  results TEXT,
  performed_by uuid REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE specimens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Cases policies
CREATE POLICY "Registration can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('registration', 'admin'));

CREATE POLICY "Registration can update their cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('registration', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('registration', 'admin'));

CREATE POLICY "Everyone can view cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

-- Evidence policies
CREATE POLICY "Forensics can manage evidence"
  ON evidence
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('forensics', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('forensics', 'admin'));

CREATE POLICY "Everyone can view evidence"
  ON evidence FOR SELECT
  TO authenticated
  USING (true);

-- Specimens policies
CREATE POLICY "Forensics can manage specimens"
  ON specimens
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('forensics', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('forensics', 'admin'));

CREATE POLICY "Everyone can view specimens"
  ON specimens FOR SELECT
  TO authenticated
  USING (true);

-- Tests policies
CREATE POLICY "Forensics can manage tests"
  ON tests
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('forensics', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('forensics', 'admin'));

CREATE POLICY "Everyone can view tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_specimens_updated_at
  BEFORE UPDATE ON specimens
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();