-- Enable Row Level Security on trends table (if not already enabled)
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access to trends" ON trends;
DROP POLICY IF EXISTS "Allow authenticated users to insert trends" ON trends;
DROP POLICY IF EXISTS "Allow service role to insert trends" ON trends;

-- Allow anyone to read trends (public access)
CREATE POLICY "Allow public read access to trends"
ON trends
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert trends
CREATE POLICY "Allow authenticated users to insert trends"
ON trends
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow service role full access (for edge functions)
CREATE POLICY "Allow service role full access to trends"
ON trends
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
