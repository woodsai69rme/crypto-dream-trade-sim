import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { type PaperAccount } from "@/hooks/useMultipleAccounts";
import { 
  Share2, Copy, Mail, Link, Users, Eye, Settings, 
  Shield, Clock, Globe, QrCode 
} from "lucide-react";

interface AccountSharingProps {
  accountIds: string[];
  accounts: PaperAccount[];
  onClose: () => void;
}

export const AccountSharing = ({ accountIds, accounts, onClose }: AccountSharingProps) => {
  const { toast } = useToast();
  const [shareSettings, setShareSettings] = useState({
    shareType: 'view',
    expiresIn: '7',
    includePersonalInfo: false,
    allowComments: false,
    requireAuth: true,
    customMessage: ''
  });
  
  const [email, setEmail] = useState('');
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);

  const selectedAccounts = accounts.filter(acc => accountIds.includes(acc.id));

  const generateShareLink = async (accountId: string) => {
    setGenerating(true);
    try {
      // Simulate API call to generate share link
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shareToken = Math.random().toString(36).substring(2, 15);
      const shareLink = `${window.location.origin}/shared/${shareToken}`;
      
      setShareLinks(prev => ({
        ...prev,
        [accountId]: shareLink
      }));

      toast({
        title: "Share Link Generated",
        description: "Share link has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Link copied to clipboard",
    });
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Email Sent",
        description: `Sharing invitation sent to ${email}`,
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'view': return <Eye className="w-4 h-4 text-blue-400" />;
      case 'trade': return <Settings className="w-4 h-4 text-orange-400" />;
      case 'admin': return <Shield className="w-4 h-4 text-red-400" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Share Trading Accounts</h3>
        <p className="text-muted-foreground">
          Share {selectedAccounts.length} selected accounts with others
        </p>
      </div>

      {/* Share Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sharing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Share Type</Label>
              <Select value={shareSettings.shareType} onValueChange={(value) => 
                setShareSettings(prev => ({ ...prev, shareType: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      View Only - Can see performance
                    </div>
                  </SelectItem>
                  <SelectItem value="trade">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-400" />
                      Trading Access - Can make trades
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      Admin Access - Full control
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expires In</Label>
              <Select value={shareSettings.expiresIn} onValueChange={(value) => 
                setShareSettings(prev => ({ ...prev, expiresIn: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">1 Week</SelectItem>
                  <SelectItem value="30">1 Month</SelectItem>
                  <SelectItem value="90">3 Months</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Personal Information</Label>
                <p className="text-xs text-muted-foreground">Share account names and descriptions</p>
              </div>
              <Switch
                checked={shareSettings.includePersonalInfo}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, includePersonalInfo: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Comments</Label>
                <p className="text-xs text-muted-foreground">Recipients can leave comments</p>
              </div>
              <Switch
                checked={shareSettings.allowComments}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, allowComments: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Authentication</Label>
                <p className="text-xs text-muted-foreground">Recipients must sign in to view</p>
              </div>
              <Switch
                checked={shareSettings.requireAuth}
                onCheckedChange={(checked) => 
                  setShareSettings(prev => ({ ...prev, requireAuth: checked }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Add a personal message for recipients..."
              value={shareSettings.customMessage}
              onChange={(e) => setShareSettings(prev => ({ ...prev, customMessage: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accounts to Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedAccounts.map(account => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: account.color_theme + '33' }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color_theme }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${account.balance.toLocaleString()} • 
                      <span className={account.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {account.total_pnl >= 0 ? '+' : ''}{account.total_pnl_percentage.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getPermissionIcon(shareSettings.shareType)}
                  <Badge variant="outline">
                    {shareSettings.shareType}
                  </Badge>
                  
                  {shareLinks[account.id] ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(shareLinks[account.id])}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => generateShareLink(account.id)}
                      disabled={generating}
                    >
                      <Link className="w-4 h-4 mr-1" />
                      Generate Link
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Share via Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Button onClick={sendEmail} className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        {/* Direct Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Direct Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const shareData = {
                  title: 'Trading Account Performance',
                  text: `Check out my trading performance across ${selectedAccounts.length} accounts`,
                  url: window.location.href
                };
                
                if (navigator.share) {
                  navigator.share(shareData);
                } else {
                  copyToClipboard(window.location.href);
                }
              }}
            >
              <Globe className="w-4 h-4 mr-2" />
              Share to Social Media
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                // Generate QR code logic would go here
                toast({
                  title: "QR Code",
                  description: "QR code sharing coming soon!",
                });
              }}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const links = Object.values(shareLinks).join('\n');
                copyToClipboard(links);
              }}
              disabled={Object.keys(shareLinks).length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All Links
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Shares */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Shares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active shares yet</p>
            <p className="text-sm">Generated share links will appear here</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button 
          onClick={() => {
            toast({
              title: "Sharing Configured",
              description: "Your sharing settings have been saved",
            });
            onClose();
          }}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
};