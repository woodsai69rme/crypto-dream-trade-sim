import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SettingsHook {
  settings: Record<string, any>;
  updateSetting: (name: string, value: any) => Promise<void>;
  isLoading: boolean;
}

export const useSettings = (settingNames: string[] = []): SettingsHook => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_name, setting_value')
        .eq('user_id', user.id);

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach(setting => {
        settingsMap[setting.setting_name] = setting.setting_value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Settings Load Error",
        description: "Failed to load your settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (name: string, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          setting_name: name,
          setting_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,setting_name'
        });

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        [name]: value
      }));

      toast({
        title: "Settings Saved",
        description: `${name} updated successfully`,
      });
    } catch (error) {
      console.error('Error saving setting:', error);
      toast({
        title: "Save Error",
        description: `Failed to save ${name}`,
        variant: "destructive",
      });
    }
  };

  return {
    settings,
    updateSetting,
    isLoading
  };
};