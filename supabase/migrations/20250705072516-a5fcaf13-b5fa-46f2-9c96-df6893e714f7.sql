-- Enhanced Multiple Paper Trading Accounts System
-- This adds comprehensive multi-account functionality with advanced features

-- Create account types enum
CREATE TYPE account_type AS ENUM (
  'aggressive_growth',
  'conservative',
  'balanced',
  'day_trading',
  'swing_trading',
  'long_term',
  'experimental',
  'educational',
  'competition',
  'copy_trading'
);

-- Create risk level enum  
CREATE TYPE risk_level AS ENUM (
  'very_low',
  'low', 
  'medium',
  'high',
  'very_high',
  'extreme'
);

-- Create account status enum
CREATE TYPE account_status AS ENUM (
  'active',
  'paused',
  'closed',
  'suspended',
  'archived'
);

-- Enhance paper_trading_accounts table with comprehensive features
ALTER TABLE public.paper_trading_accounts 
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS risk_level risk_level DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS status account_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS color_theme VARCHAR(7) DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'TrendingUp',
ADD COLUMN IF NOT EXISTS max_daily_loss NUMERIC DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS max_position_size NUMERIC DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS trading_strategy TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS auto_rebalance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS benchmark_symbol VARCHAR(10) DEFAULT 'BTC',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false, "discord": false}'::jsonb,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS performance_target NUMERIC DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS max_drawdown_limit NUMERIC DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_token VARCHAR(32) UNIQUE,
ADD COLUMN IF NOT EXISTS copied_from_account_id UUID REFERENCES public.paper_trading_accounts(id),
ADD COLUMN IF NOT EXISTS copy_settings JSONB DEFAULT '{}'::jsonb;

-- Create comprehensive account analytics table
CREATE TABLE IF NOT EXISTS public.account_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  analytics_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Performance metrics
  daily_return NUMERIC DEFAULT 0,
  weekly_return NUMERIC DEFAULT 0,
  monthly_return NUMERIC DEFAULT 0,
  quarterly_return NUMERIC DEFAULT 0,
  yearly_return NUMERIC DEFAULT 0,
  
  -- Risk metrics
  volatility NUMERIC DEFAULT 0,
  sharpe_ratio NUMERIC DEFAULT 0,
  sortino_ratio NUMERIC DEFAULT 0,
  max_drawdown NUMERIC DEFAULT 0,
  current_drawdown NUMERIC DEFAULT 0,
  
  -- Trading metrics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  avg_win NUMERIC DEFAULT 0,
  avg_loss NUMERIC DEFAULT 0,
  profit_factor NUMERIC DEFAULT 0,
  
  -- Activity metrics
  active_positions INTEGER DEFAULT 0,
  largest_position NUMERIC DEFAULT 0,
  portfolio_diversity NUMERIC DEFAULT 0,
  cash_percentage NUMERIC DEFAULT 100,
  
  -- Benchmark comparison
  benchmark_return NUMERIC DEFAULT 0,
  alpha NUMERIC DEFAULT 0,
  beta NUMERIC DEFAULT 1,
  correlation NUMERIC DEFAULT 0,
  
  -- Custom metrics
  custom_metrics JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(account_id, analytics_date)
);

-- Create account templates table for quick account creation
CREATE TABLE IF NOT EXISTS public.account_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  account_type account_type NOT NULL,
  risk_level risk_level NOT NULL,
  initial_balance NUMERIC NOT NULL DEFAULT 100000.00,
  max_daily_loss NUMERIC DEFAULT 1000.00,
  max_position_size NUMERIC DEFAULT 5000.00,
  trading_strategy TEXT DEFAULT 'manual',
  color_theme VARCHAR(7) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'TrendingUp',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default account templates
INSERT INTO public.account_templates (name, description, account_type, risk_level, initial_balance, max_daily_loss, max_position_size, trading_strategy, color_theme, icon, tags) VALUES
('Conservative Growth', 'Low-risk, steady growth focused account', 'conservative', 'low', 100000, 500, 2500, 'buy_and_hold', '#10b981', 'Shield', ARRAY['conservative', 'long-term', 'stable']),
('Aggressive Trader', 'High-risk, high-reward day trading account', 'aggressive_growth', 'very_high', 50000, 2500, 10000, 'day_trading', '#ef4444', 'Zap', ARRAY['aggressive', 'day-trading', 'high-risk']),
('Balanced Portfolio', 'Moderate risk with diversified strategy', 'balanced', 'medium', 100000, 1000, 5000, 'balanced', '#3b82f6', 'BarChart3', ARRAY['balanced', 'diversified', 'moderate']),
('Swing Trading Pro', 'Medium-term swing trading strategy', 'swing_trading', 'high', 75000, 1500, 7500, 'swing_trading', '#f59e0b', 'TrendingUp', ARRAY['swing', 'technical', 'momentum']),
('Learning Account', 'Educational account for beginners', 'educational', 'low', 25000, 250, 1250, 'educational', '#8b5cf6', 'BookOpen', ARRAY['education', 'beginner', 'learning']),
('Crypto Specialist', 'Cryptocurrency focused trading', 'experimental', 'high', 100000, 2000, 8000, 'crypto_focus', '#f97316', 'Bitcoin', ARRAY['crypto', 'bitcoin', 'altcoins']),
('Algorithm Testing', 'For testing automated strategies', 'experimental', 'medium', 150000, 3000, 12000, 'algorithmic', '#06b6d4', 'Bot', ARRAY['algo', 'testing', 'automation']),
('Competition Ready', 'High-performance competition account', 'competition', 'very_high', 200000, 5000, 20000, 'competition', '#dc2626', 'Trophy', ARRAY['competition', 'performance', 'leaderboard']);

-- Create account sharing and collaboration table
CREATE TABLE IF NOT EXISTS public.account_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  shared_with_id UUID,
  shared_with_email TEXT,
  share_type VARCHAR(20) DEFAULT 'view', -- view, trade, admin
  permissions JSONB DEFAULT '{"view": true, "trade": false, "settings": false}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  share_token VARCHAR(32) UNIQUE DEFAULT substr(md5(random()::text), 1, 32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create account notifications table
CREATE TABLE IF NOT EXISTS public.account_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- balance_alert, performance_alert, trade_alert, etc.
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, success
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enhance paper_account_audit with more comprehensive tracking
ALTER TABLE public.paper_account_audit 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS session_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS device_info TEXT,
ADD COLUMN IF NOT EXISTS location_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS transaction_hash VARCHAR(100),
ADD COLUMN IF NOT EXISTS related_trade_id UUID REFERENCES public.paper_trades(id);

-- Update paper_trades to link to specific accounts (not just bot_id)
ALTER TABLE public.paper_trades 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.paper_trading_accounts(id),
ADD COLUMN IF NOT EXISTS trade_category VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS risk_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS confidence_level NUMERIC DEFAULT 50,
ADD COLUMN IF NOT EXISTS stop_loss NUMERIC,
ADD COLUMN IF NOT EXISTS take_profit NUMERIC,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER DEFAULT 0;

-- Make bot_id nullable since we now have account_id
ALTER TABLE public.paper_trades ALTER COLUMN bot_id DROP NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paper_trading_accounts_user_status ON public.paper_trading_accounts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_paper_trading_accounts_type ON public.paper_trading_accounts(account_type, risk_level);
CREATE INDEX IF NOT EXISTS idx_account_analytics_account_date ON public.account_analytics(account_id, analytics_date DESC);
CREATE INDEX IF NOT EXISTS idx_paper_trades_account_created ON public.paper_trades(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_notifications_user_unread ON public.account_notifications(user_id, is_read, created_at DESC);

-- Enable RLS on new tables
ALTER TABLE public.account_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for account_analytics
CREATE POLICY "Users can manage their own account analytics" ON public.account_analytics
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for account_templates  
CREATE POLICY "Users can view public templates and their own" ON public.account_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own templates" ON public.account_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" ON public.account_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON public.account_templates
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for account_shares
CREATE POLICY "Users can manage shares for their accounts" ON public.account_shares
  FOR ALL USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

-- RLS policies for account_notifications
CREATE POLICY "Users can manage their own account notifications" ON public.account_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Create comprehensive functions for account management

-- Function to create account from template
CREATE OR REPLACE FUNCTION public.create_account_from_template(
  template_id_param UUID,
  account_name_param TEXT,
  custom_balance_param NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_record RECORD;
  new_account_id UUID;
  balance_to_use NUMERIC;
BEGIN
  -- Get template details
  SELECT * INTO template_record FROM public.account_templates WHERE id = template_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found';
  END IF;
  
  balance_to_use := COALESCE(custom_balance_param, template_record.initial_balance);
  
  -- Create new account from template
  INSERT INTO public.paper_trading_accounts (
    user_id, account_name, account_type, risk_level, balance, initial_balance,
    max_daily_loss, max_position_size, trading_strategy, color_theme, icon, tags,
    description, status
  ) VALUES (
    auth.uid(), account_name_param, template_record.account_type, template_record.risk_level,
    balance_to_use, balance_to_use, template_record.max_daily_loss, template_record.max_position_size,
    template_record.trading_strategy, template_record.color_theme, template_record.icon, template_record.tags,
    template_record.description, 'active'
  ) RETURNING id INTO new_account_id;
  
  -- Update template usage count
  UPDATE public.account_templates SET usage_count = usage_count + 1 WHERE id = template_id_param;
  
  -- Create audit entry
  INSERT INTO public.paper_account_audit (
    user_id, account_id, action, new_balance, reason, metadata
  ) VALUES (
    auth.uid(), new_account_id, 'account_created', balance_to_use, 
    'Account created from template: ' || template_record.name,
    jsonb_build_object('template_id', template_id_param, 'template_name', template_record.name)
  );
  
  RETURN new_account_id;
END;
$$;

-- Function to switch default account
CREATE OR REPLACE FUNCTION public.set_default_account(account_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify account belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM public.paper_trading_accounts 
    WHERE id = account_id_param AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Account not found or access denied';
  END IF;
  
  -- Remove default from all user accounts
  UPDATE public.paper_trading_accounts 
  SET is_default = false 
  WHERE user_id = auth.uid();
  
  -- Set new default
  UPDATE public.paper_trading_accounts 
  SET is_default = true, last_accessed = NOW(), access_count = access_count + 1
  WHERE id = account_id_param;
  
  -- Create audit entry
  INSERT INTO public.paper_account_audit (
    user_id, account_id, action, reason
  ) VALUES (
    auth.uid(), account_id_param, 'default_changed', 'Account set as default'
  );
  
  RETURN true;
END;
$$;

-- Function to calculate account performance metrics
CREATE OR REPLACE FUNCTION public.calculate_account_metrics(account_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  trades_data RECORD;
  performance_metrics JSONB;
BEGIN
  -- Get account details
  SELECT * INTO account_record FROM public.paper_trading_accounts 
  WHERE id = account_id_param AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found or access denied';
  END IF;
  
  -- Calculate trading metrics
  SELECT 
    COUNT(*) as total_trades,
    COUNT(*) FILTER (WHERE (side = 'sell' AND total_value > 0) OR (side = 'buy' AND total_value < 0)) as winning_trades,
    AVG(total_value) FILTER (WHERE (side = 'sell' AND total_value > 0) OR (side = 'buy' AND total_value < 0)) as avg_win,
    AVG(total_value) FILTER (WHERE (side = 'sell' AND total_value < 0) OR (side = 'buy' AND total_value > 0)) as avg_loss,
    SUM(total_value) as total_volume
  INTO trades_data
  FROM public.paper_trades 
  WHERE account_id = account_id_param;
  
  -- Build performance metrics JSON
  performance_metrics := jsonb_build_object(
    'total_trades', COALESCE(trades_data.total_trades, 0),
    'winning_trades', COALESCE(trades_data.winning_trades, 0),
    'win_rate', CASE WHEN trades_data.total_trades > 0 THEN 
      ROUND((trades_data.winning_trades::NUMERIC / trades_data.total_trades * 100), 2) 
      ELSE 0 END,
    'avg_win', COALESCE(trades_data.avg_win, 0),
    'avg_loss', COALESCE(trades_data.avg_loss, 0),
    'total_volume', COALESCE(trades_data.total_volume, 0),
    'current_balance', account_record.balance,
    'total_pnl', account_record.total_pnl,
    'total_pnl_percentage', account_record.total_pnl_percentage,
    'account_age_days', EXTRACT(days FROM NOW() - account_record.created_at),
    'last_trade', (SELECT MAX(created_at) FROM public.paper_trades WHERE account_id = account_id_param)
  );
  
  RETURN performance_metrics;
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.account_shares;

-- Set replica identity for realtime
ALTER TABLE public.account_analytics REPLICA IDENTITY FULL;
ALTER TABLE public.account_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.account_shares REPLICA IDENTITY FULL;