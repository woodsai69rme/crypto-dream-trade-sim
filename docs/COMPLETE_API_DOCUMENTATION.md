
# 🔌 COMPLETE API DOCUMENTATION

## Overview
CryptoTrader Pro uses Supabase as its backend, providing RESTful APIs, real-time subscriptions, and edge functions for all platform functionality.

---

## 🔐 AUTHENTICATION APIs

### User Registration
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: `${window.location.origin}/`
  }
});
```

### User Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});
```

### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
```

### Password Reset
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  { redirectTo: `${window.location.origin}/reset-password` }
);
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

---

## 💼 ACCOUNT MANAGEMENT APIs

### Get User's Trading Accounts
```typescript
const { data: accounts, error } = await supabase
  .from('paper_trading_accounts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Create New Trading Account
```typescript
const { data, error } = await supabase
  .from('paper_trading_accounts')
  .insert({
    user_id: userId,
    account_name: 'My Trading Account',
    account_type: 'balanced',
    risk_level: 'medium',
    balance: 100000,
    initial_balance: 100000,
    status: 'active',
    is_default: false
  })
  .select()
  .single();
```

### Create Account from Template
```typescript
const { data, error } = await supabase.rpc('create_account_from_template', {
  template_id_param: templateId,
  account_name_param: accountName,
  custom_balance_param: customBalance
});
```

### Update Account Balance
```typescript
const { data, error } = await supabase.rpc('adjust_paper_balance', {
  account_id_param: accountId,
  new_balance_param: newBalance,
  reason_param: 'Manual adjustment'
});
```

### Reset Account
```typescript
const { data, error } = await supabase.rpc('reset_paper_account', {
  account_id_param: accountId,
  reset_balance_param: initialBalance
});
```

### Set Default Account
```typescript
const { data, error } = await supabase.rpc('set_default_account', {
  account_id_param: accountId
});
```

---

## 📈 TRADING APIs

### Execute Paper Trade
```typescript
const { data, error } = await supabase.rpc('execute_paper_trade', {
  p_user_id: userId,
  p_account_id: accountId,
  p_symbol: 'BTC',
  p_side: 'buy',
  p_amount: 0.1,
  p_price: 50000,
  p_trade_type: 'market',
  p_order_type: 'market'
});
```

### Get Trade History
```typescript
const { data: trades, error } = await supabase
  .from('paper_trades')
  .select('*')
  .eq('user_id', userId)
  .eq('account_id', accountId)
  .order('created_at', { ascending: false })
  .limit(50);
```

### Create Manual Trade
```typescript
const { data, error } = await supabase
  .from('paper_trades')
  .insert({
    user_id: userId,
    account_id: accountId,
    symbol: 'BTC',
    side: 'buy',
    amount: 0.1,
    price: 50000,
    total_value: 5000,
    fee: 25,
    status: 'completed',
    trade_type: 'market',
    reasoning: 'Manual trade execution'
  })
  .select()
  .single();
```

---

## 🤖 AI BOT APIs

### Get User's AI Bots
```typescript
const { data: bots, error } = await supabase
  .from('ai_trading_bots')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Create AI Bot
```typescript
const { data, error } = await supabase
  .from('ai_trading_bots')
  .insert({
    user_id: userId,
    name: 'Bitcoin Trend Master',
    strategy: 'trend-following',
    ai_model: 'deepseek-r1',
    target_symbols: ['BTC'],
    status: 'paused',
    mode: 'paper',
    paper_balance: 5000,
    max_position_size: 2500,
    risk_level: 'medium',
    config: {
      stop_loss: 5,
      take_profit: 10,
      max_trades_per_day: 5
    }
  })
  .select()
  .single();
```

### Update Bot Status
```typescript
const { data, error } = await supabase
  .from('ai_trading_bots')
  .update({ 
    status: 'active',
    updated_at: new Date().toISOString()
  })
  .eq('id', botId)
  .eq('user_id', userId)
  .select()
  .single();
```

### Initialize Default Bots
```typescript
const { data, error } = await supabase.rpc('create_initial_trading_bots', {
  user_id: userId
});
```

---

## 👥 SOCIAL TRADING APIs

### Follow Trader
```typescript
const { data, error } = await supabase
  .from('trader_follows')
  .insert({
    user_id: userId,
    trader_name: 'Michael Saylor',
    trader_category: 'Billionaire Traders',
    copy_trading_enabled: false,
    allocation_percentage: 0
  })
  .select()
  .single();
```

### Get Followed Traders
```typescript
const { data: follows, error } = await supabase
  .from('trader_follows')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true);
```

### Enable Copy Trading
```typescript
const { data, error } = await supabase
  .from('trader_follows')
  .update({
    copy_trading_enabled: true,
    allocation_percentage: allocationPercent
  })
  .eq('id', followId)
  .eq('user_id', userId);
```

### Unfollow Trader
```typescript
const { data, error } = await supabase
  .from('trader_follows')
  .update({ is_active: false })
  .eq('user_id', userId)
  .eq('trader_name', traderName);
```

---

## 📊 ANALYTICS APIs

### Get Account Analytics
```typescript
const { data, error } = await supabase.rpc('calculate_account_metrics', {
  account_id_param: accountId
});
```

### Get Portfolio Analytics
```typescript
const { data: analytics, error } = await supabase
  .from('account_analytics')
  .select('*')
  .eq('user_id', userId)
  .eq('account_id', accountId)
  .order('analytics_date', { ascending: false })
  .limit(30);
```

### Create Risk Alert
```typescript
const { data, error } = await supabase
  .from('risk_alerts')
  .insert({
    user_id: userId,
    portfolio_id: portfolioId,
    alert_type: 'drawdown',
    symbol: 'BTC',
    trigger_condition: 'greater_than',
    trigger_value: 5000,
    current_value: 4800,
    status: 'active'
  })
  .select()
  .single();
```

---

## 📈 MARKET DATA APIs

### Get Market Data
```typescript
const { data: marketData, error } = await supabase
  .from('market_data')
  .select('*')
  .order('last_updated', { ascending: false })
  .limit(100);
```

### Get Specific Symbol Data
```typescript
const { data, error } = await supabase
  .from('market_data')
  .select('*')
  .eq('symbol', 'bitcoin')
  .single();
```

### Cache Market Data
```typescript
const { data, error } = await supabase
  .from('market_data')
  .upsert({
    symbol: 'bitcoin',
    name: 'Bitcoin',
    price: 50000,
    change_24h: 2.5,
    volume_24h: 25000000000,
    market_cap: 950000000000,
    user_id: userId
  })
  .select()
  .single();
```

---

## 🔄 REAL-TIME SUBSCRIPTIONS

### Portfolio Updates
```typescript
const portfolioChannel = supabase
  .channel('portfolio-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'paper_trading_accounts',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Portfolio updated:', payload);
    }
  )
  .subscribe();
```

### Trade Notifications
```typescript
const tradesChannel = supabase
  .channel('trades-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'paper_trades',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('New trade:', payload);
    }
  )
  .subscribe();
```

### Bot Status Changes
```typescript
const botsChannel = supabase
  .channel('bot-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'ai_trading_bots',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Bot status changed:', payload);
    }
  )
  .subscribe();
```

### Market Data Updates
```typescript
const marketChannel = supabase
  .channel('market-data')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'market_data'
    },
    (payload) => {
      console.log('Market data updated:', payload);
    }
  )
  .subscribe();
```

---

## 🔍 WATCHLIST APIs

### Get User Watchlists
```typescript
const { data: watchlists, error } = await supabase
  .from('watchlists')
  .select('*')
  .eq('user_id', userId);
```

### Add Symbol to Watchlist
```typescript
const { data, error } = await supabase
  .from('watchlists')
  .update({
    symbols: [...currentSymbols, newSymbol]
  })
  .eq('id', watchlistId)
  .eq('user_id', userId);
```

### Create New Watchlist
```typescript
const { data, error } = await supabase
  .from('watchlists')
  .insert({
    user_id: userId,
    name: 'My Custom Watchlist',
    symbols: ['bitcoin', 'ethereum', 'solana'],
    is_default: false
  })
  .select()
  .single();
```

---

## 🔒 AUDIT & SECURITY APIs

### Log Audit Event
```typescript
const { data, error } = await supabase.rpc('log_comprehensive_audit', {
  p_account_id: accountId,
  p_action_type: 'trade_executed',
  p_entity_type: 'paper_trade',
  p_entity_id: tradeId,
  p_old_values: null,
  p_new_values: tradeData,
  p_metadata: { source: 'manual_trading' }
});
```

### Get Audit Logs
```typescript
const { data: auditLogs, error } = await supabase
  .from('audit_logs')
  .select('*')
  .eq('user_id', userId)
  .order('timestamp', { ascending: false })
  .limit(100);
```

---

## ⚙️ TEMPLATE SYSTEM APIs

### Get Account Templates
```typescript
const { data: templates, error } = await supabase
  .from('account_templates')
  .select('*')
  .eq('is_public', true)
  .order('usage_count', { ascending: false });
```

### Create Custom Template
```typescript
const { data, error } = await supabase
  .from('account_templates')
  .insert({
    name: 'My Custom Template',
    description: 'Custom trading setup',
    account_type: 'balanced',
    risk_level: 'medium',
    initial_balance: 75000,
    max_daily_loss: 750,
    max_position_size: 7500,
    trading_strategy: 'swing_trading',
    color_theme: '#10b981',
    icon: 'TrendingUp',
    tags: ['custom', 'swing'],
    is_public: false,
    created_by: userId
  })
  .select()
  .single();
```

---

## 📱 NOTIFICATION APIs

### Create Notification
```typescript
const { data, error } = await supabase
  .from('account_notifications')
  .insert({
    user_id: userId,
    account_id: accountId,
    notification_type: 'trade_alert',
    title: 'Trade Executed',
    message: 'Your BTC buy order has been executed',
    severity: 'info',
    metadata: { trade_id: tradeId }
  })
  .select()
  .single();
```

### Get User Notifications
```typescript
const { data: notifications, error } = await supabase
  .from('account_notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

### Mark Notification as Read
```typescript
const { data, error } = await supabase
  .from('account_notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
  .eq('user_id', userId);
```

---

## 🔧 UTILITY FUNCTIONS

### Check Authentication Status
```typescript
const { data, error } = await supabase.rpc('check_user_authenticated');
```

### Manual Account Creation
```typescript
const { data, error } = await supabase.rpc('manual_create_account', {
  p_user_id: userId
});
```

### Ensure User Has Accounts
```typescript
const { data, error } = await supabase.rpc('ensure_user_accounts');
```

---

## 🚀 EDGE FUNCTIONS

### Market Data Fetcher
```typescript
const { data, error } = await supabase.functions.invoke('fetch-market-data', {
  body: { symbols: ['bitcoin', 'ethereum', 'solana'] }
});
```

### AI Trading Signal
```typescript
const { data, error } = await supabase.functions.invoke('ai-trading-signal', {
  body: {
    botId: botId,
    symbol: 'BTC',
    strategy: 'trend-following'
  }
});
```

### Social Sentiment Monitor
```typescript
const { data, error } = await supabase.functions.invoke('social-sentiment-monitor', {
  body: { symbols: ['BTC', 'ETH'] }
});
```

---

## ⚡ ERROR HANDLING

### Standard Error Response
```typescript
interface APIError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Usage
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

### Common Error Codes
- `PGRST116`: Row Level Security violation
- `23505`: Unique constraint violation
- `42501`: Insufficient privileges
- `23503`: Foreign key constraint violation

---

## 📊 RATE LIMITING

### Supabase Limits
- **REST API**: 500 requests/minute per user
- **Real-time**: 100 concurrent connections
- **Edge Functions**: 500 invocations/minute
- **Auth**: 100 auth operations/minute

### Best Practices
- Implement client-side caching
- Use batch operations when possible
- Implement exponential backoff for retries
- Monitor usage and optimize queries

---

This comprehensive API documentation covers all aspects of the CryptoTrader Pro platform, providing developers with complete integration capabilities.
