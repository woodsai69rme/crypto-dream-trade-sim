-- =============================================
-- PHASE 1: CRITICAL SECURITY FIXES
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

-- Create policy for audit table
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

-- Create policy for risk monitoring
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

-- Create policy for real trades
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

-- Create policy for trading confirmations
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

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Function to log comprehensive audit events
CREATE OR REPLACE FUNCTION public.log_comprehensive_audit(
  p_account_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.comprehensive_audit (
    user_id, account_id, action_type, entity_type, entity_id,
    old_values, new_values, metadata
  ) VALUES (
    auth.uid(), p_account_id, p_action_type, p_entity_type, p_entity_id,
    p_old_values, p_new_values, p_metadata
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to validate real trades with strict risk management
CREATE OR REPLACE FUNCTION public.validate_real_trade(
  p_user_id UUID,
  p_account_id UUID,
  p_symbol TEXT,
  p_side TEXT,
  p_amount NUMERIC,
  p_price NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_account_record RECORD;
  v_daily_trades NUMERIC;
  v_position_value NUMERIC;
  v_validation_result JSONB;
BEGIN
  -- Get account details
  SELECT * INTO v_account_record 
  FROM public.paper_trading_accounts 
  WHERE id = p_account_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Account not found or access denied'
    );
  END IF;
  
  -- Check if account is in live mode
  IF v_account_record.trading_mode != 'live' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Account is not configured for live trading'
    );
  END IF;
  
  -- Check emergency stop
  IF v_account_record.emergency_stop THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Emergency stop is active for this account'
    );
  END IF;
  
  -- Calculate position value
  v_position_value := p_amount * p_price;
  
  -- Check position size limit
  IF v_position_value > (v_account_record.balance * v_account_record.max_position_percentage / 100) THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Position size exceeds maximum allowed percentage'
    );
  END IF;
  
  -- Check daily trading volume
  SELECT COALESCE(SUM(total_value), 0) INTO v_daily_trades
  FROM public.real_trades
  WHERE user_id = p_user_id 
    AND account_id = p_account_id
    AND DATE(created_at) = CURRENT_DATE;
  
  IF (v_daily_trades + v_position_value) > v_account_record.daily_loss_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Daily trading limit would be exceeded'
    );
  END IF;
  
  -- All validations passed
  RETURN jsonb_build_object(
    'valid', true,
    'position_value', v_position_value,
    'daily_volume_used', v_daily_trades,
    'daily_limit', v_account_record.daily_loss_limit
  );
END;
$$;

-- Function to execute real trades with full audit trail
CREATE OR REPLACE FUNCTION public.execute_real_trade(
  p_user_id UUID,
  p_account_id UUID,
  p_exchange_name TEXT,
  p_symbol TEXT,
  p_side TEXT,
  p_amount NUMERIC,
  p_price NUMERIC,
  p_confirmation_token TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_validation_result JSONB;
  v_trade_id UUID;
  v_confirmation_record RECORD;
BEGIN
  -- Validate the trade
  v_validation_result := public.validate_real_trade(
    p_user_id, p_account_id, p_symbol, p_side, p_amount, p_price
  );
  
  IF NOT (v_validation_result->>'valid')::boolean THEN
    RETURN v_validation_result;
  END IF;
  
  -- Check confirmation token if provided
  IF p_confirmation_token IS NOT NULL THEN
    SELECT * INTO v_confirmation_record
    FROM public.trading_confirmations
    WHERE confirmation_token = p_confirmation_token
      AND user_id = p_user_id
      AND confirmed = false
      AND expires_at > now();
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', 'Invalid or expired confirmation token'
      );
    END IF;
    
    -- Mark confirmation as used
    UPDATE public.trading_confirmations
    SET confirmed = true, confirmed_at = now()
    WHERE id = v_confirmation_record.id;
  END IF;
  
  -- Insert the real trade record
  INSERT INTO public.real_trades (
    user_id, account_id, exchange_name, symbol, side, 
    amount, price, execution_price, total_value, fee,
    trade_type, status, confirmation_required
  ) VALUES (
    p_user_id, p_account_id, p_exchange_name, p_symbol, p_side,
    p_amount, p_price, p_price, p_amount * p_price, p_amount * p_price * 0.001,
    'market', 'pending', p_confirmation_token IS NULL
  ) RETURNING id INTO v_trade_id;
  
  -- Create risk monitoring entry
  INSERT INTO public.risk_monitoring (
    user_id, account_id, risk_type, current_value, threshold_value, risk_level
  ) VALUES (
    p_user_id, p_account_id, 'position_size', 
    v_validation_result->>'position_value', 
    (SELECT balance * max_position_percentage / 100 FROM public.paper_trading_accounts WHERE id = p_account_id),
    CASE 
      WHEN (v_validation_result->>'position_value')::numeric > 5000 THEN 'high'
      WHEN (v_validation_result->>'position_value')::numeric > 1000 THEN 'medium'
      ELSE 'low'
    END
  );
  
  RETURN jsonb_build_object(
    'valid', true,
    'trade_id', v_trade_id,
    'status', 'pending',
    'requires_confirmation', p_confirmation_token IS NULL
  );
END;
$$;

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION public.trigger_comprehensive_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_comprehensive_audit(
      COALESCE(NEW.account_id, NEW.id),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::text,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_comprehensive_audit(
      COALESCE(NEW.account_id, NEW.id),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_comprehensive_audit(
      COALESCE(OLD.account_id, OLD.id),
      TG_OP,
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_real_trades ON public.real_trades;
CREATE TRIGGER audit_real_trades
  AFTER INSERT OR UPDATE OR DELETE ON public.real_trades
  FOR EACH ROW EXECUTE FUNCTION public.trigger_comprehensive_audit();

DROP TRIGGER IF EXISTS audit_paper_trading_accounts ON public.paper_trading_accounts;
CREATE TRIGGER audit_paper_trading_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.paper_trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_comprehensive_audit();

DROP TRIGGER IF EXISTS audit_ai_trading_bots ON public.ai_trading_bots;
CREATE TRIGGER audit_ai_trading_bots
  AFTER INSERT OR UPDATE OR DELETE ON public.ai_trading_bots
  FOR EACH ROW EXECUTE FUNCTION public.trigger_comprehensive_audit();