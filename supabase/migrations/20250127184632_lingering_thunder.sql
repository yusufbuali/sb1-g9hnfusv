DO $$ 
BEGIN
  -- Insert users only if they don't exist
  INSERT INTO app_users (name, email, role)
  SELECT 'John Smith', 'john.smith@registration.com', 'registration'
  WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email = 'john.smith@registration.com'
  );

  INSERT INTO app_users (name, email, role)
  SELECT 'Michael Chen', 'michael.chen@forensics.com', 'forensics_head'
  WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email = 'michael.chen@forensics.com'
  );

  INSERT INTO app_users (name, email, role)
  SELECT 'Emily Brown', 'emily.brown@forensics.com', 'forensics'
  WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email = 'emily.brown@forensics.com'
  );

  INSERT INTO app_users (name, email, role)
  SELECT 'Admin User', 'admin@system.com', 'admin'
  WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email = 'admin@system.com'
  );
END $$;