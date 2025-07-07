
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, TrendingUp, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const TradingAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze markets, suggest strategies, and answer questions about cryptocurrency trading. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Simulate AI response (in real implementation, this would call OpenAI API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(input),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('bitcoin') || lowerQuery.includes('btc')) {
      return 'Bitcoin is currently showing strong momentum. Key factors to consider: institutional adoption, regulatory developments, and on-chain metrics. Consider dollar-cost averaging for long-term positions.';
    }
    
    if (lowerQuery.includes('ethereum') || lowerQuery.includes('eth')) {
      return 'Ethereum remains a strong fundamental play with the transition to PoS and upcoming upgrades. Watch for gas fee trends and DeFi activity as key indicators.';
    }
    
    if (lowerQuery.includes('strategy') || lowerQuery.includes('how to')) {
      return 'For beginners, I recommend: 1) Start with paper trading, 2) Learn technical analysis basics, 3) Practice risk management with stop-losses, 4) Diversify across major cryptocurrencies, 5) Never invest more than you can afford to lose.';
    }
    
    if (lowerQuery.includes('market') || lowerQuery.includes('trend')) {
      return 'Current market sentiment appears mixed. Key levels to watch include major support/resistance zones. Consider using technical indicators like RSI and MACD for entry/exit signals.';
    }
    
    return 'I understand you\'re asking about trading. Could you be more specific? I can help with market analysis, trading strategies, risk management, or specific cryptocurrency questions.';
  };

  return (
    <Card className="crypto-card-gradient text-primary-foreground h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-crypto-info" />
          AI Trading Assistant
          <Badge className="bg-crypto-success/20 text-crypto-success">Online</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-crypto-info text-white ml-auto'
                      : 'bg-white/10 text-primary-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-crypto-info" />
                    )}
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="bg-white/10 text-primary-foreground p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-crypto-info" />
                    <span className="text-xs opacity-70">Thinking...</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-crypto-info rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-crypto-info rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-crypto-info rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about trading, market analysis, or strategies..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          This is a demo AI assistant. Not financial advice.
        </div>
      </CardContent>
    </Card>
  );
};
