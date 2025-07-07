
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  pricing: string;
  capabilities: string[];
  use_cases: string[];
  api_endpoint?: string;
  max_tokens?: number;
  supports_streaming: boolean;
  supports_vision: boolean;
  supports_function_calling: boolean;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    category: "Large Language Model",
    description: "Most capable GPT-4 model with 128k context",
    pricing: "$0.01/1K tokens",
    capabilities: ["Text Generation", "Code", "Analysis", "Vision"],
    use_cases: ["Trading Strategy", "Market Analysis", "Code Generation"],
    supports_streaming: true,
    supports_vision: true,
    supports_function_calling: true,
    max_tokens: 128000
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",  
    category: "Multimodal",
    description: "Multimodal flagship model with vision capabilities",
    pricing: "$0.005/1K tokens",
    capabilities: ["Text", "Vision", "Audio", "Reasoning"],
    use_cases: ["Chart Analysis", "Multi-modal Trading", "Real-time Analysis"],
    supports_streaming: true,
    supports_vision: true,
    supports_function_calling: true,
    max_tokens: 128000
  },
  {
    id: "o1-preview",
    name: "o1-preview",
    provider: "OpenAI",
    category: "Reasoning Model", 
    description: "Advanced reasoning model for complex problems",
    pricing: "$0.015/1K tokens",
    capabilities: ["Advanced Reasoning", "Problem Solving", "Math"],
    use_cases: ["Complex Trading Strategies", "Risk Analysis", "Optimization"],
    supports_streaming: false,
    supports_vision: false,
    supports_function_calling: false,
    max_tokens: 32000
  },
  // Anthropic Models
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "Large Language Model",
    description: "Most intelligent Claude model with vision",
    pricing: "$0.003/1K tokens",
    capabilities: ["Text Generation", "Code", "Vision", "Analysis"],
    use_cases: ["Market Research", "Strategy Development", "Risk Assessment"],
    supports_streaming: true,
    supports_vision: true,
    supports_function_calling: true,
    max_tokens: 200000
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    category: "Fast Model",
    description: "Fastest Claude model for quick responses",
    pricing: "$0.00025/1K tokens",
    capabilities: ["Fast Text", "Quick Analysis", "Summarization"],
    use_cases: ["Quick Market Updates", "News Summarization", "Fast Alerts"],
    supports_streaming: true,
    supports_vision: false,
    supports_function_calling: true,
    max_tokens: 200000
  },
  // Google Models
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    category: "Large Language Model",
    description: "Google's most capable multimodal model",
    pricing: "$0.00125/1K tokens",
    capabilities: ["Text", "Vision", "Code", "Reasoning"],
    use_cases: ["Comprehensive Analysis", "Multi-modal Trading", "Research"],
    supports_streaming: true,
    supports_vision: true,
    supports_function_calling: true,
    max_tokens: 128000
  },
  // Meta Models
  {
    id: "llama-2-70b",
    name: "Llama 2 70B",
    provider: "Meta",
    category: "Open Source",
    description: "Large open-source model",
    pricing: "Free/Self-hosted",
    capabilities: ["Text Generation", "Code", "Reasoning"],
    use_cases: ["Custom Strategies", "Private Analysis", "Cost-effective"],
    supports_streaming: true,
    supports_vision: false,
    supports_function_calling: false,
    max_tokens: 4096
  },
  // Specialized Trading Models
  {
    id: "alpaca-7b",
    name: "Alpaca 7B Trading",
    provider: "Stanford",
    category: "Financial AI",
    description: "Fine-tuned for financial analysis",
    pricing: "Free",
    capabilities: ["Financial Analysis", "Trading Signals", "Market Insights"],
    use_cases: ["Trading Signals", "Financial Analysis", "Market Prediction"],
    supports_streaming: true,
    supports_vision: false,
    supports_function_calling: false,
    max_tokens: 2048
  },
  // DeepSeek Models
  {
    id: "deepseek-coder",
    name: "DeepSeek Coder",
    provider: "DeepSeek",
    category: "Code Model",
    description: "Specialized coding model",
    pricing: "$0.00014/1K tokens",
    capabilities: ["Code Generation", "Algorithm Development", "Strategy Coding"],
    use_cases: ["Trading Bot Development", "Strategy Implementation", "Backtesting"],
    supports_streaming: true,
    supports_vision: false,
    supports_function_calling: true,
    max_tokens: 64000
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "Reasoning Model",
    description: "Advanced reasoning at low cost",
    pricing: "$0.00055/1K tokens", 
    capabilities: ["Advanced Reasoning", "Problem Solving", "Analysis"],
    use_cases: ["Complex Strategy Analysis", "Risk Modeling", "Optimization"],
    supports_streaming: true,
    supports_vision: false,
    supports_function_calling: true,
    max_tokens: 64000
  }
];

export const AI_PROVIDERS = ["All", "OpenAI", "Anthropic", "Google", "Meta", "Stanford", "DeepSeek"];
export const AI_CATEGORIES = ["All", "Large Language Model", "Multimodal", "Reasoning Model", "Fast Model", "Open Source", "Financial AI", "Code Model"];
