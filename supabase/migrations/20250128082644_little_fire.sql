-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Users can create cases" ON cases;
DROP POLICY IF EXISTS "Users can update cases" ON cases;
DROP POLICY IF EXISTS "Users can delete cases" ON cases;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;

-- Create cases table if it doesn't exist
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
  department text NOT NULL,
  assigned_to text,
  person_name text,
  cpr_no text,
  passport_no text,
  gender text,
  nationality text,
  sender_name text,
  from_dept text,
  police_no text,
  sender_case_no text,
  police_station text,
  submitted_by text,
  submitter_police_no text,
  person_in_charge text,
  sample_count integer DEFAULT 0,
  sample_receiver text,
  expected_finish_date date,
  case_entered_by text,
  received_date date,
  received_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create simplified policies that allow all authenticated users to perform operations
CREATE POLICY "Anyone can view cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (true);

-- Create the updated_at trigger
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();