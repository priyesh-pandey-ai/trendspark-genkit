import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Flame, RefreshCw, Sparkles, LogOut, Zap, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ErrorModal from "@/components/ErrorModal";
import { generateMockTrends, type Trend } from "@/lib/mockTrends";
import { TREND_CATEGORIES, type TrendCategoryKey } from "@/lib/redditApi";
import { triggerTrendDiscovery } from "@/lib/trendDiscovery";
import { rankTrendsByBrandFit } from "@/lib/trendMatching";
import { isRateLimitError, normalizeError, formatErrorDisplay } from "@/lib/errorHandler";

interface Brand {
  id: string;
  name: string;
  niche?: string;
}

interface RankedTrend extends Trend {
  alignmentScore?: number;
  brandAlignmentScore?: number;
}

const DiscoverTrends = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [filteredTrends, setFilteredTrends] = useState<Trend[]>([]);
  const [top5Trends, setTop5Trends] = useState<Trend[]>([]);
  const [brandAlignedTrends, setBrandAlignedTrends] = useState<RankedTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [selectedTrendCategory, setSelectedTrendCategory] = useState<TrendCategoryKey>("all");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("growth_rate");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; description: string; details?: string; isRateLimit: boolean; showRetry: boolean } | null>(null);
  const [retryFunction, setRetryFunction] = useState<(() => void) | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchBrands();
    fetchTrends();
  }, [selectedTrendCategory]); // Refetch when category changes

  useEffect(() => {
    filterAndSortTrends();
  }, [trends, category, sortBy]);

  useEffect(() => {
    // Calculate top 5 trends across all categories
    if (trends.length > 0) {
      const sorted = [...trends]
        .sort((a, b) => {
          // Sort by engagement score first, then growth rate
          if (b.engagement_score !== a.engagement_score) {
            return b.engagement_score - a.engagement_score;
          }
          return b.growth_rate - a.growth_rate;
        })
        .slice(0, 5);
      setTop5Trends(sorted);
    }
  }, [trends]);

  useEffect(() => {
    // Update brand-aligned trends when trends or selected brand changes
    if (selectedBrand && trends.length > 0) {
      try {
        const selectedBrandData = brands.find(b => b.id === selectedBrand);
        if (selectedBrandData?.niche) {
          const ranked = rankTrendsByBrandFit(trends, selectedBrandData.niche, 10);
          setBrandAlignedTrends(ranked as RankedTrend[]);
        }
      } catch (error) {
        console.error("Error ranking brand-aligned trends:", error);
        setBrandAlignedTrends([]);
      }
    } else {
      setBrandAlignedTrends([]);
    }
  }, [selectedBrand, brands, trends]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('brands')
        .select('id, name, niche')
        .eq('user_id', session.user.id);

      if (error) throw error;
      
      setBrands(data || []);
    } catch (error: any) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchTrends = async () => {
    setLoading(true);
    try {
      // Fetch trends filtered by selected category source
      const { data, error } = await supabase
        .from('trends')
        .select('*')
        .match({ trend_category_source: selectedTrendCategory })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no trends in database for this category, auto-discover from Reddit
      if (!data || data.length === 0) {
        console.log(`No ${selectedTrendCategory} trends in database, auto-discovering from Reddit...`);
        toast({
          title: "No trends found",
          description: `Discovering ${TREND_CATEGORIES[selectedTrendCategory].name} trends...`,
        });
        
        // Trigger auto-discovery for this category
        const result = await triggerTrendDiscovery(selectedTrendCategory);
        
        if (result.success) {
          // Fetch again after discovery
          const { data: newData, error: newError } = await supabase
            .from('trends')
            .select('*')
            .match({ trend_category_source: selectedTrendCategory })
            .order('created_at', { ascending: false });
          
          if (!newError && newData && newData.length > 0) {
            setTrends(newData);
            toast({
              title: "✨ Trends discovered!",
              description: `Loaded ${newData.length} ${TREND_CATEGORIES[selectedTrendCategory].name} trends`,
            });
            setLoading(false);
            return;
          }
        }
        
        // If auto-discovery failed, fall back to mock data
        const mockTrends = generateMockTrends();
        setTrends(mockTrends);
        toast({
          title: "Using demo data",
          description: "Click 'Discover New Trends' to fetch real trends",
          variant: "default",
        });
      } else {
        setTrends(data);
        console.log(`Loaded ${data.length} ${selectedTrendCategory} trends from database`);
      }
    } catch (error: any) {
      console.error("Error fetching trends:", error);
      
      // Check for rate limit error
      const isRateLimit = isRateLimitError(error) || error?.status === 429;
      
      // Show error modal for rate limit errors
      if (isRateLimit) {
        const displayError = formatErrorDisplay(normalizeError(error));
        setErrorModal({
          isOpen: true,
          title: displayError.title,
          description: displayError.description,
          details: displayError.details,
          isRateLimit: true,
          showRetry: true,
        });
        setRetryFunction(() => fetchTrends);
      } else {
        // Fallback to mock data on other errors
        const mockTrends = generateMockTrends();
        setTrends(mockTrends);
        toast({
          title: "Using demo data",
          description: "Error loading trends. Click 'Discover New Trends' to try again.",
        });
      }
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
      const categoryName = TREND_CATEGORIES[selectedTrendCategory].name;
      toast({
        title: "Discovering trends...",
        description: `Fetching latest ${categoryName} trends from Reddit`,
      });

      const result = await triggerTrendDiscovery(selectedTrendCategory);

      if (result.success) {
        toast({
          title: "✨ New trends discovered!",
          description: `Found ${result.data?.trendsDiscovered || 0} ${categoryName} trends`,
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
    } catch (error: any) {
      console.error('Error discovering trends:', error);
      
      // Check for rate limit error
      const isRateLimit = isRateLimitError(error) || error?.status === 429;
      
      // Show error modal for rate limit errors
      if (isRateLimit) {
        const displayError = formatErrorDisplay(normalizeError(error));
        setErrorModal({
          isOpen: true,
          title: displayError.title,
          description: displayError.description,
          details: displayError.details,
          isRateLimit: true,
          showRetry: true,
        });
        setRetryFunction(() => handleDiscoverNewTrends);
      } else {
        toast({
          title: "Error discovering trends",
          description: "Failed to fetch new trends. Please try again later.",
          variant: "destructive",
        });
      }
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
      reddit: "🔥 Reddit",
      twitter: "🐦 Twitter",
      google_trends: "📊 Google Trends",
      manual: "✏️ Manual"
    };
    return labels[source] || source;
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      reddit: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      twitter: "bg-blue-400/10 text-blue-400 border-blue-400/20",
      google_trends: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      manual: "bg-gray-500/10 text-gray-500 border-gray-500/20"
    };
    return colors[source] || "bg-muted/50";
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 text-green-600";
    if (score >= 60) return "bg-blue-500/10 text-blue-600";
    if (score >= 40) return "bg-yellow-500/10 text-yellow-600";
    return "bg-orange-500/10 text-orange-600";
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Discover Trending Topics</h2>
          </div>
          <p className="text-muted-foreground">
            {TREND_CATEGORIES[selectedTrendCategory].description}
          </p>
        </div>

        {/* Top 5 Trending Topics Section */}
        {top5Trends.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-slate-500/5 via-slate-500/10 to-slate-500/5 rounded-lg border border-slate-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="h-7 w-7 text-slate-600" />
              <h3 className="text-2xl font-bold text-slate-700">⭐ Top 5 Trending Topics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {top5Trends.map((trend, index) => (
                <Card
                  key={`top5-${trend.id}-${index}`}
                  className="p-4 border-2 border-slate-300/40 bg-gradient-to-b from-slate-50/60 to-slate-50/30 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-4xl font-black text-slate-600">#{index + 1}</div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs font-semibold text-green-700 bg-green-100/70 px-2 py-1 rounded">
                        +{trend.growth_rate}%
                      </div>
                      <div className="text-xs font-semibold text-slate-700 bg-slate-200/70 px-2 py-1 rounded">
                        {trend.engagement_score} eng
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{trend.topic}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {trend.description}
                  </p>

                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-xs bg-slate-100/60 text-slate-700 border-slate-300">
                      {trend.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-slate-100/60 text-slate-700 border-slate-300">
                      {getSourceBadge(trend.source)}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => handleGenerateContent(trend)}
                    size="sm"
                    className="w-full bg-slate-600 hover:bg-slate-700 text-white text-xs"
                  >
                    Generate
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="mb-6">
          <Tabs value={selectedTrendCategory} onValueChange={(value) => setSelectedTrendCategory(value as TrendCategoryKey)}>
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              {Object.entries(TREND_CATEGORIES).map(([key, cat]) => (
                <TabsTrigger key={key} value={key} className="flex-shrink-0">
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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

          <Select value={selectedBrand || "none"} onValueChange={(value) => setSelectedBrand(value === "none" ? "" : value)}>
            <SelectTrigger className="sm:w-[220px] w-full">
              <SelectValue placeholder="Select your brand..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Brand Selected</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand.id} value={String(brand.id)}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand-Aligned Trends Section */}
        {selectedBrand && brandAlignedTrends.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-6 w-6 text-amber-500" />
              <h3 className="text-2xl font-bold">Top Trends for Your Brand</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              These trends are aligned with your {brands.find(b => b.id === selectedBrand)?.name} brand ({brands.find(b => b.id === selectedBrand)?.niche})
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandAlignedTrends.slice(0, 10).map((trend, index) => {
                try {
                  return (
                    <Card
                      key={`brand-${trend.id}-${index}`}
                      className="p-6 border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-transparent hover:shadow-glow hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-3xl font-bold text-amber-600">#{index + 1}</div>
                        <Badge className={`${getAlignmentColor(trend.brandAlignmentScore || 0)} font-semibold`}>
                          {trend.brandAlignmentScore || 0}% Match
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2">{trend.topic}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {trend.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className={getCategoryColor(trend.category)}>
                          {trend.category}
                        </Badge>
                        <Badge variant="outline" className={getSourceColor(trend.source)}>
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
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        Generate Content
                      </Button>
                    </Card>
                  );
                } catch (err) {
                  console.error("Error rendering brand trend card:", err, trend);
                  return null;
                }
              })}
            </div>
          </div>
        )}

        {/* All Trends Section Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold">All Trending Topics</h3>
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
                  <Badge variant="outline" className={getSourceColor(trend.source)}>
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

      {/* Error Modal */}
      {errorModal && (
        <ErrorModal
          isOpen={errorModal.isOpen}
          title={errorModal.title}
          description={errorModal.description}
          errorDetails={errorModal.details}
          isRateLimit={errorModal.isRateLimit}
          onClose={() => setErrorModal(null)}
          onRetry={retryFunction ? () => {
            setErrorModal(null);
            retryFunction();
          } : undefined}
          showRetry={errorModal.showRetry}
          retryLabel="Try Again"
        />
      )}
    </div>
  );
};

export default DiscoverTrends;
