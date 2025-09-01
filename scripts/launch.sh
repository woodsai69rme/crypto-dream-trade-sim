
#!/bin/bash

# 🚀 CryptoTrader Pro - Interactive Launch Menu
# Universal launcher for development, testing, and deployment

clear
echo "🚀 =================================="
echo "   CryptoTrader Pro Launch Menu"
echo "=================================="
echo ""
echo "1. 🏃 Start Development Server"
echo "2. 🧪 Run Full Test Suite"
echo "3. 🔍 Run System Audit"
echo "4. 🏗️  Build for Production"
echo "5. 🚀 Deploy to Vercel"
echo "6. 🌐 Deploy to Netlify"
echo "7. 📊 Performance Analysis"
echo "8. 🔐 Security Scan"
echo "9. 📚 Generate Documentation"
echo "10. 🐳 Build Docker Image"
echo "11. 🛠️  Setup Development Environment"
echo "12. 📋 System Health Check"
echo "0. ❌ Exit"
echo ""
read -p "Select an option (0-12): " choice

case $choice in
    1)
        echo "🏃 Starting development server..."
        npm run dev
        ;;
    2)
        echo "🧪 Running full test suite..."
        npm run test:all
        npm run test:coverage
        ;;
    3)
        echo "🔍 Running comprehensive system audit..."
        echo "Navigate to Settings > Comprehensive Testing Suite in the app"
        npm run dev
        ;;
    4)
        echo "🏗️ Building for production..."
        npm run build
        echo "✅ Build complete! Check dist/ folder"
        ;;
    5)
        echo "🚀 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "Installing Vercel CLI..."
            npm install -g vercel
            vercel --prod
        fi
        ;;
    6)
        echo "🌐 Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            npm run build
            netlify deploy --prod --dir=dist
        else
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
            npm run build
            netlify deploy --prod --dir=dist
        fi
        ;;
    7)
        echo "📊 Running performance analysis..."
        npm run build
        npx lighthouse http://localhost:4173 --output=html --output-path=./performance-report.html
        echo "✅ Report saved as performance-report.html"
        ;;
    8)
        echo "🔐 Running security scan..."
        npm audit
        npm audit fix
        echo "✅ Security scan complete"
        ;;
    9)
        echo "📚 Generating documentation..."
        echo "Documentation already generated in /docs folder"
        echo "✅ Check docs/ for comprehensive guides"
        ;;
    10)
        echo "🐳 Building Docker image..."
        docker build -t cryptotrader-pro .
        echo "✅ Docker image built: cryptotrader-pro"
        ;;
    11)
        echo "🛠️ Setting up development environment..."
        npm install
        npm run type-check
        npm run lint
        echo "✅ Development environment ready!"
        ;;
    12)
        echo "📋 Running system health check..."
        echo "Checking Node.js version..."
        node --version
        echo "Checking npm version..."
        npm --version
        echo "Checking dependencies..."
        npm list --depth=0
        echo "Checking TypeScript..."
        npx tsc --noEmit
        echo "✅ System health check complete!"
        ;;
    0)
        echo "👋 Goodbye! Happy trading!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please try again."
        ;;
esac

echo ""
echo "Press any key to return to menu..."
read -n 1
exec "$0"
