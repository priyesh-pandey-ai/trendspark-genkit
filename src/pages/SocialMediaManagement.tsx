import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Settings, BarChart3, Calendar, TrendingUp } from "lucide-react";
import SocialMediaSettings from "@/components/SocialMediaSettings";
import SocialMediaStats from "@/components/SocialMediaStats";
import ScheduledPostsManager from "@/components/ScheduledPostsManager";
import PostPerformanceTracker from "@/components/PostPerformanceTracker";

const SocialMediaManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("integrations");

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Social Media Management</h1>
          <p className="text-muted-foreground">
            Connect your social media accounts and automate your posting
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrations">
              <Settings className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled Posts
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="mt-6">
            <SocialMediaSettings />
          </TabsContent>

          <TabsContent value="scheduled" className="mt-6">
            <ScheduledPostsManager />
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <PostPerformanceTracker />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <SocialMediaStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SocialMediaManagement;
