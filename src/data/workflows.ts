
export interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  estimated_returns: string;
  risk_level: "Low" | "Medium" | "High" | "Very High";
  time_commitment: string;
  required_capital: number;
  steps: WorkflowStep[];
  ai_models_used: string[];
  apis_required: string[];
  success_rate: number;
  monthly_performance: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: "analysis" | "signal" | "execution" | "monitoring" | "alert";
  ai_model?: string;
  parameters: Record<string, any>;
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "momentum-scalper",
    name: "AI Momentum Scalper",
    category: "Scalping",
    description: "High-frequency momentum-based scalping using multiple AI models",
    complexity: "Expert",
    estimated_returns: "2-5% daily",
    risk_level: "Very High",
    time_commitment: "Active monitoring required",
    required_capital: 5000,
    success_rate: 78.5,
    monthly_performance: 45.2,
    ai_models_used: ["gpt-4-turbo", "claude-3-5-sonnet", "deepseek-r1"],
    apis_required: ["Binance", "CoinGecko", "TradingView", "Alpha Vantage"],
    steps: [
      {
        id: "1",
        title: "Market Momentum Analysis",
        description: "Analyze short-term momentum indicators across multiple timeframes",
        type: "analysis",
        ai_model: "gpt-4-turbo",
        parameters: {
          timeframes: ["1m", "5m", "15m"],
          indicators: ["RSI", "MACD", "Volume", "Price Action"],
          symbols: ["BTC", "ETH", "SOL", "BNB"]
        }
      },
      {
        id: "2", 
        title: "Signal Generation",
        description: "Generate buy/sell signals based on momentum analysis",
        type: "signal",
        ai_model: "claude-3-5-sonnet",
        parameters: {
          confidence_threshold: 0.85,
          risk_reward_ratio: 2.5,
          position_size: "2%"
        }
      },
      {
        id: "3",
        title: "Trade Execution",
        description: "Execute trades with dynamic position sizing",
        type: "execution",
        parameters: {
          order_type: "market",
          slippage_tolerance: 0.1,
          max_positions: 3
        }
      },
      {
        id: "4",
        title: "Real-time Monitoring",
        description: "Monitor open positions and market conditions",
        type: "monitoring",
        ai_model: "deepseek-r1",
        parameters: {
          monitoring_interval: "30s",
          stop_loss: "1%",
          take_profit: "2.5%"
        }
      }
    ]
  },
  {
    id: "dca-optimizer",
    name: "AI-Powered DCA Optimizer",
    category: "Dollar Cost Averaging",
    description: "Intelligent DCA strategy with AI-optimized timing and allocation",
    complexity: "Intermediate",
    estimated_returns: "15-25% annually",
    risk_level: "Medium",
    time_commitment: "Set and forget",
    required_capital: 1000,
    success_rate: 89.2,
    monthly_performance: 1.8,
    ai_models_used: ["gemini-pro", "claude-3-haiku"],
    apis_required: ["CoinGecko", "Messari", "Glassnode"],
    steps: [
      {
        id: "1",
        title: "Market Cycle Analysis",
        description: "Analyze current market cycle and optimal DCA timing",
        type: "analysis",
        ai_model: "gemini-pro",
        parameters: {
          cycle_indicators: ["Fear & Greed", "On-chain metrics", "Technical analysis"],
          allocation_assets: ["BTC", "ETH", "ADA", "SOL"],
          rebalance_frequency: "weekly"
        }
      },
      {
        id: "2",
        title: "Dynamic Allocation",
        description: "Optimize allocation percentages based on market conditions",
        type: "signal",
        ai_model: "claude-3-haiku",
        parameters: {
          base_allocation: {"BTC": 40, "ETH": 30, "ADA": 15, "SOL": 15},
          volatility_adjustment: true,
          trend_factor: 0.3
        }
      },
      {
        id: "3",
        title: "Automated Purchase",
        description: "Execute DCA purchases with optimized timing",
        type: "execution",
        parameters: {
          purchase_frequency: "daily",
          amount_per_purchase: 50,
          preferred_time: "market_dip"
        }
      }
    ]
  },
  {
    id: "arbitrage-scanner",
    name: "Cross-Exchange Arbitrage Scanner",
    category: "Arbitrage",
    description: "AI-powered arbitrage opportunity scanner across multiple exchanges",
    complexity: "Advanced",
    estimated_returns: "0.5-2% per trade",
    risk_level: "Low",
    time_commitment: "Automated",
    required_capital: 10000,
    success_rate: 92.7,
    monthly_performance: 8.4,
    ai_models_used: ["deepseek-coder", "gpt-4o"],
    apis_required: ["Binance", "Coinbase", "Kraken", "KuCoin", "Bybit"],
    steps: [
      {
        id: "1",
        title: "Price Monitoring",
        description: "Monitor prices across multiple exchanges in real-time",
        type: "monitoring",
        ai_model: "deepseek-coder",
        parameters: {
          exchanges: ["binance", "coinbase", "kraken", "kucoin"],
          symbols: ["BTC", "ETH", "USDT", "BNB"],
          update_frequency: "1s"
        }
      },
      {
        id: "2",
        title: "Opportunity Detection",
        description: "Identify profitable arbitrage opportunities",
        type: "signal",
        ai_model: "gpt-4o",
        parameters: {
          min_profit_threshold: 0.5,
          transaction_costs: true,
          liquidity_check: true
        }
      },
      {
        id: "3",
        title: "Risk Assessment",
        description: "Assess execution risk and market impact",
        type: "analysis",
        ai_model: "deepseek-r1",
        parameters: {
          slippage_estimation: true,
          timing_risk: true,
          counterparty_risk: true
        }
      },
      {
        id: "4",
        title: "Simultaneous Execution",
        description: "Execute buy and sell orders simultaneously",
        type: "execution",
        parameters: {
          execution_speed: "ultra_fast",
          order_splitting: true,
          risk_management: true
        }
      }
    ]
  },
  {
    id: "news-sentiment-trader",
    name: "AI News Sentiment Trader",
    category: "News Trading",
    description: "Trade based on real-time news sentiment analysis",
    complexity: "Advanced",
    estimated_returns: "20-40% annually",
    risk_level: "High",
    time_commitment: "Automated with alerts",
    required_capital: 2500,
    success_rate: 73.1,
    monthly_performance: 2.8,
    ai_models_used: ["claude-3-5-sonnet", "gemini-pro"],
    apis_required: ["NewsAPI", "Twitter API", "Reddit API", "CryptoPanic"],
    steps: [
      {
        id: "1",
        title: "News Aggregation",
        description: "Collect news from multiple sources in real-time",
        type: "monitoring",
        parameters: {
          sources: ["CoinDesk", "CoinTelegraph", "Twitter", "Reddit"],
          keywords: ["Bitcoin", "Ethereum", "regulation", "adoption"],
          update_frequency: "30s"
        }
      },
      {
        id: "2",
        title: "Sentiment Analysis",
        description: "Analyze sentiment and market impact of news",
        type: "analysis",
        ai_model: "claude-3-5-sonnet",
        parameters: {
          sentiment_models: ["financial", "crypto-specific"],
          impact_scoring: true,
          source_reliability: true
        }
      },
      {
        id: "3",
        title: "Trading Signal Generation",
        description: "Generate trading signals based on sentiment scores",
        type: "signal",
        ai_model: "gemini-pro",
        parameters: {
          sentiment_threshold: 0.7,
          news_freshness: 300,
          position_sizing: "sentiment_weighted"
        }
      },
      {
        id: "4",
        title: "Trade Execution",
        description: "Execute trades with appropriate risk management",
        type: "execution",
        parameters: {
          max_position_size: "5%",
          stop_loss: "2%",
          take_profit: "6%"
        }
      }
    ]
  },
  {
    id: "whale-tracker",
    name: "Whale Movement Tracker",
    category: "On-Chain Analysis",
    description: "Track large wallet movements and mirror whale trades",
    complexity: "Expert",
    estimated_returns: "30-60% annually",
    risk_level: "High",
    time_commitment: "Alert-based",
    required_capital: 5000,
    success_rate: 68.9,
    monthly_performance: 4.2,
    ai_models_used: ["gpt-4-turbo", "deepseek-r1"],
    apis_required: ["Etherscan", "Blockchain.info", "Whale Alert", "Glassnode"],
    steps: [
      {
        id: "1",
        title: "Whale Wallet Monitoring",
        description: "Monitor known whale wallets for large transactions",
        type: "monitoring",
        parameters: {
          wallet_threshold: 1000,
          tracked_addresses: 500,
          alert_threshold: 100000
        }
      },
      {
        id: "2",
        title: "Transaction Analysis",
        description: "Analyze whale transactions and predict market impact",
        type: "analysis",
        ai_model: "gpt-4-turbo",
        parameters: {
          transaction_size_impact: true,
          timing_analysis: true,
          exchange_flow_analysis: true
        }
      },
      {
        id: "3",
        title: "Mirror Trade Decision",
        description: "Decide whether to mirror whale trades",
        type: "signal",
        ai_model: "deepseek-r1",
        parameters: {
          whale_success_rate: 0.6,
          position_scaling: 0.1,
          delay_factor: 300
        }
      }
    ]
  }
];

export const WORKFLOW_CATEGORIES = [
  "All",
  "Scalping",
  "Dollar Cost Averaging", 
  "Arbitrage",
  "News Trading",
  "On-Chain Analysis",
  "Grid Trading",
  "Trend Following",
  "Mean Reversion",
  "Momentum Trading"
];
