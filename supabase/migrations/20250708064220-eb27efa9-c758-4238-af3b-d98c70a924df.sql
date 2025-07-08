-- Create default paper trading accounts for current user if none exist
INSERT INTO public.paper_trading_accounts (
  user_id, account_name, account_type, risk_level, balance, initial_balance,
  max_daily_loss, max_position_size, trading_strategy, color_theme, icon, 
  tags, description, status, is_default, created_at, updated_at, last_accessed, access_count
)
SELECT 
  auth.uid() as user_id,
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
  true as is_default,
  now() as created_at,
  now() as updated_at,
  now() as last_accessed,
  0 as access_count
WHERE NOT EXISTS (
  SELECT 1 FROM public.paper_trading_accounts WHERE user_id = auth.uid()
);