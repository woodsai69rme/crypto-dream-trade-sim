import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMultipleAccounts, type AccountTemplate } from "@/hooks/useMultipleAccounts";
import { 
  Zap, Shield, BarChart3, BookOpen, Bitcoin, Bot, Trophy, Target, 
  TrendingUp, Star, Users, DollarSign 
} from "lucide-react";

const TEMPLATE_ICONS = {
  aggressive_growth: Zap,
  conservative: Shield,
  balanced: BarChart3,
  day_trading: TrendingUp,
  swing_trading: Target,  
  long_term: Star,
  experimental: Bot,
  educational: BookOpen,
  competition: Trophy,
  copy_trading: Users
};

const RISK_COLORS = {
  very_low: '#10b981',
  low: '#10b981',
  medium: '#f59e0b', 
  high: '#f97316',
  very_high: '#ef4444',
  extreme: '#a855f7'
};

interface AccountTemplateSelectorProps {
  templates: AccountTemplate[];
  onClose: () => void;
}

export const AccountTemplateSelector = ({ templates, onClose }: AccountTemplateSelectorProps) => {
  const { createAccountFromTemplate, creating } = useMultipleAccounts();
  const [selectedTemplate, setSelectedTemplate] = useState<AccountTemplate | null>(null);
  const [accountName, setAccountName] = useState("");
  const [customBalance, setCustomBalance] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTemplates = templates.filter(template => 
    filterType === "all" || template.account_type === filterType
  );

  const handleCreateAccount = async () => {
    if (!selectedTemplate || !accountName.trim()) return;

    const balance = customBalance ? parseFloat(customBalance) : undefined;
    const success = await createAccountFromTemplate(
      selectedTemplate.id, 
      accountName.trim(), 
      balance
    );

    if (success) {
      onClose();
    }
  };

  const accountTypes = Array.from(new Set(templates.map(t => t.account_type)));

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          All Templates ({templates.length})
        </Button>
        {accountTypes.map(type => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {type.replace('_', ' ')} ({templates.filter(t => t.account_type === type).length})
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Template</h3>
          <ScrollArea className="h-96">
            <div className="grid gap-3">
              {filteredTemplates.map(template => {
                const TemplateIcon = TEMPLATE_ICONS[template.account_type as keyof typeof TEMPLATE_ICONS] || BarChart3;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: template.color_theme + '33',
                            border: `1px solid ${template.color_theme}66`
                          }}
                        >
                          <TemplateIcon 
                            className="w-5 h-5" 
                            style={{ color: template.color_theme }}
                          />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              style={{ 
                                backgroundColor: RISK_COLORS[template.risk_level as keyof typeof RISK_COLORS] + '33',
                                color: RISK_COLORS[template.risk_level as keyof typeof RISK_COLORS],
                                borderColor: RISK_COLORS[template.risk_level as keyof typeof RISK_COLORS] + '66'
                              }}
                            >
                              {template.risk_level.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Used {template.usage_count} times
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Initial Balance</span>
                          <p className="font-medium">${template.initial_balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Daily Loss</span>
                          <p className="font-medium">${template.max_daily_loss.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Strategy</span>
                          <p className="font-medium capitalize">{template.trading_strategy.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Position</span>
                          <p className="font-medium">${template.max_position_size.toLocaleString()}</p>
                        </div>
                      </div>

                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Account Configuration */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Account Configuration</h3>
          
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create: {selectedTemplate.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name *</Label>
                  <Input
                    id="account-name"
                    placeholder="My Trading Account"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-balance">
                    Custom Balance (Optional)
                  </Label>
                  <Input
                    id="custom-balance"
                    type="number"
                    placeholder={`Default: $${selectedTemplate.initial_balance.toLocaleString()}`}
                    value={customBalance}
                    onChange={(e) => setCustomBalance(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use template default
                  </p>
                </div>

                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm">Template Settings Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Account Type</span>
                      <p className="capitalize">{selectedTemplate.account_type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Risk Level</span>
                      <p className="capitalize">{selectedTemplate.risk_level.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Daily Loss</span>
                      <p>${selectedTemplate.max_daily_loss.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Position Size</span>
                      <p>${selectedTemplate.max_position_size.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateAccount}
                    disabled={!accountName.trim() || creating}
                    className="flex-1"
                  >
                    {creating ? "Creating..." : "Create Account"}
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a template to configure your new account</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};