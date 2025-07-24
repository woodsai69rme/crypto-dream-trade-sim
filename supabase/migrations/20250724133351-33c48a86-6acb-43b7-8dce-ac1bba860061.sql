-- =============================================
-- PHASE 1: CRITICAL SECURITY FIXES (FIXED)
-- =============================================

-- Enable RLS on all tables that don't have it
ALTER TABLE public.news_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- Create comprehensive audit trail table
CREATE TABLE IF NOT EXISTS public.comprehensive_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  account_id UUID,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.comprehensive_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first, then recreate
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.comprehensive_audit;
CREATE POLICY "Users can view their own audit logs"
ON public.comprehensive_audit
FOR SELECT
USING (auth.uid() = user_id);

-- Create real-time risk monitoring table
CREATE TABLE IF NOT EXISTS public.risk_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  account_id UUID,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('position_size', 'daily_loss', 'drawdown', 'volatility', 'correlation')),
  current_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  alert_sent BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on risk monitoring
ALTER TABLE public.risk_monitoring ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for risk monitoring
DROP POLICY IF EXISTS "Users can manage their own risk monitoring" ON public.risk_monitoring;
CREATE POLICY "Users can manage their own risk monitoring"
ON public.risk_monitoring
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create real trades table for actual trading
CREATE TABLE IF NOT EXISTS public.real_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  account_id UUID NOT NULL,
  exchange_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  price NUMERIC NOT NULL CHECK (price > 0),
  execution_price NUMERIC,
  total_value NUMERIC NOT NULL,
  fee NUMERIC DEFAULT 0,
  trade_type TEXT DEFAULT 'market' CHECK (trade_type IN ('market', 'limit', 'stop')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'failed')),
  exchange_order_id TEXT,
  confirmation_required BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on real trades
ALTER TABLE public.real_trades ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for real trades
DROP POLICY IF EXISTS "Users can manage their own real trades" ON public.real_trades;
CREATE POLICY "Users can manage their own real trades"
ON public.real_trades
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trading confirmations table for 2FA on large trades
CREATE TABLE IF NOT EXISTS public.trading_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  trade_data JSONB NOT NULL,
  confirmation_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on trading confirmations
ALTER TABLE public.trading_confirmations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for trading confirmations
DROP POLICY IF EXISTS "Users can manage their own trading confirmations" ON public.trading_confirmations;
CREATE POLICY "Users can manage their own trading confirmations"
ON public.trading_confirmations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ENHANCE EXISTING TABLES FOR REAL TRADING
-- =============================================

-- Add trading limits to paper_trading_accounts for real trading mode
ALTER TABLE public.paper_trading_accounts 
ADD COLUMN IF NOT EXISTS trading_mode TEXT DEFAULT 'paper' CHECK (trading_mode IN ('paper', 'live')),
ADD COLUMN IF NOT EXISTS max_position_percentage NUMERIC DEFAULT 10.0 CHECK (max_position_percentage > 0 AND max_position_percentage <= 100),
ADD COLUMN IF NOT EXISTS daily_loss_limit NUMERIC DEFAULT 1000.0,
ADD COLUMN IF NOT EXISTS emergency_stop BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')),
ADD COLUMN IF NOT EXISTS auto_stop_loss_percentage NUMERIC DEFAULT 5.0;

-- Update AI bots table for better real trading support
ALTER TABLE public.ai_trading_bots
ADD COLUMN IF NOT EXISTS live_trading_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_live_balance NUMERIC DEFAULT 1000.0,
ADD COLUMN IF NOT EXISTS risk_parameters JSONB DEFAULT '{"max_position_size": 0.1, "stop_loss": 0.05, "take_profit": 0.15}';