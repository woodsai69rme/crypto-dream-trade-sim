# Developer Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the CryptoTrader Pro development environment on your local machine.

## Prerequisites

### Required Software
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: Latest version
- **VS Code**: Recommended editor (or your preferred IDE)

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 5GB free space
- **Internet**: Stable connection for package downloads

## Step-by-Step Setup

### 1. Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/your-username/cryptotrader-pro.git

# Navigate to project directory
cd cryptotrader-pro

# Check current branch
git branch
```

### 2. Install Dependencies
```bash
# Clean install (recommended for first setup)
rm -rf node_modules package-lock.json

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration
The project uses Supabase with pre-configured connection settings. No additional environment variables are needed for development.

**Supabase Configuration (Pre-configured):**
- **Project URL**: `https://xtjowrewuuhmnvmuilcz.supabase.co`
- **Anon Key**: Pre-configured in the codebase
- **Database**: PostgreSQL with RLS enabled
- **Authentication**: Supabase Auth

### 4. Database Setup
The database is hosted on Supabase and requires no local setup. However, you can explore the schema:

```bash
# View database migrations
ls supabase/migrations/

# Check database schema documentation
cat docs/08_Database_Schema.md
```

### 5. Start Development Server
```bash
# Start the development server
npm run dev

# Server will start on http://localhost:5173
```

### 6. Verify Installation
Open your browser and navigate to `http://localhost:5173`. You should see:
- Authentication page if not logged in
- Dashboard if you have an account

**Test Features:**
1. Create a new account
2. Navigate between dashboard tabs
3. Create a trading account
4. Execute a paper trade
5. View trading history

## Development Tools

### VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Browser Extensions
- **React Developer Tools**: For component debugging
- **Redux DevTools**: For state management debugging
- **Supabase DevTools**: For database queries

## Project Structure

```
cryptotrader-pro/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components (Shadcn)
│   │   ├── accounts/        # Account management
│   │   ├── trading/         # Trading components
│   │   ├── analytics/       # Analytics & charts
│   │   ├── ai/              # AI trading features
│   │   └── social/          # Social trading
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route components
│   ├── services/            # External API services
│   ├── lib/                 # Utilities
│   └── integrations/        # Supabase integration
├── docs/                    # Documentation
├── supabase/               # Database migrations & functions
├── public/                 # Static assets
└── dist/                   # Build output
```

## Available Scripts

### Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Testing Scripts
```bash
# Run all tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Database Development

### Supabase Local Development (Optional)
If you want to work with a local Supabase instance:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Start local development
supabase start

# Apply migrations
supabase db reset
```

### Database Migrations
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Generate types
supabase gen types typescript --local > src/types/supabase.ts
```

## Cloud Setup

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
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Test User Accounts

For development and testing, you can create accounts through the application or use these test scenarios:

### Test Account Types
1. **Beginner Trader**
   - Email: `test.beginner@example.com`
   - Features: Basic trading, single account

2. **Advanced Trader**
   - Email: `test.advanced@example.com`
   - Features: Multiple accounts, AI bots, social trading

3. **Demo Account**
   - Email: `demo@example.com`
   - Features: Pre-populated with sample data

## Common Issues & Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Node Version Issues
```bash
# Check Node version
node --version

# Update to latest LTS
nvm install --lts
nvm use --lts
```

### Package Installation Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
1. Check internet connection
2. Verify Supabase project status
3. Check browser network tab for failed requests
4. Clear browser cache and local storage

### Build Errors
```bash
# Type checking
npm run type-check

# Check for missing dependencies
npm audit

# Clean build
rm -rf dist
npm run build
```

### Hot Reload Not Working
1. Restart development server
2. Clear browser cache
3. Check file watchers limit (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## Performance Optimization

### Development Performance
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check dependency sizes
npx bundlephobia

# Memory usage monitoring
node --inspect --max-old-space-size=4096 node_modules/.bin/vite
```

### Code Quality Tools
```bash
# ESLint configuration
npx eslint --init

# Prettier configuration
echo '{"semi": true, "singleQuote": true, "tabWidth": 2}' > .prettierrc

# Husky pre-commit hooks
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## IDE Configuration

### VS Code Settings
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### TypeScript Configuration
The project includes optimized TypeScript configuration:
- Strict mode enabled
- Path mapping for clean imports
- React JSX transformation
- Modern target compilation

## Docker Setup (Optional)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

## Security Considerations

### Development Security
- Never commit API keys or secrets
- Use HTTPS in production environments
- Keep dependencies updated
- Enable security headers

### Local Development
```bash
# Update dependencies
npm audit fix

# Check for vulnerabilities
npm audit

# Update to latest versions
npx npm-check-updates -u
npm install
```

## Getting Help

### Resources
- **Documentation**: `/docs` folder
- **Component Library**: Shadcn/ui documentation
- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs

### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Community support
- **Email**: technical-support@cryptotrader.pro

### Debugging Tips
1. Use React DevTools for component debugging
2. Check browser console for errors
3. Use Network tab to debug API calls
4. Enable Supabase debug mode for database queries
5. Use `console.log` strategically (remove before committing)

---

**Ready to start developing!** 🚀

Once your environment is set up, check out the [Testing Guide](./12_Testing_Strategy.md) and [How To Guides](./15_How_To_Guides.md) for next steps.