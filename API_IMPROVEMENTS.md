# API Functionality Improvements

This document summarizes the API improvements made to ensure proper functionality across all edge functions.

## Changes Summary

### 1. Multi-Provider Support for Content Generation

#### generate-content-kit Edge Function
**Before:** Only supported Google Gemini API
**After:** Supports both Google Gemini and Groq (Llama/Mixtral) APIs

**Changes:**
- Added `modelId` parameter (defaults to `gemini-2.0-flash-lite`)
- Implemented `generateWithGemini()` function with:
  - Retry logic (3 attempts with exponential backoff)
  - Comprehensive error handling
  - Safety filter detection
  - Rate limit handling
  
- Implemented `generateWithGroq()` function with:
  - Retry logic (3 attempts with exponential backoff)
  - Comprehensive error handling
  - JSON response format enforcement
  - Rate limit handling

**Usage:**
```typescript
// Gemini models
const result = await generateContentKit({
  modelId: 'gemini-2.0-flash-lite',  // or 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'
  voiceCard,
  trendTitle,
  platforms,
  niche
});

// Groq models
const result = await generateContentKit({
  modelId: 'llama-3.3-70b-versatile',  // or 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'
  voiceCard,
  trendTitle,
  platforms,
  niche
});
```

### 2. Gemini API Model Updates

**Problem:** The code was using `gemini-2.0-flash-exp` (experimental) as the default model, which may have:
- Unstable behavior
- Different capabilities than documented
- Potential deprecation

**Solution:** Changed default to `gemini-2.0-flash-lite` (production-ready)

**Files Updated:**
- `supabase/functions/generate-content-kit/index.ts`
- `supabase/functions/generate-voice-card/index.ts`
- `src/lib/geminiApi.ts`
- `src/types/models.ts`

**Model Priority:**
1. **Default (Production):** `gemini-2.0-flash-lite` - Fast, free, production-ready
2. **Stable Alternative:** `gemini-1.5-flash` - Stable, free
3. **High Quality:** `gemini-1.5-pro` - Best quality, paid tier
4. **Experimental:** `gemini-2.0-flash-exp` - Latest features, may be unstable

### 3. Pollinations.ai API Updates

**Problem:** Using potentially deprecated `enhance=true` parameter

**Solution:** Updated to modern API format with explicit model selection

**Before:**
```typescript
const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true`;
```

**After:**
```typescript
const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux`;
```

**Benefits:**
- Uses modern Flux model for better image quality
- More predictable results
- Follows current API best practices

### 4. Documentation Updates

Updated `MULTI_MODEL_SETUP.md` to reflect:
- `gemini-2.0-flash-lite` as the recommended default model
- `gemini-1.5-flash` available as stable alternative
- `gemini-2.0-flash-exp` available as experimental option
- Updated comparison tables and usage recommendations

## API Keys Required

### For Supabase Edge Functions
Set these secrets via Supabase Dashboard or CLI:

```bash
# Gemini API (required for default model)
GEMINI_API_KEY=your-gemini-api-key

# Groq API (optional, for Llama/Mixtral models)
GROQ_API_KEY=your-groq-api-key
```

### For Client-Side (Browser)
Set these in `.env` file:

```bash
# Gemini API (for client-side trend discovery)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Error Handling Improvements

All API functions now include:
1. **Retry Logic:** 3 attempts with exponential backoff (500ms, 1000ms, 2000ms)
2. **Rate Limit Detection:** Specific error messages for 429 responses
3. **Server Error Handling:** Automatic retry for 5xx errors
4. **Safety Filters:** Detection and user-friendly error messages
5. **Validation:** Response structure validation before parsing

## Testing Recommendations

### 1. Test Gemini API
```bash
# Using curl to test the edge function
curl -X POST https://your-project.supabase.co/functions/v1/generate-content-kit \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "gemini-2.0-flash-lite",
    "voiceCard": "Test voice card",
    "trendTitle": "AI Revolution",
    "platforms": ["Instagram", "LinkedIn"],
    "niche": "Technology"
  }'
```

### 2. Test Groq API
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-content-kit \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "modelId": "llama-3.3-70b-versatile",
    "voiceCard": "Test voice card",
    "trendTitle": "AI Revolution",
    "platforms": ["Instagram", "LinkedIn"],
    "niche": "Technology"
  }'
```

### 3. Test Pollinations.ai
```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-content-image \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "hook": "Transform your business with AI",
    "body": "Discover cutting-edge AI tools",
    "trendTitle": "AI Revolution",
    "platform": "Instagram",
    "niche": "Technology"
  }'
```

## Backward Compatibility

All changes are **backward compatible**:
- Default model changed but old model still available
- `modelId` parameter is optional (defaults to stable model)
- Existing API calls will continue to work
- No breaking changes to response format

## Performance Impact

- **Groq Models:** Typically 2-5x faster than Gemini
- **Retry Logic:** May add 500ms-2000ms delay on failures
- **Image Generation:** No performance impact (URL-based)

## Security Considerations

1. **API Keys:** All API keys stored as environment variables/secrets
2. **Error Messages:** Don't expose API keys in error messages
3. **Rate Limiting:** Proper handling to avoid excessive API calls
4. **Input Validation:** Prompts are validated before sending to APIs

## Migration Guide

### If you were using gemini-2.0-flash-exp
No action required - it's still available. To continue using it:
```typescript
const result = await generateContentKit({
  modelId: 'gemini-2.0-flash-exp',  // Explicitly specify
  // ... other params
});
```

### To use Groq models
1. Get API key from https://console.groq.com
2. Add to Supabase secrets: `GROQ_API_KEY`
3. Use in API calls:
```typescript
const result = await generateContentKit({
  modelId: 'llama-3.3-70b-versatile',
  // ... other params
});
```

## Future Enhancements

Potential improvements for future iterations:
1. Automatic fallback chain (Groq → Gemini → fallback)
2. Model performance monitoring and analytics
3. Cost tracking per model
4. A/B testing different models
5. Custom model fine-tuning support
