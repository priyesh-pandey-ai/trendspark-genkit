import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform-specific image dimensions
const PLATFORM_DIMENSIONS = {
  'Instagram': { width: 1080, height: 1080 },
  'LinkedIn': { width: 1200, height: 627 },
  'Twitter': { width: 1200, height: 675 },
  'Facebook': { width: 1200, height: 630 },
  'TikTok': { width: 1080, height: 1920 },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hook, body, trendTitle, platform, niche } = await req.json();

    console.log('Generating image for:', { platform, trendTitle });

    if (!hook || !platform) {
      throw new Error('Missing required parameters: hook and platform');
    }

    // Generate intelligent image prompt based on content and platform
    const imagePrompt = generateImagePrompt(hook, body, trendTitle, platform, niche);
    
    console.log('Generated prompt:', imagePrompt);

    // Use Pollinations.AI (free, no API key required)
    const dimensions = PLATFORM_DIMENSIONS[platform as keyof typeof PLATFORM_DIMENSIONS] || 
                      PLATFORM_DIMENSIONS['Instagram'];
    
    // Encode the prompt for URL
    const encodedPrompt = encodeURIComponent(imagePrompt);
    
    // Pollinations.AI URL with dimensions
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=true`;

    console.log('Image URL generated:', imageUrl);

    return new Response(
      JSON.stringify({ 
        imageUrl,
        imagePrompt,
        dimensions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-content-image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        imageUrl: null,
        imagePrompt: null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateImagePrompt(
  hook: string, 
  body: string, 
  trendTitle: string, 
  platform: string,
  niche?: string
): string {
  // Extract key topics from the content
  const content = `${hook} ${body}`.toLowerCase();
  
  // Determine style based on platform
  let styleGuide = '';
  switch (platform) {
    case 'LinkedIn':
      styleGuide = 'professional, corporate, minimalist, clean, business-appropriate';
      break;
    case 'Instagram':
      styleGuide = 'vibrant, aesthetic, eye-catching, modern, social media friendly';
      break;
    case 'Twitter':
      styleGuide = 'bold, attention-grabbing, clear, modern, social media optimized';
      break;
    case 'Facebook':
      styleGuide = 'friendly, engaging, colorful, relatable, social';
      break;
    case 'TikTok':
      styleGuide = 'dynamic, trendy, youthful, vibrant, energetic';
      break;
    default:
      styleGuide = 'modern, professional, clean';
  }

  // Build the prompt
  const nicheContext = niche ? `related to ${niche}` : '';
  const trendContext = trendTitle ? `about "${trendTitle}"` : '';
  
  // Create a concise, focused prompt
  const prompt = `${styleGuide} image ${nicheContext} ${trendContext}, high quality, no text overlay, professional photography, suitable for ${platform}`;

  // Clean up the prompt
  return prompt.replace(/\s+/g, ' ').trim();
}
