-- Drop existing storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- Create new storage policies with proper authentication checks
CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
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

-- Drop existing evidence table policies
DROP POLICY IF EXISTS "View Evidence" ON evidence;
DROP POLICY IF EXISTS "Insert Evidence" ON evidence;

-- Create new evidence table policies
CREATE POLICY "Anyone can view evidence"
ON evidence FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert evidence"
ON evidence FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update evidence"
ON evidence FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete evidence"
ON evidence FOR DELETE
TO authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;