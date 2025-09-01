
# 🛠️ Development Setup Guide

## Prerequisites

### Required Software

- **Node.js 18+** - JavaScript runtime
- **npm 9+** or **yarn 1.22+** - Package manager
- **Git 2.30+** - Version control
- **VS Code** (recommended) - Code editor

### Optional but Recommended

- **Docker Desktop** - For containerized development
- **PostgreSQL 14+** - Local database (alternative to Supabase)
- **Redis** - For caching and sessions

## 🚀 Quick Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd crypto-trader-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### 4. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:5173`

## 🔧 Detailed Setup

### Environment Variables

Create `.env` file with the following configuration:

```env
# Application
NODE_ENV=development
VITE_APP_VERSION=2.0.0
VITE_APP_NAME="CryptoTrader Pro"

# Supabase Configuration
VITE_SUPABASE_URL=https://xtjowrewuuhmnvmuilcz.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Market Data APIs
VITE_COINGECKO_API_KEY=your_coingecko_key
VITE_BINANCE_API_KEY=your_binance_key
VITE_COINBASE_API_KEY=your_coinbase_key

# AI Models
VITE_OPENAI_API_KEY=your_openai_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_DEEPSEEK_API_KEY=your_deepseek_key

# Development
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Database Setup

#### Option 1: Use Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL and anon key to `.env`
4. Run database migrations:

```bash
npm run db:migrate
```

#### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL service
sudo service postgresql start

# Create database
createdb cryptotrader_dev

# Update .env with local database URL
DATABASE_URL=postgresql://username:password@localhost:5432/cryptotrader_dev
```

### IDE Configuration

#### VS Code Extensions

Install recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🐳 Docker Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Configuration

`docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: cryptotrader
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🧪 Testing Setup

### Install Test Dependencies

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  vitest \
  jsdom \
  @vitest/ui
```

### Test Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🔍 Development Tools

### ESLint Configuration

`.eslintrc.js`:

```javascript
module.exports = {
  root: true,
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### Prettier Configuration

`.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 📦 Build Process

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Build Analysis

```bash
npm run build:analyze
```

## 🚀 Deployment Setup

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Netlify Deployment

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Use different port
npm run dev -- --port 3000
```

#### Node Version Issues

```bash
# Use Node Version Manager
nvm install 18
nvm use 18
```

#### Package Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Check TypeScript version
npx tsc --version
```

### Getting Help

1. Check [troubleshooting guide](./troubleshooting.md)
2. Search [existing issues](../issues)
3. Join our [Discord community](https://discord.gg/cryptotrader)
4. Contact support: support@cryptotrader.pro

## 📚 Next Steps

1. Read the [Configuration Guide](./config.md)
2. Review [API Documentation](./api.md)
3. Set up [testing environment](./testing.md)
4. Explore [deployment options](./deployment.md)

Happy coding! 🚀
