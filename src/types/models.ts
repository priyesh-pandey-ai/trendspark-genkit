/**
 * Multi-Model AI Configuration
 * Supports: Google Gemini, Groq Llama, Vertex AI
 */

export type AIModelProvider = "gemini" | "groq" | "vertex-ai";

export interface ModelConfig {
  id: string;
  provider: AIModelProvider;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  maxTokens: number;
  costPer1kTokens: number; // USD
  speedScore: number; // 1-5, higher = faster
  qualityScore: number; // 1-5, higher = better
  capabilities: {
    textGeneration: boolean;
    imageAnalysis: boolean;
    codeGeneration: boolean;
  };
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Google Gemini Models
  "gemini-2.0-flash-lite": {
    id: "gemini-2.0-flash-lite",
    provider: "gemini",
    name: "gemini-2.0-flash-lite",
    displayName: "Google Gemini 2.0 Flash Lite",
    description: "Fast, efficient production model ideal for brand voice generation. Free tier available.",
    icon: "🔵",
    maxTokens: 4096,
    costPer1kTokens: 0,
    speedScore: 5,
    qualityScore: 4,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },
  "gemini-1.5-flash": {
    id: "gemini-1.5-flash",
    provider: "gemini",
    name: "gemini-1.5-flash",
    displayName: "Google Gemini 1.5 Flash",
    description: "Stable production model. Free tier available.",
    icon: "🔵",
    maxTokens: 4096,
    costPer1kTokens: 0,
    speedScore: 5,
    qualityScore: 4,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },
  "gemini-2.0-flash-exp": {
    id: "gemini-2.0-flash-exp",
    provider: "gemini",
    name: "gemini-2.0-flash-exp",
    displayName: "Google Gemini 2.0 Flash (Experimental)",
    description: "Experimental 2.0 model with latest features. May have different behavior. Free tier available.",
    icon: "🔵",
    maxTokens: 4096,
    costPer1kTokens: 0,
    speedScore: 5,
    qualityScore: 4,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    provider: "gemini",
    name: "gemini-1.5-pro",
    displayName: "Google Gemini 1.5 Pro",
    description: "High quality model with extended context. Paid tier.",
    icon: "🔵",
    maxTokens: 8000,
    costPer1kTokens: 0.0075,
    speedScore: 4,
    qualityScore: 5,
    capabilities: {
      textGeneration: true,
      imageAnalysis: true,
      codeGeneration: true,
    },
  },

  // Groq Llama Models
  "llama-3.3-70b-versatile": {
    id: "llama-3.3-70b-versatile",
    provider: "groq",
    name: "llama-3.3-70b-versatile",
    displayName: "Groq Llama 3.3 70B",
    description: "Powerful open-source model via Groq. Extremely fast inference.",
    icon: "🦙",
    maxTokens: 8000,
    costPer1kTokens: 0.0002,
    speedScore: 5,
    qualityScore: 4,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },
  "llama-3.1-8b-instant": {
    id: "llama-3.1-8b-instant",
    provider: "groq",
    name: "llama-3.1-8b-instant",
    displayName: "Groq Llama 3.1 8B",
    description: "Fast, lightweight model. Great for quick responses.",
    icon: "🦙",
    maxTokens: 8000,
    costPer1kTokens: 0.0001,
    speedScore: 5,
    qualityScore: 3,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },
  "mixtral-8x7b-32768": {
    id: "mixtral-8x7b-32768",
    provider: "groq",
    name: "mixtral-8x7b-32768",
    displayName: "Groq Mixtral 8x7B",
    description: "Mixture of experts model. Balanced speed and quality.",
    icon: "🦙",
    maxTokens: 32768,
    costPer1kTokens: 0.00024,
    speedScore: 5,
    qualityScore: 4,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },

  // Vertex AI Models
  "text-bison-32k": {
    id: "text-bison-32k",
    provider: "vertex-ai",
    name: "text-bison-32k",
    displayName: "Vertex AI Bison (32K)",
    description: "Google's PaLM model via Vertex AI. Enterprise-grade.",
    icon: "🌳",
    maxTokens: 32000,
    costPer1kTokens: 0.001,
    speedScore: 3,
    qualityScore: 4,
    capabilities: {
      textGeneration: true,
      imageAnalysis: false,
      codeGeneration: true,
    },
  },
  "gemini-pro": {
    id: "gemini-pro-vertex",
    provider: "vertex-ai",
    name: "gemini-pro",
    displayName: "Vertex AI Gemini Pro",
    description: "Gemini model via Vertex AI. Enterprise deployment.",
    icon: "🌳",
    maxTokens: 4096,
    costPer1kTokens: 0.0005,
    speedScore: 4,
    qualityScore: 5,
    capabilities: {
      textGeneration: true,
      imageAnalysis: true,
      codeGeneration: true,
    },
  },
};

export interface ModelRequest {
  modelId: string;
  provider: AIModelProvider;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ModelResponse {
  modelId: string;
  provider: AIModelProvider;
  text: string;
  tokensUsed: number;
  costEstimate: number;
}

export interface UserModelPreferences {
  userId: string;
  preferredModel: string;
  fallbackModels: string[];
  costLimit?: number; // USD per month
  updatedAt: string;
}
