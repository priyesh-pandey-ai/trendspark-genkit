// Social Media Types and Interfaces

export interface SocialMediaIntegration {
  id: string;
  user_id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok';
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  account_handle: string;
  account_name: string;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaPost {
  id: string;
  content_kit_id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok';
  external_post_id?: string;
  status: 'pending' | 'scheduled' | 'posted' | 'failed' | 'cancelled';
  scheduled_at?: string;
  posted_at?: string;
  post_url?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaStats {
  id: string;
  post_id: string;
  platform: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  engagement_rate: number;
  last_updated_at: string;
  created_at: string;
}

export interface CSVRow {
  platform: string;
  content: string;
  imageUrl?: string;
  hashtags?: string;
  scheduledTime?: string;
}

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export interface BulkPostRequest {
  posts: Array<{
    platform: string;
    content: string;
    imageUrl?: string;
    hashtags?: string;
  }>;
  integrations: Array<{
    id: string;
    platform: string;
    access_token: string;
    account_handle: string;
  }>;
}

export interface BulkPostResponse {
  results: PostResult[];
}

export interface PlatformConfig {
  id: string;
  name: string;
  label: string;
  icon: string;
  maxCharacters: number;
  supportsImages: boolean;
  supportsVideos: boolean;
  supportsScheduling: boolean;
  maxScheduleAdvanceDays: number;
  documentationUrl: string;
  developersPortalUrl: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    label: 'Twitter/X',
    icon: '𝕏',
    maxCharacters: 280,
    supportsImages: true,
    supportsVideos: true,
    supportsScheduling: false,
    maxScheduleAdvanceDays: 0,
    documentationUrl: 'https://developer.twitter.com/en/docs',
    developersPortalUrl: 'https://developer.twitter.com/en/portal/dashboard',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    label: 'Instagram',
    icon: '📷',
    maxCharacters: 2200,
    supportsImages: true,
    supportsVideos: true,
    supportsScheduling: true,
    maxScheduleAdvanceDays: 75,
    documentationUrl: 'https://developers.facebook.com/docs/instagram',
    developersPortalUrl: 'https://developers.facebook.com',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    label: 'Facebook',
    icon: '👍',
    maxCharacters: 63206,
    supportsImages: true,
    supportsVideos: true,
    supportsScheduling: true,
    maxScheduleAdvanceDays: 6552,
    documentationUrl: 'https://developers.facebook.com/docs/facebook-login',
    developersPortalUrl: 'https://developers.facebook.com',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    label: 'LinkedIn',
    icon: '💼',
    maxCharacters: 3000,
    supportsImages: true,
    supportsVideos: true,
    supportsScheduling: true,
    maxScheduleAdvanceDays: 7,
    documentationUrl: 'https://docs.microsoft.com/en-us/linkedin/shared/api-guide/concepts',
    developersPortalUrl: 'https://www.linkedin.com/developers/apps',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    label: 'TikTok',
    icon: '🎵',
    maxCharacters: 2200,
    supportsImages: false,
    supportsVideos: true,
    supportsScheduling: false,
    maxScheduleAdvanceDays: 0,
    documentationUrl: 'https://developers.tiktok.com/doc',
    developersPortalUrl: 'https://developer.tiktok.com',
  },
};
