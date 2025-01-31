/*
  # Update Cases RLS Policies

  1. Changes
    - Drop existing policies
    - Create new policies that properly handle authentication and roles
    - Ensure proper access control based on user roles

  2. Security
    - Enable RLS on cases table
    - Add policies for:
      - View: All authenticated users
      - Create: Registration and admin users
      - Update: Registration and admin users
      - Delete: Admin users only
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view cases" ON cases;
DROP POLICY IF EXISTS "Anyone can insert cases" ON cases;
DROP POLICY IF EXISTS "Anyone can update cases" ON cases;
DROP POLICY IF EXISTS "Anyone can delete cases" ON cases;

-- Create new policies with proper role checks
CREATE POLICY "Anyone can view cases"
  ON cases FOR SELECT
  TO authenticated
  USING (true);

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

CREATE POLICY "Admin can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_id = auth.uid()
      AND app_users.role = 'admin'
    )
  );