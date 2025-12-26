-- =============================================
-- CRYPTOTRADER PRO - COMPLETE DATABASE SCHEMA
-- Real Money Trading Platform Foundation
-- =============================================

-- 1. CUSTOM TYPES/ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'trader', 'viewer');
CREATE TYPE public.account_type AS ENUM ('paper', 'live', 'demo');
CREATE TYPE public.risk_level AS ENUM ('conservative', 'moderate', 'aggressive', 'custom');
CREATE TYPE public.trade_side AS ENUM ('buy', 'sell');
CREATE TYPE public.order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit', 'trailing_stop');
CREATE TYPE public.order_status AS ENUM ('pending', 'open', 'filled', 'partially_filled', 'cancelled', 'expired', 'rejected');
CREATE TYPE public.bot_status AS ENUM ('active', 'paused', 'stopped', 'error', 'backtesting');
CREATE TYPE public.exchange_name AS ENUM ('binance', 'coinbase', 'kraken', 'kucoin', 'okx', 'deribit', 'bybit', 'huobi', 'bitfinex', 'gateio');
CREATE TYPE public.alert_type AS ENUM ('price', 'volume', 'volatility', 'trade', 'risk', 'system');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical', 'emergency');

-- 2. PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferred_currency TEXT DEFAULT 'USD',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3. USER ROLES TABLE (Security Definer Pattern)
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
        AND (expires_at IS NULL OR expires_at > NOW())
    )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. TRADING ACCOUNTS TABLE
-- =============================================
CREATE TABLE public.trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_name TEXT NOT NULL,
    account_type account_type NOT NULL DEFAULT 'paper',
    risk_level risk_level DEFAULT 'moderate',
    initial_balance DECIMAL(20,8) DEFAULT 10000,
    current_balance DECIMAL(20,8) DEFAULT 10000,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    total_pnl_percentage DECIMAL(10,4) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    max_position_size DECIMAL(10,4) DEFAULT 10,
    max_daily_loss DECIMAL(10,4) DEFAULT 5,
    max_drawdown DECIMAL(10,4) DEFAULT 20,
    leverage_limit DECIMAL(5,2) DEFAULT 1,
    auto_stop_loss BOOLEAN DEFAULT TRUE,
    emergency_stop BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts" ON public.trading_accounts
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_trading_accounts_user ON public.trading_accounts(user_id);
CREATE INDEX idx_trading_accounts_type ON public.trading_accounts(account_type);

-- 5. EXCHANGE CONNECTIONS TABLE (Encrypted API Keys)
-- =============================================
CREATE TABLE public.exchange_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    exchange exchange_name NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    passphrase_encrypted TEXT,
    encryption_iv TEXT NOT NULL,
    encryption_salt TEXT NOT NULL,
    is_testnet BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT FALSE,
    permissions JSONB DEFAULT '{"read": true, "trade": false, "withdraw": false}',
    ip_whitelist TEXT[],
    last_connected_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    connection_status TEXT DEFAULT 'disconnected',
    error_message TEXT,
    rate_limit_remaining INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exchange_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own connections" ON public.exchange_connections
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_exchange_connections_user ON public.exchange_connections(user_id);
CREATE INDEX idx_exchange_connections_exchange ON public.exchange_connections(exchange);

-- 6. TRADES TABLE
-- =============================================
CREATE TABLE public.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE NOT NULL,
    exchange_connection_id UUID REFERENCES public.exchange_connections(id),
    bot_id UUID,
    external_order_id TEXT,
    symbol TEXT NOT NULL,
    side trade_side NOT NULL,
    order_type order_type NOT NULL DEFAULT 'market',
    status order_status NOT NULL DEFAULT 'pending',
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8),
    executed_price DECIMAL(20,8),
    executed_quantity DECIMAL(20,8),
    total_value DECIMAL(20,8),
    fee DECIMAL(20,8) DEFAULT 0,
    fee_currency TEXT DEFAULT 'USD',
    pnl DECIMAL(20,8),
    pnl_percentage DECIMAL(10,4),
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    leverage DECIMAL(5,2) DEFAULT 1,
    margin_type TEXT DEFAULT 'cross',
    is_paper BOOLEAN DEFAULT TRUE,
    is_simulated BOOLEAN DEFAULT FALSE,
    reasoning TEXT,
    signal_source TEXT,
    execution_time_ms INTEGER,
    slippage DECIMAL(10,4),
    metadata JSONB DEFAULT '{}',
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own trades" ON public.trades
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_trades_user ON public.trades(user_id);
CREATE INDEX idx_trades_account ON public.trades(account_id);
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_trades_created ON public.trades(created_at DESC);
CREATE INDEX idx_trades_status ON public.trades(status);

-- 7. PORTFOLIO HOLDINGS TABLE
-- =============================================
CREATE TABLE public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    quantity DECIMAL(20,8) NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(20,8),
    current_price DECIMAL(20,8),
    current_value DECIMAL(20,8),
    unrealized_pnl DECIMAL(20,8),
    unrealized_pnl_percentage DECIMAL(10,4),
    realized_pnl DECIMAL(20,8) DEFAULT 0,
    cost_basis DECIMAL(20,8),
    allocation_percentage DECIMAL(10,4),
    last_trade_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(account_id, symbol)
);

ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own holdings" ON public.portfolio_holdings
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_holdings_account ON public.portfolio_holdings(account_id);

-- 8. AI TRADING BOTS TABLE
-- =============================================
CREATE TABLE public.ai_trading_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    strategy TEXT NOT NULL,
    ai_model TEXT DEFAULT 'gemini-2.5-flash',
    status bot_status DEFAULT 'stopped',
    risk_level risk_level DEFAULT 'moderate',
    target_symbols TEXT[] DEFAULT ARRAY['BTC', 'ETH'],
    paper_balance DECIMAL(20,8) DEFAULT 10000,
    current_balance DECIMAL(20,8) DEFAULT 10000,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    sharpe_ratio DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    max_position_size DECIMAL(10,4) DEFAULT 10,
    stop_loss_percentage DECIMAL(5,2) DEFAULT 5,
    take_profit_percentage DECIMAL(5,2) DEFAULT 10,
    trailing_stop BOOLEAN DEFAULT FALSE,
    trailing_stop_percentage DECIMAL(5,2),
    max_daily_trades INTEGER DEFAULT 10,
    trading_hours JSONB DEFAULT '{"start": "00:00", "end": "23:59"}',
    cool_down_minutes INTEGER DEFAULT 5,
    use_ai_signals BOOLEAN DEFAULT TRUE,
    use_technical_analysis BOOLEAN DEFAULT TRUE,
    use_sentiment_analysis BOOLEAN DEFAULT FALSE,
    backtest_results JSONB,
    config JSONB DEFAULT '{}',
    last_trade_at TIMESTAMPTZ,
    last_signal_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_trading_bots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bots" ON public.ai_trading_bots
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_bots_user ON public.ai_trading_bots(user_id);
CREATE INDEX idx_bots_status ON public.ai_trading_bots(status);

-- 9. BOT TRADES TABLE
-- =============================================
CREATE TABLE public.bot_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES public.ai_trading_bots(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trade_id UUID REFERENCES public.trades(id),
    signal_strength DECIMAL(5,2),
    confidence DECIMAL(5,2),
    reasoning TEXT,
    indicators_used JSONB,
    market_conditions JSONB,
    executed BOOLEAN DEFAULT FALSE,
    execution_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bot_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bot trades" ON public.bot_trades
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 10. TRADING SIGNALS TABLE
-- =============================================
CREATE TABLE public.trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.ai_trading_bots(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    signal_type trade_side NOT NULL,
    strength DECIMAL(5,2) NOT NULL,
    confidence DECIMAL(5,2),
    source TEXT NOT NULL,
    price_at_signal DECIMAL(20,8),
    target_price DECIMAL(20,8),
    stop_loss DECIMAL(20,8),
    timeframe TEXT,
    indicators JSONB,
    reasoning TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    executed BOOLEAN DEFAULT FALSE,
    execution_price DECIMAL(20,8),
    result_pnl DECIMAL(20,8),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signals" ON public.trading_signals
    FOR SELECT TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can manage own signals" ON public.trading_signals
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_signals_symbol ON public.trading_signals(symbol);
CREATE INDEX idx_signals_active ON public.trading_signals(is_active);

-- 11. FOLLOWED TRADERS TABLE
-- =============================================
CREATE TABLE public.followed_traders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    follower_account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    copy_trading_enabled BOOLEAN DEFAULT FALSE,
    copy_percentage DECIMAL(5,2) DEFAULT 100,
    max_position_size DECIMAL(10,4) DEFAULT 10,
    copy_stop_loss BOOLEAN DEFAULT TRUE,
    copy_take_profit BOOLEAN DEFAULT TRUE,
    total_copied_trades INTEGER DEFAULT 0,
    total_pnl_from_copies DECIMAL(20,8) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, trader_id)
);

ALTER TABLE public.followed_traders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own follows" ON public.followed_traders
    FOR ALL TO authenticated USING (auth.uid() = follower_id);

CREATE POLICY "Traders can see followers" ON public.followed_traders
    FOR SELECT TO authenticated USING (auth.uid() = trader_id);

-- 12. TRADE COPIES TABLE
-- =============================================
CREATE TABLE public.trade_copies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follow_id UUID REFERENCES public.followed_traders(id) ON DELETE CASCADE NOT NULL,
    original_trade_id UUID REFERENCES public.trades(id) ON DELETE CASCADE NOT NULL,
    copied_trade_id UUID REFERENCES public.trades(id),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    copy_percentage DECIMAL(5,2),
    original_amount DECIMAL(20,8),
    copied_amount DECIMAL(20,8),
    original_pnl DECIMAL(20,8),
    copied_pnl DECIMAL(20,8),
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trade_copies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Followers can view own copies" ON public.trade_copies
    FOR SELECT TO authenticated USING (auth.uid() = follower_id);

CREATE POLICY "Traders can view copies of their trades" ON public.trade_copies
    FOR SELECT TO authenticated USING (auth.uid() = trader_id);

-- 13. TRADER STATS TABLE (Public Leaderboard)
-- =============================================
CREATE TABLE public.trader_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    total_pnl_percentage DECIMAL(10,4) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    sharpe_ratio DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    avg_trade_duration INTEGER,
    followers_count INTEGER DEFAULT 0,
    copiers_count INTEGER DEFAULT 0,
    rank INTEGER,
    badges JSONB DEFAULT '[]',
    bio TEXT,
    trading_since TIMESTAMPTZ,
    last_trade_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trader_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public stats are viewable" ON public.trader_stats
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can manage own stats" ON public.trader_stats
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_trader_stats_rank ON public.trader_stats(rank);
CREATE INDEX idx_trader_stats_pnl ON public.trader_stats(total_pnl DESC);

-- 14. RISK ALERTS TABLE
-- =============================================
CREATE TABLE public.risk_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'warning',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    threshold_value DECIMAL(20,8),
    current_value DECIMAL(20,8),
    symbol TEXT,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    auto_action_taken TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON public.risk_alerts
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_risk_alerts_user ON public.risk_alerts(user_id);
CREATE INDEX idx_risk_alerts_severity ON public.risk_alerts(severity);
CREATE INDEX idx_risk_alerts_unack ON public.risk_alerts(is_acknowledged) WHERE is_acknowledged = FALSE;

-- 15. EMERGENCY STOPS TABLE
-- =============================================
CREATE TABLE public.emergency_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    triggered_by TEXT NOT NULL,
    reason TEXT NOT NULL,
    positions_closed JSONB,
    orders_cancelled JSONB,
    total_loss_prevented DECIMAL(20,8),
    is_active BOOLEAN DEFAULT TRUE,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own stops" ON public.emergency_stops
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 16. CIRCUIT BREAKERS TABLE
-- =============================================
CREATE TABLE public.circuit_breakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
    breaker_type TEXT NOT NULL,
    threshold DECIMAL(20,8) NOT NULL,
    current_value DECIMAL(20,8),
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    reset_at TIMESTAMPTZ,
    cooldown_minutes INTEGER DEFAULT 60,
    auto_reset BOOLEAN DEFAULT TRUE,
    action_on_trigger TEXT DEFAULT 'pause_trading',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.circuit_breakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own breakers" ON public.circuit_breakers
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 17. AUDIT LOGS TABLE
-- =============================================
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_id TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    execution_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 18. PRICE ALERTS TABLE
-- =============================================
CREATE TABLE public.price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    condition TEXT NOT NULL,
    target_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    notification_sent BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own price alerts" ON public.price_alerts
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_price_alerts_symbol ON public.price_alerts(symbol);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = TRUE;

-- 19. WATCHLISTS TABLE
-- =============================================
CREATE TABLE public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Default',
    symbols TEXT[] DEFAULT ARRAY['BTC', 'ETH'],
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own watchlists" ON public.watchlists
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 20. MARKET DATA CACHE TABLE
-- =============================================
CREATE TABLE public.market_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    exchange TEXT DEFAULT 'aggregate',
    price DECIMAL(20,8),
    price_change_24h DECIMAL(10,4),
    price_change_percentage_24h DECIMAL(10,4),
    volume_24h DECIMAL(30,8),
    market_cap DECIMAL(30,8),
    high_24h DECIMAL(20,8),
    low_24h DECIMAL(20,8),
    circulating_supply DECIMAL(30,8),
    total_supply DECIMAL(30,8),
    ath DECIMAL(20,8),
    ath_date TIMESTAMPTZ,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(symbol, exchange)
);

-- No RLS needed - public read access
CREATE INDEX idx_market_data_symbol ON public.market_data_cache(symbol);

-- 21. API INTEGRATIONS TABLE
-- =============================================
CREATE TABLE public.api_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT NOT NULL,
    category TEXT NOT NULL,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    encryption_iv TEXT,
    additional_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    rate_limit_remaining INTEGER,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own integrations" ON public.api_integrations
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 22. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(is_read) WHERE is_read = FALSE;

-- 23. BOT STRATEGIES TEMPLATES TABLE
-- =============================================
CREATE TABLE public.bot_strategy_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    strategy_type TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    risk_level risk_level DEFAULT 'moderate',
    default_config JSONB NOT NULL,
    indicators TEXT[],
    min_balance DECIMAL(20,8) DEFAULT 1000,
    recommended_pairs TEXT[],
    backtested_roi DECIMAL(10,4),
    backtested_sharpe DECIMAL(10,4),
    backtested_drawdown DECIMAL(10,4),
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access for templates
CREATE POLICY "Anyone can view public templates" ON public.bot_strategy_templates
    FOR SELECT USING (is_public = TRUE);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON public.trading_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exchange_connections_updated_at BEFORE UPDATE ON public.exchange_connections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_trading_bots_updated_at BEFORE UPDATE ON public.ai_trading_bots
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_followed_traders_updated_at BEFORE UPDATE ON public.followed_traders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trader_stats_updated_at BEFORE UPDATE ON public.trader_stats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON public.watchlists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_integrations_updated_at BEFORE UPDATE ON public.api_integrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    INSERT INTO public.trader_stats (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)));
    
    INSERT INTO public.trading_accounts (user_id, account_name, account_type, is_default)
    VALUES (NEW.id, 'Default Paper Account', 'paper', TRUE);
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, metadata)
    VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_metadata)
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$;

-- Execute trade function with validation
CREATE OR REPLACE FUNCTION public.execute_trade(
    p_account_id UUID,
    p_symbol TEXT,
    p_side trade_side,
    p_order_type order_type,
    p_quantity DECIMAL,
    p_price DECIMAL DEFAULT NULL,
    p_stop_loss DECIMAL DEFAULT NULL,
    p_take_profit DECIMAL DEFAULT NULL,
    p_is_paper BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_account RECORD;
    v_trade_id UUID;
    v_total_value DECIMAL;
    v_fee DECIMAL;
BEGIN
    v_user_id := auth.uid();
    
    SELECT * INTO v_account FROM public.trading_accounts
    WHERE id = p_account_id AND user_id = v_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Account not found');
    END IF;
    
    IF v_account.emergency_stop THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Emergency stop is active');
    END IF;
    
    v_total_value := p_quantity * COALESCE(p_price, 0);
    v_fee := v_total_value * 0.001;
    
    IF p_side = 'buy' AND v_account.current_balance < (v_total_value + v_fee) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'Insufficient balance');
    END IF;
    
    INSERT INTO public.trades (
        user_id, account_id, symbol, side, order_type, quantity, price,
        total_value, fee, stop_loss, take_profit, is_paper, status
    ) VALUES (
        v_user_id, p_account_id, p_symbol, p_side, p_order_type, p_quantity, p_price,
        v_total_value, v_fee, p_stop_loss, p_take_profit, p_is_paper, 'filled'
    ) RETURNING id INTO v_trade_id;
    
    IF p_side = 'buy' THEN
        UPDATE public.trading_accounts SET current_balance = current_balance - v_total_value - v_fee
        WHERE id = p_account_id;
    ELSE
        UPDATE public.trading_accounts SET current_balance = current_balance + v_total_value - v_fee
        WHERE id = p_account_id;
    END IF;
    
    PERFORM public.log_audit_event('trade_executed', 'trades', v_trade_id, NULL,
        jsonb_build_object('symbol', p_symbol, 'side', p_side, 'quantity', p_quantity, 'price', p_price));
    
    RETURN jsonb_build_object('success', TRUE, 'trade_id', v_trade_id);
END;
$$;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trading_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_holdings;