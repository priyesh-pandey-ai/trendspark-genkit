import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      conversationId, 
      context, 
      modelId = 'llama-3.3-70b-versatile',
      temperature = 0.7,
      maxTokens = 2048
    } = await req.json();

    console.log('Chat request:', { message, modelId, hasContext: !!context });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Detect feature type from message
    const featureType = detectFeatureType(message);

    // Get conversation history if conversationId provided
    let conversationHistory: any[] = [];
    if (conversationId) {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(20);
      
      conversationHistory = messages || [];
    }

    // Generate response using selected model
    let response: string;
    let tokensUsed = 0;
    let modelUsed = modelId;

    if (modelId.includes('llama') || modelId.includes('mixtral')) {
      const result = await generateWithGroq(
        modelId, 
        systemPrompt, 
        message, 
        conversationHistory,
        temperature,
        maxTokens
      );
      response = result.content;
      tokensUsed = result.tokens;
    } else {
      const result = await generateWithGemini(
        modelId,
        systemPrompt,
        message,
        conversationHistory,
        temperature,
        maxTokens
      );
      response = result.content;
      tokensUsed = result.tokens;
    }

    // Detect and extract suggested actions
    const suggestedActions = extractSuggestedActions(response, featureType);

    // Calculate cost estimate
    const costPer1kTokens = modelId.includes('gemini-2.0-flash') ? 0 : 0.0002;
    const cost = (tokensUsed / 1000) * costPer1kTokens;

    // Generate IDs
    const messageId = crypto.randomUUID();
    const newConversationId = conversationId || crypto.randomUUID();

    // Save message to database
    if (context.userId) {
      await supabase.from('chat_messages').insert([
        {
          id: crypto.randomUUID(),
          conversation_id: newConversationId,
          user_id: context.userId,
          role: 'user',
          content: message,
          brand_id: context.brandId,
        },
        {
          id: messageId,
          conversation_id: newConversationId,
          user_id: context.userId,
          role: 'assistant',
          content: response,
          model_used: modelUsed,
          feature_type: featureType,
          tokens_used: tokensUsed,
          cost_estimate: cost,
          brand_id: context.brandId,
        }
      ]);
    }

    return new Response(
      JSON.stringify({
        message: response,
        messageId,
        conversationId: newConversationId,
        modelUsed,
        featureType,
        suggestedActions,
        metadata: {
          tokens: tokensUsed,
          cost,
          processingTime: 0,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chatbot:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Build context-aware system prompt
 */
function buildSystemPrompt(context: any): string {
  let prompt = `You are TrendSpark AI, an expert social media content assistant. You help users create engaging content, analyze trends, optimize brand voice, and improve their social media strategy.

Your capabilities:
- Generate content for Twitter, LinkedIn, Instagram, Facebook, TikTok
- Analyze trends and provide insights
- Review and improve brand voice consistency
- Provide content strategy recommendations
- Research topics and find data
- Help with scheduling and workflow automation
- Analyze performance metrics

Always be:
- Concise and actionable
- Creative and engaging
- Professional yet friendly
- Data-driven when analyzing
- Brand-conscious when generating content`;

  if (context.currentBrand) {
    prompt += `\n\nCurrent Brand Context:
- Name: ${context.currentBrand.name}
- Niche: ${context.currentBrand.niche}`;
    
    if (context.currentBrand.voiceCard) {
      prompt += `\n- Voice Card: ${context.currentBrand.voiceCard.substring(0, 500)}...`;
    }
  }

  if (context.recentTrends && context.recentTrends.length > 0) {
    prompt += `\n\nRecent Trending Topics:`;
    context.recentTrends.slice(0, 5).forEach((trend: any) => {
      prompt += `\n- ${trend.topic} (${trend.category})`;
    });
  }

  if (context.recentContent && context.recentContent.length > 0) {
    prompt += `\n\nRecent Content Performance:`;
    context.recentContent.slice(0, 3).forEach((content: any) => {
      const perf = content.performance;
      if (perf) {
        prompt += `\n- ${content.platform}: ${content.content.substring(0, 100)}... (Engagement: ${perf.engagement_rate || 0}%)`;
      }
    });
  }

  if (context.preferences) {
    prompt += `\n\nUser Preferences:`;
    if (context.preferences.tone) prompt += `\n- Preferred tone: ${context.preferences.tone}`;
    if (context.preferences.platforms) prompt += `\n- Active platforms: ${context.preferences.platforms.join(', ')}`;
  }

  return prompt;
}

/**
 * Detect feature type from message
 */
function detectFeatureType(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.match(/generate|write|create|draft|compose/)) return 'content-generation';
  if (lower.match(/brand|voice|tone|style|ethos/)) return 'brand-voice';
  if (lower.match(/trend|trending|popular|viral/)) return 'trend-discovery';
  if (lower.match(/strategy|plan|schedule|calendar/)) return 'strategy';
  if (lower.match(/research|find|search|statistics/)) return 'research';
  if (lower.match(/automate|schedule|post|publish/)) return 'automation';
  if (lower.match(/analyze|performance|metrics|engagement/)) return 'analytics';
  if (lower.match(/brainstorm|ideas|creative|meme/)) return 'creative';
  
  return 'general';
}

/**
 * Extract suggested actions from response
 */
function extractSuggestedActions(response: string, featureType: string): any[] {
  const actions: any[] = [];

  // Common actions based on feature type
  if (featureType === 'content-generation') {
    actions.push({
      id: 'schedule',
      label: 'Schedule Post',
      type: 'schedule',
      icon: '📅',
    });
    actions.push({
      id: 'edit',
      label: 'Edit in Library',
      type: 'navigate',
      icon: '✏️',
    });
  }

  if (featureType === 'trend-discovery') {
    actions.push({
      id: 'generate-content',
      label: 'Generate Post',
      type: 'generate',
      icon: '✨',
    });
    actions.push({
      id: 'view-trends',
      label: 'View All Trends',
      type: 'navigate',
      icon: '📊',
    });
  }

  if (featureType === 'analytics') {
    actions.push({
      id: 'export',
      label: 'Export Report',
      type: 'export',
      icon: '📥',
    });
  }

  return actions;
}

/**
 * Generate response using Groq (Llama/Mixtral)
 */
async function generateWithGroq(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  history: any[],
  temperature: number,
  maxTokens: number
): Promise<{ content: string; tokens: number }> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h: any) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  return {
    content: data.choices[0].message.content,
    tokens: data.usage?.total_tokens || 0,
  };
}

/**
 * Generate response using Gemini
 */
async function generateWithGemini(
  modelId: string,
  systemPrompt: string,
  userMessage: string,
  history: any[],
  temperature: number,
  maxTokens: number
): Promise<{ content: string; tokens: number }> {
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Build conversation history for Gemini
  const contents: any[] = [];
  
  // Add system prompt as first user message
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood. I am TrendSpark AI, ready to assist you.' }],
  });

  // Add conversation history
  history.forEach((msg: any) => {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  });

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  
  // Estimate tokens (rough approximation)
  const tokens = Math.ceil((systemPrompt.length + userMessage.length + text.length) / 4);

  return {
    content: text,
    tokens,
  };
}
