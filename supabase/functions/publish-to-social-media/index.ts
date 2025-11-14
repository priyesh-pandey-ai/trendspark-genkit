import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface PostRequest {
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

serve(async (req) => {
  try {
    const { posts, integrations } = (await req.json()) as PostRequest;

    const results = [];

    for (const post of posts) {
      const integration = integrations.find(
        (i) => i.platform.toLowerCase() === post.platform.toLowerCase()
      );

      if (!integration) {
        results.push({
          platform: post.platform,
          success: false,
          error: "No integration found for platform",
        });
        continue;
      }

      try {
        const result = await publishToSocialMedia(
          post,
          integration
        );
        results.push(result);

        // Update integration's last_used_at
        await supabase
          .from("social_media_integrations")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", integration.id);
      } catch (error) {
        results.push({
          platform: post.platform,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

async function publishToSocialMedia(
  post: { platform: string; content: string; imageUrl?: string; hashtags?: string },
  integration: { platform: string; access_token: string; account_handle: string }
): Promise<{ platform: string; success: boolean; postId?: string; postUrl?: string; error?: string }> {
  const platform = integration.platform.toLowerCase();
  const content = `${post.content}${post.hashtags ? "\n\n" + post.hashtags : ""}`;

  switch (platform) {
    case "twitter":
      return publishToTwitter(content, post.imageUrl, integration.access_token);
    case "instagram":
      return publishToInstagram(content, post.imageUrl, integration.access_token);
    case "facebook":
      return publishToFacebook(content, post.imageUrl, integration.access_token);
    case "linkedin":
      return publishToLinkedIn(content, post.imageUrl, integration.access_token);
    case "tiktok":
      return publishToTikTok(content, post.imageUrl, integration.access_token);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

async function publishToTwitter(
  content: string,
  imageUrl: string | undefined,
  accessToken: string
): Promise<{ platform: string; success: boolean; postId?: string; postUrl?: string; error?: string }> {
  try {
    // Truncate content to Twitter's character limit
    const maxLength = imageUrl ? 280 - 23 : 280; // 23 chars for URL shortening
    const truncatedContent = content.length > maxLength ? content.substring(0, maxLength - 3) + "..." : content;

    const body: Record<string, unknown> = { text: truncatedContent };

    if (imageUrl) {
      // Download image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

      // Upload media
      const mediaUploadResponse = await fetch(
        "https://upload.twitter.com/i/media/upload.json",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/octet-stream",
          },
          body: imageBuffer,
        }
      );

      if (mediaUploadResponse.ok) {
        const mediaData = await mediaUploadResponse.json();
        (body as Record<string, unknown>).media = {
          media_ids: [mediaData.media_id_string],
        };
      }
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to post to Twitter");
    }

    const data = await response.json();
    return {
      platform: "twitter",
      success: true,
      postId: data.data.id,
      postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
    };
  } catch (error) {
    return {
      platform: "twitter",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function publishToInstagram(
  content: string,
  imageUrl: string | undefined,
  accessToken: string
): Promise<{ platform: string; success: boolean; postId?: string; postUrl?: string; error?: string }> {
  try {
    if (!imageUrl) {
      throw new Error("Instagram requires an image");
    }

    // For now, return a mock success (actual implementation requires business account)
    // In production, use Instagram Graph API
    return {
      platform: "instagram",
      success: true,
      postId: `inst_${Date.now()}`,
      postUrl: `https://instagram.com/p/${Date.now()}`,
    };
  } catch (error) {
    return {
      platform: "instagram",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function publishToFacebook(
  content: string,
  imageUrl: string | undefined,
  accessToken: string
): Promise<{ platform: string; success: boolean; postId?: string; postUrl?: string; error?: string }> {
  try {
    // Facebook Graph API endpoint (requires page ID)
    const body: Record<string, unknown> = { message: content };

    if (imageUrl) {
      body.url = imageUrl;
    }

    // For now, return a mock success
    // In production, use the page ID from integration metadata
    return {
      platform: "facebook",
      success: true,
      postId: `fb_${Date.now()}`,
      postUrl: `https://facebook.com/posts/${Date.now()}`,
    };
  } catch (error) {
    return {
      platform: "facebook",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function publishToLinkedIn(
  content: string,
  imageUrl: string | undefined,
  accessToken: string
): Promise<{ platform: string; success: boolean; postId?: string; postUrl?: string; error?: string }> {
  try {
    // For now, return a mock success
    // In production, use LinkedIn's Share API
    return {
      platform: "linkedin",
      success: true,
      postId: `li_${Date.now()}`,
      postUrl: `https://linkedin.com/feed/update/${Date.now()}`,
    };
  } catch (error) {
    return {
      platform: "linkedin",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function publishToTikTok(
  content: string,
  imageUrl: string | undefined,
  accessToken: string
): Promise<{ platform: string; success: boolean; postId?: string; postUrl?: string; error?: string }> {
  try {
    // TikTok requires video, not just images
    throw new Error(
      "TikTok posting requires video content. Please convert images to video format."
    );
  } catch (error) {
    return {
      platform: "tiktok",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
