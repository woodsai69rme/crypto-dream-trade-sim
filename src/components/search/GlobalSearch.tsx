
import { useState, useEffect } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, User, Settings, Wallet, Bot } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'account' | 'trade' | 'bot' | 'setting' | 'symbol';
  icon: React.ReactNode;
  action: () => void;
}

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      // Mock search results - in production, this would query your data
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Main Trading Account',
          description: 'Primary trading account with $10,000 balance',
          type: 'account' as const,
          icon: <Wallet className="w-4 h-4" />,
          action: () => console.log('Navigate to account')
        },
        {
          id: '2',
          title: 'BTC/USD Trade',
          description: 'Recent Bitcoin trade - +$250 profit',
          type: 'trade' as const,
          icon: <TrendingUp className="w-4 h-4" />,
          action: () => console.log('View trade details')
        },
        {
          id: '3',
          title: 'AI Trading Bot',
          description: 'Conservative strategy bot - Active',
          type: 'bot' as const,
          icon: <Bot className="w-4 h-4" />,
          action: () => console.log('View bot settings')
        },
        {
          id: '4',
          title: 'API Settings',
          description: 'Manage exchange connections',
          type: 'setting' as const,
          icon: <Settings className="w-4 h-4" />,
          action: () => console.log('Open API settings')
        }
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      );

      setResults(mockResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'account': return 'bg-blue-500/20 text-blue-400';
      case 'trade': return 'bg-green-500/20 text-green-400';
      case 'bot': return 'bg-purple-500/20 text-purple-400';
      case 'setting': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search accounts, trades, bots..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    result.action();
                    setOpen(false);
                  }}
                  className="flex items-center gap-3"
                >
                  {result.icon}
                  <div className="flex-1">
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.description}
                    </div>
                  </div>
                  <Badge variant="outline" className={getTypeColor(result.type)}>
                    {result.type}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};
