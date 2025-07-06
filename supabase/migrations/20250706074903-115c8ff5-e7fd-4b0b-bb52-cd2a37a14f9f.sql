
-- Add missing trade_type column to paper_trades table
ALTER TABLE public.paper_trades 
ADD COLUMN IF NOT EXISTS trade_type text DEFAULT 'market';

-- Add missing order_type column for better trade tracking  
ALTER TABLE public.paper_trades 
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'market';

-- Add missing execution_price column for actual vs requested price tracking
ALTER TABLE public.paper_trades 
ADD COLUMN IF NOT EXISTS execution_price numeric DEFAULT 0;

-- Update the paper-trade function to handle the new columns
CREATE OR REPLACE FUNCTION execute_paper_trade(
  p_user_id uuid,
  p_account_id uuid,
  p_symbol text,
  p_side text,
  p_amount numeric,
  p_price numeric,
  p_trade_type text DEFAULT 'market',
  p_order_type text DEFAULT 'market'
) RETURNS jsonb AS $$
DECLARE
  v_account_balance numeric;
  v_trade_value numeric;
  v_fee numeric := 0.001; -- 0.1% fee
  v_total_cost numeric;
  v_new_balance numeric;
  v_trade_id uuid;
BEGIN
  -- Get current account balance
  SELECT balance INTO v_account_balance 
  FROM paper_trading_accounts 
  WHERE id = p_account_id AND user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not found');
  END IF;
  
  -- Calculate trade value and costs
  v_trade_value := p_amount * p_price;
  v_total_cost := v_trade_value * (1 + v_fee);
  
  -- Check if sufficient balance for buy orders
  IF p_side = 'buy' AND v_account_balance < v_total_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;
  
  -- Insert the trade
  INSERT INTO paper_trades (
    user_id, account_id, symbol, side, amount, price, 
    total_value, fee, trade_type, order_type, execution_price, status
  ) VALUES (
    p_user_id, p_account_id, p_symbol, p_side, p_amount, p_price,
    v_trade_value, v_trade_value * v_fee, p_trade_type, p_order_type, p_price, 'completed'
  ) RETURNING id INTO v_trade_id;
  
  -- Update account balance
  IF p_side = 'buy' THEN
    v_new_balance := v_account_balance - v_total_cost;
  ELSE
    v_new_balance := v_account_balance + (v_trade_value * (1 - v_fee));
  END IF;
  
  UPDATE paper_trading_accounts 
  SET balance = v_new_balance,
      total_pnl = v_new_balance - initial_balance,
      total_pnl_percentage = ((v_new_balance - initial_balance) / initial_balance) * 100,
      updated_at = now()
  WHERE id = p_account_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'trade_id', v_trade_id,
    'new_balance', v_new_balance,
    'trade_value', v_trade_value,
    'fee', v_trade_value * v_fee
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add settings table for persistent user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can manage their own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
