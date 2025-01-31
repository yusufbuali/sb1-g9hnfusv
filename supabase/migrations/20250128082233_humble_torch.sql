-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Registration and admin can create cases" ON cases;
DROP POLICY IF EXISTS "Registration and admin can update cases" ON cases;
DROP POLICY IF EXISTS "Admin can delete cases" ON cases;

-- Create new policies with simplified authentication checks
CREATE POLICY "Users can view all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;