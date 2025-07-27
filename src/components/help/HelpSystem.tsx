
import React, { useState } from 'react';
import { HelpCircle, Book, Video, MessageCircle, Search, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'trading' | 'bots' | 'analytics' | 'account';
  content: string;
  video?: string;
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with CryptoTrader Pro',
    description: 'Learn the basics of using our platform',
    category: 'getting-started',
    content: `
# Getting Started

Welcome to CryptoTrader Pro! This guide will help you get started with paper trading and AI bots.

## 1. Creating Your First Account
- Navigate to the Accounts tab
- Click "Create New Account"
- Choose from pre-built templates or create custom
- Set your risk parameters

## 2. Making Your First Trade
- Go to the Trading tab
- Select your symbol (BTC, ETH, etc.)
- Choose buy or sell
- Enter amount and price
- Review and execute

## 3. Setting Up AI Bots
- Visit the AI Bots section
- Browse available strategies
- Configure bot parameters
- Activate and monitor performance
    `
  },
  {
    id: 'paper-trading',
    title: 'Paper Trading Guide',
    description: 'Master risk-free trading with virtual money',
    category: 'trading',
    content: `
# Paper Trading Guide

Paper trading allows you to practice without real money risk.

## Key Features
- Virtual $100,000 starting balance
- Real-time market data
- Multiple account types
- Performance tracking

## Best Practices
1. Start with small positions
2. Use stop-losses
3. Keep a trading journal
4. Analyze your performance regularly
    `
  },
  {
    id: 'ai-bots',
    title: 'AI Trading Bots',
    description: 'Automate your trading with intelligent bots',
    category: 'bots',
    content: `
# AI Trading Bots

Our AI bots use advanced algorithms to trade automatically.

## Available Strategies
- Trend Following
- Mean Reversion
- Arbitrage
- Momentum Trading
- Grid Trading

## Configuration
1. Select a strategy
2. Set risk parameters
3. Choose target symbols
4. Activate the bot
5. Monitor performance

## Risk Management
- Set maximum position sizes
- Use daily loss limits
- Monitor bot performance regularly
    `
  }
];

export const HelpSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 z-50 w-96 max-w-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Help Center
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-96">
              {selectedTopic ? (
                <div className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTopic(null)}
                    className="mb-4"
                  >
                    ← Back to topics
                  </Button>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold">{selectedTopic.title}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {selectedTopic.category}
                      </Badge>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {selectedTopic.content}
                      </pre>
                    </div>
                    {selectedTopic.video && (
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full">
                          <Video className="h-4 w-4 mr-2" />
                          Watch Video Tutorial
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 p-4">
                  <Tabs defaultValue="topics" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="topics">Topics</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="topics" className="space-y-2">
                      {filteredTopics.map((topic) => (
                        <div
                          key={topic.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedTopic(topic)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{topic.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {topic.description}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="contact" className="space-y-4">
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Live Chat Support
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Video className="h-4 w-4 mr-2" />
                          Video Tutorials
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          <p>Support Hours:</p>
                          <p>Monday - Friday: 9AM - 6PM</p>
                          <p>Response time: &lt; 2 hours</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
