/*
  # Evidence Table Setup

  1. Changes
    - Create evidence table with proper structure
    - Add RLS policies for evidence management
    - Add indexes for performance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create evidence table if it doesn't exist
CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id text REFERENCES cases(case_number) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  notes text,
  uploaded_by uuid REFERENCES auth.users(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view evidence"
  ON evidence FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert evidence"
  ON evidence FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update evidence"
  ON evidence FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete evidence"
  ON evidence FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS evidence_case_id_idx ON evidence(case_id);
CREATE INDEX IF NOT EXISTS evidence_uploaded_by_idx ON evidence(uploaded_by);