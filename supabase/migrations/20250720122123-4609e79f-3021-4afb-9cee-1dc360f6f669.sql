
-- Add real trading mode support to paper trading accounts
ALTER TABLE public.paper_trading_accounts 
ADD COLUMN IF NOT EXISTS trading_mode text DEFAULT 'paper' CHECK (trading_mode IN ('paper', 'live')),
ADD COLUMN IF NOT EXISTS daily_loss_limit numeric DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS weekly_loss_limit numeric DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS max_position_percentage numeric DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_stop boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_risk_check timestamp with time zone DEFAULT now();

-- Create real trading credentials table with proper encryption
CREATE TABLE IF NOT EXISTS public.real_trading_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange_name text NOT NULL,
  api_key_encrypted text NOT NULL,
  api_secret_encrypted text NOT NULL,
  passphrase_encrypted text,
  encryption_key_id text NOT NULL,
  is_testnet boolean DEFAULT true,
  is_active boolean DEFAULT false,
  permissions jsonb DEFAULT '[]'::jsonb,
  daily_limit numeric DEFAULT 1000.00,
  position_limit numeric DEFAULT 5000.00,
  last_used timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for real trading credentials
ALTER TABLE public.real_trading_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own real trading credentials" 
ON public.real_trading_credentials 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create real trades table separate from paper trades
CREATE TABLE IF NOT EXISTS public.real_trades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
  exchange_name text NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  amount numeric NOT NULL,
  price numeric NOT NULL,
  execution_price numeric NOT NULL,
  total_value numeric NOT NULL,
  fee numeric NOT NULL DEFAULT 0,
  slippage numeric DEFAULT 0,
  order_id text,
  trade_type text DEFAULT 'market' CHECK (trade_type IN ('market', 'limit', 'stop')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  error_message text,
  confirmation_required boolean DEFAULT true,
  confirmed_at timestamp with time zone,
  executed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS for real trades
ALTER TABLE public.real_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own real trades" 
ON public.real_trades 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create risk monitoring table
CREATE TABLE IF NOT EXISTS public.risk_monitoring (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.paper_trading_accounts(id) ON DELETE CASCADE,
  risk_type text NOT NULL,
  current_value numeric NOT NULL,
  threshold_value numeric NOT NULL,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  alert_triggered boolean DEFAULT false,
  alert_message text,
  resolution_action text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS for risk monitoring
ALTER TABLE public.risk_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own risk monitoring" 
ON public.risk_monitoring 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trading confirmations table for double confirmation system
CREATE TABLE IF NOT EXISTS public.trading_confirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_data jsonb NOT NULL,
  confirmation_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  confirmed boolean DEFAULT false,
  confirmed_at timestamp with time zone,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS for trading confirmations
ALTER TABLE public.trading_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own trading confirmations" 
ON public.trading_confirmations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update exchange_connections to support mainnet/testnet separation
ALTER TABLE public.exchange_connections 
ADD COLUMN IF NOT EXISTS environment text DEFAULT 'testnet' CHECK (environment IN ('testnet', 'mainnet')),
ADD COLUMN IF NOT EXISTS daily_volume_limit numeric DEFAULT 10000.00,
ADD COLUMN IF NOT EXISTS position_size_limit numeric DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high'));

-- Create function to validate real trading operations
CREATE OR REPLACE FUNCTION public.validate_real_trade(
  p_user_id uuid,
  p_account_id uuid,
  p_symbol text,
  p_side text,
  p_amount numeric,
  p_price numeric
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_account_record RECORD;
  v_daily_trades numeric;
  v_position_value numeric;
  v_validation_result jsonb;
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

-- Create function to execute real trade with proper validation
CREATE OR REPLACE FUNCTION public.execute_real_trade(
  p_user_id uuid,
  p_account_id uuid,
  p_exchange_name text,
  p_symbol text,
  p_side text,
  p_amount numeric,
  p_price numeric,
  p_confirmation_token text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_validation_result jsonb;
  v_trade_id uuid;
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

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_real_trading_credentials_updated_at
  BEFORE UPDATE ON public.real_trading_credentials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_real_trades_updated_at
  BEFORE UPDATE ON public.real_trades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_risk_monitoring_updated_at
  BEFORE UPDATE ON public.risk_monitoring
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
