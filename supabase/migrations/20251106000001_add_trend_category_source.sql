-- Add trend_category_source column to trends table
-- This tracks which category filter was used when discovering the trend

ALTER TABLE trends 
ADD COLUMN IF NOT EXISTS trend_category_source VARCHAR(50) DEFAULT 'all';

-- Create index for faster filtering by category source
CREATE INDEX IF NOT EXISTS idx_trends_category_source ON trends(trend_category_source);

-- Update existing trends to have 'all' as default
UPDATE trends 
SET trend_category_source = 'all' 
WHERE trend_category_source IS NULL;

-- Add comment
COMMENT ON COLUMN trends.trend_category_source IS 'The category filter used when discovering this trend (all, technology, business, etc.)';
