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

    const prompt = `Create ${platforms.length} platform-specific social media posts using the voice and style below.

VOICE CARD:
${voiceCard}

TREND: ${trendTitle}
NICHE: ${niche}
PLATFORMS: ${platforms.join(', ')}

OUTPUT FORMAT: JSON array with these fields for each platform:
- platform (string)
- hook (max 80 chars, attention-grabbing)
- body (max 220 words)
- cta (clear call-to-action)
- hashtags (array of 7-10 hashtags)

Return ONLY the JSON array, no markdown.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 4096,
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
    
    console.log('Full Gemini API response:', JSON.stringify(data, null, 2));
    
    // Validate Gemini response structure
    if (!data.candidates || !data.candidates.length) {
      console.error('Invalid Gemini response structure - no candidates array');
      
      // Check for safety filters or other blocking
      if (data.promptFeedback) {
        console.error('Prompt feedback:', JSON.stringify(data.promptFeedback));
        throw new Error(`Content was blocked by safety filters: ${JSON.stringify(data.promptFeedback.blockReason || 'Unknown reason')}`);
      }
      
      throw new Error('Gemini returned an empty response. The content may have been filtered. Please try a different trend topic.');
    }
    
    if (!data.candidates[0].content?.parts?.[0]?.text) {
      console.error('Missing text in Gemini response:', JSON.stringify(data.candidates[0]));
      
      // Check finish reason
      const finishReason = data.candidates[0].finishReason;
      if (finishReason === 'MAX_TOKENS') {
        throw new Error('Response was too long and got cut off. This usually means the voice card is very detailed. Please try again or use a more concise voice card.');
      }
      
      if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Content generation stopped: ${finishReason}. Please try a different trend topic.`);
      }
      
      throw new Error('Gemini response missing content. Please try again.');
    }
    
    let content = data.candidates[0].content.parts[0].text;
    
    console.log('Raw Gemini response (first 500 chars):', content.substring(0, 500));
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }
    
    // Clean up common JSON issues
    content = content.trim();
    
    // Try to parse the JSON
    let contentKits;
    try {
      contentKits = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Problematic content (full):', content);
      
      // Try to fix common issues: unescaped quotes, newlines in strings
      try {
        // Remove any trailing commas before closing brackets
        let cleaned = content.replace(/,(\s*[}\]])/g, '$1');
        
        // Try parsing again
        contentKits = JSON.parse(cleaned);
        console.log('Successfully parsed after cleanup');
      } catch (secondError) {
        console.error('Still failed after cleanup:', secondError);
        const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error';
        throw new Error(`Failed to parse Gemini response as JSON: ${errorMsg}. Response: ${content.substring(0, 200)}...`);
      }
    }

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