import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Sparkles, Copy, Download, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PostPreview from "@/components/PostPreview";

interface Brand {
  id: string;
  name: string;
  niche: string;
  voice_card: string;
}

interface ContentKit {
  platform: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

const Generate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>(location.state?.brandId || "");
  const [trendTitle, setTrendTitle] = useState(location.state?.trendTitle || "");
  const [platforms, setPlatforms] = useState<string[]>(["Instagram", "LinkedIn", "Twitter"]);
  const [loading, setLoading] = useState(false);
  const [contentKits, setContentKits] = useState<ContentKit[]>([]);

  const availablePlatforms = ["Instagram", "LinkedIn", "Twitter", "Facebook", "TikTok"];

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
      
      if (data && data.length > 0 && !selectedBrand) {
        setSelectedBrand(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching brands",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBrand || !trendTitle) {
      toast({
        title: "Required fields",
        description: "Please select a brand and enter a trend topic",
        variant: "destructive",
      });
      return;
    }

    if (platforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const brand = brands.find(b => b.id === selectedBrand);
      if (!brand) throw new Error("Brand not found");
      
      // Check if brand has a voice card
      if (!brand.voice_card || brand.voice_card.trim().length === 0) {
        throw new Error("This brand doesn't have a voice card yet. Please create the brand's voice card first.");
      }

      toast({
        title: "Generating content...",
        description: "This may take a moment",
      });

      // Validate all required fields
      if (!trendTitle || trendTitle.trim().length === 0) {
        throw new Error("Please enter a trend title");
      }
      
      if (!platforms || platforms.length === 0) {
        throw new Error("Please select at least one platform");
      }

      // Sanitize trend title - remove extra spaces and trim
      const sanitizedTrendTitle = trendTitle.trim().replace(/\s+/g, ' ');
      
      // Validate sanitized title
      if (sanitizedTrendTitle.length > 500) {
        throw new Error("Trend title is too long. Please keep it under 500 characters.");
      }

      console.log('Calling generate-content-kit with:', {
        hasVoiceCard: !!brand.voice_card,
        voiceCardLength: brand.voice_card?.length,
        voiceCardPreview: brand.voice_card?.substring(0, 100) + '...',
        originalTrendTitle: trendTitle,
        sanitizedTrendTitle: sanitizedTrendTitle,
        trendTitleLength: sanitizedTrendTitle.length,
        platforms,
        platformsCount: platforms.length,
        niche: brand.niche
      });

      const { data, error } = await supabase.functions.invoke('generate-content-kit', {
        body: {
          voiceCard: brand.voice_card,
          trendTitle: sanitizedTrendTitle,
          platforms,
          niche: brand.niche
        }
      });

      console.log('Edge Function response:', { data, error });

      if (error) {
        console.error('Edge Function error details:', error);
        // Check if there's a response with error details
        if (error.context && error.context.body) {
          const errorBody = await error.context.text();
          console.error('Error response body:', errorBody);
        }
        throw error;
      }

      if (!data || !data.contentKits) {
        throw new Error('Invalid response from Edge Function: missing contentKits');
      }

      setContentKits(data.contentKits);

      // Save to database
      const kitsToInsert = data.contentKits.map((kit: ContentKit) => ({
        brand_id: selectedBrand,
        trend_title: trendTitle,
        platform: kit.platform,
        hook: kit.hook,
        body: kit.body,
        cta: kit.cta,
        hashtags: kit.hashtags,
        status: 'draft'
      }));

      const { error: insertError } = await supabase
        .from('content_kits')
        .insert(kitsToInsert);

      if (insertError) throw insertError;

      toast({
        title: "Content generated!",
        description: `Created ${data.contentKits.length} content variants`,
      });
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast({
        title: "Error generating content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (kit: ContentKit) => {
    const text = `${kit.hook}\n\n${kit.body}\n\n${kit.cta}\n\n${kit.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${kit.platform} post copied`,
    });
  };

  const handleDownloadAll = () => {
    const csv = contentKits.map(kit => ({
      Platform: kit.platform,
      Hook: kit.hook,
      Body: kit.body,
      CTA: kit.cta,
      Hashtags: kit.hashtags.join(' ')
    }));

    const headers = Object.keys(csv[0]).join(',');
    const rows = csv.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trendTitle}-content-kits.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Content kits saved as CSV",
    });
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/content-library')}>
            <Library className="h-4 w-4 mr-2" />
            Content Library
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Generate Content Kit</h1>
          </div>
          <p className="text-muted-foreground">Create platform-optimized posts from trending topics</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Generation Form */}
          <Card className="p-6 gradient-card shadow-lg h-fit">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="brand">Select Brand *</Label>
                <select
                  id="brand"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  <option value="">Choose a brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} - {brand.niche}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trend">Trend Topic *</Label>
                <Input
                  id="trend"
                  placeholder="e.g., #MicroBrewCoffeeMemes, AI in Marketing"
                  value={trendTitle}
                  onChange={(e) => setTrendTitle(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-3">
                <Label>Select Platforms *</Label>
                {availablePlatforms.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={platforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <label
                      htmlFor={platform}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {platform}
                    </label>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-hero text-white"
              >
                {loading ? "Generating..." : "Generate Content Kit"}
              </Button>
            </form>
          </Card>

          {/* Results */}
          <div className="space-y-6">
            {contentKits.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All as CSV
                </Button>
              </div>
            )}

            {contentKits.map((kit, i) => (
              <div key={i} className="space-y-4">
                <Card className="p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{kit.platform}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(kit)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Hook</p>
                      <p className="font-medium">{kit.hook}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Body</p>
                      <p className="text-sm whitespace-pre-wrap">{kit.body}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">CTA</p>
                      <p className="text-sm font-medium text-primary">{kit.cta}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Hashtags</p>
                      <p className="text-sm text-secondary">{kit.hashtags.join(' ')}</p>
                    </div>
                  </div>
                </Card>

                <PostPreview
                  platform={kit.platform}
                  hook={kit.hook}
                  body={kit.body}
                  cta={kit.cta}
                  hashtags={kit.hashtags}
                />
              </div>
            ))}

            {contentKits.length === 0 && !loading && (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill in the form and generate your first content kit
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Generate;