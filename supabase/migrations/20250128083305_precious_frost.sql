/*
  # Update cases table policies

  1. Changes
    - Drop and recreate policies to allow authenticated users to perform operations
    - Preserve existing function and trigger dependencies
    - Ensure proper RLS setup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Users can create cases" ON cases;
DROP POLICY IF EXISTS "Users can update cases" ON cases;
DROP POLICY IF EXISTS "Users can delete cases" ON cases;
DROP POLICY IF EXISTS "Anyone can view cases" ON cases;
DROP POLICY IF EXISTS "Anyone can insert cases" ON cases;
DROP POLICY IF EXISTS "Anyone can update cases" ON cases;
DROP POLICY IF EXISTS "Anyone can delete cases" ON cases;

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