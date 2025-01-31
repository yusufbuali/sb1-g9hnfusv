-- Add persons JSONB column to cases table
ALTER TABLE cases
ADD COLUMN IF NOT EXISTS persons JSONB DEFAULT '[]'::jsonb;

-- Create an index on the persons column for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_persons ON cases USING gin (persons);

-- Update RLS policies to include the new column
DROP POLICY IF EXISTS "Registration and admin can create cases" ON cases;
DROP POLICY IF EXISTS "Registration and admin can update cases" ON cases;

CREATE POLICY "Registration and admin can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_id = auth.uid()
      AND (app_users.role = 'registration' OR app_users.role = 'admin')
    )
  );

CREATE POLICY "Registration and admin can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_id = auth.uid()
      AND (app_users.role = 'registration' OR app_users.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_id = auth.uid()
      AND (app_users.role = 'registration' OR app_users.role = 'admin')
    )
  );