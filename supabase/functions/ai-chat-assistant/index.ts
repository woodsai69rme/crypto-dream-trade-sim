
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are a professional cryptocurrency trading assistant. You provide expert analysis, trading advice, and market insights. 

Key responsibilities:
- Analyze market trends and provide actionable insights
- Suggest trading strategies based on technical and fundamental analysis
- Help with risk management and position sizing
- Explain complex crypto concepts in simple terms
- Provide alerts about important market movements
- Stay up-to-date with crypto news and developments

Always be professional, accurate, and helpful. If you're uncertain about something, say so rather than guessing.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, model = 'openrouter', context = [] } = await req.json()
    
    let apiKey: string | undefined;
    let endpoint: string;
    let headers: Record<string, string>;
    let body: any;

    // Configure based on selected model
    switch (model) {
      case 'openrouter':
        apiKey = Deno.env.get('OPENROUTER_API_KEY');
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://crypto-trading-simulator.com',
          'X-Title': 'Crypto Trading Simulator'
        };
        body = {
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...context.slice(-10),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;
        
      case 'openai':
        apiKey = Deno.env.get('OPENAI_API_KEY');
        endpoint = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        body = {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...context.slice(-10),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;
        
      case 'groq':
        apiKey = Deno.env.get('GROQ_API_KEY');
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        body = {
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...context.slice(-10),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;
        
      case 'deepseek':
        apiKey = Deno.env.get('DEEPSEEK_API_KEY');
        endpoint = 'https://api.deepseek.com/v1/chat/completions';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        };
        body = {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...context.slice(-10),
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;
        
      default:
        // Fallback to mock response if no API key
        return new Response(
          JSON.stringify({
            response: "I'm a crypto trading assistant. I can help you analyze markets, suggest strategies, and provide trading insights. However, I need an API key to be configured to provide real-time analysis.",
            type: 'general'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          response: `${model.toUpperCase()} API key not configured. Please add it in the API settings to enable AI assistance.`,
          type: 'general'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'No response generated';
    
    // Determine response type based on content
    let responseType = 'general';
    if (aiResponse.toLowerCase().includes('analysis') || aiResponse.toLowerCase().includes('chart')) {
      responseType = 'analysis';
    } else if (aiResponse.toLowerCase().includes('advice') || aiResponse.toLowerCase().includes('strategy')) {
      responseType = 'advice';
    } else if (aiResponse.toLowerCase().includes('alert') || aiResponse.toLowerCase().includes('warning')) {
      responseType = 'alert';
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        type: responseType,
        model: model
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Chat Assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I'm experiencing technical difficulties. Please try again or check your API configuration in settings."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
