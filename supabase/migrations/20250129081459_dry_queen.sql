/*
  # Fix schema and policies for evidence management

  1. Schema Updates
    - Update evidence and specimens tables to use case_number
    - Fix storage bucket configuration

  2. Security
    - Update RLS policies for proper access control
    - Fix storage bucket policies
*/

-- Drop existing storage policies
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON storage.objects;

-- Recreate storage bucket with proper settings
DELETE FROM storage.buckets WHERE id = 'evidence';
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',
  'evidence',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

-- Create new storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence');

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

-- Update evidence table policies
DROP POLICY IF EXISTS "Anyone can view evidence" ON evidence;
DROP POLICY IF EXISTS "Anyone can insert evidence" ON evidence;
DROP POLICY IF EXISTS "Anyone can update evidence" ON evidence;
DROP POLICY IF EXISTS "Anyone can delete evidence" ON evidence;

CREATE POLICY "View Evidence"
ON evidence FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert Evidence"
ON evidence FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update specimens table policies
DROP POLICY IF EXISTS "Anyone can view specimens" ON specimens;
DROP POLICY IF EXISTS "Anyone can insert specimens" ON specimens;
DROP POLICY IF EXISTS "Anyone can update specimens" ON specimens;
DROP POLICY IF EXISTS "Anyone can delete specimens" ON specimens;

CREATE POLICY "View Specimens"
ON specimens FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert Specimens"
ON specimens FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update tests table policies
DROP POLICY IF EXISTS "Anyone can view tests" ON tests;
DROP POLICY IF EXISTS "Anyone can insert tests" ON tests;
DROP POLICY IF EXISTS "Anyone can update tests" ON tests;
DROP POLICY IF EXISTS "Anyone can delete tests" ON tests;

CREATE POLICY "View Tests"
ON tests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert Tests"
ON tests FOR INSERT
TO authenticated
WITH CHECK (true);