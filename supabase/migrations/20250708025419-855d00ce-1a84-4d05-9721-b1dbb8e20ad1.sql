
-- Create paper trading accounts for the 3 main accounts
INSERT INTO public.paper_trading_accounts (
  user_id, account_name, account_type, risk_level, balance, initial_balance,
  max_daily_loss, max_position_size, trading_strategy, color_theme, icon, tags,
  description, status, is_default
) VALUES 
(auth.uid(), 'woods1', 'conservative', 'low', 100000.00, 100000.00, 2000.00, 10000.00, 'diversified', '#22c55e', 'Shield', ARRAY['conservative', 'stable'], 'Conservative trading account focused on capital preservation', 'active', true),
(auth.uid(), 'angry', 'aggressive', 'high', 100000.00, 100000.00, 5000.00, 25000.00, 'momentum', '#ef4444', 'TrendingUp', ARRAY['aggressive', 'high-risk'], 'Aggressive trading account for maximum growth', 'active', false),
(auth.uid(), 'handjob', 'balanced', 'medium', 100000.00, 100000.00, 3500.00, 15000.00, 'hybrid', '#3b82f6', 'BarChart3', ARRAY['balanced', 'hybrid'], 'Hybrid trading account balancing risk and reward', 'active', false);

-- Create the 20 AI trading bots using the existing function
SELECT create_initial_trading_bots(auth.uid());

-- Create trader follows for top 20 crypto traders
INSERT INTO public.trader_follows (
  user_id, trader_name, trader_category, is_active, copy_trading_enabled, allocation_percentage
) VALUES 
(auth.uid(), 'Michael Saylor', 'Billionaire Traders', true, true, 5.0),
(auth.uid(), 'Cathie Wood', 'Professional Fund Managers', true, true, 4.5),
(auth.uid(), 'CryptoBanter', 'Crypto Influencers', true, true, 4.0),
(auth.uid(), 'Coin Bureau Guy', 'Crypto Influencers', true, true, 4.5),
(auth.uid(), 'BitBoy Crypto', 'Crypto Influencers', true, true, 3.5),
(auth.uid(), 'Raoul Pal', 'Macro Investors', true, true, 4.0),
(auth.uid(), 'Plan B', 'Crypto Analysts', true, true, 5.0),
(auth.uid(), 'Willy Woo', 'Crypto Analysts', true, true, 4.5),
(auth.uid(), 'Anthony Pompliano', 'Crypto Entrepreneurs', true, true, 4.0),
(auth.uid(), 'Cameron Winklevoss', 'Crypto Entrepreneurs', true, true, 3.5),
(auth.uid(), 'Tyler Winklevoss', 'Crypto Entrepreneurs', true, true, 3.5),
(auth.uid(), 'Kevin O''Leary', 'Traditional Investors', true, true, 3.0),
(auth.uid(), 'Mark Cuban', 'Billionaire Traders', true, true, 4.0),
(auth.uid(), 'Balaji Srinivasan', 'Tech Entrepreneurs', true, true, 4.5),
(auth.uid(), 'Naval Ravikant', 'Tech Entrepreneurs', true, true, 4.0),
(auth.uid(), 'Changpeng Zhao (CZ)', 'Exchange CEOs', true, true, 4.5),
(auth.uid(), 'Brian Armstrong', 'Exchange CEOs', true, true, 3.5),
(auth.uid(), 'Vitalik Buterin', 'Crypto Founders', true, true, 5.0),
(auth.uid(), 'Charles Hoskinson', 'Crypto Founders', true, true, 4.0),
(auth.uid(), 'Gavin Wood', 'Crypto Founders', true, true, 4.0);

-- Create initial market data cache for major cryptocurrencies
INSERT INTO public.market_data_cache (symbol, exchange, price_usd, change_24h, volume_24h, market_cap) VALUES
('BTC', 'binance', 67500.00, 2.5, 28500000000, 1330000000000),
('ETH', 'binance', 3850.00, 1.8, 15200000000, 463000000000),
('SOL', 'binance', 245.00, 5.2, 3400000000, 115000000000),
('ADA', 'binance', 1.15, -0.8, 890000000, 40500000000),
('DOT', 'binance', 11.50, 3.1, 450000000, 16200000000),
('LINK', 'binance', 25.80, 2.3, 680000000, 15700000000),
('UNI', 'binance', 12.40, 1.9, 290000000, 9800000000),
('AVAX', 'binance', 52.30, 4.7, 780000000, 21400000000),
('MATIC', 'binance', 0.98, -1.2, 420000000, 9200000000),
('ATOM', 'binance', 18.60, 2.8, 340000000, 7300000000)
ON CONFLICT (symbol, exchange) DO UPDATE SET
  price_usd = EXCLUDED.price_usd,
  change_24h = EXCLUDED.change_24h,
  volume_24h = EXCLUDED.volume_24h,
  market_cap = EXCLUDED.market_cap,
  updated_at = now();

-- Create comprehensive audit entries for system initialization
INSERT INTO public.comprehensive_audit (
  user_id, action_type, entity_type, entity_id, metadata
) VALUES
(auth.uid(), 'system_initialization', 'trading_system', 'complete_setup', 
 jsonb_build_object(
   'accounts_created', 3,
   'bots_created', 20,
   'traders_followed', 20,
   'initialization_time', now(),
   'system_version', '1.0.0'
 ));
