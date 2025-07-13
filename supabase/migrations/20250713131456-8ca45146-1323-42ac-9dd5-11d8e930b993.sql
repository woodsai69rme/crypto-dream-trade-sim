-- Enhanced reset functionality with statistics tracking
CREATE OR REPLACE FUNCTION public.reset_account_with_stats(account_id_param uuid, preserve_stats boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_record RECORD;
  stats_backup JSONB;
  result JSONB;
BEGIN
  -- Get account details
  SELECT * INTO account_record FROM public.paper_trading_accounts 
  WHERE id = account_id_param AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account not found or access denied');
  END IF;
  
  -- Backup current stats if requested
  IF preserve_stats THEN
    stats_backup := jsonb_build_object(
      'total_trades_before_reset', (SELECT COUNT(*) FROM public.paper_trades WHERE account_id = account_id_param),
      'total_volume_before_reset', (SELECT COALESCE(SUM(total_value), 0) FROM public.paper_trades WHERE account_id = account_id_param),
      'reset_date', NOW(),
      'balance_before_reset', account_record.balance,
      'pnl_before_reset', account_record.total_pnl
    );
  END IF;
  
  -- Reset the account
  UPDATE public.paper_trading_accounts 
  SET 
    balance = initial_balance,
    total_pnl = 0.00,
    total_pnl_percentage = 0.00,
    updated_at = NOW()
  WHERE id = account_id_param;
  
  -- Archive trades instead of deleting (for history preservation)
  UPDATE public.paper_trades 
  SET 
    status = 'archived',
    updated_at = NOW()
  WHERE account_id = account_id_param AND status != 'archived';
  
  -- Create comprehensive audit entry
  INSERT INTO public.comprehensive_audit (
    user_id, account_id, action_type, entity_type, entity_id,
    old_values, new_values, metadata
  ) VALUES (
    auth.uid(), account_id_param, 'account_reset', 'account', account_id_param::text,
    jsonb_build_object('balance', account_record.balance, 'total_pnl', account_record.total_pnl),
    jsonb_build_object('balance', account_record.initial_balance, 'total_pnl', 0),
    CASE WHEN preserve_stats THEN stats_backup ELSE '{}' END
  );
  
  result := jsonb_build_object(
    'success', true,
    'account_id', account_id_param,
    'previous_balance', account_record.balance,
    'new_balance', account_record.initial_balance,
    'stats_preserved', preserve_stats,
    'backup_data', CASE WHEN preserve_stats THEN stats_backup ELSE NULL END
  );
  
  RETURN result;
END;
$$;

-- Multi-account reset with statistics
CREATE OR REPLACE FUNCTION public.reset_multiple_accounts(account_ids uuid[], preserve_stats boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  account_id uuid;
  results JSONB[] := '{}';
  result JSONB;
  total_success INTEGER := 0;
  total_failed INTEGER := 0;
BEGIN
  FOREACH account_id IN ARRAY account_ids LOOP
    BEGIN
      result := public.reset_account_with_stats(account_id, preserve_stats);
      results := results || result;
      
      IF (result->>'success')::boolean THEN
        total_success := total_success + 1;
      ELSE
        total_failed := total_failed + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      total_failed := total_failed + 1;
      results := results || jsonb_build_object(
        'success', false,
        'account_id', account_id,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', total_failed = 0,
    'total_accounts', array_length(account_ids, 1),
    'successful_resets', total_success,
    'failed_resets', total_failed,
    'results', results
  );
END;
$$;

-- Enhanced bot configurations with 50 top strategies
CREATE OR REPLACE FUNCTION public.create_50_elite_bot_configs(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    elite_configs JSONB[] := ARRAY[
        '{"name": "Bitcoin Alpha Momentum", "strategy": "momentum", "symbols": ["BTC"], "balance": 10000, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["technical_analysis", "sentiment", "volume_analysis"]}',
        '{"name": "Ethereum Smart Grid", "strategy": "grid-trading", "symbols": ["ETH"], "balance": 8000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["smart_grid", "volatility_detection", "auto_rebalance"]}',
        '{"name": "Multi-Asset DCA Pro", "strategy": "dca", "symbols": ["BTC", "ETH", "SOL", "ADA"], "balance": 15000, "risk": "low", "ai_model": "deepseek-r1", "features": ["portfolio_rebalancing", "market_timing", "risk_management"]}',
        '{"name": "Solana Breakout Hunter", "strategy": "breakout", "symbols": ["SOL"], "balance": 5000, "risk": "aggressive", "ai_model": "claude-opus-4", "features": ["pattern_recognition", "volume_spike_detection", "momentum_confirmation"]}',
        '{"name": "Cross-Exchange Arbitrage", "strategy": "arbitrage", "symbols": ["BTC", "ETH", "USDT"], "balance": 20000, "risk": "low", "ai_model": "gpt-4.1", "features": ["multi_exchange", "latency_optimization", "spread_monitoring"]}',
        '{"name": "AI Sentiment Scalper", "strategy": "scalping", "symbols": ["BTC", "ETH"], "balance": 7500, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["news_sentiment", "social_media_analysis", "rapid_execution"]}',
        '{"name": "Mean Reversion Master", "strategy": "mean-reversion", "symbols": ["LINK", "UNI", "AAVE"], "balance": 6000, "risk": "medium", "ai_model": "deepseek-r1", "features": ["statistical_analysis", "bollinger_bands", "rsi_optimization"]}',
        '{"name": "Whale Tracker Elite", "strategy": "on-chain", "symbols": ["BTC", "ETH"], "balance": 12000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["whale_monitoring", "large_transaction_analysis", "flow_tracking"]}',
        '{"name": "Options Hedge Guardian", "strategy": "hedge", "symbols": ["BTC", "ETH"], "balance": 18000, "risk": "low", "ai_model": "claude-opus-4", "features": ["options_analysis", "delta_hedging", "volatility_protection"]}',
        '{"name": "Flash Crash Opportunity", "strategy": "contrarian", "symbols": ["BTC", "ETH", "SOL"], "balance": 10000, "risk": "aggressive", "ai_model": "deepseek-r1", "features": ["crash_detection", "recovery_timing", "position_sizing"]}',
        '{"name": "Pairs Trading Quantum", "strategy": "pairs", "symbols": ["BTC", "ETH"], "balance": 14000, "risk": "medium", "ai_model": "claude-sonnet-4", "features": ["correlation_analysis", "spread_trading", "cointegration"]}',
        '{"name": "Futures Spread Master", "strategy": "spread", "symbols": ["BTC", "ETH"], "balance": 16000, "risk": "high", "ai_model": "gpt-4.1", "features": ["calendar_spreads", "contango_detection", "roll_optimization"]}',
        '{"name": "Stablecoin Yield Hunter", "strategy": "yield", "symbols": ["USDT", "USDC", "DAI"], "balance": 25000, "risk": "low", "ai_model": "deepseek-r1", "features": ["yield_farming", "defi_integration", "stablecoin_arbitrage"]}',
        '{"name": "Altcoin Rotation AI", "strategy": "rotation", "symbols": ["ADA", "DOT", "LINK", "UNI", "AVAX"], "balance": 8000, "risk": "high", "ai_model": "claude-opus-4", "features": ["sector_rotation", "momentum_scoring", "correlation_matrix"]}',
        '{"name": "Pattern Recognition Pro", "strategy": "pattern", "symbols": ["BTC", "ETH", "SOL"], "balance": 9000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["chart_patterns", "harmonic_analysis", "fibonacci_retracements"]}',
        '{"name": "Volume Surge Detector", "strategy": "volume", "symbols": ["BTC", "ETH", "SOL", "ADA"], "balance": 7000, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["volume_analysis", "unusual_activity", "breakout_confirmation"]}',
        '{"name": "Neural Network Predictor", "strategy": "ml-prediction", "symbols": ["BTC", "ETH"], "balance": 15000, "risk": "high", "ai_model": "deepseek-r1", "features": ["lstm_networks", "feature_engineering", "ensemble_models"]}',
        '{"name": "Market Microstructure", "strategy": "microstructure", "symbols": ["BTC", "ETH"], "balance": 12000, "risk": "medium", "ai_model": "claude-opus-4", "features": ["order_book_analysis", "market_impact", "liquidity_detection"]}',
        '{"name": "Cross-Chain Arbitrage", "strategy": "cross-chain", "symbols": ["BTC", "ETH", "SOL"], "balance": 20000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["bridge_monitoring", "cross_chain_opportunities", "gas_optimization"]}',
        '{"name": "Volatility Surface Trader", "strategy": "volatility", "symbols": ["BTC", "ETH"], "balance": 13000, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["implied_volatility", "vix_analysis", "volatility_arbitrage"]}',
        '{"name": "DeFi Yield Optimizer", "strategy": "defi-yield", "symbols": ["ETH", "UNI", "AAVE", "COMP"], "balance": 18000, "risk": "medium", "ai_model": "deepseek-r1", "features": ["yield_optimization", "liquidity_mining", "impermanent_loss_protection"]}',
        '{"name": "News Event Trader", "strategy": "event-driven", "symbols": ["BTC", "ETH", "SOL"], "balance": 8000, "risk": "high", "ai_model": "claude-opus-4", "features": ["news_parsing", "event_detection", "sentiment_scoring"]}',
        '{"name": "Liquidity Pool Hunter", "strategy": "liquidity", "symbols": ["ETH", "UNI", "SUSHI"], "balance": 16000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["pool_analysis", "apr_tracking", "IL_calculation"]}',
        '{"name": "Trend Following Master", "strategy": "trend-following", "symbols": ["BTC", "ETH", "SOL", "ADA"], "balance": 11000, "risk": "medium", "ai_model": "claude-sonnet-4", "features": ["trend_identification", "momentum_filters", "risk_adjusted_returns"]}',
        '{"name": "Statistical Arbitrage", "strategy": "stat-arb", "symbols": ["BTC", "ETH", "LTC", "BCH"], "balance": 14000, "risk": "medium", "ai_model": "deepseek-r1", "features": ["statistical_models", "z_score_analysis", "pair_selection"]}',
        '{"name": "Options Flow Analyzer", "strategy": "options-flow", "symbols": ["BTC", "ETH"], "balance": 17000, "risk": "high", "ai_model": "claude-opus-4", "features": ["options_flow", "gamma_exposure", "put_call_ratio"]}',
        '{"name": "Crypto Index Tracker", "strategy": "index", "symbols": ["BTC", "ETH", "SOL", "ADA", "DOT"], "balance": 20000, "risk": "low", "ai_model": "gpt-4.1", "features": ["index_replication", "weight_optimization", "rebalancing_automation"]}',
        '{"name": "Social Sentiment Engine", "strategy": "social-sentiment", "symbols": ["BTC", "ETH", "DOGE"], "balance": 6000, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["twitter_analysis", "reddit_sentiment", "influencer_tracking"]}',
        '{"name": "Technical Indicator Fusion", "strategy": "technical-fusion", "symbols": ["BTC", "ETH", "SOL"], "balance": 9500, "risk": "medium", "ai_model": "deepseek-r1", "features": ["multi_indicator", "signal_fusion", "adaptive_parameters"]}',
        '{"name": "Risk Parity Portfolio", "strategy": "risk-parity", "symbols": ["BTC", "ETH", "SOL", "ADA", "LINK"], "balance": 25000, "risk": "low", "ai_model": "claude-opus-4", "features": ["risk_budgeting", "volatility_targeting", "correlation_adjustment"]}',
        '{"name": "Momentum Factor Model", "strategy": "factor-momentum", "symbols": ["BTC", "ETH", "SOL", "ADA"], "balance": 12000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["factor_analysis", "momentum_scoring", "sector_exposure"]}',
        '{"name": "Bollinger Band Squeeze", "strategy": "bb-squeeze", "symbols": ["BTC", "ETH"], "balance": 7500, "risk": "medium", "ai_model": "claude-sonnet-4", "features": ["volatility_contraction", "breakout_detection", "squeeze_alerts"]}',
        '{"name": "Fibonacci Retracement", "strategy": "fibonacci", "symbols": ["BTC", "ETH", "SOL"], "balance": 8500, "risk": "medium", "ai_model": "deepseek-r1", "features": ["fibonacci_levels", "golden_ratio", "extension_targets"]}',
        '{"name": "Elliott Wave Counter", "strategy": "elliott-wave", "symbols": ["BTC", "ETH"], "balance": 10000, "risk": "high", "ai_model": "claude-opus-4", "features": ["wave_counting", "impulse_correction", "fractal_analysis"]}',
        '{"name": "Ichimoku Cloud Trader", "strategy": "ichimoku", "symbols": ["BTC", "ETH", "SOL"], "balance": 9000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["cloud_analysis", "kinko_hyo", "time_cycles"]}',
        '{"name": "MACD Divergence Hunter", "strategy": "macd-divergence", "symbols": ["BTC", "ETH", "ADA"], "balance": 7000, "risk": "medium", "ai_model": "claude-sonnet-4", "features": ["divergence_detection", "histogram_analysis", "signal_confirmation"]}',
        '{"name": "RSI Overbought Oversold", "strategy": "rsi-extreme", "symbols": ["BTC", "ETH", "SOL", "LINK"], "balance": 8000, "risk": "medium", "ai_model": "deepseek-r1", "features": ["rsi_signals", "divergence_analysis", "multi_timeframe"]}',
        '{"name": "Support Resistance Master", "strategy": "support-resistance", "symbols": ["BTC", "ETH"], "balance": 9500, "risk": "medium", "ai_model": "claude-opus-4", "features": ["level_identification", "bounce_detection", "breakout_confirmation"]}',
        '{"name": "Channel Trading Expert", "strategy": "channel", "symbols": ["BTC", "ETH", "SOL"], "balance": 8500, "risk": "medium", "ai_model": "gpt-4.1", "features": ["channel_identification", "range_trading", "breakout_monitoring"]}',
        '{"name": "Gap Trading Specialist", "strategy": "gap-trading", "symbols": ["BTC", "ETH"], "balance": 6500, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["gap_detection", "fill_probability", "momentum_analysis"]}',
        '{"name": "Candlestick Pattern AI", "strategy": "candlestick", "symbols": ["BTC", "ETH", "SOL", "ADA"], "balance": 7500, "risk": "medium", "ai_model": "deepseek-r1", "features": ["pattern_recognition", "reversal_patterns", "continuation_signals"]}',
        '{"name": "Volume Profile Analyzer", "strategy": "volume-profile", "symbols": ["BTC", "ETH"], "balance": 11000, "risk": "medium", "ai_model": "claude-opus-4", "features": ["poc_analysis", "value_area", "volume_distribution"]}',
        '{"name": "Market Structure Trader", "strategy": "market-structure", "symbols": ["BTC", "ETH", "SOL"], "balance": 10500, "risk": "medium", "ai_model": "gpt-4.1", "features": ["structure_breaks", "liquidity_sweeps", "fair_value_gaps"]}',
        '{"name": "Smart Money Concepts", "strategy": "smart-money", "symbols": ["BTC", "ETH"], "balance": 13000, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["institutional_flow", "order_blocks", "mitigation_blocks"]}',
        '{"name": "Harmonic Pattern Trader", "strategy": "harmonic", "symbols": ["BTC", "ETH", "SOL"], "balance": 9000, "risk": "medium", "ai_model": "deepseek-r1", "features": ["gartley_patterns", "butterfly_patterns", "bat_patterns"]}',
        '{"name": "Wyckoff Method AI", "strategy": "wyckoff", "symbols": ["BTC", "ETH"], "balance": 12000, "risk": "medium", "ai_model": "claude-opus-4", "features": ["accumulation_detection", "distribution_phases", "spring_analysis"]}',
        '{"name": "Time Cycle Analyzer", "strategy": "time-cycles", "symbols": ["BTC", "ETH", "SOL"], "balance": 8000, "risk": "medium", "ai_model": "gpt-4.1", "features": ["fibonacci_time", "gann_squares", "seasonal_patterns"]}',
        '{"name": "Fractal Breakout System", "strategy": "fractal", "symbols": ["BTC", "ETH", "ADA"], "balance": 7500, "risk": "high", "ai_model": "claude-sonnet-4", "features": ["fractal_patterns", "chaos_theory", "self_similarity"]}',
        '{"name": "Algorithmic Order Executor", "strategy": "algo-execution", "symbols": ["BTC", "ETH"], "balance": 15000, "risk": "low", "ai_model": "deepseek-r1", "features": ["twap_execution", "vwap_optimization", "slippage_minimization"]}',
        '{"name": "Multi-Timeframe Analyzer", "strategy": "multi-timeframe", "symbols": ["BTC", "ETH", "SOL", "ADA"], "balance": 11500, "risk": "medium", "ai_model": "claude-opus-4", "features": ["timeframe_confluence", "trend_alignment", "signal_filtering"]}'
    ];
    config JSONB;
    priority_levels TEXT[] := ARRAY['low', 'medium', 'high', 'aggressive'];
    current_priority TEXT;
BEGIN
    -- Clear existing bots for user
    DELETE FROM public.ai_trading_bots WHERE user_id = user_id_param;
    
    FOR i IN 1..array_length(elite_configs, 1) LOOP
        config := elite_configs[i];
        current_priority := priority_levels[((i - 1) % 4) + 1];
        
        INSERT INTO public.ai_trading_bots (
            user_id, name, strategy, ai_model, target_symbols, status, mode,
            paper_balance, max_position_size, risk_level, config, performance,
            created_at, updated_at
        ) VALUES (
            user_id_param,
            config->>'name',
            config->>'strategy',
            config->>'ai_model',
            ARRAY(SELECT jsonb_array_elements_text(config->'symbols')),
            'paused',
            'paper',
            (config->>'balance')::NUMERIC,
            (config->>'balance')::NUMERIC * 0.3,
            config->>'risk',
            config || jsonb_build_object('priority', current_priority, 'elite_tier', true),
            jsonb_build_object(
                'total_return', 0,
                'win_rate', 0,
                'total_trades', 0,
                'daily_pnl', 0,
                'weekly_pnl', 0,
                'monthly_pnl', 0,
                'sharpe_ratio', 0,
                'max_drawdown', 0,
                'created_date', NOW()
            ),
            NOW(),
            NOW()
        );
    END LOOP;
END;
$$;