import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Search, Download, Eye, Edit, Copy, Trash2, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentKit {
  id: string;
  brand_id: string;
  trend_title: string;
  platform: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  status: string;
  created_at: string;
  brands: {
    name: string;
  };
}

const ContentLibrary = () => {
  const [contentKits, setContentKits] = useState<ContentKit[]>([]);
  const [filteredKits, setFilteredKits] = useState<ContentKit[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const platforms = ["Instagram", "LinkedIn", "Twitter", "Facebook", "TikTok"];
  const statuses = ["draft", "approved", "scheduled", "published"];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contentKits, searchQuery, selectedBrand, selectedPlatforms, selectedStatus]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const [kitsResult, brandsResult] = await Promise.all([
        supabase
          .from('content_kits')
          .select('*, brands(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('brands')
          .select('*')
          .order('name', { ascending: true })
      ]);

      if (kitsResult.error) throw kitsResult.error;
      if (brandsResult.error) throw brandsResult.error;

      setContentKits(kitsResult.data || []);
      setBrands(brandsResult.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contentKits];

    if (searchQuery) {
      filtered = filtered.filter(kit =>
        kit.trend_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kit.hook?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kit.body?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter(kit => kit.brand_id === selectedBrand);
    }

    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(kit => selectedPlatforms.includes(kit.platform));
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(kit => kit.status === selectedStatus);
    }

    setFilteredKits(filtered);
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCopy = (kit: ContentKit) => {
    const text = `${kit.hook}\n\n${kit.body}\n\n${kit.cta}\n\n${kit.hashtags?.join(' ') || ''}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${kit.platform} post copied`,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_kits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContentKits(prev => prev.filter(kit => kit.id !== id));
      toast({
        title: "Content deleted",
        description: "Content kit has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('content_kits')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setContentKits(prev =>
        prev.map(kit => kit.id === id ? { ...kit, status: newStatus } : kit)
      );

      toast({
        title: "Status updated",
        description: `Content marked as ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    if (filteredKits.length === 0) {
      toast({
        title: "No content to export",
        description: "Apply filters to show content",
        variant: "destructive",
      });
      return;
    }

    const csv = filteredKits.map(kit => ({
      'Brand Name': kit.brands.name,
      'Trend Title': kit.trend_title,
      'Platform': kit.platform,
      'Hook': kit.hook || '',
      'Body': kit.body || '',
      'CTA': kit.cta || '',
      'Hashtags': kit.hashtags?.join(' ') || '',
      'Status': kit.status,
      'Created Date': new Date(kit.created_at).toLocaleDateString()
    }));

    const headers = Object.keys(csv[0]).join(',');
    const rows = csv.map(row => 
      Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-library-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `${filteredKits.length} content kits exported`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'approved': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'published': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Content Library</h1>
          <p className="text-muted-foreground">View and manage all your generated content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold text-primary">{contentKits.length}</div>
            <div className="text-sm text-muted-foreground">Total Content</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {contentKits.filter(k => k.status === 'approved').length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-500">
              {contentKits.filter(k => k.status === 'scheduled').length}
            </div>
            <div className="text-sm text-muted-foreground">Scheduled</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-500">
              {contentKits.filter(k => k.status === 'published').length}
            </div>
            <div className="text-sm text-muted-foreground">Published</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by trend or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="All brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All brands</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Export */}
              <div className="space-y-2">
                <Label>Export</Label>
                <Button onClick={exportToCSV} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </Button>
              </div>
            </div>

            {/* Platform Checkboxes */}
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-4">
                {platforms.map(platform => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${platform}`}
                      checked={selectedPlatforms.includes(platform)}
                      onCheckedChange={() => togglePlatform(platform)}
                    />
                    <label
                      htmlFor={`platform-${platform}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {platform}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Content Table */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredKits.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {contentKits.length === 0 
                ? "No content generated yet. Create content from the Generate page."
                : "No content matches your filters."}
            </p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trend Title</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKits.map((kit) => (
                  <TableRow key={kit.id}>
                    <TableCell className="font-medium">{kit.trend_title}</TableCell>
                    <TableCell>{kit.brands.name}</TableCell>
                    <TableCell>{kit.platform}</TableCell>
                    <TableCell>{new Date(kit.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`${getStatusColor(kit.status)} cursor-pointer`}>
                            {kit.status}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {statuses.map(status => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusUpdate(kit.id, status)}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopy(kit)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(kit.id)} className="text-destructive">
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
      </main>
    </div>
  );
};

export default ContentLibrary;
