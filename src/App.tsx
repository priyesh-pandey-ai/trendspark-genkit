import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateBrand from "./pages/CreateBrand";
import BrandDetail from "./pages/BrandDetail";
import Generate from "./pages/Generate";
import ContentLibrary from "./pages/ContentLibrary";
import Analytics from "./pages/Analytics";
import DiscoverTrends from "./pages/DiscoverTrends";
import SocialMediaManagement from "./pages/SocialMediaManagement";
import NotFound from "./pages/NotFound";
import FloatingChatbot from "./components/FloatingChatbot";
import { ChatContext } from "./types/chatbot";

const queryClient = new QueryClient();

const AppContent = () => {
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const location = useLocation();
  
  // Don't show chatbot on landing and auth pages
  const showChatbot = !["/", "/auth"].includes(location.pathname);

  useEffect(() => {
    const loadContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's current brand
      const { data: brands } = await supabase
        .from('brands')
        .select('id, name, niche, voice_card')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch recent trends
      const { data: trends } = await supabase
        .from('trends')
        .select('id, topic, category')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent content
      const { data: content } = await supabase
        .from('content_kits')
        .select('id, content, platform')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setChatContext({
        userId: user.id,
        brandId: brands?.[0]?.id,
        currentBrand: brands?.[0] ? {
          id: brands[0].id,
          name: brands[0].name,
          niche: brands[0].niche,
          voiceCard: brands[0].voice_card,
        } : undefined,
        recentTrends: trends || [],
        recentContent: content || [],
      });
    };

    if (showChatbot) {
      loadContext();
    }
  }, [showChatbot, location.pathname]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-brand" element={<CreateBrand />} />
        <Route path="/brand/:id" element={<BrandDetail />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/content-library" element={<ContentLibrary />} />
        <Route path="/analytics/:brandId" element={<Analytics />} />
        <Route path="/discover-trends" element={<DiscoverTrends />} />
        <Route path="/social-media" element={<SocialMediaManagement />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showChatbot && chatContext && <FloatingChatbot context={chatContext} />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
