import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  TrendingUp, 
  Database, 
  Brain, 
  Eye, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Shield
} from "lucide-react";

interface APIService {
  id: string;
  name: string;
  category: 'trading_bots' | 'crypto_apis' | 'sentiment' | 'exchanges' | 'ai_models' | 'automation' | 'infrastructure';
  type: 'free' | 'paid' | 'freemium';
  description: string;
  keyFields: {
    name: string;
    type: 'text' | 'password' | 'url';
    required: boolean;
    placeholder: string;
  }[];
  features: string[];
  website?: string;
  documentation?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const apiServices: APIService[] = [
  // Trading Bots
  {
    id: 'tradesanta',
    name: 'TradeSanta',
    category: 'trading_bots',
    type: 'paid',
    description: 'Grid/DCA bots, beginner-friendly automated trading',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your TradeSanta API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your TradeSanta API Secret' }
    ],
    features: ['Grid Trading', 'DCA Bots', 'Beginner Friendly', 'Multiple Exchanges'],
    website: 'https://tradesanta.com',
    icon: Bot
  },
  {
    id: '3commas',
    name: '3Commas',
    category: 'trading_bots',
    type: 'paid',
    description: 'Smart trading terminal with bots and portfolio management',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your 3Commas API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your 3Commas API Secret' }
    ],
    features: ['DCA Bots', 'Grid Bots', 'Smart Trading', 'Portfolio Management'],
    website: 'https://3commas.io',
    icon: Bot
  },
  {
    id: 'cryptohopper',
    name: 'Cryptohopper',
    category: 'trading_bots',
    type: 'freemium',
    description: 'Cloud-based crypto trading bot with strategy marketplace',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Cryptohopper API Key' }
    ],
    features: ['Strategy Marketplace', 'Copy Trading', 'Technical Analysis', 'Paper Trading'],
    website: 'https://cryptohopper.com',
    icon: Bot
  },
  {
    id: 'gunbot',
    name: 'Gunbot',
    category: 'trading_bots',
    type: 'paid',
    description: 'Professional crypto trading bot with advanced strategies',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Gunbot API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Gunbot API Secret' }
    ],
    features: ['Advanced Strategies', 'Multiple Exchanges', 'GUI Interface', 'Backtesting'],
    website: 'https://gunbot.com',
    icon: Bot
  },
  {
    id: 'haasbot',
    name: 'HaasBot',
    category: 'trading_bots',
    type: 'paid',
    description: 'Advanced algorithmic trading bot platform',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your HaasBot API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your HaasBot API Secret' }
    ],
    features: ['Visual Strategy Editor', 'Backtesting', 'Advanced Indicators', 'Cloud Trading'],
    website: 'https://haasonline.com',
    icon: Bot
  },
  {
    id: 'zenbot',
    name: 'Zenbot',
    category: 'trading_bots',
    type: 'free',
    description: 'Open-source trading bot with machine learning',
    keyFields: [
      { name: 'config_path', type: 'text', required: true, placeholder: 'Path to Zenbot config file' }
    ],
    features: ['Open Source', 'Machine Learning', 'Command Line', 'Multiple Exchanges'],
    website: 'https://github.com/DeviaVir/zenbot',
    icon: Bot
  },
  {
    id: 'gekko',
    name: 'Gekko',
    category: 'trading_bots',
    type: 'free',
    description: 'Open-source trading bot and backtesting platform',
    keyFields: [
      { name: 'api_endpoint', type: 'url', required: true, placeholder: 'Gekko API endpoint' }
    ],
    features: ['Open Source', 'Backtesting', 'Paper Trading', 'Strategy Development'],
    website: 'https://gekko.wizb.it',
    icon: Bot
  },
  {
    id: 'quadency',
    name: 'Quadency',
    category: 'trading_bots',
    type: 'freemium',
    description: 'Professional trading platform with automated strategies',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Quadency API Key' }
    ],
    features: ['Automated Strategies', 'Portfolio Management', 'Risk Management', 'Social Trading'],
    website: 'https://quadency.com',
    icon: Bot
  },
  {
    id: 'shrimpy',
    name: 'Shrimpy',
    category: 'trading_bots',
    type: 'paid',
    description: 'Portfolio management and rebalancing automation',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Shrimpy API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Shrimpy API Secret' }
    ],
    features: ['Portfolio Rebalancing', 'Social Trading', 'Index Funds', 'Backtesting'],
    website: 'https://shrimpy.io',
    icon: Bot
  },
  {
    id: 'cornix',
    name: 'Cornix',
    category: 'trading_bots',
    type: 'paid',
    description: 'Telegram signal trading automation',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Cornix API Key' }
    ],
    features: ['Telegram Signals', 'Risk Management', 'Multiple Exchanges', 'Copy Trading'],
    website: 'https://cornix.io',
    icon: Bot
  },
  {
    id: 'bitsgap',
    name: 'Bitsgap',
    category: 'trading_bots',
    type: 'freemium',
    description: 'Grid trading and DCA bots with arbitrage',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Bitsgap API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Bitsgap API Secret' }
    ],
    features: ['Grid Trading', 'DCA Bots', 'Arbitrage', 'Portfolio Tracking'],
    website: 'https://bitsgap.com',
    icon: Bot
  },
  {
    id: 'kucoin_bot',
    name: 'KuCoin Trading Bot',
    category: 'trading_bots',
    type: 'free',
    description: 'Built-in trading bots on KuCoin exchange',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your KuCoin API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your KuCoin API Secret' },
      { name: 'passphrase', type: 'password', required: true, placeholder: 'Your KuCoin Passphrase' }
    ],
    features: ['Grid Trading', 'DCA', 'Spot-Futures Arbitrage', 'Infinity Grid'],
    website: 'https://kucoin.com',
    icon: Bot
  },
  {
    id: 'bybit_bot',
    name: 'Bybit Trading Bot',
    category: 'trading_bots',
    type: 'free',
    description: 'Integrated trading bots on Bybit platform',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Bybit API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Bybit API Secret' }
    ],
    features: ['Grid Trading', 'DCA', 'Martingale', 'Copy Trading'],
    website: 'https://bybit.com',
    icon: Bot
  },
  {
    id: 'gate_bot',
    name: 'Gate.io Trading Bot',
    category: 'trading_bots',
    type: 'free',
    description: 'Automated trading strategies on Gate.io',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Gate.io API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Gate.io API Secret' }
    ],
    features: ['Grid Trading', 'DCA', 'Smart Orders', 'Copy Trading'],
    website: 'https://gate.io',
    icon: Bot
  },
  {
    id: 'deribit_bot',
    name: 'Deribit Trading Bot',
    category: 'trading_bots',
    type: 'free',
    description: 'Options and futures trading automation',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Deribit API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Deribit API Secret' }
    ],
    features: ['Options Trading', 'Futures', 'Delta Hedging', 'Volatility Trading'],
    website: 'https://deribit.com',
    icon: Bot
  },
  {
    id: 'huobi_bot',
    name: 'Huobi Trading Bot',
    category: 'trading_bots',
    type: 'free',
    description: 'Grid and strategy bots on Huobi',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Huobi API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Huobi API Secret' }
    ],
    features: ['Grid Trading', 'Strategy Bots', 'Copy Trading', 'Spot Trading'],
    website: 'https://huobi.com',
    icon: Bot
  },
  {
    id: 'crypto_com_bot',
    name: 'Crypto.com Trading Bot',
    category: 'trading_bots',
    type: 'free',
    description: 'Automated trading on Crypto.com Exchange',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Crypto.com API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Crypto.com API Secret' }
    ],
    features: ['Smart Orders', 'DCA', 'Grid Trading', 'Copy Trading'],
    website: 'https://crypto.com',
    icon: Bot
  },
  {
    id: 'coinrule',
    name: 'Coinrule',
    category: 'trading_bots',
    type: 'paid',
    description: 'Rule-based automation, no coding needed',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Coinrule API Key' }
    ],
    features: ['No-Code Automation', 'Rule Builder', 'Strategy Templates', 'Portfolio Management'],
    website: 'https://coinrule.com',
    icon: Settings
  },
  {
    id: 'pionex',
    name: 'Pionex',
    category: 'trading_bots',
    type: 'freemium',
    description: 'Built-in bots, low fees, unified platform',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Pionex API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Pionex API Secret' }
    ],
    features: ['Built-in Bots', 'Low Fees', 'Grid Trading', 'DCA Bots'],
    website: 'https://pionex.com',
    icon: TrendingUp
  },
  {
    id: 'freqtrade',
    name: 'Freqtrade',
    category: 'trading_bots',
    type: 'free',
    description: 'Open-source, highly customizable, Python-based',
    keyFields: [
      { name: 'webhook_url', type: 'url', required: true, placeholder: 'Freqtrade Webhook URL' },
      { name: 'webhook_token', type: 'password', required: false, placeholder: 'Webhook Token (Optional)' }
    ],
    features: ['Open Source', 'Python-based', 'Highly Customizable', 'Backtesting'],
    website: 'https://freqtrade.io',
    icon: Brain
  },

  // Sentiment Analysis
  {
    id: 'lunarcrush',
    name: 'LunarCrush',
    category: 'sentiment',
    type: 'paid',
    description: 'Social analytics, sentiment, trends from Twitter, Reddit, etc.',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your LunarCrush API Key' }
    ],
    features: ['Social Analytics', 'Sentiment Analysis', 'Influencer Tracking', 'Galaxy Score'],
    website: 'https://lunarcrush.com',
    icon: Eye
  },
  {
    id: 'cryptometer',
    name: 'CryptoMeter',
    category: 'sentiment',
    type: 'free',
    description: 'Real-time social mentions and trends',
    keyFields: [
      { name: 'api_key', type: 'password', required: false, placeholder: 'API Key (Optional for premium features)' }
    ],
    features: ['Social Mentions', 'Trend Analysis', 'Real-time Data', 'Free Tier'],
    website: 'https://cryptometer.io',
    icon: BarChart3
  },
  {
    id: 'santiment',
    name: 'Santiment',
    category: 'sentiment',
    type: 'paid',
    description: 'News/social sentiment, on-chain analytics',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Santiment API Key' }
    ],
    features: ['On-chain Analytics', 'Social Sentiment', 'Development Activity', 'Network Value'],
    website: 'https://santiment.net',
    icon: Activity
  },
  {
    id: 'glassnode',
    name: 'Glassnode',
    category: 'sentiment',
    type: 'paid',
    description: 'On-chain analytics and sentiment indicators',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Glassnode API Key' }
    ],
    features: ['On-chain Metrics', 'Market Indicators', 'Network Health', 'Exchange Flows'],
    website: 'https://glassnode.com',
    icon: Database
  },

  // Crypto APIs
  {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'crypto_apis',
    type: 'freemium',
    description: 'Comprehensive crypto market data and analytics',
    keyFields: [
      { name: 'api_key', type: 'password', required: false, placeholder: 'API Key (Pro features only)' }
    ],
    features: ['Market Data', 'Price History', 'Market Cap Rankings', 'Developer Activity'],
    website: 'https://coingecko.com',
    icon: Globe
  },
  {
    id: 'coinmarketcap',
    name: 'CoinMarketCap',
    category: 'crypto_apis',
    type: 'freemium',
    description: 'Leading crypto market data provider',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your CoinMarketCap API Key' }
    ],
    features: ['Market Data', 'Historical Prices', 'Market Rankings', 'Global Metrics'],
    website: 'https://coinmarketcap.com',
    icon: DollarSign
  },
  {
    id: 'messari',
    name: 'Messari',
    category: 'crypto_apis',
    type: 'freemium',
    description: 'Professional-grade crypto research and data',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Messari API Key' }
    ],
    features: ['Research Data', 'Fundamental Analysis', 'Protocol Metrics', 'Qualitative Data'],
    website: 'https://messari.io',
    icon: Shield
  },

  // Exchanges
  {
    id: 'binance',
    name: 'Binance',
    category: 'exchanges',
    type: 'free',
    description: 'World\'s largest crypto exchange',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Binance API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Binance API Secret' },
      { name: 'testnet', type: 'text', required: false, placeholder: 'Use testnet? (true/false)' }
    ],
    features: ['Spot Trading', 'Futures', 'Options', 'Staking', 'DeFi'],
    website: 'https://binance.com',
    icon: TrendingUp
  },
  {
    id: 'coinbase',
    name: 'Coinbase Pro',
    category: 'exchanges',
    type: 'free',
    description: 'Professional trading platform',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Coinbase Pro API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Coinbase Pro API Secret' },
      { name: 'passphrase', type: 'password', required: true, placeholder: 'Your Coinbase Pro Passphrase' }
    ],
    features: ['Spot Trading', 'Professional Tools', 'Advanced Orders', 'Institutional Grade'],
    website: 'https://pro.coinbase.com',
    icon: Database
  },
  {
    id: 'okx',
    name: 'OKX',
    category: 'exchanges',
    type: 'free',
    description: 'Leading crypto exchange and Web3 ecosystem',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your OKX API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your OKX API Secret' },
      { name: 'passphrase', type: 'password', required: true, placeholder: 'Your OKX Passphrase' }
    ],
    features: ['Spot Trading', 'Derivatives', 'DeFi', 'NFT Marketplace'],
    website: 'https://okx.com',
    icon: Zap
  },

  // Infrastructure & Automation
  {
    id: 'ccxt',
    name: 'CCXT',
    category: 'infrastructure',
    type: 'free',
    description: 'Cryptocurrency trading library supporting 130+ exchanges',
    keyFields: [
      { name: 'exchange_id', type: 'text', required: true, placeholder: 'Exchange ID (e.g., binance, coinbase)' },
      { name: 'api_key', type: 'password', required: false, placeholder: 'Exchange API Key' },
      { name: 'api_secret', type: 'password', required: false, placeholder: 'Exchange API Secret' }
    ],
    features: ['130+ Exchanges', 'Unified API', 'Trading', 'Order Management'],
    website: 'https://ccxt.trade',
    icon: Database
  },
  {
    id: 'context7',
    name: 'Context7',
    category: 'ai_models',
    type: 'paid',
    description: 'Advanced AI context management for trading decisions',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Context7 API Key' },
      { name: 'context_id', type: 'text', required: true, placeholder: 'Context ID' }
    ],
    features: ['Context Management', 'AI Decision Making', 'Memory Systems', 'Trading Intelligence'],
    website: 'https://context7.ai',
    icon: Brain
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'automation',
    type: 'freemium',
    description: 'Workflow automation platform for trading strategies',
    keyFields: [
      { name: 'webhook_url', type: 'url', required: true, placeholder: 'n8n Webhook URL' },
      { name: 'api_key', type: 'password', required: false, placeholder: 'n8n API Key (if using cloud)' }
    ],
    features: ['Workflow Automation', 'Visual Editor', 'Custom Triggers', 'API Integrations'],
    website: 'https://n8n.io',
    icon: Settings
  },

  // Additional Exchanges
  {
    id: 'kraken',
    name: 'Kraken',
    category: 'exchanges',
    type: 'free',
    description: 'Secure and trusted cryptocurrency exchange',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Kraken API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Kraken API Secret' }
    ],
    features: ['Spot Trading', 'Futures', 'Margin Trading', 'Staking'],
    website: 'https://kraken.com',
    icon: Shield
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'exchanges',
    type: 'free',
    description: 'Regulated cryptocurrency exchange and custodian',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Gemini API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Gemini API Secret' }
    ],
    features: ['Regulated', 'Custody Services', 'ActiveTrader', 'Institutional'],
    website: 'https://gemini.com',
    icon: Shield
  },
  {
    id: 'bitfinex',
    name: 'Bitfinex',
    category: 'exchanges',
    type: 'free',
    description: 'Professional trading platform with advanced features',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Bitfinex API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your Bitfinex API Secret' }
    ],
    features: ['Advanced Trading', 'Margin Trading', 'Lending', 'Derivatives'],
    website: 'https://bitfinex.com',
    icon: TrendingUp
  },
  {
    id: 'ftx',
    name: 'FTX',
    category: 'exchanges',
    type: 'free',
    description: 'Derivatives exchange (historical data)',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your FTX API Key' },
      { name: 'api_secret', type: 'password', required: true, placeholder: 'Your FTX API Secret' }
    ],
    features: ['Historical Data', 'Derivatives', 'Spot Trading', 'Leveraged Tokens'],
    website: 'https://ftx.com',
    icon: Database
  },

  // Additional AI Models
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'ai_models',
    type: 'paid',
    description: 'Access to multiple AI models through unified API',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your OpenRouter API Key' }
    ],
    features: ['Multiple Models', 'Cost Optimization', 'Model Routing', 'Unified API'],
    website: 'https://openrouter.ai',
    icon: Brain
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    category: 'ai_models',
    type: 'paid',
    description: 'Advanced AI assistant for trading analysis',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Anthropic API Key' }
    ],
    features: ['Advanced Reasoning', 'Safe AI', 'Long Context', 'Trading Analysis'],
    website: 'https://anthropic.com',
    icon: Brain
  },
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai_models',
    type: 'paid',
    description: 'GPT models for trading insights and automation',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your OpenAI API Key' }
    ],
    features: ['GPT Models', 'Code Generation', 'Analysis', 'Function Calling'],
    website: 'https://openai.com',
    icon: Brain
  },
  {
    id: 'together',
    name: 'Together AI',
    category: 'ai_models',
    type: 'paid',
    description: 'Open-source AI models for trading strategies',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Together AI API Key' }
    ],
    features: ['Open Source Models', 'Fast Inference', 'Custom Models', 'Cost Effective'],
    website: 'https://together.ai',
    icon: Brain
  },

  // Additional Trading Platforms
  {
    id: 'tradingview',
    name: 'TradingView',
    category: 'crypto_apis',
    type: 'freemium',
    description: 'Advanced charting and social trading platform',
    keyFields: [
      { name: 'username', type: 'text', required: true, placeholder: 'TradingView Username' },
      { name: 'password', type: 'password', required: true, placeholder: 'TradingView Password' }
    ],
    features: ['Advanced Charts', 'Pine Script', 'Social Trading', 'Alerts'],
    website: 'https://tradingview.com',
    icon: BarChart3
  },
  {
    id: 'coinalyze',
    name: 'Coinalyze',
    category: 'crypto_apis',
    type: 'freemium',
    description: 'Crypto derivatives and options analytics',
    keyFields: [
      { name: 'api_key', type: 'password', required: true, placeholder: 'Your Coinalyze API Key' }
    ],
    features: ['Derivatives Data', 'Options Analytics', 'Funding Rates', 'Open Interest'],
    website: 'https://coinalyze.net',
    icon: BarChart3
  }
];

export const ComprehensiveAPIManager = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>('trading_bots');
  const [apiConfigs, setApiConfigs] = useState<Record<string, any>>({});
  const [testingStatus, setTestingStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  const categories = {
    trading_bots: { label: 'Trading Bots', icon: Bot, color: 'bg-blue-500/20 text-blue-400' },
    crypto_apis: { label: 'Crypto APIs', icon: Database, color: 'bg-green-500/20 text-green-400' },
    sentiment: { label: 'Sentiment Analysis', icon: Eye, color: 'bg-purple-500/20 text-purple-400' },
    exchanges: { label: 'Exchanges', icon: TrendingUp, color: 'bg-orange-500/20 text-orange-400' },
    ai_models: { label: 'AI Models', icon: Brain, color: 'bg-pink-500/20 text-pink-400' },
    automation: { label: 'Automation', icon: Settings, color: 'bg-cyan-500/20 text-cyan-400' },
    infrastructure: { label: 'Infrastructure', icon: Zap, color: 'bg-yellow-500/20 text-yellow-400' },
  };

  const filteredServices = apiServices.filter(service => service.category === activeCategory);

  const updateApiConfig = (serviceId: string, field: string, value: string) => {
    setApiConfigs(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value
      }
    }));
  };

  const testConnection = async (service: APIService) => {
    setTestingStatus(prev => ({ ...prev, [service.id]: 'testing' }));
    
    try {
      // Simulate API test - in real implementation, this would test actual connections
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.3;
      
      setTestingStatus(prev => ({ 
        ...prev, 
        [service.id]: success ? 'success' : 'error' 
      }));
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `Successfully connected to ${service.name}` 
          : `Failed to connect to ${service.name}. Please check your credentials.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      setTestingStatus(prev => ({ ...prev, [service.id]: 'error' }));
      toast({
        title: "Connection Error",
        description: `Failed to test connection to ${service.name}`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'testing': return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="crypto-card-gradient text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Comprehensive API & Exchange Manager
            <Badge className="bg-purple-500/20 text-purple-400">
              {apiServices.length} Services
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(categories).map(([key, category]) => {
              const CategoryIcon = category.icon;
              const count = apiServices.filter(s => s.category === key).length;
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "outline"}
                  onClick={() => setActiveCategory(key)}
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${
                    activeCategory === key ? category.color : 'border-white/20'
                  }`}
                >
                  <CategoryIcon className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs opacity-70">{count} services</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredServices.map((service) => {
          const ServiceIcon = service.icon;
          const config = apiConfigs[service.id] || {};
          const status = testingStatus[service.id] || 'idle';
          
          return (
            <Card key={service.id} className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <ServiceIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-white">{service.name}</h3>
                        <Badge className={
                          service.type === 'free' ? 'bg-green-500/20 text-green-400' :
                          service.type === 'paid' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }>
                          {service.type}
                        </Badge>
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-sm text-white/60">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {service.website && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20"
                        onClick={() => window.open(service.website, '_blank')}
                      >
                        Visit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => testConnection(service)}
                      disabled={status === 'testing'}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {status === 'testing' ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {service.keyFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label className="text-white">
                        {field.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </Label>
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={config[field.name] || ''}
                        onChange={(e) => updateApiConfig(service.id, field.name, e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <Badge key={feature} className="bg-blue-500/20 text-blue-400">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={config.enabled || false}
                      onCheckedChange={(checked) => updateApiConfig(service.id, 'enabled', checked.toString())}
                    />
                    <Label className="text-white">Enable Integration</Label>
                  </div>
                  
                  {status === 'success' && (
                    <Badge className="bg-green-500/20 text-green-400">
                      ✓ Connected
                    </Badge>
                  )}
                  {status === 'error' && (
                    <Badge className="bg-red-500/20 text-red-400">
                      ✗ Connection Failed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};