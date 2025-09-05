-- Note: We're using Clerk for authentication, so no custom users table needed
-- Clerk provides user IDs as strings, not UUIDs

-- Create decisions table
CREATE TABLE decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID (string format)
  question TEXT NOT NULL,
  pros JSONB DEFAULT '[]'::jsonb,
  cons JSONB DEFAULT '[]'::jsonb,
  result TEXT CHECK (result IN ('YES', 'NO')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  outcome TEXT CHECK (outcome IN ('good', 'bad', 'pending')) DEFAULT 'pending',
  time_saved INTEGER DEFAULT 0
);

-- Create waitlist table
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for decisions table
-- Note: These are simplified policies - authentication is handled by Clerk in the application layer
-- In production, you should implement proper JWT verification in these policies
CREATE POLICY "Users can view own decisions" ON decisions
  FOR SELECT USING (true); -- Application-level auth via Clerk

CREATE POLICY "Users can insert own decisions" ON decisions
  FOR INSERT WITH CHECK (true); -- Application-level auth via Clerk

CREATE POLICY "Users can update own decisions" ON decisions
  FOR UPDATE USING (true); -- Application-level auth via Clerk

CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_decisions_user_id ON decisions(user_id);
CREATE INDEX idx_decisions_created_at ON decisions(created_at);
CREATE INDEX idx_decisions_locked_until ON decisions(locked_until);
CREATE INDEX idx_decisions_outcome ON decisions(outcome);
CREATE INDEX idx_decisions_result ON decisions(result);