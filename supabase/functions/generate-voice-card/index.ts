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
    const { samplePosts, niche, modelId = 'gemini-2.0-flash-exp' } = await req.json();
    
    console.log('Generating voice card for niche:', niche, 'using model:', modelId);

    const prompt = `Analyze the following brand materials and generate a Voice Card with sections:
- One-line brand ethos (clear, compelling)
- Tone descriptors (5 adjectives)
- Sentence rhythm (short/punchy or long/flowing)
- Vocabulary to prefer/avoid
- Compliance taboos (topics to avoid)
- CTA patterns
- Emoji/hashtag policy

Keep it concise and actionable.

Niche: ${niche}
Sample Posts:
${samplePosts.join('\n\n---\n\n')}

Format the output as clear markdown sections.`;

    // Route to appropriate model provider
    let voiceCard: string;
    
    if (modelId.includes('llama') || modelId.includes('mixtral')) {
      voiceCard = await generateWithGroq(modelId, prompt);
    } else {
      voiceCard = await generateWithGemini(modelId, prompt);
    }

    // Validate that we got a meaningful response
    if (!voiceCard || voiceCard.trim().length < 50) {
      throw new Error('Generated voice card is too short. Please try again with more detailed sample posts.');
    }

    console.log('Voice card generated successfully, length:', voiceCard.length, 'model:', modelId);

    return new Response(
      JSON.stringify({ voiceCard, modelUsed: modelId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-voice-card:', error);
    
    let errorMessage = 'An error occurred while generating the brand voice card.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Generate voice card using Google Gemini API
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
        text: `You are a brand voice expert. Create clear, actionable brand voice guidelines.\n\n${prompt}`
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
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
  
  if (!data.candidates || data.candidates.length === 0) {
    console.error('No candidates in response:', JSON.stringify(data));
    throw new Error('Voice card generation was blocked by safety filters.');
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * Generate voice card using Groq API (Llama/Mixtral)
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
        content: 'You are a brand voice expert. Create clear, actionable brand voice guidelines.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2048,
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