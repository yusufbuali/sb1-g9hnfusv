/*
  # Update app_users table and policies
  
  1. Table Changes
    - Create app_users table if not exists
    - Add updated_at trigger
  
  2. Data
    - Insert demo users
  
  3. Security
    - Enable RLS
    - Update policies with proper checks
*/

-- Create app_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'registration', 'forensics', 'forensics_head')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_app_users_updated_at ON public.app_users;
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert demo users
INSERT INTO public.app_users (id, auth_id, name, email, role) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'John Smith',
    'john.smith@registration.com',
    'registration'
  ),
  (
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'Michael Chen',
    'michael.chen@forensics.com',
    'forensics_head'
  ),
  (
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
    'Emily Brown',
    'emily.brown@forensics.com',
    'forensics'
  ),
  (
    '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
    'Admin User',
    'admin@system.com',
    'admin'
  )
ON CONFLICT (id) DO UPDATE SET
  auth_id = EXCLUDED.auth_id,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Enable Row Level Security
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all users" ON public.app_users;
DROP POLICY IF EXISTS "Admin can manage users" ON public.app_users;

-- Create new policies
CREATE POLICY "Users can read all users"
  ON public.app_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage users"
  ON public.app_users
  FOR ALL
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');