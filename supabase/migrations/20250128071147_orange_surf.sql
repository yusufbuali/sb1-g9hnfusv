/*
  # Fix RLS policies for cases table

  1. Changes
    - Drop existing policies
    - Create new policies that work with demo users
    - Add policies for registration and admin roles
  
  2. Security
    - Enable RLS on cases table
    - Add policies for:
      - Registration users can create and update cases
      - All authenticated users can view cases
      - Admin users have full access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Registration can create cases" ON cases;
DROP POLICY IF EXISTS "Registration can update their cases" ON cases;
DROP POLICY IF EXISTS "Everyone can view cases" ON cases;

-- Create new policies
CREATE POLICY "Users can view all cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Registration and admin can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND (app_users.role = 'registration' OR app_users.role = 'admin')
    )
  );

CREATE POLICY "Registration and admin can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND (app_users.role = 'registration' OR app_users.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND (app_users.role = 'registration' OR app_users.role = 'admin')
    )
  );

CREATE POLICY "Admin can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
    )
  );