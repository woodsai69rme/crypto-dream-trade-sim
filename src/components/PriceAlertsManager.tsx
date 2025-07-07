import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, BellOff, Plus, Trash2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface PriceAlert {
  id: string;
  symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  is_active: boolean;
  is_triggered: boolean;
  created_at: string;
}

export const PriceAlertsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    target_price: '',
    direction: 'above' as 'above' | 'below'
  });

  const popularSymbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'UNI', 'AVAX', 'MATIC', 'ATOM'];

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data as PriceAlert[]) || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load price alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.target_price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user?.id,
          symbol: newAlert.symbol,
          target_price: parseFloat(newAlert.target_price),
          direction: newAlert.direction,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Alert Created",
        description: `Price alert set for ${newAlert.symbol} ${newAlert.direction} $${newAlert.target_price}`,
      });

      setNewAlert({ symbol: '', target_price: '', direction: 'above' });
      setShowCreateForm(false);
      fetchAlerts();
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive",
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, is_active: isActive } : alert
      ));

      toast({
        title: isActive ? "Alert Enabled" : "Alert Disabled",
        description: `Price alert has been ${isActive ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      console.error('Error toggling alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(alerts.filter(alert => alert.id !== alertId));
      toast({
        title: "Alert Deleted",
        description: "Price alert has been removed",
      });
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    }
  };

  const getAlertIcon = (direction: string, isTriggered: boolean) => {
    if (isTriggered) return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return direction === 'above' ? 
      <TrendingUp className="w-4 h-4 text-green-400" /> : 
      <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (alert.is_triggered) return { label: 'Triggered', color: 'bg-yellow-500/20 text-yellow-400' };
    if (alert.is_active) return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
    return { label: 'Disabled', color: 'bg-gray-500/20 text-gray-400' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-primary-foreground">Price Alerts</h2>
          <Badge variant="outline">{alerts.length} alerts</Badge>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </Button>
      </div>

      {showCreateForm && (
        <Card className="crypto-card-gradient text-white">
          <CardHeader>
            <CardTitle>Create Price Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Symbol</Label>
                <Select value={newAlert.symbol} onValueChange={(value) => setNewAlert({...newAlert, symbol: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularSymbols.map(symbol => (
                      <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Direction</Label>
                <Select value={newAlert.direction} onValueChange={(value: 'above' | 'below') => setNewAlert({...newAlert, direction: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Target Price ($)</Label>
                <Input
                  type="number"
                  value={newAlert.target_price}
                  onChange={(e) => setNewAlert({...newAlert, target_price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createAlert} className="flex-1">
                Create Alert
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card className="crypto-card-gradient text-white">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="mt-2 text-white/60">Loading alerts...</p>
            </CardContent>
          </Card>
        ) : alerts.length === 0 ? (
          <Card className="crypto-card-gradient text-white">
            <CardContent className="p-6 text-center">
              <BellOff className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Price Alerts</h3>
              <p className="text-white/60 mb-4">Create your first price alert to get notified when prices hit your targets.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Alert
              </Button>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert) => {
            const status = getAlertStatus(alert);
            return (
              <Card key={alert.id} className="crypto-card-gradient text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.direction, alert.is_triggered)}
                      <div>
                        <h4 className="font-medium">
                          {alert.symbol} {alert.direction} ${alert.target_price.toLocaleString()}
                        </h4>
                        <div className="text-sm text-white/60">
                          Created {new Date(alert.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.is_active}
                          onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                          disabled={alert.is_triggered}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};