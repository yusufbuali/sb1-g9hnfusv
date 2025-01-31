/*
  # Specimen and Test Tables Setup

  1. New Tables
    - specimens: Store physical evidence specimens
    - tests: Store test results for specimens

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create specimen table
CREATE TABLE IF NOT EXISTS specimens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text REFERENCES cases(case_number) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  collection_date timestamptz NOT NULL,
  collected_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create test table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  specimen_id uuid REFERENCES specimens(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  repeats integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  results text,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE specimens ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Create policies for specimens
CREATE POLICY "Anyone can view specimens"
  ON specimens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert specimens"
  ON specimens FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update specimens"
  ON specimens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete specimens"
  ON specimens FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for tests
CREATE POLICY "Anyone can view tests"
  ON tests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert tests"
  ON tests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update tests"
  ON tests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tests"
  ON tests FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS specimens_case_id_idx ON specimens(case_id);
CREATE INDEX IF NOT EXISTS specimens_collected_by_idx ON specimens(collected_by);
CREATE INDEX IF NOT EXISTS tests_specimen_id_idx ON tests(specimen_id);
CREATE INDEX IF NOT EXISTS tests_performed_by_idx ON tests(performed_by);