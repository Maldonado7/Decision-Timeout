-- Create users table (this might already exist with Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create decisions table
CREATE TABLE decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own decisions" ON decisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decisions" ON decisions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions" ON decisions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_decisions_user_id ON decisions(user_id);
CREATE INDEX idx_decisions_created_at ON decisions(created_at);
CREATE INDEX idx_decisions_locked_until ON decisions(locked_until);