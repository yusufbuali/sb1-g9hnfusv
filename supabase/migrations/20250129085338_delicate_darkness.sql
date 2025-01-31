-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_specimens_case_id ON specimens(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_tests_specimen_id ON tests(specimen_id);

-- Drop existing policies
DROP POLICY IF EXISTS "View Specimens" ON specimens;
DROP POLICY IF EXISTS "Insert Specimens" ON specimens;
DROP POLICY IF EXISTS "Update Specimens" ON specimens;
DROP POLICY IF EXISTS "Delete Specimens" ON specimens;

-- Create new policies
CREATE POLICY "View Specimens"
ON specimens FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Insert Specimens"
ON specimens FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update Specimens"
ON specimens FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Delete Specimens"
ON specimens FOR DELETE
TO authenticated
USING (true);