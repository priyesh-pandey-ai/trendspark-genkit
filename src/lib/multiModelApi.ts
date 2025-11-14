/**
 * Multi-Model AI API Integration
 * Handles requests across Gemini, Groq Llama, and Vertex AI
 */

import { MODEL_CONFIGS, ModelRequest, ModelResponse, AIModelProvider } from "@/types/models";

/**
 * Route request to appropriate AI model provider
 */
export async function callAIModel(request: ModelRequest): Promise<ModelResponse> {
  const model = MODEL_CONFIGS[request.modelId];
  if (!model) {
    throw new Error(`Unknown model: ${request.modelId}`);
  }

  try {
    switch (model.provider) {
      case "gemini":
        return await callGeminiModel(request);
      case "groq":
        return await callGroqModel(request);
      case "vertex-ai":
        return await callVertexAIModel(request);
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${model.provider} model ${request.modelId}:`, error);
    throw error;
  }
}

/**
 * Call Google Gemini API
 */
async function callGeminiModel(request: ModelRequest): Promise<ModelResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY not configured");
  }

  const model = MODEL_CONFIGS[request.modelId];
  const maxTokens = request.maxTokens || model.maxTokens;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${request.modelId}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: request.prompt }],
          },
        ],
        generationConfig: {
          temperature: request.temperature || 0.7,
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
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Estimate tokens used (rough approximation)
  const tokensUsed = Math.ceil(text.length / 4);

  return {
    modelId: request.modelId,
    provider: "gemini",
    text,
    tokensUsed,
    costEstimate: (tokensUsed / 1000) * model.costPer1kTokens,
  };
}

/**
 * Call Groq API (Llama, Mixtral)
 */
async function callGroqModel(request: ModelRequest): Promise<ModelResponse> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GROQ_API_KEY not configured");
  }

  const model = MODEL_CONFIGS[request.modelId];
  const maxTokens = request.maxTokens || model.maxTokens;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.name,
      messages: [{ role: "user", content: request.prompt }],
      max_tokens: maxTokens,
      temperature: request.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  const tokensUsed = data.usage?.total_tokens || Math.ceil(text.length / 4);

  return {
    modelId: request.modelId,
    provider: "groq",
    text,
    tokensUsed,
    costEstimate: (tokensUsed / 1000) * model.costPer1kTokens,
  };
}

/**
 * Call Vertex AI API (Google Cloud)
 */
async function callVertexAIModel(request: ModelRequest): Promise<ModelResponse> {
  const projectId = import.meta.env.VITE_VERTEX_AI_PROJECT_ID;
  const region = import.meta.env.VITE_VERTEX_AI_REGION || "us-central1";

  if (!projectId) {
    throw new Error("VITE_VERTEX_AI_PROJECT_ID not configured");
  }

  // Note: Vertex AI requires OAuth token, so this would be better handled via backend/edge function
  // This is a placeholder showing the structure
  const model = MODEL_CONFIGS[request.modelId];

  throw new Error(
    "Vertex AI calls should be routed through an Edge Function for secure token handling. Please use backend integration."
  );
}

/**
 * List all available models with their configs
 */
export function getAvailableModels() {
  return Object.values(MODEL_CONFIGS);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: AIModelProvider) {
  return Object.values(MODEL_CONFIGS).filter((m) => m.provider === provider);
}

/**
 * Get model config by ID
 */
export function getModelConfig(modelId: string) {
  return MODEL_CONFIGS[modelId];
}
