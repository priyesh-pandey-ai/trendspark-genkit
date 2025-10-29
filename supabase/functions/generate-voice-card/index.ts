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
    const { samplePosts, niche } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured. Get a free key at https://ai.google.dev');
    }

    console.log('Generating voice card for niche:', niche);

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

    // Use Google Gemini API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a brand voice expert. Create clear, actionable brand voice guidelines.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
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
      
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if response was blocked by safety filters
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', JSON.stringify(data));
      throw new Error('Voice card generation was blocked. Please try different sample posts or adjust your input.');
    }

    const voiceCard = data.candidates[0].content.parts[0].text;

    // Validate that we got a meaningful response
    if (!voiceCard || voiceCard.trim().length < 50) {
      throw new Error('Generated voice card is too short. Please try again with more detailed sample posts.');
    }

    console.log('Voice card generated successfully, length:', voiceCard.length);

    return new Response(
      JSON.stringify({ voiceCard }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-voice-card:', error);
    
    // Provide more specific error messages
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