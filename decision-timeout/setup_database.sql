-- Complete Database Setup for Decision Timeout App
-- Run this in your Supabase SQL Editor

-- 1. Create decisions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  question TEXT NOT NULL,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  result TEXT NOT NULL CHECK (result IN ('YES', 'NO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  outcome TEXT DEFAULT 'pending' CHECK (outcome IN ('good', 'bad', 'pending')),
  time_saved INTEGER NOT NULL DEFAULT 0,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow users to see only their own decisions
CREATE POLICY "Users can view their own decisions" ON decisions
  FOR SELECT USING (user_id = auth.uid()::text);

-- 4. Create policy to allow users to insert their own decisions  
CREATE POLICY "Users can insert their own decisions" ON decisions
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- 5. Create policy to allow users to update their own decisions
CREATE POLICY "Users can update their own decisions" ON decisions
  FOR UPDATE USING (user_id = auth.uid()::text);

-- 6. Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON decisions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON decisions TO anon;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS decisions_user_id_idx ON decisions(user_id);
CREATE INDEX IF NOT EXISTS decisions_created_at_idx ON decisions(created_at DESC);

-- 8. Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'decisions'
ORDER BY ordinal_position;