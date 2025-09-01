
# 🧪 Testing Guide

Comprehensive testing strategy for CryptoTrader Pro.

## 📋 Testing Strategy

### Test Pyramid

```
    🔺 E2E Tests (10%)
   🔺🔺 Integration Tests (20%)
  🔺🔺🔺 Unit Tests (70%)
```

### Testing Principles

1. **Fast Feedback** - Tests run quickly to provide immediate feedback
2. **Reliable** - Tests are deterministic and don't flake
3. **Maintainable** - Tests are easy to understand and modify
4. **Comprehensive** - Critical paths are thoroughly tested
5. **Isolated** - Tests don't depend on external services

## 🏗️ Test Architecture

### Directory Structure

```
src/
├── __tests__/          # Global test files
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
├── services/
│   ├── service.ts
│   └── service.test.ts
└── test/
    ├── setup.ts        # Test setup
    ├── mocks/          # Mock implementations
    ├── fixtures/       # Test data
    └── utils/          # Test utilities
```

### Test Configuration

#### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### Test Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockResolvedValue({ data: [], error: null }),
      delete: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock intersection observer
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

## 🧪 Unit Tests

### Component Testing

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing

```typescript
// src/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from './useAuth';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('initializes with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('signs in user successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const { error } = await result.current.signIn('test@example.com', 'password');
      expect(error).toBeNull();
    });
  });

  it('handles sign in errors', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Mock failed sign in
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    });
    
    await act(async () => {
      const { error } = await result.current.signIn('test@example.com', 'wrong');
      expect(error?.message).toBe('Invalid credentials');
    });
  });
});
```

### Service Testing

```typescript
// src/services/marketDataService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { marketDataService } from './marketDataService';

// Mock fetch
global.fetch = vi.fn();

describe('marketDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches current prices successfully', async () => {
    const mockResponse = {
      bitcoin: { usd: 50000 },
      ethereum: { usd: 3000 }
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const prices = await marketDataService.getCurrentPrices(['bitcoin', 'ethereum']);
    
    expect(prices).toEqual({
      BTC: { price: 50000, symbol: 'BTC' },
      ETH: { price: 3000, symbol: 'ETH' }
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const prices = await marketDataService.getCurrentPrices(['bitcoin']);
    expect(prices).toEqual({});
  });

  it('caches responses to avoid repeated calls', async () => {
    const mockResponse = { bitcoin: { usd: 50000 } };
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // First call
    await marketDataService.getCurrentPrices(['bitcoin']);
    
    // Second call (should use cache)
    await marketDataService.getCurrentPrices(['bitcoin']);
    
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
```

## 🔗 Integration Tests

### API Integration Tests

```typescript
// src/__tests__/integration/auth.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Authentication Integration', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    // Use test database
    supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
  });

  it('creates user profile on signup', async () => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'testpassword123';

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    expect(authError).toBeNull();
    expect(authData.user).toBeTruthy();

    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user!.id)
      .single();

    expect(profileError).toBeNull();
    expect(profile).toBeTruthy();
    expect(profile.email).toBe(email);
  });
});
```

### Database Integration Tests

```typescript
// src/__tests__/integration/trading.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Trading System Integration', () => {
  let testUserId: string;
  let testAccountId: string;

  beforeEach(async () => {
    // Create test user and account
    const { data: user } = await supabase.auth.signUp({
      email: `test+${Date.now()}@example.com`,
      password: 'testpassword123',
    });
    testUserId = user.user!.id;

    const { data: account } = await supabase
      .from('paper_trading_accounts')
      .insert({
        user_id: testUserId,
        account_name: 'Test Account',
        balance: 10000,
        initial_balance: 10000,
      })
      .select()
      .single();
    testAccountId = account.id;
  });

  afterEach(async () => {
    // Cleanup test data
    await supabase
      .from('paper_trading_accounts')
      .delete()
      .eq('id', testAccountId);
  });

  it('creates paper trade successfully', async () => {
    const tradeData = {
      user_id: testUserId,
      account_id: testAccountId,
      symbol: 'BTC',
      side: 'buy',
      amount: 0.1,
      price: 50000,
      total_value: 5000,
    };

    const { data: trade, error } = await supabase
      .from('paper_trades')
      .insert(tradeData)
      .select()
      .single();

    expect(error).toBeNull();
    expect(trade).toBeTruthy();
    expect(trade.symbol).toBe('BTC');
    expect(trade.side).toBe('buy');
  });

  it('updates account balance after trade', async () => {
    // Create a trade
    await supabase.from('paper_trades').insert({
      user_id: testUserId,
      account_id: testAccountId,
      symbol: 'BTC',
      side: 'buy',
      amount: 0.1,
      price: 50000,
      total_value: 5000,
      pnl: 500,
    });

    // Check updated balance
    const { data: account } = await supabase
      .from('paper_trading_accounts')
      .select('balance, total_pnl')
      .eq('id', testAccountId)
      .single();

    expect(account.total_pnl).toBe(500);
  });
});
```

## 🎭 End-to-End Tests

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can sign up and sign in', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to sign up
    await page.click('text=Sign Up');
    
    // Fill sign up form
    const email = `test+${Date.now()}@example.com`;
    await page.fill('[data-testid=email-input]', email);
    await page.fill('[data-testid=password-input]', 'testpassword123');
    await page.click('[data-testid=signup-button]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Sign out
    await page.click('[data-testid=user-menu]');
    await page.click('text=Sign Out');
    
    // Sign in again
    await page.click('text=Sign In');
    await page.fill('[data-testid=email-input]', email);
    await page.fill('[data-testid=password-input]', 'testpassword123');
    await page.click('[data-testid=signin-button]');
    
    // Should be back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});

// e2e/trading.spec.ts
test.describe('Trading Features', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'password');
    await page.click('[data-testid=signin-button]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates paper trading account', async ({ page }) => {
    await page.click('[data-testid=accounts-tab]');
    await page.click('[data-testid=create-account-button]');
    
    await page.fill('[data-testid=account-name]', 'Test Trading Account');
    await page.selectOption('[data-testid=account-type]', 'aggressive');
    await page.fill('[data-testid=initial-balance]', '50000');
    
    await page.click('[data-testid=submit-account]');
    
    await expect(page.locator('text=Test Trading Account')).toBeVisible();
  });

  test('creates and configures AI bot', async ({ page }) => {
    await page.click('[data-testid=bots-tab]');
    await page.click('[data-testid=create-bot-button]');
    
    await page.fill('[data-testid=bot-name]', 'Test Bitcoin Bot');
    await page.selectOption('[data-testid=bot-strategy]', 'momentum');
    await page.selectOption('[data-testid=target-symbol]', 'BTC');
    await page.fill('[data-testid=bot-balance]', '10000');
    
    await page.click('[data-testid=submit-bot]');
    
    await expect(page.locator('text=Test Bitcoin Bot')).toBeVisible();
    
    // Start the bot
    await page.click('[data-testid=start-bot-button]');
    await expect(page.locator('[data-testid=bot-status]')).toHaveText('active');
  });

  test('runs comprehensive audit', async ({ page }) => {
    await page.click('[data-testid=settings-tab]');
    await page.click('text=Comprehensive Testing Suite');
    
    await page.click('[data-testid=run-audit-button]');
    
    // Wait for audit to complete (may take several minutes)
    await expect(page.locator('[data-testid=audit-status]'))
      .toHaveText('completed', { timeout: 300000 });
    
    // Check audit results
    await expect(page.locator('[data-testid=system-health-score]')).toBeVisible();
    await expect(page.locator('[data-testid=trading-accuracy]')).toBeVisible();
    await expect(page.locator('[data-testid=security-score]')).toBeVisible();
  });
});
```

## 🚀 Performance Tests

### Load Testing with Artillery

```yaml
# artillery.yml
config:
  target: 'http://localhost:5173'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      rampTo: 50
      name: "Ramp up load"
    - duration: 600
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "Browse and trade"
    weight: 70
    flow:
      - get:
          url: "/"
      - think: 2
      - get:
          url: "/dashboard"
      - think: 5
      - get:
          url: "/api/market-data"
      - think: 3
      - post:
          url: "/api/paper-trades"
          json:
            symbol: "BTC"
            side: "buy"
            amount: 0.1
            price: 50000

  - name: "Audit system"
    weight: 30
    flow:
      - get:
          url: "/settings"
      - think: 2
      - post:
          url: "/api/audit/run"
      - think: 60
      - get:
          url: "/api/audit/results"
```

### Performance Test Script

```typescript
// src/test/performance/api.perf.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('API Performance Tests', () => {
  it('market data endpoint responds within 500ms', async () => {
    const start = performance.now();
    
    const response = await fetch('/api/market-data');
    const data = await response.json();
    
    const duration = performance.now() - start;
    
    expect(response.ok).toBe(true);
    expect(duration).toBeLessThan(500);
    expect(data).toBeDefined();
  });

  it('handles concurrent requests efficiently', async () => {
    const requests = Array.from({ length: 10 }, () =>
      fetch('/api/market-data').then(r => r.json())
    );
    
    const start = performance.now();
    const results = await Promise.all(requests);
    const duration = performance.now() - start;
    
    expect(results).toHaveLength(10);
    expect(duration).toBeLessThan(2000); // 10 requests in under 2 seconds
  });
});
```

## 📊 Test Automation

### Test Scripts

```json
// package.json scripts
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run src/__tests__/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "artillery run artillery.yml",
    "test:all": "npm run test:run && npm run test:e2e",
    "test:ci": "npm run test:coverage && npm run test:e2e"
  }
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Utilities

```typescript
// src/test/utils/render.tsx
import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: any;
}

const createWrapper = (options: CustomRenderOptions = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export const render = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const Wrapper = createWrapper(options);
  return rtlRender(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { render };
```

## 📈 Coverage Reports

### Coverage Configuration

```typescript
// vitest.config.ts coverage configuration
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/components/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        './src/hooks/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
  },
});
```

## 🎯 Testing Best Practices

### Test Organization

1. **Group Related Tests** - Use `describe` blocks to group related test cases
2. **Clear Test Names** - Test names should describe the expected behavior
3. **Single Responsibility** - Each test should test one specific behavior
4. **Independent Tests** - Tests should not depend on each other
5. **Test Data Management** - Use fixtures and factories for consistent test data

### Mock Strategies

1. **Mock External Dependencies** - Mock API calls, third-party services
2. **Partial Mocks** - Only mock what you need to test
3. **Spy on Real Methods** - Use spies to verify function calls
4. **Mock Timers** - Control time-dependent code with fake timers

### Debugging Tests

```typescript
// Debug mode for specific tests
import { debug } from '@testing-library/react';

it('debugs component state', () => {
  const { container } = render(<MyComponent />);
  debug(container); // Prints HTML structure
  
  // Set breakpoint here for debugging
  debugger;
});

// Custom debug utilities
export const logRenderTree = (container: HTMLElement) => {
  console.log(container.outerHTML);
};
```

This comprehensive testing guide ensures robust, reliable, and maintainable test coverage for CryptoTrader Pro.
