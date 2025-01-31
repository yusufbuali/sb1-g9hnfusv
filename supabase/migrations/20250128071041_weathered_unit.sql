-- First, ensure the table is empty
TRUNCATE TABLE app_users;

-- Re-insert the demo users with proper UUIDs
INSERT INTO app_users (id, name, email, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'john.smith@registration.com', 'registration'),
  ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Michael Chen', 'michael.chen@forensics.com', 'forensics_head'),
  ('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Emily Brown', 'emily.brown@forensics.com', 'forensics'),
  ('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Admin User', 'admin@system.com', 'admin');