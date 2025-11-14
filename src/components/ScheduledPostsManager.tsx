import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Clock, Trash2, MoreVertical, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScheduledPost {
  id: string;
  platform: string;
  status: string;
  scheduled_at: string;
  posted_at?: string;
  post_url?: string;
  error_message?: string;
  content_kit_id: string;
  external_post_id?: string;
  metadata?: {
    content: string;
    hashtags?: string;
    imageUrl?: string;
  };
}

const ScheduledPostsManager = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchScheduledPosts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchScheduledPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      let query = supabase
        .from('social_media_posts')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPost = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this post?')) return;

    try {
      const { error } = await supabase
        .from('social_media_posts')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, status: 'cancelled' } : post
        )
      );

      toast({
        title: 'Post cancelled',
        description: 'The scheduled post has been cancelled',
      });
    } catch (error: any) {
      toast({
        title: 'Error cancelling post',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('social_media_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPosts((prev) => prev.filter((post) => post.id !== id));

      toast({
        title: 'Post deleted',
        description: 'The post has been permanently deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting post',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePostNow = async (id: string) => {
    try {
      const post = posts.find((p) => p.id === id);
      if (!post) return;

      // Update scheduled_at to now
      const { error } = await supabase
        .from('social_media_posts')
        .update({ scheduled_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Post rescheduled',
        description: 'The post will be published immediately',
      });

      fetchScheduledPosts();
    } catch (error: any) {
      toast({
        title: 'Error rescheduling post',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'posted':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const isOverdue = (scheduledTime: string) => {
    return new Date(scheduledTime) < new Date();
  };

  const filteredPosts = posts.filter((post) => {
    if (filterStatus === 'all') return true;
    return post.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading scheduled posts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All Posts' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'posted', label: 'Posted' },
          { value: 'failed', label: 'Failed' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === filter.value
                ? 'bg-primary text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {filter.label} ({posts.filter((p) => filter.value === 'all' || p.status === filter.value).length})
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {filterStatus === 'all'
              ? 'No posts scheduled yet'
              : `No posts with status "${filterStatus}"`}
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Posted Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id} className={isOverdue(post.scheduled_at) && post.status === 'scheduled' ? 'bg-yellow-50' : ''}>
                  <TableCell>
                    <span className="font-semibold capitalize">
                      {post.platform}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {post.metadata?.content || 'No content'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(post.status)} text-white`}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDateTime(post.scheduled_at)}
                      {isOverdue(post.scheduled_at) && post.status === 'scheduled' && (
                        <span className="text-xs text-red-500 font-semibold ml-1">OVERDUE</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.posted_at ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-green-500" />
                        {formatDateTime(post.posted_at)}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {post.status === 'scheduled' && (
                          <>
                            <DropdownMenuItem onClick={() => handlePostNow(post.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Post Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCancelPost(post.id)}>
                              Cancel Schedule
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {posts.filter((p) => p.status === 'scheduled' && isOverdue(p.scheduled_at)).length > 0 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm font-medium text-yellow-900">
            ⚠️ {posts.filter((p) => p.status === 'scheduled' && isOverdue(p.scheduled_at)).length} posts
            are overdue and waiting to be posted
          </p>
        </Card>
      )}
    </div>
  );
};

export default ScheduledPostsManager;
