# Quick Deployment Guide - Manual Database Migration

Since the CLI is having connection issues, apply the migration manually via Supabase Dashboard:

## Step 1: Open SQL Editor

1. Go to: https://supabase.com/dashboard/project/azrbnenohawcdawnxzat/sql/new
2. Click "New Query"

## Step 2: Paste and Execute Migration

Copy this SQL and paste into the editor:

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chat_messages table for chatbot conversations
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    model_used TEXT,
    feature_type TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10, 6) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create conversations table to track chat sessions
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    archived BOOLEAN DEFAULT false,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- RLS Policies for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat messages"
    ON public.chat_messages
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
    ON public.chat_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
    ON public.chat_messages
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
    ON public.conversations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
    ON public.conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON public.conversations
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON public.conversations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON public.chat_messages;
CREATE TRIGGER update_conversation_timestamp_trigger
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_timestamp();

-- Function to auto-generate conversation title from first message
CREATE OR REPLACE FUNCTION public.generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
    first_message TEXT;
    new_title TEXT;
BEGIN
    -- Only generate title if it's the first user message and conversation has no title
    IF NEW.role = 'user' THEN
        SELECT title INTO new_title FROM public.conversations WHERE id = NEW.conversation_id;
        
        IF new_title IS NULL OR new_title = '' THEN
            -- Generate title from first 50 characters of message
            new_title := substring(NEW.content from 1 for 50);
            IF length(NEW.content) > 50 THEN
                new_title := new_title || '...';
            END IF;
            
            UPDATE public.conversations
            SET title = new_title
            WHERE id = NEW.conversation_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate conversation title
DROP TRIGGER IF EXISTS generate_conversation_title_trigger ON public.chat_messages;
CREATE TRIGGER generate_conversation_title_trigger
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_conversation_title();
```

## Step 3: Click "Run" (or press Ctrl+Enter)

You should see success messages for each statement.

## Step 4: Verify Tables Created

Run this query to confirm:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages', 'conversations');
```

Should return 2 rows.

## Step 5: Test Chatbot

1. Dev server is already running at: http://localhost:8081/
2. Open the app in your browser
3. Login to your account
4. Click the chatbot button (bottom-right)
5. Send a test message: "Generate a LinkedIn post about AI"

---

## Deployment Status

✅ **Edge Function Deployed**: chatbot function is live  
⏳ **Database Migration**: Apply SQL manually via dashboard (above)  
✅ **Dev Server Running**: http://localhost:8081/  
📋 **Next**: Test the chatbot!

---

## If You Get Errors

### "GROQ_API_KEY not configured"
- Go to: https://supabase.com/dashboard/project/azrbnenohawcdawnxzat/settings/functions
- Add secret: `GROQ_API_KEY` = your Groq API key

### "Cannot read properties of undefined"
- Make sure you're logged in
- Ensure you have at least one brand created
- Check browser console for specific errors

### "Failed to fetch"
- Check edge function logs: https://supabase.com/dashboard/project/azrbnenohawcdawnxzat/functions/chatbot/logs
- Verify GROQ_API_KEY is set in secrets

---

**Pro Tip**: After running the migration, refresh your browser to ensure the latest code is loaded!
