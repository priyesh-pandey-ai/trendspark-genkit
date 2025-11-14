-- Create social_media_integrations table to store API credentials and settings
CREATE TABLE IF NOT EXISTS social_media_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform varchar(50) NOT NULL, -- 'twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'
  access_token text NOT NULL, -- encrypted
  refresh_token text, -- encrypted, optional
  token_expires_at timestamp,
  account_handle varchar(255),
  account_name varchar(255),
  is_active boolean DEFAULT true,
  last_used_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, platform, account_handle)
);

-- Create social_media_posts table to track posted content
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_kit_id uuid NOT NULL REFERENCES content_kits(id) ON DELETE CASCADE,
  platform varchar(50) NOT NULL, -- 'twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'
  external_post_id varchar(255), -- post ID from the platform
  status varchar(50) DEFAULT 'pending', -- 'pending', 'scheduled', 'posted', 'failed', 'cancelled'
  scheduled_at timestamp,
  posted_at timestamp,
  post_url varchar(500),
  error_message text,
  metadata jsonb, -- store platform-specific metadata
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create social_media_stats table for tracking post performance
CREATE TABLE IF NOT EXISTS social_media_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES social_media_posts(id) ON DELETE CASCADE,
  platform varchar(50) NOT NULL,
  likes_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  shares_count int DEFAULT 0,
  views_count int DEFAULT 0,
  engagement_rate decimal(5,2) DEFAULT 0,
  last_updated_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE social_media_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_media_integrations
CREATE POLICY "Users can see their own integrations"
ON social_media_integrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
ON social_media_integrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
ON social_media_integrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
ON social_media_integrations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for social_media_posts (through content_kits)
CREATE POLICY "Users can see posts from their brands"
ON social_media_posts
FOR SELECT
TO authenticated
USING (
  content_kit_id IN (
    SELECT id FROM content_kits 
    WHERE brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can insert posts for their brands"
ON social_media_posts
FOR INSERT
TO authenticated
WITH CHECK (
  content_kit_id IN (
    SELECT id FROM content_kits 
    WHERE brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update posts for their brands"
ON social_media_posts
FOR UPDATE
TO authenticated
USING (
  content_kit_id IN (
    SELECT id FROM content_kits 
    WHERE brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  )
)
WITH CHECK (
  content_kit_id IN (
    SELECT id FROM content_kits 
    WHERE brand_id IN (
      SELECT id FROM brands WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for social_media_stats (through posts)
CREATE POLICY "Users can see stats for their posts"
ON social_media_stats
FOR SELECT
TO authenticated
USING (
  post_id IN (
    SELECT id FROM social_media_posts 
    WHERE content_kit_id IN (
      SELECT id FROM content_kits 
      WHERE brand_id IN (
        SELECT id FROM brands WHERE user_id = auth.uid()
      )
    )
  )
);

-- Create indexes for performance
CREATE INDEX idx_social_integrations_user ON social_media_integrations(user_id);
CREATE INDEX idx_social_integrations_platform ON social_media_integrations(platform);
CREATE INDEX idx_social_posts_content_kit ON social_media_posts(content_kit_id);
CREATE INDEX idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_social_posts_status ON social_media_posts(status);
CREATE INDEX idx_social_posts_scheduled_at ON social_media_posts(scheduled_at);
CREATE INDEX idx_social_stats_post ON social_media_stats(post_id);
