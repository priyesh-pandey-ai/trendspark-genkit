/**
 * Chatbot Types and Interfaces
 */

export type ChatRole = "user" | "assistant" | "system";
export type ChatFeatureType = 
  | "content-generation"
  | "brand-voice"
  | "trend-discovery"
  | "strategy"
  | "research"
  | "automation"
  | "analytics"
  | "creative";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  modelUsed?: string;
  featureType?: ChatFeatureType;
  metadata?: {
    brandId?: string;
    trendId?: string;
    contentKitId?: string;
    tokens?: number;
    cost?: number;
  };
}

export interface ChatContext {
  userId: string;
  brandId?: string;
  currentBrand?: {
    id: string;
    name: string;
    niche: string;
    voiceCard?: string;
  };
  recentTrends?: Array<{
    id: string;
    topic: string;
    category: string;
  }>;
  recentContent?: Array<{
    id: string;
    content: string;
    platform: string;
    performance?: {
      likes?: number;
      shares?: number;
      engagement_rate?: number;
    };
  }>;
  preferences?: {
    preferredModel?: string;
    tone?: string;
    platforms?: string[];
  };
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context: ChatContext;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: string;
  messageId: string;
  conversationId: string;
  modelUsed: string;
  featureType?: ChatFeatureType;
  suggestedActions?: ChatAction[];
  metadata?: {
    tokens: number;
    cost: number;
    processingTime: number;
  };
}

export interface ChatAction {
  id: string;
  label: string;
  type: "generate" | "schedule" | "analyze" | "export" | "navigate";
  icon?: string;
  payload?: any;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface ChatCommand {
  command: string;
  description: string;
  example: string;
  aliases?: string[];
}

export const CHAT_COMMANDS: ChatCommand[] = [
  {
    command: "/generate",
    description: "Generate content for social media",
    example: "/generate LinkedIn post about AI trends",
    aliases: ["/create", "/write"],
  },
  {
    command: "/analyze",
    description: "Analyze trends or performance",
    example: "/analyze my top performing posts",
    aliases: ["/review", "/check"],
  },
  {
    command: "/schedule",
    description: "Schedule posts across platforms",
    example: "/schedule post for tomorrow 9am",
    aliases: ["/plan", "/queue"],
  },
  {
    command: "/trends",
    description: "Discover and explain trending topics",
    example: "/trends in technology this week",
    aliases: ["/discover", "/explore"],
  },
  {
    command: "/voice",
    description: "Get brand voice guidance",
    example: "/voice check this caption",
    aliases: ["/brand", "/tone"],
  },
  {
    command: "/research",
    description: "Research topics and find sources",
    example: "/research statistics about social media",
    aliases: ["/find", "/search"],
  },
  {
    command: "/export",
    description: "Export content as CSV or document",
    example: "/export content calendar for next month",
    aliases: ["/download", "/save"],
  },
  {
    command: "/help",
    description: "Show available commands and features",
    example: "/help",
    aliases: ["/?", "/commands"],
  },
];

export const SUGGESTED_PROMPTS = {
  welcome: [
    "Generate a LinkedIn post about trending AI topics",
    "Analyze my brand voice and suggest improvements",
    "Create a 7-day content calendar",
    "What trends match my niche?",
  ],
  contentGeneration: [
    "Write 3 Instagram captions about [topic]",
    "Generate hooks for a blog post",
    "Create a Twitter thread explaining [concept]",
    "Adapt this post for TikTok",
  ],
  brandVoice: [
    "Does this match my brand voice?",
    "Make this caption more [casual/professional]",
    "What words should I avoid in my brand?",
    "Review my brand voice card",
  ],
  trendDiscovery: [
    "What's trending in [industry] right now?",
    "Explain the [trend name] trend",
    "Find trends related to [topic]",
    "Which trends should I post about?",
  ],
  strategy: [
    "When is the best time to post?",
    "Create a content strategy for [goal]",
    "How can I improve engagement?",
    "Give me A/B testing ideas",
  ],
  analytics: [
    "Why did this post perform well?",
    "Summarize my performance this week",
    "What content type gets the most engagement?",
    "Compare my Twitter vs LinkedIn performance",
  ],
};
