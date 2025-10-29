import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Flame, RefreshCw, Sparkles, LogOut, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateMockTrends, type Trend } from "@/lib/mockTrends";
import { triggerTrendDiscovery } from "@/lib/trendDiscovery";

const DiscoverTrends = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("growth_rate");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchTrends();
  }, []);

  useEffect(() => {
    filterAndSortTrends();
  }, [trends, category, sortBy]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchTrends = async () => {
    setLoading(true);
    try {
      // Try fetching from database first
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no trends in database, use mock data
      if (!data || data.length === 0) {
        const mockTrends = generateMockTrends();
        setTrends(mockTrends);
        toast({
          title: "Mock trends loaded",
          description: "Showing demo trending topics",
        });
      } else {
        setTrends(data);
      }
    } catch (error: any) {
      console.error("Error fetching trends:", error);
      // Fallback to mock data on error
      const mockTrends = generateMockTrends();
      setTrends(mockTrends);
      toast({
        title: "Using demo data",
        description: "Showing sample trending topics",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrends = () => {
    let result = [...trends];

    // Filter by category
    if (category !== "All") {
      result = result.filter(trend => trend.category === category);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "growth_rate":
          return b.growth_rate - a.growth_rate;
        case "engagement":
          return b.engagement_score - a.engagement_score;
        case "latest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredTrends(result);
  };

  const handleRefresh = () => {
    fetchTrends();
  };

  const handleDiscoverNewTrends = async () => {
    setDiscovering(true);
    try {
      toast({
        title: "Discovering trends...",
        description: "Fetching latest trending topics from external sources",
      });

      const result = await triggerTrendDiscovery();

      if (result.success) {
        toast({
          title: "✨ New trends discovered!",
          description: `Found ${result.data?.trendsDiscovered || 0} trending topics`,
        });
        // Refresh the trends list
        await fetchTrends();
      } else {
        toast({
          title: "Trend discovery unavailable",
          description: "Using cached trends. Check your API configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error discovering trends:', error);
      toast({
        title: "Error discovering trends",
        description: "Failed to fetch new trends. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDiscovering(false);
    }
  };

  const handleGenerateContent = (trend: Trend) => {
    navigate('/generate', { state: { trendTitle: trend.topic } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Business: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      Lifestyle: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      Health: "bg-green-500/10 text-green-500 border-green-500/20",
      Marketing: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return colors[cat] || "bg-muted text-muted-foreground";
  };

  const getSourceBadge = (source: string) => {
    const labels: Record<string, string> = {
      reddit: "Reddit",
      twitter: "Twitter",
      google_trends: "Google Trends",
      manual: "Manual"
    };
    return labels[source] || source;
  };

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Trend-Craft AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Discover Trending Topics</h2>
          </div>
          <p className="text-muted-foreground">
            Find viral content ideas and generate platform-optimized posts instantly
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            onClick={handleDiscoverNewTrends} 
            disabled={discovering}
            className="gradient-hero text-white sm:w-auto w-full"
          >
            <Zap className={`h-4 w-4 mr-2 ${discovering ? 'animate-spin' : ''}`} />
            {discovering ? 'Discovering...' : 'Discover New Trends'}
          </Button>

          <Button onClick={handleRefresh} variant="outline" className="sm:w-auto w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Trends
          </Button>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-[200px] w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Lifestyle">Lifestyle</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="sm:w-[200px] w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="growth_rate">Growth Rate</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="latest">Latest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trends Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredTrends.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold text-lg mb-2">No trends match your filters</h4>
            <p className="text-muted-foreground mb-6">
              Try adjusting your category filter or refresh to see new trends
            </p>
            <Button onClick={handleRefresh} className="gradient-hero text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Trends
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrends.map((trend) => (
              <Card
                key={trend.id}
                className="p-6 gradient-card hover:shadow-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2">{trend.topic}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {trend.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className={getCategoryColor(trend.category)}>
                    {trend.category}
                  </Badge>
                  <Badge variant="outline" className="bg-muted/50">
                    {getSourceBadge(trend.source)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">+{trend.growth_rate}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="h-4 w-4" />
                    <span className="font-semibold">{trend.engagement_score}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleGenerateContent(trend)}
                  className="w-full gradient-hero text-white"
                >
                  Generate Content
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoverTrends;
