-- Phase 1: Critical Security Fixes

-- Enable RLS on tables that have it disabled
ALTER TABLE public.news_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_time_market_data ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for real_time_market_data (public read-only)
CREATE POLICY "Market data is public" ON public.real_time_market_data
FOR SELECT USING (true);

-- Fix function security by setting search_path for all functions
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.trigger_set_timestamp() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.create_initial_trading_bots(uuid) SET search_path = public;
ALTER FUNCTION public.populate_dummy_snapshots() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.adjust_paper_balance(uuid, numeric, text) SET search_path = public;
ALTER FUNCTION public.create_account_from_template(uuid, text, numeric) SET search_path = public;
ALTER FUNCTION public.update_bot_stats_after_trade() SET search_path = public;
ALTER FUNCTION public.reset_paper_account(uuid, numeric) SET search_path = public;
ALTER FUNCTION public.set_default_account(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_account_metrics(uuid) SET search_path = public;
ALTER FUNCTION public.log_comprehensive_audit(uuid, text, text, text, jsonb, jsonb, jsonb) SET search_path = public;
ALTER FUNCTION public.create_default_accounts_for_user(uuid) SET search_path = public;
ALTER FUNCTION public.ensure_user_accounts() SET search_path = public;
ALTER FUNCTION public.execute_paper_trade(uuid, uuid, text, text, numeric, numeric, text, text) SET search_path = public;
ALTER FUNCTION public.check_user_authenticated() SET search_path = public;
ALTER FUNCTION public.manual_create_account(uuid) SET search_path = public;
ALTER FUNCTION public.reset_account_with_stats(uuid, boolean) SET search_path = public;
ALTER FUNCTION public.reset_multiple_accounts(uuid[], boolean) SET search_path = public;
ALTER FUNCTION public.create_50_elite_bot_configs(uuid) SET search_path = public;
ALTER FUNCTION public.create_sample_exchange_connections() SET search_path = public;