/*
  # Fix authentication and RLS policies

  1. Changes
    - Create auth users for demo accounts
    - Update app_users with auth IDs
    - Fix RLS policies for cases table
  
  2. Security
    - Create auth users with secure passwords
    - Link app_users to auth users
    - Update RLS policies to use auth.uid()
*/

-- First, ensure we have the auth users
DO $$
DECLARE
  auth_uid_registration uuid;
  auth_uid_forensics_head uuid;
  auth_uid_forensics uuid;
  auth_uid_admin uuid;
BEGIN
  -- Create auth users if they don't exist
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', 
     '550e8400-e29b-41d4-a716-446655440000',
     'authenticated',
     'authenticated',
     'john.smith@registration.com',
     crypt('demo123456', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     '',
     '',
     '')
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO auth_uid_registration;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000',
     '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
     'authenticated',
     'authenticated',
     'michael.chen@forensics.com',
     crypt('demo123456', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     '',
     '',
     '')
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO auth_uid_forensics_head;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000',
     '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
     'authenticated',
     'authenticated',
     'emily.brown@forensics.com',
     crypt('demo123456', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     '',
     '',
     '')
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO auth_uid_forensics;

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000',
     '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
     'authenticated',
     'authenticated',
     'admin@system.com',
     crypt('demo123456', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     '',
     '',
     '')
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO auth_uid_admin;

  -- Update app_users with auth IDs
  UPDATE app_users
  SET auth_id = '550e8400-e29b-41d4-a716-446655440000'
  WHERE email = 'john.smith@registration.com';

  UPDATE app_users
  SET auth_id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  WHERE email = 'michael.chen@forensics.com';

  UPDATE app_users
  SET auth_id = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  WHERE email = 'emily.brown@forensics.com';

  UPDATE app_users
  SET auth_id = '6ba7b812-9dad-11d1-80b4-00c04fd430c8'
  WHERE email = 'admin@system.com';
END $$;

-- Update RLS policies
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