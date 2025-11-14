import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface ScheduledPost {
  id: string;
  content_kit_id: string;
  platform: string;
  status: string;
  scheduled_at: string;
  metadata: {
    content: string;
    hashtags?: string;
    imageUrl?: string;
  };
}

interface Integration {
  id: string;
  platform: string;
  access_token: string;
  account_handle: string;
}

// This function should be called by a scheduled cron job every 5 minutes
serve(async (req) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get all posts scheduled for now or earlier
    const now = new Date().toISOString();
    const { data: scheduledPosts, error: postsError } = await supabase
      .from("social_media_posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(100); // Process in batches

    if (postsError) throw postsError;

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No posts to process", processed: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const post of scheduledPosts) {
      try {
        // Get the integration for this post
        const { data: integrations, error: integError } = await supabase
          .from("social_media_integrations")
          .select("id, platform, access_token, account_handle")
          .eq("platform", post.platform)
          .eq("is_active", true)
          .limit(1);

        if (integError) {
          throw new Error(`Failed to fetch integration: ${integError.message}`);
        }

        if (!integrations || integrations.length === 0) {
          await updatePostStatus(post.id, "failed", `No active integration for ${post.platform}`);
          results.push({ postId: post.id, success: false, error: "No integration found" });
          continue;
        }

        const integration = integrations[0];

        // Call the publishing function
        const publishResponse = await supabase.functions.invoke(
          "publish-to-social-media",
          {
            body: {
              posts: [
                {
                  platform: post.platform,
                  content: post.metadata?.content || "",
                  imageUrl: post.metadata?.imageUrl,
                  hashtags: post.metadata?.hashtags,
                },
              ],
              integrations: [integration],
            },
          }
        );

        if (publishResponse.error) {
          await updatePostStatus(post.id, "failed", publishResponse.error.message);
          results.push({ postId: post.id, success: false, error: publishResponse.error.message });
        } else {
          const publishResult = publishResponse.data?.results?.[0];

          if (publishResult?.success) {
            // Update post with success info
            const { error: updateError } = await supabase
              .from("social_media_posts")
              .update({
                status: "posted",
                posted_at: new Date().toISOString(),
                external_post_id: publishResult.postId,
                post_url: publishResult.postUrl,
              })
              .eq("id", post.id);

            if (updateError) throw updateError;

            // Log successful posting
            results.push({
              postId: post.id,
              success: true,
              externalId: publishResult.postId,
            });
          } else {
            await updatePostStatus(
              post.id,
              "failed",
              publishResult?.error || "Unknown publishing error"
            );
            results.push({
              postId: post.id,
              success: false,
              error: publishResult?.error || "Unknown error",
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await updatePostStatus(post.id, "failed", errorMessage);
        results.push({ postId: post.id, success: false, error: errorMessage });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    console.log(
      `Processed ${results.length} posts: ${successCount} succeeded, ${failureCount} failed`
    );

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} scheduled posts`,
        processed: results.length,
        succeeded: successCount,
        failed: failureCount,
        results,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing scheduled posts:", errorMessage);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        processed: 0,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

async function updatePostStatus(
  postId: string,
  status: string,
  errorMessage: string
): Promise<void> {
  const { error } = await supabase
    .from("social_media_posts")
    .update({
      status,
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    console.error(`Failed to update post ${postId}:`, error);
  }
}
