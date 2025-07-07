
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SettingsHook {
  settings: Record<string, any>;
  updateSetting: (name: string, value: any) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useSettings = (settingNames: string[] = []): SettingsHook => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_name, setting_value')
        .eq('user_id', user.id);

      if (error) {
        console.error('Settings load error:', error);
        throw error;
      }

      const settingsMap: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          // Handle both simple values and JSON values
          settingsMap[setting.setting_name] = setting.setting_value;
        } catch (parseError) {
          console.warn('Failed to parse setting:', setting.setting_name, parseError);
          settingsMap[setting.setting_name] = setting.setting_value;
        }
      });

      console.log('Loaded settings:', settingsMap);
      setSettings(settingsMap);
      setError(null);
    } catch (error: any) {
      console.error('Error loading settings:', error);
      setError(error.message || 'Failed to load settings');
      toast({
        title: "Settings Load Error",
        description: "Failed to load your settings. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (name: string, value: any): Promise<boolean> => {
    try {
      console.log('Updating setting:', name, '=', value);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First try to update, then insert if doesn't exist
      const { error: upsertError } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            setting_name: name,
            setting_value: value,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id,setting_name',
            ignoreDuplicates: false 
          }
        );

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw upsertError;
      }

      // Update local state immediately for responsive UI
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));

      console.log('Setting saved successfully:', name, '=', value);
      return true;
    } catch (error: any) {
      console.error('Error saving setting:', error);
      setError(error.message || 'Failed to save setting');
      
      toast({
        title: "Save Error",
        description: `Failed to save ${name}: ${error.message}`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    settings,
    updateSetting,
    isLoading,
    error
  };
};
