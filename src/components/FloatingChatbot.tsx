import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, ChatContext, SUGGESTED_PROMPTS, CHAT_COMMANDS } from "@/types/chatbot";

interface FloatingChatbotProps {
  context: ChatContext;
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showCommands, setShowCommands] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Load prompt history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatbot_prompt_history');
    if (savedHistory) {
      try {
        setPromptHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load prompt history:', e);
      }
    }
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // Add to prompt history (avoid duplicates)
    if (text && !promptHistory.includes(text)) {
      const newHistory = [text, ...promptHistory].slice(0, 50); // Keep last 50
      setPromptHistory(newHistory);
      localStorage.setItem('chatbot_prompt_history', JSON.stringify(newHistory));
    }
    
    setInput("");
    setHistoryIndex(-1);
    setTempInput("");
    setShowSuggestions(false);
    setShowCommands(false);

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: {
          message: text,
          conversationId,
          context: {
            ...context,
            preferences: {
              preferredModel: 'llama-3.3-70b-versatile', // Fast Groq model
            },
          },
          modelId: 'llama-3.3-70b-versatile',
        },
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: data.messageId,
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        modelUsed: data.modelUsed,
        featureType: data.featureType,
        metadata: data.metadata,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      // Show actions if available
      if (data.suggestedActions && data.suggestedActions.length > 0) {
        toast({
          title: "Quick Actions Available",
          description: `${data.suggestedActions.length} actions suggested`,
        });
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Show commands on /
    if (e.key === "/" && input === "") {
      setShowCommands(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (promptHistory.length === 0) return;
      
      if (historyIndex === -1) {
        setTempInput(input); // Save current input
      }
      
      const newIndex = Math.min(historyIndex + 1, promptHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(promptHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex - 1;
      if (newIndex === -1) {
        setHistoryIndex(-1);
        setInput(tempInput); // Restore original input
      } else {
        setHistoryIndex(newIndex);
        setInput(promptHistory[newIndex]);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId(null);
    setShowSuggestions(true);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg gradient-hero text-white z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed z-50 shadow-2xl transition-all duration-300 ${
        isMinimized
          ? "bottom-6 right-6 w-80 h-16"
          : "bottom-6 right-6 w-96 h-[600px]"
      }`}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">TrendSpark AI</CardTitle>
          {messages.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {messages.filter(m => m.role === 'user').length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[calc(100%-4rem)] p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && showSuggestions && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  👋 Hi! I'm TrendSpark AI. I can help you with:
                </p>
                <div className="space-y-2">
                  {SUGGESTED_PROMPTS.welcome.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-3 text-sm border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    💡 Type <code className="bg-muted px-1 py-0.5 rounded">/help</code> for commands
                  </p>
                </div>
              </div>
            )}

            {showCommands && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Available Commands:</p>
                <div className="space-y-1">
                  {CHAT_COMMANDS.slice(0, 5).map((cmd) => (
                    <button
                      key={cmd.command}
                      onClick={() => {
                        setInput(cmd.command + " ");
                        setShowCommands(false);
                        inputRef.current?.focus();
                      }}
                      className="block w-full text-left text-xs hover:bg-background p-1 rounded"
                    >
                      <code className="font-mono">{cmd.command}</code> - {cmd.description}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.role === "user" ? "flex justify-end" : "flex justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.modelUsed && (
                    <p className="text-xs opacity-70 mt-1">
                      {message.featureType} • {message.modelUsed.includes('llama') ? '🦙' : '🔵'}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="w-full mb-2 text-xs"
              >
                Clear Chat
              </Button>
            )}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setHistoryIndex(-1); // Reset history navigation when typing
                }}
                onKeyPress={handleKeyPress}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... (↑↓ for history, / for commands)"
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="gradient-hero text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FloatingChatbot;
