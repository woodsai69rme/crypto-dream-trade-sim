-- Fix security issues: Enable RLS on tables missing it

-- Enable RLS on market_data_cache (public read access)
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read market data" ON public.market_data_cache
    FOR SELECT USING (true);

-- Enable RLS on bot_strategy_templates
ALTER TABLE public.bot_strategy_templates ENABLE ROW LEVEL SECURITY;

-- Fix function search_path issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;