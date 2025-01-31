/*
  # Fix User Data

  1. Changes
    - Ensures app_users table exists
    - Cleans up any existing data
    - Re-inserts demo users
*/

-- First, ensure the table is empty
TRUNCATE TABLE app_users;

-- Re-insert the demo users
INSERT INTO app_users (name, email, role) VALUES
  ('John Smith', 'john.smith@registration.com', 'registration'),
  ('Michael Chen', 'michael.chen@forensics.com', 'forensics_head'),
  ('Emily Brown', 'emily.brown@forensics.com', 'forensics'),
  ('Admin User', 'admin@system.com', 'admin');