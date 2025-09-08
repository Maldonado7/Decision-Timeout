-- Migration to make database compatible with Clerk authentication
-- This fixes the schema to use TEXT user_id instead of UUID to work with Clerk

-- Start transaction
BEGIN;

-- Step 1: Remove foreign key constraints and policies that depend on auth.users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can insert own decisions" ON decisions;
DROP POLICY IF EXISTS "Users can update own decisions" ON decisions;

-- Step 2: Drop the existing users table since we're using Clerk for auth
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Alter decisions table to use TEXT for user_id instead of UUID
ALTER TABLE decisions ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Drop and recreate index for performance with TEXT user_id
DROP INDEX IF EXISTS idx_decisions_user_id;
CREATE INDEX idx_decisions_user_id ON decisions(user_id);

-- Step 5: Create new RLS policies compatible with Clerk auth
-- Note: These policies will need to be updated when we implement proper Clerk JWT verification
CREATE POLICY "Users can view own decisions" ON decisions
  FOR SELECT USING (true); -- Temporarily allow all, will be restricted via application logic

CREATE POLICY "Users can insert own decisions" ON decisions
  FOR INSERT WITH CHECK (true); -- Temporarily allow all, will be restricted via application logic

CREATE POLICY "Users can update own decisions" ON decisions
  FOR UPDATE USING (true); -- Temporarily allow all, will be restricted via application logic

-- Step 6: Add any missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_decisions_outcome ON decisions(outcome);
CREATE INDEX IF NOT EXISTS idx_decisions_result ON decisions(result);

-- Commit transaction
COMMIT;

-- Note: After running this migration, you'll need to:
-- 1. Update RLS policies to properly verify Clerk JWTs
-- 2. Ensure all existing data has been properly migrated
-- 3. Test the authentication flow end-to-end