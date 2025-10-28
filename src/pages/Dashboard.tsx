import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, LogOut, Zap, Library, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  niche: string;
  created_at: string;
}

const Dashboard = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchBrands();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching brands",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground">Manage your brands and generate trending content</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 gradient-card border-primary/10 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/create-brand')}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Create New Brand</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a new brand profile with AI-powered voice extraction
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 gradient-card border-secondary/10 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (brands.length === 0) {
                    toast({
                      title: "No brands yet",
                      description: "Create a brand first to generate content",
                      variant: "destructive",
                    });
                  } else {
                    navigate('/generate');
                  }
                }}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Generate Content</h3>
                <p className="text-sm text-muted-foreground">
                  Create platform-optimized posts from trending topics
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 gradient-card border-accent/10 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/content-library')}>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Library className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Content Library</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage all your generated content
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Brands List */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Your Brands</h3>
          
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : brands.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-semibold text-lg mb-2">No brands yet</h4>
              <p className="text-muted-foreground mb-6">
                Create your first brand to start generating content
              </p>
              <Button onClick={() => navigate('/create-brand')} className="gradient-hero text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Brand
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <Card 
                  key={brand.id} 
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="cursor-pointer" onClick={() => navigate(`/brand/${brand.id}`)}>
                    <h4 className="font-semibold text-lg mb-2">{brand.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{brand.niche || 'No niche specified'}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(brand.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Add analytics button */}
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/analytics/${brand.id}`);
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/generate', { state: { brandId: brand.id } });
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;