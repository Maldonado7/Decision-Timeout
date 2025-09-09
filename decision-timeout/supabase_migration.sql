-- Add confidence_level column to decisions table
-- This migration adds psychological tracking capability

-- Add confidence_level column (1-10 scale, nullable for existing records)
ALTER TABLE decisions 
ADD COLUMN confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10);

-- Add comment for documentation
COMMENT ON COLUMN decisions.confidence_level IS 'User confidence rating from 1-10 scale for psychological tracking';