# Deployment Guide

## Overview
This guide covers the complete deployment process for CryptoTrader Pro, including build preparation, environment configuration, and deployment to various platforms.

## Pre-Deployment Checklist

### Code Quality Verification
```bash
# Run complete test suite
npm run test:all

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Security audit
npm audit --audit-level high

# Bundle analysis
npm run build
npx vite-bundle-analyzer dist
```

### Performance Optimization
```bash
# Optimize images
npm run optimize:images

# Check bundle size
npm run analyze

# Lighthouse CI audit
npx lhci autorun
```

### Environment Verification
- [ ] All required environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints tested
- [ ] CDN assets optimized
- [ ] SSL certificates valid

## Build Process

### Production Build
```bash
# Clean previous builds
rm -rf dist

# Install dependencies (production only)
npm ci --only=production

# Run production build
npm run build

# Verify build output
ls -la dist/

# Test production build locally
npm run preview
```

### Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          utils: ['date-fns', 'lodash']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    __DEV__: JSON.stringify(false)
  }
});
```

## Deployment Platforms

### 1. Lovable Hosting (Primary - Recommended)

#### Automatic Deployment
```bash
# Deploy via Lovable interface
1. Click "Publish" button in Lovable editor
2. Wait for automatic build and deployment
3. Access via provided URL: https://crypto-dream-trade-sim.lovable.app
```

#### Custom Domain Setup
1. Navigate to Project Settings → Domains
2. Add custom domain (requires paid plan)
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www
   Value: crypto-dream-trade-sim.lovable.app
   ```

#### Environment Variables
No additional environment variables needed - Supabase connection is pre-configured.

### 2. Vercel Deployment

#### Setup & Configuration
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Custom domain configuration
vercel domains add yourdomain.com
```

#### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 3. Netlify Deployment

#### Build Settings
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
    
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "max-age=31536000, immutable"
```

#### Deployment Commands
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=dist

# Configure custom domain
netlify sites:update --name=your-site-name
```

### 4. Traditional Web Hosting

#### Static Hosting Setup
```bash
# Build for production
npm run build

# Upload dist/ folder contents to web server
# Configure web server for SPA routing
```

#### Apache Configuration
```apache
# .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options DENY
  Header always set X-Content-Type-Options nosniff
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "origin-when-cross-origin"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### Nginx Configuration
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/html;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "origin-when-cross-origin";
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
}
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-vercel:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-netlify:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Deploy Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment process..."

# Pre-deployment checks
echo "📋 Running pre-deployment checks..."
npm run test:ci
npm run type-check
npm run lint
npm audit --audit-level high

# Build application
echo "🔨 Building application..."
npm run build

# Run post-build verification
echo "🔍 Verifying build..."
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not found"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed - index.html not found"
  exit 1
fi

# Check bundle size
echo "📊 Analyzing bundle size..."
BUNDLE_SIZE=$(du -sh dist | cut -f1)
echo "Bundle size: $BUNDLE_SIZE"

# Deploy based on target
case $1 in
  "vercel")
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    ;;
  "netlify")
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    ;;
  "github")
    echo "🌐 Deploying to GitHub Pages..."
    npm run deploy:github
    ;;
  *)
    echo "❓ Usage: ./deploy.sh [vercel|netlify|github]"
    exit 1
    ;;
esac

echo "✅ Deployment completed successfully!"
```

## Environment Configuration

### Production Environment Variables
```bash
# Production .env (if needed)
NODE_ENV=production
VITE_APP_VERSION=$npm_package_version
VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Supabase (pre-configured)
VITE_SUPABASE_URL=https://xtjowrewuuhmnvmuilcz.supabase.co
VITE_SUPABASE_ANON_KEY=[pre-configured]
```

### Build-time Variables
```typescript
// src/config/build.ts
export const buildInfo = {
  version: __APP_VERSION__,
  buildTime: __BUILD_TIME__,
  environment: __NODE_ENV__,
  commitHash: __COMMIT_HASH__
};
```

## Security Configuration

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://xtjowrewuuhmnvmuilcz.supabase.co;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://xtjowrewuuhmnvmuilcz.supabase.co wss://xtjowrewuuhmnvmuilcz.supabase.co;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
">
```

### Security Headers
```typescript
// Security headers configuration
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-XSS-Protection': '1; mode=block'
};
```

## Monitoring & Health Checks

### Health Check Endpoint
```typescript
// src/api/health.ts
export async function healthCheck() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    version: buildInfo.version,
    checks: {
      database: await checkDatabase(),
      storage: await checkStorage(),
      api: await checkExternalAPIs()
    }
  };

  return checks;
}

async function checkDatabase() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    return error ? 'unhealthy' : 'healthy';
  } catch {
    return 'unhealthy';
  }
}
```

### Uptime Monitoring
```javascript
// Uptime monitoring with external service
const uptimeConfig = {
  url: 'https://crypto-dream-trade-sim.lovable.app/health',
  interval: 60, // seconds
  timeout: 10,  // seconds
  expectedStatus: 200,
  expectedContent: 'healthy'
};
```

## Rollback Strategy

### Automated Rollback
```bash
#!/bin/bash
# rollback.sh

PREVIOUS_DEPLOYMENT=$1

if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
  echo "❌ Usage: ./rollback.sh <deployment-id>"
  exit 1
fi

echo "🔄 Rolling back to deployment: $PREVIOUS_DEPLOYMENT"

case $PLATFORM in
  "vercel")
    vercel rollback $PREVIOUS_DEPLOYMENT
    ;;
  "netlify")
    netlify api restoreDeploy --data='{"deploy_id":"'$PREVIOUS_DEPLOYMENT'"}'
    ;;
  *)
    echo "❌ Platform not supported for automatic rollback"
    exit 1
    ;;
esac

echo "✅ Rollback completed"
```

### Manual Rollback Steps
1. **Identify Issue**: Monitor errors and user reports
2. **Assess Impact**: Determine severity and affected users
3. **Execute Rollback**: Use platform-specific rollback commands
4. **Verify Rollback**: Test critical functionality
5. **Communicate**: Notify stakeholders of rollback
6. **Investigate**: Analyze root cause of issue

## Performance Optimization

### Asset Optimization
```bash
# Image optimization
npm run optimize:images

# Code splitting verification
npm run analyze:bundle

# Preload critical resources
echo "Preloading critical fonts and scripts..."
```

### CDN Configuration
```typescript
// CDN asset configuration
const cdnConfig = {
  fonts: 'https://fonts.googleapis.com',
  icons: 'https://cdn.jsdelivr.net/npm/lucide@latest',
  images: 'https://images.unsplash.com'
};
```

## Database Deployment

### Migration Strategy
```bash
# Run database migrations
supabase migration up

# Verify migration status
supabase migration list

# Rollback if needed
supabase migration down --count 1
```

### Data Backup
```bash
# Create pre-deployment backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list backup-*.sql
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### Asset Loading Issues
- Verify CDN configuration
- Check CORS settings
- Validate asset paths

#### API Connection Problems
- Test Supabase connection
- Verify environment variables
- Check network connectivity

#### Performance Issues
- Analyze bundle size
- Check for memory leaks
- Optimize images and assets

### Debugging Tools
```bash
# Network analysis
curl -I https://crypto-dream-trade-sim.lovable.app

# Performance testing
npm run lighthouse

# Security scan
npm audit
```

## Post-Deployment Checklist

### Immediate Verification
- [ ] Application loads successfully
- [ ] User authentication works
- [ ] Core features functional
- [ ] Real-time updates working
- [ ] Mobile responsiveness verified

### Extended Testing
- [ ] Performance benchmarks met
- [ ] Security headers configured
- [ ] SSL certificate valid
- [ ] Database connectivity confirmed
- [ ] Error monitoring active

### Monitoring Setup
- [ ] Uptime monitoring configured
- [ ] Error tracking active
- [ ] Performance monitoring enabled
- [ ] User analytics functional
- [ ] Backup systems verified

## Support & Maintenance

### 24/7 Monitoring
- **Uptime**: 99.9% SLA target
- **Response Time**: <2 seconds average
- **Error Rate**: <0.1% target
- **Availability**: Multi-region deployment

### Emergency Contacts
- **Technical Lead**: technical-lead@cryptotrader.pro
- **DevOps Engineer**: devops@cryptotrader.pro
- **Emergency Hotline**: +1-XXX-XXX-XXXX

### Maintenance Windows
- **Scheduled**: Sunday 2:00-4:00 AM UTC
- **Emergency**: As needed with 30-min notice
- **Updates**: Automatic for security patches

---

This deployment guide ensures a smooth, secure, and reliable deployment process for CryptoTrader Pro across multiple platforms.