-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create auth.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.users (
  instance_id uuid,
  id uuid PRIMARY KEY,
  aud varchar(255),
  role varchar(255),
  email varchar(255) UNIQUE,
  encrypted_password varchar(255),
  email_confirmed_at timestamptz DEFAULT now(),
  invited_at timestamptz,
  confirmation_token varchar(255),
  confirmation_sent_at timestamptz,
  recovery_token varchar(255),
  recovery_sent_at timestamptz,
  email_change_token_new varchar(255),
  email_change varchar(255),
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  phone text,
  phone_confirmed_at timestamptz,
  phone_change text,
  phone_change_token varchar(255),
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
  email_change_token_current varchar(255),
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamptz,
  reauthentication_token varchar(255),
  reauthentication_sent_at timestamptz,
  is_sso_user boolean DEFAULT false
);

-- Create extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert demo users with proper auth setup
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
  raw_app_meta_data,
  raw_user_meta_data
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '550e8400-e29b-41d4-a716-446655440000',
    'authenticated',
    'authenticated',
    'john.smith@registration.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'authenticated',
    'authenticated',
    'michael.chen@forensics.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'authenticated',
    'authenticated',
    'emily.brown@forensics.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'authenticated',
    'authenticated',
    'admin@system.com',
    crypt('demo123456', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  role = EXCLUDED.role,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Update app_users to ensure auth_id is set correctly
UPDATE app_users SET auth_id = id;

-- Create auth schema migrations table with correct structure
CREATE TABLE IF NOT EXISTS auth.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz DEFAULT now()
);

-- Insert initial schema version
INSERT INTO auth.schema_migrations (version)
VALUES ('20230530130625')
ON CONFLICT DO NOTHING;