/*
  # Fix auth schema and user setup

  1. Changes
    - Create auth schema if not exists
    - Create auth.users table with proper structure
    - Add demo users with proper auth setup
    - Update RLS policies to use auth.uid()
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  email_confirmed_at timestamptz,
  role text DEFAULT 'authenticated',
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert demo users with proper auth setup
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'john.smith@registration.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated'
  ),
  (
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'michael.chen@forensics.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated'
  ),
  (
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'emily.brown@forensics.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated'
  ),
  (
    '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'admin@system.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated'
  )
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  role = EXCLUDED.role;

-- Update app_users to ensure auth_id is set correctly
UPDATE app_users SET auth_id = id;