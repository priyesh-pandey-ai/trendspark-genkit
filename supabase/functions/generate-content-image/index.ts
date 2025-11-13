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

const DEFAULT_PLATFORM = 'Instagram';

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
    let imagePrompt = generateImagePrompt(hook, body, trendTitle, platform, niche);
    
    // Validate and truncate prompt if too long (max 500 characters for URL safety)
    const MAX_PROMPT_LENGTH = 500;
    if (imagePrompt.length > MAX_PROMPT_LENGTH) {
      imagePrompt = imagePrompt.substring(0, MAX_PROMPT_LENGTH);
      console.log('Prompt truncated to:', imagePrompt.length, 'characters');
    }
    
    console.log('Generated prompt:', imagePrompt);

    // Use Pollinations.AI (free, no API key required)
    const dimensions = PLATFORM_DIMENSIONS[platform as keyof typeof PLATFORM_DIMENSIONS] || 
                      PLATFORM_DIMENSIONS[DEFAULT_PLATFORM];
    
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
  // Improved image prompt builder:
  // - Heuristically extract keywords from hook/body and use trendTitle as primary subject
  // - Compose a structured, brand-ready prompt: visual style, subject, setting, composition, lighting, color palette
  // - Append explicit negatives to avoid random/unrelated images

  const raw = `${hook || ''} ${body || ''} ${trendTitle || ''} ${niche || ''}`.toLowerCase();

  // Simple keyword extraction (frequency-based, removes stopwords)
  const STOPWORDS = new Set([
    'the','and','for','with','that','this','from','are','was','were','will','have','has','but','not','you','your',
    'a','an','of','in','on','to','is','it','as','by','be','at','or','its','our','we','us','can','new'
  ]);

  const words = raw
    .replace(/["'“”‘’\(\)\[\],.:;!?\/\\<>@#\$%\^&\*=+|~`]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOPWORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const keywords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

  // Choose up to 4 helpful keywords as secondary subjects
  const subjects = [] as string[];
  if (trendTitle && trendTitle.trim().length > 0) subjects.push(trendTitle.trim());
  for (const k of keywords) {
    if (subjects.join(' ').toLowerCase().includes(k)) continue;
    subjects.push(k);
    if (subjects.length >= 4) break;
  }

  // Infer a simple setting if certain location words are present
  const KNOWN_SETTINGS: Record<string,string> = {
    office: 'modern office',
    workspace: 'workspace',
    kitchen: 'stylish kitchen',
    outdoors: 'outdoor scene',
    street: 'street scene',
    city: 'urban cityscape',
    studio: 'studio backdrop',
    coffee: 'cafe interior',
    nature: 'natural landscape',
    product: 'clean product studio',
  };
  let setting = '';
  for (const s of Object.keys(KNOWN_SETTINGS)) {
    if (words.includes(s)) { setting = KNOWN_SETTINGS[s]; break; }
  }
  if (!setting) setting = subjects.length ? 'clean minimal background' : 'abstract brand-friendly background';

  // Platform-specific visual style and camera guidance
  let visualStyle = '';
  let composition = 'rule-of-thirds composition, centered main subject';
  let lighting = 'soft, diffused, professional lighting';
  let colorPalette = 'brand-friendly, harmonious colors';
  let shotType = 'medium shot';

  switch (platform) {
    case 'LinkedIn':
      visualStyle = 'clean, corporate, minimalist editorial photography';
      colorPalette = 'muted tones, neutral palette';
      composition = 'clean composition, ample negative space';
      shotType = 'close-up or medium shot';
      lighting = 'even, flattering studio lighting';
      break;
    case 'Instagram':
      visualStyle = 'vibrant, aesthetic, high-fashion editorial photography';
      colorPalette = 'vibrant and cohesive colors';
      composition = 'artful composition, shallow depth of field';
      shotType = 'full-frame or close-up';
      lighting = 'golden-hour or studio-styled dramatic lighting';
      break;
    case 'Twitter':
      visualStyle = 'bold, graphic, modern photography';
      colorPalette = 'high contrast, punchy colors';
      composition = 'clear focal point, easy to read at small sizes';
      shotType = 'close-up';
      lighting = 'high-contrast, directional lighting';
      break;
    case 'Facebook':
      visualStyle = 'friendly, relatable lifestyle photography';
      colorPalette = 'warm, welcoming colors';
      composition = 'relatable scene, natural framing';
      shotType = 'medium shot';
      lighting = 'natural, soft lighting';
      break;
    case 'TikTok':
      visualStyle = 'dynamic, trendy, cinematic still';
      colorPalette = 'energetic bold colors';
      composition = 'vertical-friendly composition, high energy';
      shotType = 'portrait/vertical';
      lighting = 'high-energy, vibrant lighting';
      break;
    default:
      visualStyle = 'modern, professional photography';
  }

  // Build the main prompt with structured phrases
  const subjectPhrase = subjects.length ? `Subject: ${subjects.join(', ')}` : 'Subject: abstract brand visual';
  const nichePhrase = niche ? `Context: related to ${niche}` : '';
  const trendPhrase = trendTitle ? `Theme: ${trendTitle}` : '';

  const mainParts = [
    visualStyle,
    subjectPhrase,
    `Setting: ${setting}`,
    `Composition: ${composition}`,
    `Lighting: ${lighting}`,
    `Color palette: ${colorPalette}`,
    `Shot: ${shotType}`,
    nichePhrase,
    trendPhrase,
    'High resolution, professional, brand-suitable'
  ].filter(Boolean).join(', ');

  // Negative constraints to avoid random/unrelated elements
  const negatives = [
    'no text',
    'no watermark',
    'no logos',
    'no borders',
    'no collage',
    'no low-resolution',
    'no artifacts',
    'avoid unrelated objects or random backgrounds',
    'do not include extra people unless explicitly mentioned'
  ].join(', ');

  const prompt = `${mainParts}, ${negatives}`.replace(/\s+/g, ' ').trim();

  // Keep prompt reasonably sized
  return prompt.length > 450 ? prompt.substring(0, 450).trim() : prompt;
}

// Example function generated by Gemini Canvas
// /**
//  * Generates an enhanced image prompt for an AI image generator (like Pollinations.ai)
//  * based on social media post content.
//  *
//  * @param hook - The main hook or headline of the post (e.g., "5 Secrets to Skyrocket Your Productivity").
//  * @param body - The body content (used for basic keyword extraction).
//  * @param trendTitle - A specific trend the post is about (e.g., "The AI Revolution").
//  * @param platform - The target social media platform ('LinkedIn', 'Instagram', 'Twitter', 'Facebook', 'TikTok').
//  * @param niche - The specific niche or industry (e.g., 'SaaS marketing', 'personal finance').
//  * @param imageType - The desired type of image ('photograph', 'illustration', 'digital art', 'abstract'). Defaults to 'photograph'.
//  * @returns A detailed, structured string prompt for the image generation AI.
//  */
// function generateEnhancedImagePrompt(
//   hook: string,
//   body: string,
//   trendTitle: string,
//   platform: string,
//   niche?: string,
//   imageType: 'photograph' | 'illustration' | 'digital art' | 'abstract' = 'photograph'
// ): string {

//   // --- 1. Define Core Subject ---
//   // The hook is the most direct representation of the post's core message.
//   // We frame it as a visual concept.
//   const subject = `A visually compelling ${imageType} that powerfully illustrates the concept of: "${hook}"`;

//   // --- 2. Define Context & Keywords ---
//   // We'll pull in the niche and trend for thematic context.
//   const nicheContext = niche ? `for a ${niche} audience` : '';
//   const trendContext = trendTitle ? `related to the trend "${trendTitle}"` : '';
  
//   // This is a *very* basic keyword extractor.
//   // It filters out common "stop words" and punctuation, then takes the first 3 long-ish words.
//   // For better results, a real NLP library would be needed, but this is a good start.
//   const stopWords = new Set([
//     'a', 'an', 'the', 'is', 'in', 'on', 'for', 'to', 'with', 'of', 'and', 'or', 'but', 
//     'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
//     'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
//     'will', 'would', 'should', 'can', 'could', 'about', 'above', 'below', 'from', 'up', 'down',
//     'out', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
//     'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
//     'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't'
//   ]);

//   const bodyWords = body.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
//   const keywords = bodyWords
//     .filter(word => word.length > 3 && !stopWords.has(word))
//     .slice(0, 3); // Take the first 3 "keywords"
    
//   const keywordContext = keywords.length > 0 ? `featuring elements of: ${keywords.join(', ')}` : '';

//   // --- 3. Define Style Guide (More Evocative) ---
//   let styleGuide = '';
//   let technicals = '8k, high resolution, ultra-detailed, sharp focus';

//   switch (platform) {
//     case 'LinkedIn':
//       styleGuide = 'professional, corporate-clean, minimalist design, futuristic, optimistic, blue and white color palette, sense of innovation';
//       technicals += imageType === 'photograph' ? ', bright studio lighting, uncluttered background' : ', clean vector lines, iso-metric style';
//       break;
//     case 'Instagram':
//       styleGuide = 'vibrant, highly aesthetic, cinematic, trendy, dynamic colors, high contrast, visually stunning, engaging';
//       technicals += imageType === 'photograph' ? ', golden hour lighting, photorealistic, 50mm lens, shallow depth of field' : ', digital art, trending on ArtStation, smooth gradients';
//       break;
//     case 'Twitter': // or 'X'
//       styleGuide = 'bold, high-impact, graphic, strong focal point, attention-grabbing, high contrast';
//       technicals += ', simple background, clear subject';
//       break;
//     case 'Facebook':
//       styleGuide = 'friendly, warm, relatable, authentic, colorful, engaging, community-focused, optimistic';
//       technicals += imageType === 'photograph' ? ', natural lighting, lifestyle shot, candid' : ', soft illustration style, rounded shapes';
//       break;
//     case 'TikTok':
//       styleGuide = 'dynamic, energetic, trendy, youthful, vibrant, neon accents, a sense of motion, slightly edgy, eye-catching';
//       technicals += ', action shot, dutch angle, high energy, motion blur';
//       break;
//     default:
//       styleGuide = 'modern, clean, professional, high quality';
//   }

//   // --- 4. Define Negative Prompt (What to AVOID) ---
//   // This is critical for avoiding common AI mistakes.
//   const negativePrompt = 'no text, no letters, no watermarks, no logos, blurry, grainy, ugly, deformed, bad anatomy, poorly drawn, extra limbs, disfigured, mutated, watermark, signature, text overlay';

//   // --- 5. Assemble the Final Prompt ---
//   const promptParts = [
//     subject,
//     nicheContext,
//     trendContext,
//     keywordContext, // Added our new "keywords"
//     `Style: ${styleGuide}`,
//     `Technicals: ${technicals}`,
//     `Negative Prompt: ${negativePrompt}`
//   ];

//   // Filter out any empty parts (like if niche or trendTitle aren't provided)
//   // and join them with a comma. This structure is very clear for AIs.
//   return promptParts
//     .filter(Boolean) // This removes empty strings (e.g., if nicheContext is '')
//     .join(', ')
//     .replace(/\s+/g, ' ') // Clean up extra whitespace
//     .trim();
// }
