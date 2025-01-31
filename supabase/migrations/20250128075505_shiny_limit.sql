/*
  # Fix auth schema and user setup

  1. Changes
    - Create auth schema and required extensions
    - Set up auth.users table with correct structure
    - Add demo users with proper authentication
    - Ensure app_users are properly linked
*/

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Create auth.users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'auth' AND tablename = 'users'
  ) THEN
    CREATE TABLE auth.users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      email text UNIQUE NOT NULL,
      encrypted_password text NOT NULL,
      email_confirmed_at timestamptz DEFAULT now(),
      role text DEFAULT 'authenticated',
      last_sign_in_at timestamptz,
      raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
      raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Insert or update demo users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  raw_app_meta_data
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440000',
    'john.smith@registration.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'::jsonb
  ),
  (
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'michael.chen@forensics.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'::jsonb
  ),
  (
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'emily.brown@forensics.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'::jsonb
  ),
  (
    '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'admin@system.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider": "email", "providers": ["email"]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  role = EXCLUDED.role,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data;

-- Ensure app_users auth_id is correctly set
UPDATE app_users SET auth_id = id;