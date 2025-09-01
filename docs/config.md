
# ⚙️ Configuration Guide

Complete configuration reference for CryptoTrader Pro.

## 📋 Environment Variables

### Core Application Settings

```env
# Application Identity
NODE_ENV=production|development|test
VITE_APP_NAME="CryptoTrader Pro"
VITE_APP_VERSION=2.0.0
VITE_APP_DESCRIPTION="Advanced Cryptocurrency Trading Platform"

# Application Behavior
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info|debug|warn|error
VITE_MAINTENANCE_MODE=false
VITE_FEATURE_FLAGS={"newUI": true, "betaFeatures": false}
```

### Database Configuration

```env
# Supabase (Primary)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_KEY=your_service_key

# Alternative: PostgreSQL Direct
DATABASE_URL=postgresql://user:password@localhost:5432/cryptotrader
DATABASE_POOL_SIZE=20
DATABASE_TIMEOUT=30000

# Alternative: SQLite (Development)
SQLITE_DB_PATH=./data/cryptotrader.db
SQLITE_WAL_MODE=true
```

### Market Data APIs

```env
# CoinGecko (Primary)
VITE_COINGECKO_API_KEY=your_coingecko_pro_key
VITE_COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
VITE_COINGECKO_RATE_LIMIT=50

# Binance API
VITE_BINANCE_API_KEY=your_binance_key
VITE_BINANCE_SECRET_KEY=your_binance_secret
VITE_BINANCE_TESTNET=true

# Coinbase Pro
VITE_COINBASE_API_KEY=your_coinbase_key
VITE_COINBASE_SECRET=your_coinbase_secret
VITE_COINBASE_PASSPHRASE=your_passphrase
VITE_COINBASE_SANDBOX=true

# Alternative Data Sources
VITE_CRYPTOCOMPARE_API_KEY=your_cryptocompare_key
VITE_ALPHA_VANTAGE_API_KEY=your_alphavantage_key
```

### AI Model Configuration

```env
# OpenAI
VITE_OPENAI_API_KEY=your_openai_key
VITE_OPENAI_ORG_ID=your_org_id
VITE_OPENAI_MODEL=gpt-4-turbo-preview

# Anthropic Claude
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# DeepSeek
VITE_DEEPSEEK_API_KEY=your_deepseek_key
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com

# Custom AI Models
VITE_CUSTOM_AI_ENDPOINT=https://your-ai-api.com
VITE_CUSTOM_AI_TOKEN=your_custom_token
```

### Security Settings

```env
# Authentication
VITE_JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
VITE_JWT_EXPIRY=24h
VITE_REFRESH_TOKEN_EXPIRY=7d

# Encryption
VITE_ENCRYPTION_KEY=your-32-char-encryption-key
VITE_HASH_ROUNDS=12

# CORS Settings
VITE_CORS_ORIGINS=https://yourdomain.com,https://staging.yourdomain.com
VITE_CORS_CREDENTIALS=true

# Rate Limiting
VITE_RATE_LIMIT_WINDOW=15m
VITE_RATE_LIMIT_MAX_REQUESTS=100
VITE_RATE_LIMIT_SKIP_SUCCESSFUL=true

# Security Headers
VITE_CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'"
VITE_HSTS_MAX_AGE=31536000
```

### Trading Configuration

```env
# Paper Trading Settings
VITE_PAPER_TRADING_INITIAL_BALANCE=100000
VITE_PAPER_TRADING_MAX_ACCOUNTS=10
VITE_PAPER_TRADING_RESET_FREQUENCY=monthly

# Risk Management
VITE_MAX_DAILY_LOSS_PERCENTAGE=5
VITE_MAX_POSITION_SIZE_PERCENTAGE=10
VITE_STOP_LOSS_DEFAULT=5
VITE_TAKE_PROFIT_DEFAULT=15

# Trading Fees Simulation
VITE_TRADING_FEE_PERCENTAGE=0.1
VITE_SLIPPAGE_SIMULATION=0.05
VITE_SPREAD_SIMULATION=0.02

# Bot Configuration
VITE_MAX_ACTIVE_BOTS=50
VITE_BOT_EXECUTION_INTERVAL=30000
VITE_BOT_MAX_RETRIES=3
```

### Performance & Monitoring

```env
# Caching
VITE_CACHE_TTL=300
VITE_CACHE_MAX_SIZE=100MB
VITE_REDIS_URL=redis://localhost:6379

# Analytics
VITE_ANALYTICS_TRACKING_ID=your_analytics_id
VITE_ANALYTICS_ENABLED=true
VITE_ERROR_TRACKING_DSN=your_sentry_dsn

# Performance Monitoring
VITE_PERFORMANCE_SAMPLING_RATE=0.1
VITE_MEMORY_THRESHOLD=512MB
VITE_CPU_THRESHOLD=80

# Health Checks
VITE_HEALTH_CHECK_INTERVAL=60000
VITE_HEALTH_CHECK_TIMEOUT=5000
VITE_HEALTH_CHECK_RETRIES=3
```

### Email & Notifications

```env
# Email Service (SendGrid)
VITE_SENDGRID_API_KEY=your_sendgrid_key
VITE_FROM_EMAIL=noreply@cryptotrader.pro
VITE_ADMIN_EMAIL=admin@cryptotrader.pro

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VITE_VAPID_PRIVATE_KEY=your_vapid_private_key
VITE_VAPID_SUBJECT=mailto:admin@cryptotrader.pro

# Webhook Configuration
VITE_WEBHOOK_SECRET=your_webhook_secret
VITE_WEBHOOK_TIMEOUT=30000
```

## 🏗️ Application Configuration

### Trading Bot Settings

```typescript
// src/config/bots.ts
export const BOT_CONFIG = {
  maxActiveBots: 50,
  defaultBalance: 10000,
  executionInterval: 30000, // 30 seconds
  maxRetries: 3,
  riskLevels: {
    conservative: {
      maxPositionSize: 0.05, // 5% of balance
      stopLoss: 0.02, // 2%
      takeProfit: 0.05, // 5%
    },
    moderate: {
      maxPositionSize: 0.1, // 10% of balance
      stopLoss: 0.05, // 5%
      takeProfit: 0.15, // 15%
    },
    aggressive: {
      maxPositionSize: 0.2, // 20% of balance
      stopLoss: 0.1, // 10%
      takeProfit: 0.3, // 30%
    },
  },
};
```

### Market Data Configuration

```typescript
// src/config/market.ts
export const MARKET_CONFIG = {
  updateInterval: 5000, // 5 seconds
  symbols: [
    'bitcoin', 'ethereum', 'solana', 'cardano', 'ripple',
    'binancecoin', 'avalanche-2', 'chainlink', 'uniswap',
    'aave', 'compound-governance-token'
  ],
  indicators: {
    sma: [20, 50, 200],
    ema: [12, 26],
    rsi: { period: 14, overbought: 70, oversold: 30 },
    macd: { fast: 12, slow: 26, signal: 9 },
    bollinger: { period: 20, stdDev: 2 },
  },
  timeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
};
```

### UI Theme Configuration

```typescript
// src/config/theme.ts
export const THEME_CONFIG = {
  defaultTheme: 'dark',
  colors: {
    primary: 'hsl(222, 84%, 65%)',
    secondary: 'hsl(210, 40%, 98%)',
    success: 'hsl(142, 76%, 36%)',
    danger: 'hsl(0, 84%, 60%)',
    warning: 'hsl(38, 92%, 50%)',
    info: 'hsl(221, 83%, 53%)',
  },
  animations: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};
```

## 🔧 Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts', 'lightweight-charts'],
          utils: ['date-fns', 'lodash-es', 'uuid'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  preview: {
    port: 4173,
  },
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

## 🐳 Docker Configuration

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: cryptotrader
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

volumes:
  postgres_data:
  redis_data:
```

## 🔒 Security Configuration

### Content Security Policy

```javascript
// Security headers configuration
const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.coingecko.com https://*.supabase.co wss://*.supabase.co;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
  `.replace(/\s+/g, ' ').trim(),
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
```

### Rate Limiting Configuration

```typescript
// Rate limiting rules
export const RATE_LIMITS = {
  global: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
  },
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // requests per window
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // attempts per window
  },
  trading: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // trades per window
  },
};
```

## 📊 Monitoring Configuration

### Application Metrics

```typescript
// Monitoring configuration
export const MONITORING_CONFIG = {
  metrics: {
    enabled: true,
    interval: 60000, // 1 minute
    retention: '7d',
  },
  alerts: {
    errorRate: { threshold: 0.05, window: '5m' },
    responseTime: { threshold: 2000, window: '5m' },
    memory: { threshold: 0.8, window: '1m' },
    cpu: { threshold: 0.8, window: '1m' },
  },
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: 'json',
    transports: ['console', 'file'],
  },
};
```

## 🚀 Deployment-Specific Configuration

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "origin-when-cross-origin" }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "origin-when-cross-origin"
```

## 📝 Configuration Validation

### Environment Validation

```typescript
// src/config/validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_COINGECKO_API_KEY: z.string().optional(),
  VITE_OPENAI_API_KEY: z.string().optional(),
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
};
```

This configuration guide provides comprehensive coverage of all aspects of the CryptoTrader Pro application configuration. Adjust values according to your specific deployment needs and security requirements.
