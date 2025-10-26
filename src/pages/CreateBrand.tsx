import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreateBrand = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState({
    name: "",
    niche: "",
    samplePost1: "",
    samplePost2: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => {
    if (step === 1) {
      if (!brandData.name || !brandData.niche) {
        toast({
          title: "Required fields",
          description: "Please fill in brand name and niche",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brandData.samplePost1 || !brandData.samplePost2) {
      toast({
        title: "Required fields",
        description: "Please provide at least 2 sample posts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate voice card
      toast({
        title: "Generating brand voice...",
        description: "This may take a moment",
      });

      const { data: voiceData, error: voiceError } = await supabase.functions.invoke('generate-voice-card', {
        body: {
          samplePosts: [brandData.samplePost1, brandData.samplePost2].filter(Boolean),
          niche: brandData.niche
        }
      });

      if (voiceError) throw voiceError;

      // Create brand
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert({
          user_id: user.id,
          name: brandData.name,
          niche: brandData.niche,
          voice_card: voiceData.voiceCard,
          sample_posts: [brandData.samplePost1, brandData.samplePost2].filter(Boolean)
        })
        .select()
        .single();

      if (brandError) throw brandError;

      toast({
        title: "Brand created!",
        description: "Your brand voice has been captured successfully",
      });

      navigate(`/brand/${brand.id}`);
    } catch (error: any) {
      console.error('Error creating brand:', error);
      toast({
        title: "Error creating brand",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Create New Brand</h1>
          </div>
          <p className="text-muted-foreground">
            Step {step} of 2: {step === 1 ? "Basic Information" : "Sample Content"}
          </p>
        </div>

        <Card className="p-8 gradient-card shadow-lg">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Pilgrim Coffee"
                  value={brandData.name}
                  onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche">Niche *</Label>
                <Input
                  id="niche"
                  placeholder="e.g., D2C Coffee Roaster, Tech Startup, Fashion Brand"
                  value={brandData.niche}
                  onChange={(e) => setBrandData({ ...brandData, niche: e.target.value })}
                  className="bg-background"
                />
              </div>

              <Button onClick={handleNext} className="w-full gradient-hero text-white">
                Continue to Sample Posts
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sample1">Sample Post 1 *</Label>
                <Textarea
                  id="sample1"
                  placeholder="Paste a representative post from this brand..."
                  value={brandData.samplePost1}
                  onChange={(e) => setBrandData({ ...brandData, samplePost1: e.target.value })}
                  className="min-h-32 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sample2">Sample Post 2 *</Label>
                <Textarea
                  id="sample2"
                  placeholder="Paste another representative post..."
                  value={brandData.samplePost2}
                  onChange={(e) => setBrandData({ ...brandData, samplePost2: e.target.value })}
                  className="min-h-32 bg-background"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Tip: Choose posts that best represent your brand's voice, tone, and style. 
                  Our AI will analyze these to create your unique brand voice card.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 gradient-hero text-white"
                >
                  {loading ? "Creating Brand..." : "Create Brand"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
};

export default CreateBrand;