/*
  # Fix Evidence Storage Setup

  1. Changes
    - Drop and recreate storage bucket with proper settings
    - Update storage policies
    - Add public access policy
*/

-- Drop existing bucket if it exists
DO $$
BEGIN
  DELETE FROM storage.buckets WHERE id = 'evidence';
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Create evidence bucket with proper settings
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true);

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their evidence" ON storage.objects;

-- Create storage policies
CREATE POLICY "Enable read access for authenticated users"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence');

CREATE POLICY "Enable insert access for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Enable update access for authenticated users"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'evidence');

CREATE POLICY "Enable delete access for authenticated users"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence');