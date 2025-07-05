
# API Documentation

## Overview
This document outlines the API endpoints and database interactions for the cryptocurrency trading platform.

## Supabase Database API

### Authentication Endpoints

#### Get Current User
```typescript
const { data: user, error } = await supabase.auth.getUser();
```

#### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

#### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Trading Accounts

#### Get User's Trading Accounts
```typescript
const { data, error } = await supabase
  .from('paper_trading_accounts')
  .select('*')
  .eq('user_id', userId);
```

#### Create New Trading Account
```typescript
const { data, error } = await supabase
  .from('paper_trading_accounts')
  .insert({
    user_id: userId,
    account_name: 'My Trading Account',
    balance: 100000,
    initial_balance: 100000
  });
```

#### Update Account Balance
```typescript
const { data, error } = await supabase
  .from('paper_trading_accounts')
  .update({ balance: newBalance })
  .eq('id', accountId)
  .eq('user_id', userId);
```

### Trading Operations

#### Execute Trade
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
    fee: 25
  });
```

#### Get Trade History
```typescript
const { data, error } = await supabase
  .from('paper_trades')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

### AI Trading Bots

#### Get User's Bots
```typescript
const { data, error } = await supabase
  .from('ai_trading_bots')
  .select('*')
  .eq('user_id', userId);
```

#### Create New Bot
```typescript
const { data, error } = await supabase
  .from('ai_trading_bots')
  .insert({
    user_id: userId,
    name: 'Trend Following Bot',
    strategy: 'trend-following',
    target_symbols: ['BTC', 'ETH'],
    status: 'active',
    config: {
      maxPositionSize: 1000,
      riskLevel: 'medium'
    }
  });
```

#### Update Bot Status
```typescript
const { data, error } = await supabase
  .from('ai_trading_bots')
  .update({ status: 'paused' })
  .eq('id', botId)
  .eq('user_id', userId);
```

### Social Trading

#### Follow Trader
```typescript
const { data, error } = await supabase
  .from('trader_follows')
  .insert({
    user_id: userId,
    trader_name: 'Michael Saylor',
    trader_category: 'Billionaire Traders'
  });
```

#### Get Followed Traders
```typescript
const { data, error } = await supabase
  .from('trader_follows')
  .select('*')
  .eq('user_id', userId);
```

#### Unfollow Trader
```typescript
const { data, error } = await supabase
  .from('trader_follows')
  .delete()
  .eq('user_id', userId)
  .eq('trader_name', traderName);
```

### Market Data

#### Get Cached Market Data
```typescript
const { data, error } = await supabase
  .from('market_data_cache')
  .select('*')
  .order('last_updated', { ascending: false })
  .limit(100);
```

#### Get Specific Symbol Data
```typescript
const { data, error } = await supabase
  .from('market_data_cache')
  .select('*')
  .eq('symbol', 'bitcoin')
  .single();
```

### Portfolio Management

#### Get User Portfolios
```typescript
const { data, error } = await supabase
  .from('portfolios')
  .select('*')
  .eq('user_id', userId);
```

#### Update Portfolio
```typescript
const { data, error } = await supabase
  .from('portfolios')
  .update({
    total_value: newValue,
    total_pnl: pnl,
    positions: updatedPositions
  })
  .eq('id', portfolioId)
  .eq('user_id', userId);
```

## Real-time Subscriptions

### Portfolio Updates
```typescript
const channel = supabase
  .channel('portfolio-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'portfolios',
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

## Edge Functions

### Market Data Fetcher
```typescript
// Endpoint: /functions/v1/fetch-market-data
const { data, error } = await supabase.functions.invoke('fetch-market-data', {
  body: { symbols: ['bitcoin', 'ethereum'] }
});
```

### Paper Trade Executor
```typescript
// Endpoint: /functions/v1/paper-trade
const { data, error } = await supabase.functions.invoke('paper-trade', {
  body: {
    userId,
    accountId,
    symbol: 'BTC',
    side: 'buy',
    amount: 0.1
  }
});
```

## Error Handling

### Common Error Patterns
```typescript
try {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
    
  if (error) {
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Database error:', error);
  // Handle error appropriately
}
```

### Rate Limiting
- Supabase automatically handles rate limiting
- Implement client-side debouncing for frequent operations
- Use caching to reduce API calls

## Best Practices

### Security
- Always use Row Level Security (RLS)
- Validate user permissions on every operation
- Never expose sensitive data in client-side code

### Performance
- Use selective queries (specify columns)
- Implement pagination for large datasets
- Cache frequently accessed data
- Use real-time subscriptions judiciously

### Data Consistency
- Use transactions for related operations
- Implement optimistic updates with rollback
- Handle connection errors gracefully
