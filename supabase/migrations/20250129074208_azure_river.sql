/*
  # Evidence Storage Setup

  1. Changes
    - Create evidence storage bucket
    - Update evidence table to use case_number instead of case_id
    - Add RLS policies for evidence storage

  2. Security
    - Enable RLS for storage bucket
    - Add policies for authenticated users
*/

-- Create evidence storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('evidence', 'evidence')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "Authenticated users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Authenticated users can view evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'evidence');

CREATE POLICY "Authenticated users can delete their evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'evidence');

-- Update evidence table to use case_number instead of UUID
ALTER TABLE evidence 
  DROP CONSTRAINT IF EXISTS evidence_case_id_fkey,
  ALTER COLUMN case_id TYPE text;

-- Add foreign key constraint to cases table using case_number
ALTER TABLE evidence
  ADD CONSTRAINT evidence_case_number_fkey
  FOREIGN KEY (case_id)
  REFERENCES cases(case_number)
  ON DELETE CASCADE;