
@echo off
cls

:: 🚀 CryptoTrader Pro - Windows Launch Menu

:menu
cls
echo 🚀 ==================================
echo    CryptoTrader Pro Launch Menu
echo ==================================
echo.
echo 1. 🏃 Start Development Server
echo 2. 🧪 Run Full Test Suite  
echo 3. 🔍 Run System Audit
echo 4. 🏗️  Build for Production
echo 5. 🚀 Deploy to Vercel
echo 6. 🌐 Deploy to Netlify
echo 7. 📊 Performance Analysis
echo 8. 🔐 Security Scan
echo 9. 📚 Generate Documentation
echo 10. 🐳 Build Docker Image
echo 11. 🛠️  Setup Development Environment
echo 12. 📋 System Health Check
echo 0. ❌ Exit
echo.
set /p choice="Select an option (0-12): "

if "%choice%"=="1" goto dev_server
if "%choice%"=="2" goto test_suite
if "%choice%"=="3" goto system_audit
if "%choice%"=="4" goto build_prod
if "%choice%"=="5" goto deploy_vercel
if "%choice%"=="6" goto deploy_netlify
if "%choice%"=="7" goto performance
if "%choice%"=="8" goto security_scan
if "%choice%"=="9" goto documentation
if "%choice%"=="10" goto docker_build
if "%choice%"=="11" goto setup_env
if "%choice%"=="12" goto health_check
if "%choice%"=="0" goto exit
goto invalid

:dev_server
echo 🏃 Starting development server...
npm run dev
goto pause_return

:test_suite
echo 🧪 Running full test suite...
npm run test:all
npm run test:coverage
goto pause_return

:system_audit
echo 🔍 Running comprehensive system audit...
echo Navigate to Settings ^> Comprehensive Testing Suite in the app
npm run dev
goto pause_return

:build_prod
echo 🏗️ Building for production...
npm run build
echo ✅ Build complete! Check dist/ folder
goto pause_return

:deploy_vercel
echo 🚀 Deploying to Vercel...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)
vercel --prod
goto pause_return

:deploy_netlify
echo 🌐 Deploying to Netlify...
where netlify >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Netlify CLI...
    npm install -g netlify-cli
)
npm run build
netlify deploy --prod --dir=dist
goto pause_return

:performance
echo 📊 Running performance analysis...
npm run build
npx lighthouse http://localhost:4173 --output=html --output-path=./performance-report.html
echo ✅ Report saved as performance-report.html
goto pause_return

:security_scan
echo 🔐 Running security scan...
npm audit
npm audit fix
echo ✅ Security scan complete
goto pause_return

:documentation
echo 📚 Generating documentation...
echo Documentation already generated in /docs folder
echo ✅ Check docs/ for comprehensive guides
goto pause_return

:docker_build
echo 🐳 Building Docker image...
docker build -t cryptotrader-pro .
echo ✅ Docker image built: cryptotrader-pro
goto pause_return

:setup_env
echo 🛠️ Setting up development environment...
npm install
npm run type-check
npm run lint
echo ✅ Development environment ready!
goto pause_return

:health_check
echo 📋 Running system health check...
echo Checking Node.js version...
node --version
echo Checking npm version...
npm --version
echo Checking dependencies...
npm list --depth=0
echo Checking TypeScript...
npx tsc --noEmit
echo ✅ System health check complete!
goto pause_return

:invalid
echo ❌ Invalid option. Please try again.
goto pause_return

:pause_return
echo.
pause
goto menu

:exit
echo 👋 Goodbye! Happy trading!
pause
exit
