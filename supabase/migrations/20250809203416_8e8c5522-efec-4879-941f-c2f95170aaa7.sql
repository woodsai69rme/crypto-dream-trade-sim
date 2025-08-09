
-- Enable RLS on critical tables that were missing it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for users table
CREATE POLICY "Users can only access their own data" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Enable RLS on market_data_cache table
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for market data - make it publicly readable
CREATE POLICY "Market data is publicly readable" ON public.market_data_cache
  FOR SELECT USING (true);

-- Allow authenticated users to insert market data
CREATE POLICY "Authenticated users can insert market data" ON public.market_data_cache
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create audit_runs table for tracking system audits
CREATE TABLE public.audit_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  audit_type TEXT NOT NULL DEFAULT 'full_system',
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  results JSONB DEFAULT '{}',
  summary JSONB DEFAULT '{}',
  go_no_go_decision TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_runs
ALTER TABLE public.audit_runs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit runs
CREATE POLICY "Users can manage their own audit runs" ON public.audit_runs
  FOR ALL USING (auth.uid() = user_id);

-- Create simulation_trade_logs table for paper trading simulations
CREATE TABLE public.simulation_trade_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_run_id UUID REFERENCES public.audit_runs(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  account_id UUID REFERENCES public.paper_trading_accounts(id),
  bot_id UUID REFERENCES public.ai_trading_bots(id),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  execution_price NUMERIC,
  total_value NUMERIC NOT NULL,
  pnl NUMERIC DEFAULT 0,
  execution_latency_ms INTEGER DEFAULT 0,
  decision_logic JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on simulation_trade_logs
ALTER TABLE public.simulation_trade_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for simulation trade logs
CREATE POLICY "Users can manage their own simulation logs" ON public.simulation_trade_logs
  FOR ALL USING (auth.uid() = user_id);

-- Create system_diagnostics table for health checks
CREATE TABLE public.system_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_run_id UUID REFERENCES public.audit_runs(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  component_type TEXT NOT NULL,
  component_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'offline')),
  response_time_ms INTEGER,
  error_details JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on system_diagnostics
ALTER TABLE public.system_diagnostics ENABLE ROW LEVEL SECURITY;

-- Create policy for system diagnostics
CREATE POLICY "Users can manage their own diagnostics" ON public.system_diagnostics
  FOR ALL USING (auth.uid() = user_id);

-- Update market_data_cache to ensure consistency
ALTER TABLE public.market_data_cache 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS change_percentage_24h NUMERIC,
ADD COLUMN IF NOT EXISTS high_24h NUMERIC,
ADD COLUMN IF NOT EXISTS low_24h NUMERIC;

-- Create function to standardize market data access
CREATE OR REPLACE FUNCTION get_market_data(p_symbol TEXT)
RETURNS TABLE(
  symbol TEXT,
  price_usd NUMERIC,
  change_24h NUMERIC,
  volume_24h_usd NUMERIC,
  last_updated TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mdc.symbol,
    mdc.price_usd,
    mdc.change_24h,
    mdc.volume_24h_usd,
    mdc.last_updated
  FROM public.market_data_cache mdc
  WHERE mdc.symbol = p_symbol
  ORDER BY mdc.last_updated DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
