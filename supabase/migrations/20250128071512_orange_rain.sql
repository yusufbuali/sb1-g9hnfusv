/*
  # Set up database authentication

  1. Changes
    - Create auth schema and users table
    - Add authentication functions
    - Update RLS policies to use auth.uid()
*/

-- Create auth functions
CREATE OR REPLACE FUNCTION auth.check_role(required_role text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_id = auth.uid()
      AND app_users.role::text = required_role
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION auth.current_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role::text
    FROM app_users
    WHERE auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use the new functions
DROP POLICY IF EXISTS "Registration and admin can create cases" ON cases;
DROP POLICY IF EXISTS "Registration and admin can update cases" ON cases;

CREATE POLICY "Registration and admin can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.check_role('registration') OR 
    auth.check_role('admin')
  );

CREATE POLICY "Registration and admin can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    auth.check_role('registration') OR 
    auth.check_role('admin')
  )
  WITH CHECK (
    auth.check_role('registration') OR 
    auth.check_role('admin')
  );