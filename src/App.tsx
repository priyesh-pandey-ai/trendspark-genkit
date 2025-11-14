import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
