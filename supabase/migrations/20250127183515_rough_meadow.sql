/*
  # Create users table and roles

  1. New Tables
    - `app_users`
      - `id` (uuid, primary key)
      - `auth_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text, unique)
      - `role` (user_role enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `app_users` table
    - Add policies for authenticated users
*/

-- Create role enum
CREATE TYPE user_role AS ENUM ('admin', 'registration', 'forensics', 'forensics_head');

-- Create users table
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all users"
  ON app_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage users"
  ON app_users
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create updated_at trigger
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();