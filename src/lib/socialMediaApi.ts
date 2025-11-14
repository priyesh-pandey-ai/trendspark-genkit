// Social Media API Wrapper
// Handles posting to various social media platforms

interface SocialMediaPost {
  content: string;
  imageUrl?: string;
  hashtags?: string[];
  scheduledTime?: Date;
  platforms: string[];
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export class TwitterAPI {
  constructor(private accessToken: string) {}

  async post(content: string, imageUrl?: string): Promise<PostResult> {
    try {
      // Prepare the request body
      const body: any = { text: content };

      // Add image if provided
      if (imageUrl) {
        const imageData = await fetch(imageUrl).then(r => r.arrayBuffer());
        const mediaResponse = await fetch('https://upload.twitter.com/i/media/upload.json', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/octet-stream',
          },
          body: imageData,
        });

        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          body.media = { media_ids: [mediaData.media_id_string] };
        }
      }

      // Post the tweet
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to post to Twitter');
      }

      const data = await response.json();
      return {
        platform: 'twitter',
        success: true,
        postId: data.data.id,
        postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
      };
    } catch (error) {
      return {
        platform: 'twitter',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class InstagramAPI {
  constructor(private accessToken: string, private accountId: string) {}

  async post(content: string, imageUrl?: string): Promise<PostResult> {
    try {
      if (!imageUrl) {
        throw new Error('Instagram requires an image');
      }

      // Upload image container
      const containerResponse = await fetch(
        `https://graph.instagram.com/v18.0/${this.accountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: content,
            access_token: this.accessToken,
          }),
        }
      );

      if (!containerResponse.ok) {
        const errorData = await containerResponse.json();
        throw new Error(errorData.error?.message || 'Failed to create media container');
      }

      const containerData = await containerResponse.json();

      // Publish the media
      const publishResponse = await fetch(
        `https://graph.instagram.com/v18.0/${this.accountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: this.accessToken,
          }),
        }
      );

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(errorData.error?.message || 'Failed to publish to Instagram');
      }

      const publishData = await publishResponse.json();
      return {
        platform: 'instagram',
        success: true,
        postId: publishData.id,
        postUrl: `https://instagram.com/p/${publishData.id}`,
      };
    } catch (error) {
      return {
        platform: 'instagram',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class FacebookAPI {
  constructor(private accessToken: string, private pageId: string) {}

  async post(content: string, imageUrl?: string): Promise<PostResult> {
    try {
      const body: any = { message: content };

      if (imageUrl) {
        body.url = imageUrl;
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${this.pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...body,
            access_token: this.accessToken,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to post to Facebook');
      }

      const data = await response.json();
      const [pageId, postId] = data.id.split('_');
      return {
        platform: 'facebook',
        success: true,
        postId: data.id,
        postUrl: `https://facebook.com/${pageId}/posts/${postId}`,
      };
    } catch (error) {
      return {
        platform: 'facebook',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class LinkedInAPI {
  constructor(private accessToken: string, private personId: string) {}

  async post(content: string, imageUrl?: string): Promise<PostResult> {
    try {
      const body: any = {
        commentary: content,
        visibility: 'PUBLIC',
      };

      if (imageUrl) {
        body.content = {
          contentEntities: [
            {
              entityLocation: imageUrl,
            },
          ],
          shareMediaCategory: 'IMAGE',
        };
      }

      const response = await fetch(
        `https://api.linkedin.com/v2/ugcPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202311',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post to LinkedIn');
      }

      const data = await response.json();
      return {
        platform: 'linkedin',
        success: true,
        postId: data.id,
        postUrl: data.id,
      };
    } catch (error) {
      return {
        platform: 'linkedin',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class TikTokAPI {
  constructor(private accessToken: string, private openId: string) {}

  async post(content: string, videoUrl?: string): Promise<PostResult> {
    try {
      if (!videoUrl) {
        throw new Error('TikTok requires a video URL (images are not supported for TikTok)');
      }

      const response = await fetch(
        `https://open.tiktok.com/v1/share/publish/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_url: videoUrl,
            text: content,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to post to TikTok');
      }

      const data = await response.json();
      return {
        platform: 'tiktok',
        success: true,
        postId: data.data.video_id,
        postUrl: `https://tiktok.com/@${this.openId}/video/${data.data.video_id}`,
      };
    } catch (error) {
      return {
        platform: 'tiktok',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export class SocialMediaManager {
  static getAPIInstance(platform: string, accessToken: string, accountData: any) {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return new TwitterAPI(accessToken);
      case 'instagram':
        return new InstagramAPI(accessToken, accountData.accountId);
      case 'facebook':
        return new FacebookAPI(accessToken, accountData.pageId);
      case 'linkedin':
        return new LinkedInAPI(accessToken, accountData.personId);
      case 'tiktok':
        return new TikTokAPI(accessToken, accountData.openId);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  static async publishToMultiplePlatforms(
    post: SocialMediaPost
  ): Promise<PostResult[]> {
    const results: PostResult[] = [];

    for (const platform of post.platforms) {
      try {
        // This would be called from an edge function with proper credentials
        // For now, we'll just return a placeholder result
        results.push({
          platform,
          success: false,
          error: 'Credentials not available',
        });
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

export default SocialMediaManager;
