
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    max_completion_tokens: number;
    is_moderated: boolean;
  };
}

export interface OpenRouterUsage {
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
  timestamp: string;
}

export const useOpenRouterIntegration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [usage, setUsage] = useState<OpenRouterUsage[]>([]);

  const fetchAvailableModels = useCallback(async (apiKey?: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch OpenRouter models');
      }

      const data = await response.json();
      setModels(data.data || []);
      
      toast({
        title: "Models Fetched",
        description: `Found ${data.data?.length || 0} available models`,
      });
    } catch (error: any) {
      console.error('Error fetching OpenRouter models:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available models",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const generateTradingAnalysis = useCallback(async (
    prompt: string,
    modelId: string = 'anthropic/claude-3.5-sonnet',
    apiKey: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CryptoTrader Pro',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: 'You are an expert cryptocurrency trading analyst. Provide detailed, actionable trading insights based on the given market data and context.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      const data = await response.json();
      
      // Log usage
      const usageEntry: OpenRouterUsage = {
        model: modelId,
        usage: data.usage,
        cost: parseFloat(data.usage.total_tokens) * 0.00001, // Approximate cost
        timestamp: new Date().toISOString(),
      };
      
      setUsage(prev => [usageEntry, ...prev.slice(0, 99)]); // Keep last 100 entries

      return data.choices[0]?.message?.content || 'No analysis generated';
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate trading analysis",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getTotalUsageCost = useCallback(() => {
    return usage.reduce((total, entry) => total + entry.cost, 0);
  }, [usage]);

  return {
    models,
    usage,
    loading,
    fetchAvailableModels,
    generateTradingAnalysis,
    getTotalUsageCost,
  };
};
