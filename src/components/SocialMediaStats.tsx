import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import PostPerformanceTracker from './PostPerformanceTracker';

interface PostStats {
  id: string;
  platform: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  engagement_rate: number;
  created_at: string;
}

interface PlatformStats {
  platform: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  avgEngagementRate: number;
}

const SocialMediaStats = () => {
  const [stats, setStats] = useState<PostStats[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      // For now, we'll use mock data since the tables are new
      // In production, fetch from social_media_stats table
      setStats([]);
      setPlatformStats([]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const PLATFORM_COLORS: { [key: string]: string } = {
    twitter: '#1DA1F2',
    instagram: '#E1306C',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
  };

  const chartData = platformStats.map((p) => ({
    platform: p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
    engagement: parseFloat(p.avgEngagementRate.toFixed(2)),
  }));

  const engagementData = stats
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 10)
    .map((s) => ({
      platform: s.platform,
      likes: s.likes_count,
      comments: s.comments_count,
      shares: s.shares_count,
      views: s.views_count,
      date: new Date(s.created_at).toLocaleDateString(),
    }));

  const totalEngagement =
    platformStats.reduce((acc, p) => acc + p.totalLikes + p.totalComments + p.totalShares, 0);

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        {['7', '30', '90'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition ${
              timeRange === range
                ? 'bg-primary text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Last {range} days
          </button>
        ))}
      </div>

      {stats.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No analytics data yet. Start posting to see your social media stats!
          </p>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
              <div className="text-2xl font-bold">
                {platformStats.reduce((acc, p) => acc + p.totalLikes, 0)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">Total Comments</p>
              </div>
              <div className="text-2xl font-bold">
                {platformStats.reduce((acc, p) => acc + p.totalComments, 0)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-muted-foreground">Total Shares</p>
              </div>
              <div className="text-2xl font-bold">
                {platformStats.reduce((acc, p) => acc + p.totalShares, 0)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
              <div className="text-2xl font-bold">
                {(platformStats.reduce((acc, p) => acc + p.totalViews, 0) / 1000).toFixed(1)}K
              </div>
            </Card>
          </div>

          {/* Engagement by Platform */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Average Engagement Rate by Platform</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="engagement" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </Card>

          {/* Platform Distribution */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-4">Engagement Metrics Over Time</h3>
              {engagementData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="likes" stroke="#ff6b6b" />
                    <Line type="monotone" dataKey="comments" stroke="#4dabf7" />
                    <Line type="monotone" dataKey="shares" stroke="#51cf66" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Performance by Platform</h3>
              <div className="space-y-3">
                {platformStats.map((p) => (
                  <div key={p.platform} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {p.platform}
                      </span>
                      <Badge variant="outline">
                        {p.totalPosts} posts
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="text-xs">Engagement: {p.avgEngagementRate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialMediaStats;
