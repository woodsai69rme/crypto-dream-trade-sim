-- Fix account_type enum to include all needed values
ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'crypto_focus';
ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'day_trading';

-- Now insert the account templates with correct enum values
INSERT INTO public.account_templates (
  name, description, account_type, risk_level, initial_balance, 
  max_daily_loss, max_position_size, trading_strategy, color_theme, 
  icon, tags, is_public, created_by
) VALUES
('Balanced Starter', 'Perfect for beginners with balanced risk/reward', 'balanced', 'medium', 100000, 5000, 20000, 'manual', '#3b82f6', 'TrendingUp', ARRAY['beginner', 'balanced'], true, NULL),
('Conservative Portfolio', 'Low-risk steady growth strategy', 'conservative', 'low', 75000, 2000, 10000, 'buy_and_hold', '#22c55e', 'Shield', ARRAY['conservative', 'safe'], true, NULL),
('Aggressive Growth', 'High-risk high-reward trading', 'aggressive_growth', 'high', 50000, 10000, 25000, 'algorithmic', '#ef4444', 'TrendingUp', ARRAY['aggressive', 'growth'], true, NULL),
('Day Trading Pro', 'Active day trading account', 'balanced', 'high', 25000, 5000, 12500, 'scalping', '#f59e0b', 'Zap', ARRAY['daytrading', 'active'], true, NULL),
('Crypto Focus', 'Cryptocurrency trading specialist', 'balanced', 'medium', 30000, 4000, 15000, 'manual', '#8b5cf6', 'Bitcoin', ARRAY['crypto', 'digital'], true, NULL)
ON CONFLICT (name) DO NOTHING;

-- Create function to auto-create accounts for new users
CREATE OR REPLACE FUNCTION public.create_default_accounts_for_user(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Check if user already has accounts
  IF EXISTS (SELECT 1 FROM public.paper_trading_accounts WHERE user_id = user_id_param) THEN
    RETURN;
  END IF;
  
  -- Create default account using Balanced Starter template
  SELECT * INTO template_record FROM public.account_templates WHERE name = 'Balanced Starter' LIMIT 1;
  
  IF FOUND THEN
    INSERT INTO public.paper_trading_accounts (
      user_id, account_name, account_type, risk_level, balance, initial_balance,
      max_daily_loss, max_position_size, trading_strategy, color_theme, icon, 
      tags, description, status, is_default
    ) VALUES (
      user_id_param, 'My Trading Account', template_record.account_type, template_record.risk_level,
      template_record.initial_balance, template_record.initial_balance, template_record.max_daily_loss,
      template_record.max_position_size, template_record.trading_strategy, template_record.color_theme,
      template_record.icon, template_record.tags, template_record.description, 'active', true
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to create accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create a profile with default paper trading balance
  INSERT INTO public.profiles (id, email, display_name, avatar_url, paper_balance)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    100000.00
  );

  -- Create default accounts
  PERFORM public.create_default_accounts_for_user(NEW.id);

  -- Create a default portfolio for the new user
  INSERT INTO public.portfolios (user_id, name, is_default, mode, initial_balance, current_balance, total_value)
  VALUES (
    NEW.id,
    'My Paper Portfolio',
    true,
    'paper',
    100000.00,
    100000.00,
    100000.00
  );

  -- Create a default watchlist with popular cryptocurrencies
  INSERT INTO public.watchlists (user_id, name, is_default, symbols)
  VALUES (
    NEW.id,
    'My Watchlist',
    true,
    ARRAY['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple']
  );

  RETURN NEW;
END;
$$;

-- Fix RLS policies to prevent recursion
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update comprehensive_audit RLS policy to fix violations
DROP POLICY IF EXISTS "Users can manage their own audit logs" ON public.comprehensive_audit;
CREATE POLICY "Users can manage their own audit logs" 
ON public.comprehensive_audit 
FOR ALL 
USING (user_id = public.get_user_id())
WITH CHECK (user_id = public.get_user_id());

-- Ensure existing users have accounts
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM public.create_default_accounts_for_user(user_record.id);
  END LOOP;
END $$;