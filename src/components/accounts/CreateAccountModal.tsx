import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AccountTemplate } from "@/hooks/useMultipleAccounts";
import { 
  Plus, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Star,
  Users,
  Zap
} from "lucide-react";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

export const CreateAccountModal = ({ isOpen, onClose, onAccountCreated }: CreateAccountModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<AccountTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AccountTemplate | null>(null);
  const [accountName, setAccountName] = useState('');
  const [customBalance, setCustomBalance] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('account_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as AccountTemplate[]);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error Loading Templates",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to create an account",
        variant: "destructive",
      });
      return;
    }

    if (!accountName.trim()) {
      toast({
        title: "Account Name Required",
        description: "Please enter a name for your account",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const balance = customBalance ? parseFloat(customBalance) : undefined;
      
      const { data: accountId, error } = await supabase.rpc('create_account_from_template', {
        template_id_param: selectedTemplate.id,
        account_name_param: accountName.trim(),
        custom_balance_param: balance
      });

      if (error) throw error;

      toast({
        title: "Account Created",
        description: `"${accountName}" has been created successfully`,
      });
      
      onAccountCreated();
      onClose();
      
      // Reset form
      setSelectedTemplate(null);
      setAccountName('');
      setCustomBalance('');
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Account Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'aggressive': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTemplateIcon = (strategy: string) => {
    switch (strategy) {
      case 'conservative': return <Shield className="w-5 h-5" />;
      case 'aggressive': return <Zap className="w-5 h-5" />;
      case 'balanced': return <TrendingUp className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto crypto-card-gradient text-primary-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="w-5 h-5" />
            Create New Trading Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Details */}
          <Card className="bg-background/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Account Name *</Label>
                <Input 
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account name (e.g., 'Bitcoin Trading', 'Conservative Portfolio')"
                  className="bg-background/10 border-white/20"
                />
              </div>
              <div>
                <Label>Custom Initial Balance (optional)</Label>
                <Input 
                  type="number"
                  value={customBalance}
                  onChange={(e) => setCustomBalance(e.target.value)}
                  placeholder="Leave empty to use template default"
                  className="bg-background/10 border-white/20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Override the template's default balance if needed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card className="bg-background/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Select Account Template</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose a pre-configured template that matches your trading strategy
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedTemplate?.id === template.id 
                        ? 'bg-primary/20 border-primary' 
                        : 'bg-background/5 border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTemplateIcon(template.trading_strategy)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{template.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {template.description}
                          </p>
                        </div>
                        {template.usage_count > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {template.usage_count}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Initial Balance:</span>
                          <span className="font-medium">${template.initial_balance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Type:</span>
                          <span className="capitalize">{template.account_type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Risk Level:</span>
                          <Badge className={getRiskLevelColor(template.risk_level)}>
                            {template.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Strategy:</span>
                          <span className="capitalize">{template.trading_strategy.replace('-', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Daily Loss:</span>
                          <span>${template.max_daily_loss?.toLocaleString() || 'No limit'}</span>
                        </div>
                      </div>

                      {template.tags && template.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No templates available. Loading...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Template Summary */}
          {selectedTemplate && (
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    {getTemplateIcon(selectedTemplate.trading_strategy)}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Selected: {selectedTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Initial Balance:</span>
                    <div className="font-medium">
                      ${(customBalance ? parseFloat(customBalance) : selectedTemplate.initial_balance).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Name:</span>
                    <div className="font-medium">{accountName || 'Not set'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAccount} 
              disabled={loading || !selectedTemplate || !accountName.trim()}
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};