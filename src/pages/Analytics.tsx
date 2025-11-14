import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ErrorModal from "@/components/ErrorModal";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { isRateLimitError, normalizeError, formatErrorDisplay } from "@/lib/errorHandler";

interface Brand {
  id: string;
  name: string;
  niche: string;
}

interface ContentKit {
  id: string;
  trend_title: string;
  platform: string;
  status: string;
  created_at: string;
}

interface AnalyticsData {
  totalPosts: number;
  thisWeek: number;
  thisMonth: number;
  mostActivePlatform: string;
  dailyData: Array<{ date: string; count: number }>;
  platformData: Array<{ name: string; value: number; color: string }>;
  trendData: Array<{ name: string; count: number }>;
  statusData: Array<{ name: string; value: number; color: string }>;
}

const Analytics = () => {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [dateRange, setDateRange] = useState<string>("30");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; description: string; details?: string; isRateLimit: boolean; showRetry: boolean } | null>(null);
  const [retryFunction, setRetryFunction] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchBrandAndAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId, dateRange]);

  const fetchBrandAndAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch brand details
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (brandError) throw brandError;
      setBrand(brandData);

      // Calculate date range
      const daysAgo = parseInt(dateRange);
      const startDate = daysAgo === 0 
        ? new Date('2000-01-01') // All time
        : startOfDay(subDays(new Date(), daysAgo));

      // Fetch content kits
      const { data: kitsData, error: kitsError } = await supabase
        .from('content_kits')
        .select('*')
        .eq('brand_id', brandId)
        .gte('created_at', startDate.toISOString());

      if (kitsError) throw kitsError;

      // Process analytics data
      const processedData = processAnalytics(kitsData || []);
      setAnalytics(processedData);
    } catch (error: any) {
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
        setRetryFunction(() => fetchBrandAndAnalytics);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        toast({
          title: "Error loading analytics",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (kits: ContentKit[]): AnalyticsData => {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);

    // Calculate summary stats
    const totalPosts = kits.length;
    const thisWeek = kits.filter(k => new Date(k.created_at) >= sevenDaysAgo).length;
    const thisMonth = kits.filter(k => new Date(k.created_at) >= thirtyDaysAgo).length;

    // Most active platform
    const platformCounts: Record<string, number> = {};
    kits.forEach(kit => {
      platformCounts[kit.platform] = (platformCounts[kit.platform] || 0) + 1;
    });
    const mostActivePlatform = Object.keys(platformCounts).length > 0
      ? Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    // Daily data for line chart
    const dailyCounts: Record<string, number> = {};
    kits.forEach(kit => {
      const date = format(new Date(kit.created_at), 'MMM dd');
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    // Sort daily data chronologically
    const dailyData = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count, timestamp: new Date(date + ', ' + new Date().getFullYear()) }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(({ date, count }) => ({ date, count }));

    // Platform data for pie chart
    const platformColors: Record<string, string> = {
      'Instagram': '#a855f7',
      'LinkedIn': '#3b82f6',
      'Twitter': '#06b6d4',
      'Facebook': '#1877f2',
      'TikTok': '#000000'
    };
    const platformData = Object.entries(platformCounts).map(([name, value]) => ({
      name,
      value,
      color: platformColors[name] || '#6b7280'
    }));

    // Top 10 trends
    const trendCounts: Record<string, number> = {};
    kits.forEach(kit => {
      trendCounts[kit.trend_title] = (trendCounts[kit.trend_title] || 0) + 1;
    });
    const trendData = Object.entries(trendCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Status data for donut chart
    const statusCounts: Record<string, number> = {};
    kits.forEach(kit => {
      statusCounts[kit.status] = (statusCounts[kit.status] || 0) + 1;
    });
    const statusColors: Record<string, string> = {
      'draft': '#6b7280',
      'approved': '#22c55e',
      'scheduled': '#3b82f6',
      'published': '#a855f7',
      'exported': '#f59e0b'
    };
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: statusColors[name] || '#6b7280'
    }));

    return {
      totalPosts,
      thisWeek,
      thisMonth,
      mostActivePlatform,
      dailyData,
      platformData,
      trendData,
      statusData
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!brand || !analytics) return null;

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="0">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{brand.name} Analytics</h1>
          </div>
          <p className="text-muted-foreground">{brand.niche}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.totalPosts}</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.thisWeek}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.thisMonth}</div>
                <div className="text-sm text-muted-foreground">This Month</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.mostActivePlatform}</div>
                <div className="text-sm text-muted-foreground">Top Platform</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Line Chart - Content Over Time */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Content Generated Over Time</h3>
            {analytics.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(243, 75%, 59%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(243, 75%, 59%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data for selected period
              </div>
            )}
          </Card>

          {/* Pie Chart - Platform Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Platform Distribution</h3>
            {analytics.platformData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {analytics.platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No platform data available
              </div>
            )}
          </Card>

          {/* Bar Chart - Top Trends */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Top 10 Trending Topics</h3>
            {analytics.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.trendData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(189, 85%, 52%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </Card>

          {/* Donut Chart - Status Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Status Distribution</h3>
            {analytics.statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No status data available
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
