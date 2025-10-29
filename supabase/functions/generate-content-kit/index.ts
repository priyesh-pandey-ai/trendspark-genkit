import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voiceCard, trendTitle, platforms, niche } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    console.log('Generating content kit for trend:', trendTitle);

    const prompt = `Using the Voice Card below and the Trend topic, create ${platforms.length} UNIQUE platform-specific posts.

IMPORTANT: Create ONE post for EACH of these platforms: ${platforms.join(', ')}
Do NOT repeat content. Each platform should have DIFFERENT content optimized for that platform's audience.

For each platform, output:
- Hook (≤80 characters, attention-grabbing)
- Body (≤220 words, engaging and valuable, UNIQUE to this platform)
- CTA (clear call-to-action)
- Hashtags (7-10 relevant hashtags)

Voice Card:
${voiceCard}

Trend Topic: ${trendTitle}
Niche: ${niche}

CRITICAL: Return exactly ${platforms.length} objects in a JSON array, one per platform: ${platforms.join(', ')}
Format as JSON array with objects containing: platform, hook, body, cta, hashtags (array of strings).

Example structure:
[
  {"platform": "Instagram", "hook": "...", "body": "...", "cta": "...", "hashtags": [...]},
  {"platform": "LinkedIn", "hook": "...", "body": "...", "cta": "...", "hashtags": [...]}
]`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Gemini API error');
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    const contentKits = JSON.parse(content);

    console.log('Content kit generated successfully');

    return new Response(
      JSON.stringify({ contentKits }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-content-kit:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});