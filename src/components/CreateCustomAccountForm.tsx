import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMultipleAccounts, type PaperAccount } from "@/hooks/useMultipleAccounts";
import { 
  Zap, Shield, BarChart3, BookOpen, Bitcoin, Bot, Trophy, Target, 
  TrendingUp, Star, Users, Palette, Hash 
} from "lucide-react";

const ACCOUNT_TYPES = [
  { value: 'balanced', label: 'Balanced Portfolio', icon: BarChart3, color: '#3b82f6' },
  { value: 'aggressive_growth', label: 'Aggressive Growth', icon: Zap, color: '#ef4444' },
  { value: 'conservative', label: 'Conservative', icon: Shield, color: '#10b981' },
  { value: 'day_trading', label: 'Day Trading', icon: TrendingUp, color: '#f97316' },
  { value: 'swing_trading', label: 'Swing Trading', icon: Target, color: '#f59e0b' },
  { value: 'long_term', label: 'Long Term', icon: Star, color: '#8b5cf6' },
  { value: 'experimental', label: 'Experimental', icon: Bot, color: '#06b6d4' },
  { value: 'educational', label: 'Educational', icon: BookOpen, color: '#8b5cf6' },
  { value: 'competition', label: 'Competition', icon: Trophy, color: '#dc2626' },
  { value: 'copy_trading', label: 'Copy Trading', icon: Users, color: '#059669' }
];

const RISK_LEVELS = [
  { value: 'very_low', label: 'Very Low', color: '#10b981' },
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'very_high', label: 'Very High', color: '#ef4444' },
  { value: 'extreme', label: 'Extreme', color: '#a855f7' }
];

const TRADING_STRATEGIES = [
  'manual', 'buy_and_hold', 'day_trading', 'swing_trading', 'scalping',
  'grid_trading', 'dca', 'momentum', 'mean_reversion', 'arbitrage',
  'algorithmic', 'sentiment', 'technical', 'fundamental'
];

const COLOR_THEMES = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#dc2626', '#059669', '#7c3aed'
];

const ICONS = [
  'TrendingUp', 'BarChart3', 'Zap', 'Shield', 'Target', 'Star',
  'Bot', 'BookOpen', 'Trophy', 'Users', 'Bitcoin', 'DollarSign'
];

interface CreateCustomAccountFormProps {
  onClose: () => void;
}

export const CreateCustomAccountForm = ({ onClose }: CreateCustomAccountFormProps) => {
  const { createCustomAccount, creating } = useMultipleAccounts();
  
  const [formData, setFormData] = useState<Partial<PaperAccount>>({
    account_name: '',
    initial_balance: 100000,
    account_type: 'balanced',
    risk_level: 'medium',
    description: '',
    color_theme: '#3b82f6',
    icon: 'TrendingUp',
    max_daily_loss: 1000,
    max_position_size: 5000,
    trading_strategy: 'manual',
    auto_rebalance: false,
    performance_target: 10,
    max_drawdown_limit: 20,
    currency: 'USD',
    timezone: 'UTC',
    tags: []
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof PaperAccount, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && formData.tags && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_name?.trim()) {
      return;
    }

    const success = await createCustomAccount(formData);
    if (success) {
      onClose();
    }
  };

  const selectedAccountType = ACCOUNT_TYPES.find(type => type.value === formData.account_type);
  const selectedRiskLevel = RISK_LEVELS.find(risk => risk.value === formData.risk_level);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name *</Label>
              <Input
                id="account-name"
                placeholder="Enter account name"
                value={formData.account_name}
                onChange={(e) => handleInputChange('account_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your trading strategy or goals"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial-balance">Initial Balance ($) *</Label>
              <Input
                id="initial-balance"
                type="number"
                min="1000"
                step="1000"
                value={formData.initial_balance}
                onChange={(e) => handleInputChange('initial_balance', parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Type & Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Type & Risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select value={formData.account_type} onValueChange={(value) => handleInputChange('account_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" style={{ color: type.color }} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={formData.risk_level} onValueChange={(value) => handleInputChange('risk_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map(risk => (
                    <SelectItem key={risk.value} value={risk.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: risk.color }}
                        />
                        {risk.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trading Strategy</Label>
              <Select value={formData.trading_strategy} onValueChange={(value) => handleInputChange('trading_strategy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADING_STRATEGIES.map(strategy => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="performance-target">Performance Target (%)</Label>
                <Input
                  id="performance-target"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.performance_target}
                  onChange={(e) => handleInputChange('performance_target', parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-drawdown">Max Drawdown (%)</Label>
                <Input
                  id="max-drawdown"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.max_drawdown_limit}
                  onChange={(e) => handleInputChange('max_drawdown_limit', parseFloat(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-daily-loss">Max Daily Loss ($)</Label>
              <Input
                id="max-daily-loss"
                type="number"
                min="100"
                step="100"
                value={formData.max_daily_loss}
                onChange={(e) => handleInputChange('max_daily_loss', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-position-size">Max Position Size ($)</Label>
              <Input
                id="max-position-size"
                type="number"
                min="1000"
                step="500"
                value={formData.max_position_size}
                onChange={(e) => handleInputChange('max_position_size', parseFloat(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Rebalancing</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically rebalance portfolio
                </p>
              </div>
              <Switch
                checked={formData.auto_rebalance}
                onCheckedChange={(checked) => handleInputChange('auto_rebalance', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_THEMES.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color_theme === color ? 'border-white shadow-lg' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleInputChange('color_theme', color)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(icon => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Hash className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.color_theme + '33' }}
            >
              {selectedAccountType && (
                <selectedAccountType.icon 
                  className="w-6 h-6" 
                  style={{ color: formData.color_theme }}
                />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {formData.account_name || 'Account Name'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge style={{ 
                  backgroundColor: selectedRiskLevel?.color + '33',
                  color: selectedRiskLevel?.color,
                  borderColor: selectedRiskLevel?.color + '66'
                }}>
                  {selectedRiskLevel?.label}
                </Badge>
                <Badge variant="outline">
                  {selectedAccountType?.label}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${formData.initial_balance?.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Initial Balance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!formData.account_name?.trim() || creating}
          className="flex-1"
        >
          {creating ? "Creating Account..." : "Create Account"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};