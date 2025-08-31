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