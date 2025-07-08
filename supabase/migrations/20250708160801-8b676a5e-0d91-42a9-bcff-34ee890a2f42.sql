-- Fix the execute_paper_trade function to properly handle account_id
CREATE OR REPLACE FUNCTION public.execute_paper_trade(p_user_id uuid, p_account_id uuid, p_symbol text, p_side text, p_amount numeric, p_price numeric, p_trade_type text DEFAULT 'market'::text, p_order_type text DEFAULT 'market'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Insert the trade with proper account_id linking
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
$function$;

-- Update existing trades with null account_id to link them to accounts
-- This will distribute existing trades across the user's accounts
DO $$
DECLARE
    user_rec RECORD;
    account_rec RECORD;
    trade_rec RECORD;
    account_index INTEGER := 0;
    user_accounts uuid[];
BEGIN
    -- For each user who has trades with null account_id
    FOR user_rec IN 
        SELECT DISTINCT user_id 
        FROM paper_trades 
        WHERE account_id IS NULL AND user_id IS NOT NULL
    LOOP
        -- Get all accounts for this user
        SELECT ARRAY_AGG(id) INTO user_accounts
        FROM paper_trading_accounts 
        WHERE user_id = user_rec.user_id
        ORDER BY created_at;
        
        -- Skip if user has no accounts
        IF user_accounts IS NULL OR array_length(user_accounts, 1) = 0 THEN
            CONTINUE;
        END IF;
        
        account_index := 0;
        
        -- Update each trade with null account_id for this user
        FOR trade_rec IN 
            SELECT id 
            FROM paper_trades 
            WHERE user_id = user_rec.user_id AND account_id IS NULL
            ORDER BY created_at
        LOOP
            -- Assign account in round-robin fashion
            account_index := (account_index % array_length(user_accounts, 1)) + 1;
            
            UPDATE paper_trades 
            SET account_id = user_accounts[account_index]
            WHERE id = trade_rec.id;
        END LOOP;
        
        RAISE NOTICE 'Updated trades for user % across % accounts', user_rec.user_id, array_length(user_accounts, 1);
    END LOOP;
END $$;