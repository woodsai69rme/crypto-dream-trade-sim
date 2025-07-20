import { supabase } from '@/integrations/supabase/client';

export interface BackgroundService {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  getStatus: () => ServiceStatus;
}

export interface ServiceStatus {
  tradeFollowing: {
    active: boolean;
    accountsActive: number;
    lastSignal: string | null;
    signalsGenerated: number;
  };
  aiBots: {
    active: boolean;
    botsActive: number;
    lastTrade: string | null;
    tradesExecuted: number;
  };
}

interface TradeSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  confidence: number;
  timestamp: string;
  source: string;
  reasoning: string;
}

class BackgroundTradingManager {
  private static instance: BackgroundTradingManager;
  private isRunning = false;
  private intervals: Set<NodeJS.Timeout> = new Set();
  private status: ServiceStatus = {
    tradeFollowing: {
      active: false,
      accountsActive: 0,
      lastSignal: null,
      signalsGenerated: 0
    },
    aiBots: {
      active: false,
      botsActive: 0,
      lastTrade: null,
      tradesExecuted: 0
    }
  };

  private constructor() {
    // Singleton pattern
    this.loadPersistedState();
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for beforeunload to save state
    window.addEventListener('beforeunload', this.saveState.bind(this));
  }

  static getInstance(): BackgroundTradingManager {
    if (!BackgroundTradingManager.instance) {
      BackgroundTradingManager.instance = new BackgroundTradingManager();
    }
    return BackgroundTradingManager.instance;
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      console.log('🌙 Page hidden - continuing background trading...');
    } else {
      console.log('👁️ Page visible - background trading continues...');
      this.syncStatus();
    }
  }

  private async loadPersistedState() {
    try {
      const tradeFollowingActive = localStorage.getItem('backgroundTradeFollowing') === 'true';
      const aiBotsActive = localStorage.getItem('backgroundAIBots') === 'true';
      
      if (tradeFollowingActive) {
        this.status.tradeFollowing.active = true;
      }
      
      if (aiBotsActive) {
        this.status.aiBots.active = true;
      }

      // Load stats from localStorage
      const savedStats = localStorage.getItem('backgroundTradingStats');
      if (savedStats) {
        const stats = JSON.parse(savedStats);
        this.status = { ...this.status, ...stats };
      }

      console.log('📱 Loaded persisted trading state:', this.status);
    } catch (error) {
      console.error('Error loading persisted state:', error);
    }
  }

  private saveState() {
    try {
      localStorage.setItem('backgroundTradeFollowing', this.status.tradeFollowing.active.toString());
      localStorage.setItem('backgroundAIBots', this.status.aiBots.active.toString());
      localStorage.setItem('backgroundTradingStats', JSON.stringify(this.status));
      console.log('💾 Saved background trading state');
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Background trading already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting background trading services...');

    // Start trade following service
    if (this.status.tradeFollowing.active) {
      this.startTradeFollowing();
    }

    // Start AI bots service
    if (this.status.aiBots.active) {
      this.startAIBots();
    }

    // Status sync interval
    const statusInterval = setInterval(() => {
      this.syncStatus();
      this.saveState();
    }, 30000); // Every 30 seconds

    this.intervals.add(statusInterval);
  }

  stop() {
    console.log('🛑 Stopping background trading services...');
    this.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    this.saveState();
  }

  private startTradeFollowing() {
    console.log('📡 Starting background trade following...');
    
    const generateSignals = () => {
      if (!this.status.tradeFollowing.active || !this.isRunning) return;

      const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'LINK', 'UNI', 'AVAX', 'MATIC', 'DOT'];
      const sides = ['buy', 'sell'];
      
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = sides[Math.floor(Math.random() * sides.length)] as 'buy' | 'sell';
      const confidence = Math.random() * 40 + 50;
      const price = Math.random() * 1000 + 100;
      
      const signal: TradeSignal = {
        id: `bg_signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        side,
        price,
        amount: Math.random() * 2 + 0.1,
        confidence,
        timestamp: new Date().toISOString(),
        source: 'BACKGROUND_AI',
        reasoning: `Background ${confidence > 80 ? 'strong' : 'moderate'} ${side} signal for ${symbol}`
      };

      this.processBackgroundSignal(signal);
      
      this.status.tradeFollowing.signalsGenerated++;
      this.status.tradeFollowing.lastSignal = new Date().toISOString();
      
      console.log(`🔄 Background signal generated: ${signal.symbol} ${signal.side} (${signal.confidence.toFixed(1)}%)`);
    };

    // Generate signals every 5-15 seconds
    const signalInterval = setInterval(generateSignals, 5000 + Math.random() * 10000);
    this.intervals.add(signalInterval);
  }

  private startAIBots() {
    console.log('🤖 Starting background AI bots...');
    
    const executeBotTrades = async () => {
      if (!this.status.aiBots.active || !this.isRunning) return;

      try {
        // Get user from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get active bots
        const { data: bots } = await supabase
          .from('ai_trading_bots')
          .select('id, name, strategy, target_symbols, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(5);

        if (!bots || bots.length === 0) return;

        // Select 1-2 random bots to execute trades
        const activeBots = bots.filter(bot => bot.status === 'active');
        const numberOfBots = Math.min(2, activeBots.length);
        const selectedBots = activeBots
          .sort(() => Math.random() - 0.5)
          .slice(0, numberOfBots);

        for (const bot of selectedBots) {
          if (Math.random() > 0.4) { // 60% chance to execute
            await this.executeBackgroundBotTrade(bot, user.id);
            this.status.aiBots.tradesExecuted++;
            this.status.aiBots.lastTrade = new Date().toISOString();
          }
        }

        this.status.aiBots.botsActive = activeBots.length;
        
      } catch (error) {
        console.error('Error in background bot trading:', error);
      }
    };

    // Execute bot trades every 15-30 seconds
    const botInterval = setInterval(executeBotTrades, 15000 + Math.random() * 15000);
    this.intervals.add(botInterval);
  }

  private async processBackgroundSignal(signal: TradeSignal) {
    try {
      // Get user accounts
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: accounts } = await supabase
        .from('paper_trading_accounts')
        .select('id, account_name, balance, risk_level, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(10);

      if (!accounts || accounts.length === 0) return;

      // Check which accounts have trade following enabled
      const activeAccounts = [];
      for (const account of accounts) {
        const isFollowing = localStorage.getItem(`trade_following_${account.id}`) === 'true';
        if (isFollowing) {
          activeAccounts.push(account);
        }
      }

      this.status.tradeFollowing.accountsActive = activeAccounts.length;

      // Execute trades for active accounts
      for (const account of activeAccounts) {
        const confidenceThreshold = this.getConfidenceThreshold(account.risk_level);
        
        if (signal.confidence >= confidenceThreshold) {
          await this.executeBackgroundTrade(signal, account, user.id);
        }
      }

    } catch (error) {
      console.error('Error processing background signal:', error);
    }
  }

  private async executeBackgroundBotTrade(bot: any, userId: string) {
    try {
      const symbol = bot.target_symbols[Math.floor(Math.random() * bot.target_symbols.length)];
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const price = Math.random() * 1000 + 100;
      const amount = 0.001 + Math.random() * 0.05;

      console.log(`🤖 Background bot trade: ${bot.name} - ${symbol} ${side}`);

      // Log to audit
      await supabase
        .from('comprehensive_audit')
        .insert({
          user_id: userId,
          action_type: 'background_bot_trade',
          entity_type: 'ai_bot',
          entity_id: bot.id,
          metadata: {
            bot_name: bot.name,
            symbol,
            side,
            amount,
            price,
            strategy: bot.strategy,
            execution_mode: 'background'
          }
        });

    } catch (error) {
      console.error('Error executing background bot trade:', error);
    }
  }

  private async executeBackgroundTrade(signal: TradeSignal, account: any, userId: string) {
    try {
      console.log(`💼 Background trade: ${account.account_name} - ${signal.symbol} ${signal.side}`);

      // Log to audit
      await supabase
        .from('comprehensive_audit')
        .insert({
          user_id: userId,
          account_id: account.id,
          action_type: 'background_trade',
          entity_type: 'trade_signal',
          entity_id: signal.id,
          metadata: {
            symbol: signal.symbol,
            side: signal.side,
            amount: signal.amount,
            price: signal.price,
            confidence: signal.confidence,
            account_name: account.account_name,
            execution_mode: 'background'
          }
        });

    } catch (error) {
      console.error('Error executing background trade:', error);
    }
  }

  private getConfidenceThreshold(riskLevel: string): number {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 80;
      case 'medium': return 75; 
      case 'high': return 70;
      case 'aggressive': return 60;
      default: return 75;
    }
  }

  private async syncStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sync with database state
      const { data: accounts } = await supabase
        .from('paper_trading_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data: bots } = await supabase
        .from('ai_trading_bots')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Update status
      if (accounts) {
        let activeFollowing = 0;
        for (const account of accounts) {
          if (localStorage.getItem(`trade_following_${account.id}`) === 'true') {
            activeFollowing++;
          }
        }
        this.status.tradeFollowing.accountsActive = activeFollowing;
      }

      if (bots) {
        this.status.aiBots.botsActive = bots.length;
      }

    } catch (error) {
      console.error('Error syncing status:', error);
    }
  }

  // Public methods
  enableTradeFollowing() {
    this.status.tradeFollowing.active = true;
    localStorage.setItem('backgroundTradeFollowing', 'true');
    
    if (this.isRunning) {
      this.startTradeFollowing();
    }
    
    console.log('✅ Background trade following enabled');
  }

  disableTradeFollowing() {
    this.status.tradeFollowing.active = false;
    localStorage.setItem('backgroundTradeFollowing', 'false');
    console.log('❌ Background trade following disabled');
  }

  enableAIBots() {
    this.status.aiBots.active = true;
    localStorage.setItem('backgroundAIBots', 'true');
    
    if (this.isRunning) {
      this.startAIBots();
    }
    
    console.log('✅ Background AI bots enabled');
  }

  disableAIBots() {
    this.status.aiBots.active = false;
    localStorage.setItem('backgroundAIBots', 'false');
    console.log('❌ Background AI bots disabled');
  }

  getStatus(): ServiceStatus {
    return { ...this.status };
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const backgroundTradingService = BackgroundTradingManager.getInstance();