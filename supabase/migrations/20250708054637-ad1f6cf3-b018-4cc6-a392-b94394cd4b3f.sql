-- Create default paper trading accounts for users who don't have any
INSERT INTO public.paper_trading_accounts (
  user_id, account_name, account_type, risk_level, balance, initial_balance,
  max_daily_loss, max_position_size, trading_strategy, color_theme, icon, 
  tags, description, status, is_default
)
SELECT 
  id as user_id,
  'Main Trading Account' as account_name,
  'balanced' as account_type,
  'medium' as risk_level,
  100000 as balance,
  100000 as initial_balance,
  5000 as max_daily_loss,
  10000 as max_position_size,
  'manual' as trading_strategy,
  '#3b82f6' as color_theme,
  'TrendingUp' as icon,
  ARRAY['default', 'main'] as tags,
  'Your primary paper trading account' as description,
  'active' as status,
  true as is_default
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.paper_trading_accounts)
ON CONFLICT (user_id, account_name) DO NOTHING;

-- Create additional accounts for existing users
INSERT INTO public.paper_trading_accounts (
  user_id, account_name, account_type, risk_level, balance, initial_balance,
  max_daily_loss, max_position_size, trading_strategy, color_theme, icon, 
  tags, description, status, is_default
)
SELECT 
  id as user_id,
  'Aggressive Growth' as account_name,
  'aggressive_growth' as account_type,
  'high' as risk_level,
  50000 as balance,
  50000 as initial_balance,
  2500 as max_daily_loss,
  15000 as max_position_size,
  'algorithmic' as trading_strategy,
  '#ef4444' as color_theme,
  'TrendingUp' as icon,
  ARRAY['aggressive', 'growth'] as tags,
  'High-risk, high-reward trading account' as description,
  'active' as status,
  false as is_default
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.paper_trading_accounts WHERE account_name = 'Aggressive Growth')
ON CONFLICT (user_id, account_name) DO NOTHING;

INSERT INTO public.paper_trading_accounts (
  user_id, account_name, account_type, risk_level, balance, initial_balance,
  max_daily_loss, max_position_size, trading_strategy, color_theme, icon, 
  tags, description, status, is_default
)
SELECT 
  id as user_id,
  'Conservative Portfolio' as account_name,
  'conservative' as account_type,
  'low' as risk_level,
  75000 as balance,
  75000 as initial_balance,
  1000 as max_daily_loss,
  5000 as max_position_size,
  'buy_and_hold' as trading_strategy,
  '#22c55e' as color_theme,
  'Shield' as icon,
  ARRAY['conservative', 'safe'] as tags,
  'Low-risk, steady growth account' as description,
  'active' as status,
  false as is_default
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.paper_trading_accounts WHERE account_name = 'Conservative Portfolio')
ON CONFLICT (user_id, account_name) DO NOTHING;