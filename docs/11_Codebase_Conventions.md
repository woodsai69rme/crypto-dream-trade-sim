# Codebase Conventions

## Overview
This document outlines the coding standards, naming conventions, and best practices for the CryptoTrader Pro codebase to ensure consistency, maintainability, and team collaboration.

## File & Folder Structure

### Directory Organization
```
src/
├── components/           # React components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── accounts/        # Account-specific components
│   ├── trading/         # Trading-specific components
│   ├── analytics/       # Analytics & charts
│   ├── ai/              # AI trading features
│   ├── social/          # Social trading components
│   ├── dashboard/       # Dashboard components
│   ├── notifications/   # Notification components
│   ├── portfolio/       # Portfolio components
│   ├── settings/        # Settings components
│   └── testing/         # Testing components
├── hooks/               # Custom React hooks
├── pages/               # Route/page components
├── services/            # External API services
├── lib/                 # Utilities and helpers
├── types/               # TypeScript type definitions
└── integrations/        # Third-party integrations
    └── supabase/        # Supabase configuration
```

### File Naming Conventions

#### Components
```typescript
// PascalCase for React components
✅ AccountManager.tsx
✅ TradingPanel.tsx
✅ AITradingBot.tsx

// Avoid abbreviations unless widely understood
❌ AccMgr.tsx
❌ TrdPanel.tsx
```

#### Hooks
```typescript
// camelCase with 'use' prefix
✅ useAuth.tsx
✅ useMultipleAccounts.tsx
✅ useRealTimePortfolio.tsx

// Descriptive names
✅ useAccountReset.tsx
❌ useReset.tsx
```

#### Services
```typescript
// camelCase with descriptive suffix
✅ marketDataService.ts
✅ tradingService.ts
✅ authService.ts
```

#### Utilities
```typescript
// camelCase for utility functions
✅ utils.ts
✅ constants.ts
✅ helpers.ts
✅ formatters.ts
```

## Naming Conventions

### Variables & Functions
```typescript
// camelCase for variables and functions
const accountBalance = 100000;
const currentUser = useAuth();

function calculateTotalPnL(trades: Trade[]): number {
  // Implementation
}

// Constants in SCREAMING_SNAKE_CASE
const MAX_POSITION_SIZE = 10000;
const DEFAULT_CURRENCY = 'USD';
const API_ENDPOINTS = {
  MARKET_DATA: '/api/market-data',
  TRADES: '/api/trades'
} as const;
```

### Component Props
```typescript
// Use descriptive prop names
interface AccountCardProps {
  account: Account;
  isSelected?: boolean;
  onSelect: (accountId: string) => void;
  className?: string;
}

// Prefix boolean props with 'is', 'has', 'can', 'should'
interface TradingPanelProps {
  isLoading: boolean;
  hasError: boolean;
  canTrade: boolean;
  shouldShowAdvanced: boolean;
}
```

### Event Handlers
```typescript
// Use 'handle' prefix for event handlers
const handleTradeSubmit = (tradeData: TradeData) => {
  // Implementation
};

const handleAccountSelect = (accountId: string) => {
  // Implementation
};

// Use 'on' prefix for callback props
interface ComponentProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  onSuccess: (result: Result) => void;
}
```

## TypeScript Conventions

### Type Definitions
```typescript
// Use PascalCase for type names
interface User {
  id: string;
  email: string;
  displayName: string;
}

type TradeType = 'buy' | 'sell';
type AccountStatus = 'active' | 'paused' | 'archived';

// Use descriptive generic names
interface ApiResponse<TData> {
  data: TData;
  error?: string;
  success: boolean;
}

// Prefix interfaces with 'I' only when necessary to avoid conflicts
interface IExternalApiResponse {
  // When integrating with external libraries
}
```

### Enums
```typescript
// Use PascalCase for enum names and values
enum AccountType {
  Conservative = 'conservative',
  Balanced = 'balanced',
  Aggressive = 'aggressive',
  DayTrading = 'day_trading'
}

// Use const assertions for simple constants
const RISK_LEVELS = {
  Low: 'low',
  Medium: 'medium',
  High: 'high'
} as const;

type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];
```

### Function Types
```typescript
// Use arrow functions for simple handlers
const handleClick = (event: MouseEvent) => {
  // Implementation
};

// Use function declarations for complex logic
function calculatePortfolioMetrics(
  trades: Trade[],
  accounts: Account[]
): PortfolioMetrics {
  // Complex implementation
}

// Use generic constraints appropriately
function updateEntity<T extends { id: string }>(
  entity: T,
  updates: Partial<T>
): T {
  return { ...entity, ...updates };
}
```

## Component Structure

### Component Organization
```typescript
// 1. Imports (grouped and sorted)
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useMultipleAccounts';

import { formatCurrency } from '@/lib/utils';
import { Account, Trade } from '@/types';

// 2. Types and interfaces
interface AccountCardProps {
  account: Account;
  onSelect: (accountId: string) => void;
  className?: string;
}

// 3. Component definition
export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onSelect,
  className
}) => {
  // 4. State and hooks
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // 5. Event handlers
  const handleClick = useCallback(() => {
    onSelect(account.id);
  }, [account.id, onSelect]);
  
  // 6. Effects
  useEffect(() => {
    // Implementation
  }, []);
  
  // 7. Render
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{account.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

// 8. Default export (if applicable)
export default AccountCard;
```

### Custom Hooks
```typescript
// Hook naming: use + descriptive name
export const useAccountManagement = () => {
  // 1. State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 2. Functions
  const createAccount = useCallback(async (data: CreateAccountData) => {
    // Implementation
  }, []);
  
  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    // Implementation
  }, []);
  
  // 3. Effects
  useEffect(() => {
    fetchAccounts();
  }, []);
  
  // 4. Return object with clear structure
  return {
    // State
    accounts,
    isLoading,
    error,
    
    // Actions
    createAccount,
    updateAccount,
    
    // Derived state
    totalAccounts: accounts.length,
    hasAccounts: accounts.length > 0
  };
};
```

## Styling Conventions

### Tailwind CSS Classes
```typescript
// Use semantic design tokens from theme
✅ "bg-card text-card-foreground"
✅ "border-border"
✅ "text-primary"

// Avoid direct colors
❌ "bg-white text-black"
❌ "border-gray-200"

// Group related classes
<div className={cn(
  "flex items-center gap-4", // Layout
  "p-4 rounded-lg", // Spacing & borders
  "bg-card text-card-foreground", // Colors
  "hover:bg-accent transition-colors", // Interactions
  className // Allow override
)} />

// Use conditional classes clearly
<Button 
  className={cn(
    "base-button-classes",
    isLoading && "opacity-50 cursor-not-allowed",
    variant === 'primary' && "bg-primary text-primary-foreground",
    variant === 'secondary' && "bg-secondary text-secondary-foreground"
  )}
/>
```

### Component Variants
```typescript
// Use cva for component variants
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

## Import/Export Conventions

### Import Organization
```typescript
// 1. React and React-related imports
import React, { useState, useEffect } from 'react';

// 2. Third-party library imports
import { z } from 'zod';
import { toast } from 'sonner';

// 3. UI component imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal component imports
import { AccountManager } from '@/components/accounts/AccountManager';

// 5. Hook imports
import { useAuth } from '@/hooks/useAuth';

// 6. Service/utility imports
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// 7. Type imports (with 'type' keyword)
import type { Account, Trade } from '@/types';
```

### Export Conventions
```typescript
// Named exports for utilities and hooks
export const formatCurrency = (amount: number) => {
  // Implementation
};

export const useAccountData = () => {
  // Implementation
};

// Default exports for main components
const AccountManager: React.FC = () => {
  // Implementation
};

export default AccountManager;

// Re-exports for clean barrel exports
// In index.ts files
export { AccountManager } from './AccountManager';
export { TradingPanel } from './TradingPanel';
export { default as AITradingBot } from './AITradingBot';
```

## Error Handling Conventions

### Error Boundaries
```typescript
// Use error boundaries for component trees
class TradingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Trading component error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <TradingErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
// Use consistent error handling patterns
const handleTradeSubmit = async (tradeData: TradeData) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const result = await executeTrade(tradeData);
    
    toast.success('Trade executed successfully');
    onSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError(message);
    toast.error(`Trade failed: ${message}`);
    console.error('Trade execution error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Performance Conventions

### Memoization
```typescript
// Use React.memo for expensive components
export const ExpensiveChart = React.memo<ChartProps>(({ data, options }) => {
  // Expensive rendering logic
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.data === nextProps.data;
});

// Use useMemo for expensive calculations
const portfolioMetrics = useMemo(() => {
  return calculateComplexMetrics(trades, accounts);
}, [trades, accounts]);

// Use useCallback for event handlers passed to children
const handleAccountSelect = useCallback((accountId: string) => {
  setSelectedAccount(accountId);
  onAccountChange(accountId);
}, [onAccountChange]);
```

### Code Splitting
```typescript
// Lazy load heavy components
const AITradingBot = lazy(() => import('@/components/ai/AITradingBot'));
const AdvancedAnalytics = lazy(() => import('@/components/analytics/AdvancedAnalytics'));

// Use Suspense with fallbacks
<Suspense fallback={<ComponentSkeleton />}>
  <AITradingBot />
</Suspense>
```

## Testing Conventions

### Test File Structure
```typescript
// AccountManager.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountManager } from './AccountManager';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/services/accountService');

describe('AccountManager', () => {
  beforeEach(() => {
    // Setup
  });

  describe('rendering', () => {
    it('should display account list when accounts exist', () => {
      // Test implementation
    });
  });

  describe('interactions', () => {
    it('should handle account selection', () => {
      // Test implementation
    });
  });

  describe('error states', () => {
    it('should display error message when loading fails', () => {
      // Test implementation
    });
  });
});
```

## Comment Conventions

### Code Comments
```typescript
// Use JSDoc for functions and components
/**
 * Calculates the total profit/loss for a portfolio
 * @param trades - Array of trade objects
 * @param currentPrices - Current market prices
 * @returns Total PnL in USD
 */
function calculateTotalPnL(
  trades: Trade[],
  currentPrices: Record<string, number>
): number {
  // Implementation details with inline comments
  const totalPnL = trades.reduce((sum, trade) => {
    // Calculate individual trade PnL
    const currentPrice = currentPrices[trade.symbol];
    const tradePnL = trade.side === 'buy' 
      ? (currentPrice - trade.price) * trade.amount
      : (trade.price - currentPrice) * trade.amount;
    
    return sum + tradePnL;
  }, 0);

  return totalPnL;
}

// TODO comments for future improvements
// TODO: Add support for multiple currencies
// FIXME: Handle edge case where currentPrice is undefined
// NOTE: This calculation assumes all trades are in the same currency
```

## Git Conventions

### Commit Messages
```bash
# Format: type(scope): description
feat(trading): add multi-account trading support
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
style(ui): improve button component styling
refactor(hooks): simplify account management logic
test(trading): add unit tests for trade execution
chore(deps): update dependencies to latest versions

# Use imperative mood
✅ "Add trading panel component"
❌ "Added trading panel component"
❌ "Adding trading panel component"
```

### Branch Naming
```bash
# Feature branches
feature/multi-account-trading
feature/ai-bot-integration
feature/social-trading

# Bug fix branches
fix/trade-execution-error
fix/authentication-redirect

# Hotfix branches
hotfix/critical-balance-calculation

# Release branches
release/v1.2.0
```

### Pull Request Guidelines
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

## Code Review Checklist

### Pre-Review
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] Code follows naming conventions
- [ ] No console.log statements in production code
- [ ] TypeScript types are properly defined

### Review Focus Areas
- [ ] Logic correctness and edge cases
- [ ] Performance implications
- [ ] Security considerations
- [ ] Accessibility compliance
- [ ] Mobile responsiveness
- [ ] Error handling completeness

### Post-Review
- [ ] Address all review comments
- [ ] Update documentation if needed
- [ ] Verify CI/CD pipeline passes
- [ ] Test deployment in staging environment

---

Following these conventions ensures a maintainable, scalable, and collaborative codebase that the entire team can work with effectively.