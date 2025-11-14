# Multi-Model AI Integration Guide

## Overview

TrendSpark now supports **3 AI model providers** with **6+ models** for flexible brand voice generation:

### Supported Providers & Models

#### 🔵 **Google Gemini** (Free tier available)
- `gemini-1.5-flash` - Fast, efficient, free (default, production-ready)
- `gemini-1.5-pro` - High quality, paid tier
- `gemini-2.0-flash-exp` - Experimental 2.0 features (may have different behavior)

#### 🦙 **Groq Llama** (Ultra-fast inference)
- `llama-3.1-70b-versatile` - Powerful, 70B parameters
- `llama-3.1-8b-instant` - Lightweight, fast
- `mixtral-8x7b-32768` - Mixture of experts, balanced

#### 🌳 **Vertex AI** (Google Cloud enterprise)
- `gemini-pro` - Gemini via Vertex AI
- `text-bison-32k` - PaLM model

---

## Setup Instructions

### 1. Get API Keys

#### **Google Gemini API Key** (Free)
```bash
# Visit: https://aistudio.google.com/apikey
# Click "Get API Key" → Create new API key
# Copy the key
```

#### **Groq API Key** (Fast, low-cost)
```bash
# Visit: https://console.groq.com
# Sign up or log in
# Navigate to "API Keys"
# Create new API key
# Copy the key
```

#### **Vertex AI** (Optional, requires GCP)
```bash
# Visit: https://console.cloud.google.com
# Enable Vertex AI API
# Create service account with Vertex AI access
# Download JSON credentials
```

---

### 2. Configure Environment Variables

Update `.env` file in project root:

```dotenv
# Gemini API Key (free, required for default model)
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Groq API Key (for Llama/Mixtral models)
VITE_GROQ_API_KEY=your-groq-api-key-here

# Vertex AI (optional, for enterprise deployments)
VITE_VERTEX_AI_PROJECT_ID=your-gcp-project-id
VITE_VERTEX_AI_REGION=us-central1
```

---

### 3. Configure Supabase Edge Function Secrets

The edge functions also need API keys for server-side calls:

#### Via Supabase Dashboard:
1. Go to: `https://supabase.com/dashboard/project/azrbnenohawcdawnxzat/settings/functions`
2. Click "Secrets" tab
3. Add new secrets:
   - `GEMINI_API_KEY` → your-gemini-api-key
   - `GROQ_API_KEY` → your-groq-api-key

#### Via CLI:
```bash
npx supabase secrets set GEMINI_API_KEY=your-key
npx supabase secrets set GROQ_API_KEY=your-key
```

---

## Usage

### Creating a Brand with Model Selection

1. **Dashboard** → **Create Brand**
2. **Step 1: Basic Information**
   - Enter brand name and niche
   - **Select AI Model** from dropdown
   - View model details: speed, quality, cost, capabilities
3. **Step 2: Sample Posts**
   - Provide 2 sample posts
   - Click **Create Brand**

### Model Selection Tips

| Use Case | Recommended Model | Reason |
|----------|-------------------|--------|
| **Quick testing** | Gemini 1.5 Flash | Free, fast, production-ready |
| **High quality** | Gemini 1.5 Pro | Best quality, context-aware |
| **Speed & cost** | Groq Llama 3.1 8B | Ultra-fast, cheap |
| **Complex content** | Groq Llama 3.1 70B | More powerful |
| **Experimental** | Gemini 2.0 Flash Exp | Latest features, may be unstable |
| **Enterprise** | Vertex AI Gemini Pro | GCP integration, SLA |

---

## Model Comparison

### Performance Metrics

```
┌─────────────────────────┬───────┬─────────┬────────────┬──────────┐
│ Model                   │ Speed │ Quality │ Cost (1K)  │ Max Tokens│
├─────────────────────────┼───────┼─────────┼────────────┼──────────┤
│ Gemini 1.5 Flash        │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐  │ Free       │ 4K       │
│ Gemini 2.0 Flash (Exp)  │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐  │ Free       │ 4K       │
│ Gemini 1.5 Pro          │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐⭐ │ $0.0075    │ 8K       │
│ Groq Llama 3.1 70B      │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐  │ $0.0002    │ 8K       │
│ Groq Llama 3.1 8B       │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐   │ $0.0001    │ 8K       │
│ Groq Mixtral 8x7B       │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐  │ $0.00024   │ 32K      │
│ Vertex AI Gemini Pro    │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐⭐ │ $0.0005    │ 4K       │
└─────────────────────────┴───────┴─────────┴────────────┴──────────┘
```

---

## Cost Estimation

### Example Costs for Voice Card Generation

Assuming **~1000 tokens** per voice card:

| Model | Cost per Voice Card | Cost for 100 Cards |
|-------|----------------------|--------------------|
| Gemini 1.5 Flash | **Free** | **Free** |
| Gemini 2.0 Flash Exp | **Free** | **Free** |
| Gemini 1.5 Pro | $0.0075 | $0.75 |
| Groq Llama 70B | $0.0002 | $0.02 |
| Groq Llama 8B | $0.0001 | $0.01 |
| Groq Mixtral | $0.00024 | $0.024 |

---

## Fallback Strategy

If a model fails (rate limited, down, etc.):

1. **Default behavior**: Uses selected model with **3 retries** (exponential backoff)
2. **Manual fallback**: Switch model and retry
3. **Future enhancement**: Automatic fallback chain (e.g., Gemini Pro → Groq Llama → Gemini Flash)

---

## Troubleshooting

### "API Key Not Configured"
- ✅ Check `.env` file has the key
- ✅ Verify key format (starts with `AIzaSy...` for Gemini, etc.)
- ✅ For edge functions, check Supabase Dashboard → Secrets

### "Rate Limit Exceeded"
- ⏳ Wait 5-10 minutes
- 🔄 Switch to different model
- 💰 Upgrade API tier (increase quota)

### "503 Service Unavailable"
- Automatic retry (up to 3 times with backoff)
- Check provider status page
- Try again in a few minutes

### "Model Not Found"
- Verify model name in dropdown
- Check Groq/Gemini API for latest model names
- Update `src/types/models.ts` if new models available

---

## Adding New Models

To add a new model (e.g., Claude, Cohere):

### 1. Update `src/types/models.ts`:
```typescript
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // ... existing models
  "claude-3-opus": {
    id: "claude-3-opus",
    provider: "anthropic",
    name: "claude-3-opus",
    displayName: "Claude 3 Opus",
    description: "Highest capability model from Anthropic",
    icon: "🤖",
    maxTokens: 4096,
    costPer1kTokens: 0.015,
    speedScore: 3,
    qualityScore: 5,
    capabilities: {
      textGeneration: true,
      imageAnalysis: true,
      codeGeneration: true,
    },
  },
};
```

### 2. Update `src/lib/multiModelApi.ts`:
```typescript
async function callAnthropicModel(request: ModelRequest): Promise<ModelResponse> {
  // Implement Anthropic API call
}
```

### 3. Update `supabase/functions/generate-voice-card/index.ts`:
```typescript
if (modelId.includes('claude')) {
  voiceCard = await generateWithAnthropic(modelId, prompt);
}
```

---

## Performance Recommendations

### For Best Speed
- Use **Groq Llama 3.1 8B** (fastest inference)
- Good for: Quick iterations, testing, high-volume content generation

### For Best Quality
- Use **Gemini 1.5 Pro** or **Vertex AI Gemini Pro**
- Good for: Brand voice that needs to be perfect, premium clients

### For Best Cost
- Use **Gemini 1.5 Flash** (free tier, production-ready)
- Good for: Testing, demos, low-budget projects, production use

### Balanced Choice
- Use **Groq Llama 3.1 70B**
- Good for: Production use, balances speed/quality/cost

---

## API Rate Limits

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| **Gemini** | 60 req/min | 1500 req/min |
| **Groq** | Unlimited | Unlimited |
| **Vertex AI** | Per quota | Per quota |

---

## Next Steps

1. ✅ Get API keys from each provider
2. ✅ Add keys to `.env` file
3. ✅ Set keys in Supabase Dashboard → Secrets
4. ✅ Create a test brand with each model
5. ✅ Monitor costs and performance
6. ✅ Configure preferred model in user settings (future feature)

---

## Support & Resources

- **Gemini**: https://ai.google.dev
- **Groq**: https://console.groq.com
- **Vertex AI**: https://cloud.google.com/vertex-ai
- **TrendSpark Docs**: Check README.md

