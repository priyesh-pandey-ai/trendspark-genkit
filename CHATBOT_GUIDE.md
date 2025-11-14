# 🤖 TrendSpark AI Chatbot - Complete Guide

## Overview

TrendSpark AI is an intelligent chatbot assistant integrated throughout the platform. It helps users create content, analyze trends, optimize brand voice, and automate social media workflows using advanced AI models.

---

## Features

### ✨ **Content Generation**
- Write posts for any platform (Twitter, LinkedIn, Instagram, Facebook, TikTok)
- Generate hooks, captions, hashtags
- Create content variations for A/B testing
- Adapt content between platforms

**Example Prompts:**
- "Write a LinkedIn post about AI automation"
- "Generate 5 Instagram captions for a coffee brand"
- "Create a Twitter thread explaining blockchain"
- "Adapt this post for TikTok"

### 🎨 **Brand Voice Assistant**
- Review content for brand consistency
- Answer questions about brand tone and style
- Suggest vocabulary improvements
- Check compliance with brand guidelines

**Example Prompts:**
- "Does this match my brand voice?"
- "Make this sound more professional"
- "What words should I avoid?"
- "Review my brand voice card"

### 📊 **Trend Discovery**
- Explain trending topics
- Find trends matching your niche
- Generate content ideas from trends
- Analyze trend relevance

**Example Prompts:**
- "What's trending in technology?"
- "Explain the AI agents trend"
- "Find trends for a coffee brand"
- "Give me 10 ideas based on current trends"

### 📈 **Analytics & Strategy**
- Analyze post performance
- Provide strategy recommendations
- Suggest posting times
- Generate content calendars

**Example Prompts:**
- "Why did this post perform well?"
- "When should I post for maximum engagement?"
- "Create a 30-day content plan"
- "How can I improve my reach?"

### 🔬 **Research Assistant**
- Find statistics and data
- Research topics
- Discover audience insights
- Locate credible sources

**Example Prompts:**
- "Find statistics about social media usage"
- "Research best practices for LinkedIn"
- "What does my audience care about?"
- "Find sources for this claim"

### ⚡ **Workflow Automation**
- Schedule posts
- Generate CSV files
- Bulk operations
- Quick actions

**Example Prompts:**
- "Schedule this for tomorrow 9am"
- "Create a content calendar CSV"
- "Post this to Twitter now"
- "Generate report for this week"

---

## Using the Chatbot

### **Opening the Chat**
Click the floating 💬 button in the bottom-right corner of any page (except Landing/Auth).

### **Quick Start**
When you open the chat for the first time, you'll see suggested prompts:
- Click any suggestion to start a conversation
- Or type your own question

### **Slash Commands**
Type `/` to see available commands:

| Command | Description | Example |
|---------|-------------|---------|
| `/generate` | Generate content | `/generate LinkedIn post about AI` |
| `/analyze` | Analyze performance | `/analyze top posts` |
| `/schedule` | Schedule posts | `/schedule post for tomorrow` |
| `/trends` | Discover trends | `/trends in technology` |
| `/voice` | Brand voice check | `/voice check this caption` |
| `/research` | Research topics | `/research social media stats` |
| `/export` | Export data | `/export content calendar` |
| `/help` | Show help | `/help` |

### **Context Awareness**
The chatbot automatically knows:
- Your current brand and voice card
- Recent trending topics
- Your recent content performance
- Your platform preferences

This means you can ask contextual questions like:
- "Generate a post in my brand voice"
- "Which trends match my niche?"
- "Analyze my recent performance"

---

## Advanced Features

### **Multi-Turn Conversations**
The chatbot remembers context within a conversation:
```
You: "Write a LinkedIn post about AI"
Bot: [generates post]
You: "Make it shorter"
Bot: [shortens the post]
You: "Add 3 hashtags"
Bot: [adds hashtags]
```

### **Model Selection**
The chatbot uses **Groq Llama 3.3 70B** by default for:
- ⚡ Ultra-fast responses (sub-second)
- 🎯 High quality output
- 💰 Cost-effective ($0.0002/1K tokens)

You can configure different models in the code.

### **Quick Actions**
After certain responses, the chatbot suggests actions:
- 📅 **Schedule Post** - After generating content
- ✏️ **Edit in Library** - Open content editor
- 📊 **View All Trends** - Navigate to trends page
- 📥 **Export Report** - Download analytics

### **Chat History**
- All conversations are saved
- Auto-generated titles from first message
- Access past conversations (feature in progress)

---

## UI Controls

### **Chat Window Controls**
- **Minimize** (−) - Collapse chat to title bar
- **Maximize** (□) - Expand to full view
- **Close** (×) - Hide chat (click button to reopen)
- **Clear Chat** - Start new conversation

### **Input Options**
- **Type & Enter** - Send message
- **Shift+Enter** - New line (multi-line messages)
- **/** - Show slash commands
- **Clear button** - Reset conversation

---

## Technical Details

### **Database Tables**

#### `chat_messages`
Stores all chat messages with:
- User and assistant messages
- Model used, tokens, cost
- Feature type detection
- Brand context

#### `conversations`
Tracks chat sessions with:
- Auto-generated titles
- Last message timestamp
- Archive capability

### **Edge Function**
`/chatbot` endpoint handles:
- Multi-model routing (Groq, Gemini)
- Context building from user data
- Feature type detection
- Action suggestion generation

### **Security**
- **RLS Policies**: Users only see their own chats
- **API Keys**: Stored as Supabase secrets
- **User Isolation**: All data scoped to user_id

---

## Model Comparison

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| **Llama 3.3 70B** (default) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $0.0002/1K | Balanced, fast |
| Llama 3.1 8B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | $0.0001/1K | Quick responses |
| Mixtral 8x7B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $0.00024/1K | Complex tasks |
| Gemini 2.0 Flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Free | Testing, demos |
| Gemini 1.5 Pro | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $0.0075/1K | Premium quality |

---

## Deployment Steps

### 1. **Run Migration**
```sql
-- Execute in Supabase SQL Editor
-- File: supabase/migrations/20251114000000_add_chatbot_tables.sql
```

### 2. **Deploy Edge Function**
```powershell
npx supabase functions deploy chatbot --project-ref azrbnenohawcdawnxzat
```

### 3. **Set API Keys** (if not already set)
Via Supabase Dashboard → Settings → Functions → Secrets:
- `GROQ_API_KEY`
- `GEMINI_API_KEY`

### 4. **Test**
- Open app → Dashboard
- Click chat button
- Send test message
- Verify response

---

## Usage Examples

### **Example 1: Content Generation**
```
User: "Generate a LinkedIn post about the future of AI agents"

Bot: Here's a LinkedIn post for you:

🤖 The Future of AI Agents is Here

AI agents are revolutionizing how we work. Unlike traditional AI that waits for commands, agents can:
• Plan and execute multi-step tasks
• Learn from context and adapt
• Collaborate with humans seamlessly

We're moving from "AI as a tool" to "AI as a teammate."

What do you think? Are you ready for autonomous AI agents in your workflow?

#AIAgents #ArtificialIntelligence #FutureOfWork

[Quick Actions: Schedule Post | Edit in Library]
```

### **Example 2: Brand Voice Check**
```
User: "Does this match my brand voice? 'Hey guys! Check out our sick new features!'"

Bot: Based on your brand voice card (professional, data-driven, B2B SaaS), this doesn't quite match:

❌ "Hey guys" - Too casual for B2B audience
❌ "sick" - Slang doesn't fit professional tone
✅ Good: Enthusiasm and directness

Suggested rewrite:
"Excited to share our latest features designed to boost your team's productivity."

This maintains enthusiasm while staying professional and benefit-focused.
```

### **Example 3: Trend Analysis**
```
User: "/trends in marketing this week"

Bot: Here are the top 5 trending topics in marketing this week:

1. **AI-Powered Personalization** (🔥 High)
   - Brands using AI to customize user experiences
   - 127% increase in mentions

2. **Short-Form Video Dominance** (📈 Growing)
   - TikTok, Reels, Shorts driving engagement
   - Content under 60 seconds performing best

3. **Zero-Click Content** (🆕 Emerging)
   - Providing value without requiring clicks
   - Builds trust and reach

4. **Community-Led Growth** (⭐ Stable)
   - Building engaged communities vs. large audiences
   - Discord, Slack communities thriving

5. **Ethical AI Marketing** (🌱 New)
   - Transparency in AI usage
   - Privacy-first approaches

Want me to generate content ideas for any of these?

[Quick Actions: Generate Post | View All Trends]
```

---

## Troubleshooting

### **Chatbot Not Responding**
1. Check Supabase function logs
2. Verify API keys are set (Dashboard → Secrets)
3. Check browser console for errors
4. Try refreshing the page

### **"API Key Not Configured"**
- Set `GROQ_API_KEY` in Supabase secrets
- Redeploy the chatbot function

### **Slow Responses**
- Switch to faster model (Llama 8B)
- Check network connection
- Verify function logs for delays

### **Context Not Loading**
- Ensure user is logged in
- Check brands/trends/content exist
- Verify database permissions (RLS)

---

## Cost Management

### **Typical Usage Costs**
- **10 conversations/day**: ~$0.01/day
- **100 conversations/day**: ~$0.10/day
- **1000 conversations/day**: ~$1.00/day

### **Cost Optimization**
1. Use free Gemini 2.0 Flash for testing
2. Switch to Llama 8B for simple queries
3. Use Llama 70B for complex reasoning
4. Monitor tokens via metadata

---

## Future Enhancements

🚧 **Coming Soon:**
- [ ] Voice input/output
- [ ] Image analysis in chat
- [ ] Conversation search
- [ ] Saved prompts/templates
- [ ] Team chat (share conversations)
- [ ] Chat analytics dashboard
- [ ] Mobile-optimized chat
- [ ] Export conversations
- [ ] Custom model selection per chat

---

## Support

**Need Help?**
- Check Supabase function logs
- Review browser console
- Check `CHAT_COMMANDS` in code
- Test with `/help` command

**Found a Bug?**
- Check error logs
- Verify API keys
- Test with simple prompts first
- Report with conversation context

---

**Version**: 1.0  
**Last Updated**: November 14, 2025  
**Models**: Groq Llama 3.3 70B (default), Gemini 2.0 Flash, others configurable
