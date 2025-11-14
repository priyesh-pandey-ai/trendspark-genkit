import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  platform: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  account_handle: string;
  account_name: string;
  is_active: boolean;
  last_used_at?: string;
}

const SocialMediaSettings = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('twitter');
  const [formData, setFormData] = useState({
    accessToken: '',
    refreshToken: '',
    accountHandle: '',
    accountName: '',
  });
  const [saving, setSaving] = useState(false);

  const platforms = [
    { value: 'twitter', label: 'Twitter/X', icon: '𝕏' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'facebook', label: 'Facebook', icon: '👍' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching integrations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    if (!formData.accessToken || !formData.accountHandle || !formData.accountName) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('social_media_integrations')
        .insert({
          platform: selectedPlatform,
          access_token: formData.accessToken,
          refresh_token: formData.refreshToken || null,
          account_handle: formData.accountHandle,
          account_name: formData.accountName,
          is_active: true,
        })
        .select();

      if (error) throw error;

      setIntegrations((prev) => [data[0], ...prev]);
      setFormData({
        accessToken: '',
        refreshToken: '',
        accountHandle: '',
        accountName: '',
      });
      setOpenDialog(false);

      toast({
        title: 'Integration added',
        description: `${selectedPlatform} account connected successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error adding integration',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const { error } = await supabase
        .from('social_media_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIntegrations((prev) => prev.filter((i) => i.id !== id));

      toast({
        title: 'Integration deleted',
        description: 'Social media account disconnected',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting integration',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleIntegration = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('social_media_integrations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, is_active: !currentStatus } : i
        )
      );

      toast({
        title: 'Status updated',
        description: `Integration ${!currentStatus ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating integration',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getPlatformLabel = (platform: string) => {
    return platforms.find((p) => p.value === platform)?.label || platform;
  };

  const getPlatformIcon = (platform: string) => {
    return platforms.find((p) => p.value === platform)?.icon || '📱';
  };

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Social Media Integrations</h2>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Social Media Account</DialogTitle>
              <DialogDescription>
                Add your social media API credentials to enable automated posting
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p className="font-semibold mb-1">Getting your API credentials:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedPlatform === 'twitter' && (
                      <>
                        <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Twitter Developer Portal</a></li>
                        <li>Create an app and generate Bearer Token</li>
                      </>
                    )}
                    {selectedPlatform === 'instagram' && (
                      <>
                        <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                        <li>Create an app and get your Access Token</li>
                      </>
                    )}
                    {selectedPlatform === 'facebook' && (
                      <>
                        <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                        <li>Create an app and get your Page Access Token</li>
                      </>
                    )}
                    {selectedPlatform === 'linkedin' && (
                      <>
                        <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn Developers</a></li>
                        <li>Create an app and generate an Access Token</li>
                      </>
                    )}
                    {selectedPlatform === 'tiktok' && (
                      <>
                        <li>Go to <a href="https://developer.tiktok.com" target="_blank" rel="noopener noreferrer" className="underline">TikTok Developer</a></li>
                        <li>Create an app and get your Access Token</li>
                      </>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token *</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="Paste your access token here"
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refreshToken">Refresh Token (Optional)</Label>
                <Input
                  id="refreshToken"
                  type="password"
                  placeholder="Paste your refresh token (if applicable)"
                  value={formData.refreshToken}
                  onChange={(e) =>
                    setFormData({ ...formData, refreshToken: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHandle">Account Handle *</Label>
                <Input
                  id="accountHandle"
                  placeholder="e.g., @myaccount or username"
                  value={formData.accountHandle}
                  onChange={(e) =>
                    setFormData({ ...formData, accountHandle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Display Name *</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., My Brand Account"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleAddIntegration}
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Connecting...' : 'Connect Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading integrations...
        </div>
      ) : integrations.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No integrations yet</h3>
          <p className="text-muted-foreground mb-6">
            Connect your social media accounts to start posting automatically
          </p>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Integration
              </Button>
            </DialogTrigger>
          </Dialog>
        </Card>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">
                      {getPlatformIcon(integration.platform)}
                    </span>
                    <div>
                      <h3 className="font-semibold">
                        {getPlatformLabel(integration.platform)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {integration.account_name} ({integration.account_handle})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </Badge>

                    {isTokenExpired(integration.token_expires_at) && (
                      <Badge variant="destructive">Token Expired</Badge>
                    )}

                    {integration.last_used_at && (
                      <span className="text-xs text-muted-foreground">
                        Last used: {new Date(integration.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toggleIntegration(integration.id, integration.is_active)
                    }
                  >
                    {integration.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteIntegration(integration.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {integrations.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            You have {integrations.filter((i) => i.is_active).length} active integration(s).
            You can now use the bulk posting feature from the Content Library.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SocialMediaSettings;
