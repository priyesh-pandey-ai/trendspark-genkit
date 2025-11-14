import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface PostWithStats {
  id: string;
  platform: string;
  status: string;
  posted_at?: string;
  post_url?: string;
  metadata?: {
    content: string;
    hashtags?: string;
  };
  stats?: {
    likes_count: number;
    comments_count: number;
    shares_count: number;
    views_count: number;
    engagement_rate: number;
  };
}

interface PlatformPerformance {
  platform: string;
  totalPosts: number;
  avgEngagement: number;
  avgLikes: number;
  bestPost: PostWithStats | null;
  worstPost: PostWithStats | null;
}

const PostPerformanceTracker = () => {
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [platformPerformance, setPlatformPerformance] = useState<PlatformPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    fetchPostPerformance();
    // Refresh every minute
    const interval = setInterval(fetchPostPerformance, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPostPerformance = async () => {
    try {
      // Get all posted posts with their stats
      const { data: postedPosts, error: postsError } = await supabase
        .from('social_media_posts')
        .select(
          `
          id,
          platform,
          status,
          posted_at,
          post_url,
          metadata,
          social_media_stats (
            likes_count,
            comments_count,
            shares_count,
            views_count,
            engagement_rate
          )
        `
        )
        .eq('status', 'posted')
        .order('posted_at', { ascending: false })
        .limit(100);

      if (postsError) throw postsError;

      const formattedPosts = (postedPosts || []).map((post: any) => ({
        ...post,
        stats: post.social_media_stats?.[0],
      }));

      setPosts(formattedPosts);

      // Calculate platform performance
      const performanceMap: Record<string, PlatformPerformance> = {};

      formattedPosts.forEach((post: PostWithStats) => {
        if (!performanceMap[post.platform]) {
          performanceMap[post.platform] = {
            platform: post.platform,
            totalPosts: 0,
            avgEngagement: 0,
            avgLikes: 0,
            bestPost: null,
            worstPost: null,
          };
        }

        const perf = performanceMap[post.platform];
        perf.totalPosts++;

        if (post.stats) {
          perf.avgEngagement += post.stats.engagement_rate;
          perf.avgLikes += post.stats.likes_count;

          // Track best and worst posts
          if (!perf.bestPost || post.stats.engagement_rate > (perf.bestPost.stats?.engagement_rate || 0)) {
            perf.bestPost = post;
          }
          if (!perf.worstPost || post.stats.engagement_rate < (perf.worstPost.stats?.engagement_rate || 100)) {
            perf.worstPost = post;
          }
        }
      });

      // Calculate averages
      Object.values(performanceMap).forEach((perf) => {
        if (perf.totalPosts > 0) {
          perf.avgEngagement = perf.avgEngagement / perf.totalPosts;
          perf.avgLikes = perf.avgLikes / perf.totalPosts;
        }
      });

      setPlatformPerformance(Object.values(performanceMap));
    } catch (error) {
      console.error('Error fetching post performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedPlatform === 'all') return true;
    return post.platform === selectedPlatform;
  });

  const getPerformanceLevel = (engagement: number) => {
    if (engagement >= 10) return { label: 'Excellent', color: 'text-green-600' };
    if (engagement >= 5) return { label: 'Good', color: 'text-blue-600' };
    if (engagement >= 2) return { label: 'Average', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading performance data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Performance Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {platformPerformance.map((perf) => (
          <Card key={perf.platform} className="p-4">
            <div className="space-y-2">
              <h4 className="font-semibold capitalize">{perf.platform}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts:</span>
                  <span className="font-medium">{perf.totalPosts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Engagement:</span>
                  <span className={`font-medium ${getPerformanceLevel(perf.avgEngagement).color}`}>
                    {perf.avgEngagement.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Likes:</span>
                  <span className="font-medium">{perf.avgLikes.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Platform Filter & Performance Details */}
      <Tabs defaultValue="all" onValueChange={setSelectedPlatform} className="w-full">
        <TabsList className="grid w-auto gap-2">
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          {platformPerformance.map((perf) => (
            <TabsTrigger key={perf.platform} value={perf.platform}>
              {perf.platform} ({perf.totalPosts})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedPlatform} className="mt-6">
          {filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts with performance data yet</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => {
                    const performance = getPerformanceLevel(post.stats?.engagement_rate || 0);
                    return (
                      <TableRow key={post.id}>
                        <TableCell className="text-sm">
                          {post.posted_at ? new Date(post.posted_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {post.metadata?.content?.substring(0, 50) || 'N/A'}...
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Badge className={`${performance.color.replace('text-', 'bg-')}`}>
                              {post.stats?.engagement_rate?.toFixed(1) || 0}%
                            </Badge>
                            {post.stats && (
                              post.stats.engagement_rate >= 5 ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{post.stats?.likes_count || 0}</TableCell>
                        <TableCell>{post.stats?.comments_count || 0}</TableCell>
                        <TableCell>{post.stats?.shares_count || 0}</TableCell>
                        <TableCell>{post.stats?.views_count || 0}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Insights */}
      {platformPerformance.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {platformPerformance.map((perf) => (
            <Card key={`insights-${perf.platform}`} className="p-6">
              <h3 className="font-semibold mb-4 capitalize">{perf.platform} Insights</h3>
              <div className="space-y-4">
                {perf.bestPost && (
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Best Performing Post</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {perf.bestPost.metadata?.content || 'N/A'}
                    </p>
                    <p className="text-xs font-medium mt-1">
                      Engagement: {perf.bestPost.stats?.engagement_rate?.toFixed(1)}%
                    </p>
                  </div>
                )}

                {perf.worstPost && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Lowest Performing Post</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {perf.worstPost.metadata?.content || 'N/A'}
                    </p>
                    <p className="text-xs font-medium mt-1">
                      Engagement: {perf.worstPost.stats?.engagement_rate?.toFixed(1)}%
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Engagement: {perf.totalPosts * (perf.avgLikes + (perf.avgEngagement / 100) * 100)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostPerformanceTracker;
