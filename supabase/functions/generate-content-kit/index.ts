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
    const { voiceCard, trendTitle, platforms, niche, modelId = 'gemini-2.0-flash-lite' } = await req.json();

    console.log('Generating content kit for trend:', trendTitle, 'using model:', modelId);

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

TREND: ${trendTitle}
NICHE: ${niche}
PLATFORMS: ${platforms.join(', ')}

OUTPUT FORMAT: JSON array with these fields for each platform:
- platform (string)
- hook (max 80 chars, attention-grabbing)
- body (max 220 words)
- cta (clear call-to-action)
- hashtags (array of 7-10 hashtags)

CRITICAL: Return exactly ${platforms.length} objects in a JSON array, one per platform: ${platforms.join(', ')}
Format as JSON array with objects containing: platform, hook, body, cta, hashtags (array of strings).

Example structure:
[
  {"platform": "Instagram", "hook": "...", "body": "...", "cta": "...", "hashtags": [...]},
  {"platform": "LinkedIn", "hook": "...", "body": "...", "cta": "...", "hashtags": [...]}
]`;

    // Route to appropriate model provider
    let content: string;
    
    if (modelId.includes('llama') || modelId.includes('mixtral')) {
      content = await generateWithGroq(modelId, prompt);
    } else {
      content = await generateWithGemini(modelId, prompt);
    }
    
    console.log('Raw AI response (first 500 chars):', content.substring(0, 500));
    
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
        const cleaned = content.replace(/,(\s*[}\]])/g, '$1');
        
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

/**
 * Generate content kit using Google Gemini API
 */
async function generateWithGemini(modelId: string, prompt: string): Promise<string> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Get a free key at https://ai.google.dev');
  }

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  let response: Response | null = null;
  let attempt = 0;
  const maxAttempts = 3;
  let lastErrorText = "";

  const requestBody = JSON.stringify({
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
  });

  while (attempt < maxAttempts) {
    attempt++;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      if (response.ok) {
        break;
      }

      lastErrorText = await response.text();
      console.error(`Gemini API error (attempt ${attempt}):`, response.status, lastErrorText);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (response.status >= 500 && attempt < maxAttempts) {
        const backoffMs = 500 * Math.pow(2, attempt - 1);
        console.warn(`Retrying Gemini request in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await sleep(backoffMs);
        continue;
      }

      throw new Error(`Gemini API error: ${response.status}`);
    } catch (err) {
      console.error(`Gemini request failed on attempt ${attempt}:`, err);
      if (attempt < maxAttempts) {
        const backoffMs = 500 * Math.pow(2, attempt - 1);
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }

  if (!response) {
    throw new Error('No response received from Gemini API');
  }

  const data = await response.json();
  
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

  return data.candidates[0].content.parts[0].text;
}

/**
 * Generate content kit using Groq API (Llama/Mixtral)
 */
async function generateWithGroq(modelId: string, prompt: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Get a free key at https://console.groq.com');
  }

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  let response: Response | null = null;
  let attempt = 0;
  const maxAttempts = 3;

  const requestBody = JSON.stringify({
    model: modelId,
    messages: [
      {
        role: 'system',
        content: 'You are a content generation expert. Create platform-specific social media posts that are unique and optimized for each platform. Always return valid JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" }
  });

  while (attempt < maxAttempts) {
    attempt++;
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      if (response.ok) {
        break;
      }

      const errorText = await response.text();
      console.error(`Groq API error (attempt ${attempt}):`, response.status, errorText);

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (response.status >= 500 && attempt < maxAttempts) {
        const backoffMs = 500 * Math.pow(2, attempt - 1);
        console.warn(`Retrying Groq request in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await sleep(backoffMs);
        continue;
      }

      throw new Error(`Groq API error: ${response.status}`);
    } catch (err) {
      console.error(`Groq request failed on attempt ${attempt}:`, err);
      if (attempt < maxAttempts) {
        const backoffMs = 500 * Math.pow(2, attempt - 1);
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }

  if (!response) {
    throw new Error('No response received from Groq API');
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from Groq API');
  }

  return data.choices[0].message.content;
}