import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, FileText, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Brand {
  id: string;
  name: string;
  niche: string;
  voice_card: string;
  created_at: string;
}

const BrandDetail = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({ total: 0, thisWeek: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBrand();
    fetchQuickStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBrand = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBrand(data);
    } catch (error: any) {
      toast({
        title: "Error fetching brand",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickStats = async () => {
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('content_kits')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', id);
    
    if (totalError) return;

    // Get this week's count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: weekCount, error: weekError } = await supabase
      .from('content_kits')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', id)
      .gte('created_at', sevenDaysAgo.toISOString());
    
    if (!weekError) {
      setQuickStats({ 
        total: totalCount || 0, 
        thisWeek: weekCount || 0 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/generate', { state: { brandId: brand.id } })}
            className="gradient-hero text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Content
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
          <p className="text-muted-foreground">{brand.niche}</p>
        </div>

        <Card className="p-8 gradient-card shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Brand Voice Card</h2>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown>{brand.voice_card}</ReactMarkdown>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Created on {new Date(brand.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </Card>

        <Card className="p-6 gradient-card shadow-lg mt-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h3 className="font-semibold text-lg">Quick Stats</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-3xl font-bold text-primary">{quickStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">{quickStats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate(`/analytics/${brand.id}`)} 
            className="w-full gradient-hero text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            View Full Analytics
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default BrandDetail;