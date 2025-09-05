# CubicleRide Production Deployment Script with SEO Setup
# Deploy to Azure Static Web Apps with custom domain cubicleride.me
# By Harshit Soni - Founder, CubicleRide

Write-Host "🚀 Deploying CubicleRide to Production (cubicleride.me)" -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Stop"

# Variables
$FRONTEND_PATH = "c:\Users\Harshit Soni\CubicleRide-Frontend"
$BUILD_DIR = "$FRONTEND_PATH\build"
$AZURE_SUBSCRIPTION = "Your-Azure-Subscription-ID"
$RESOURCE_GROUP = "CubicleRide-RG"
$STATIC_WEB_APP_NAME = "cubicleride-frontend"

try {
    Write-Host "📁 Navigating to CubicleRide directory..." -ForegroundColor Yellow
    Set-Location $FRONTEND_PATH

    # Build for production with environment variables
    Write-Host "🔨 Building CubicleRide for production..." -ForegroundColor Yellow
    $env:REACT_APP_API_URL = "https://cubicleride-backend.azurewebsites.net"
    $env:REACT_APP_ENVIRONMENT = "production"
    $env:GENERATE_SOURCEMAP = "false"
    
    npm run build

    # Verify critical files exist
    $criticalFiles = @(
        "$BUILD_DIR\index.html",
        "$BUILD_DIR\robots.txt",
        "$BUILD_DIR\sitemap.xml",
        "$BUILD_DIR\manifest.json"
    )

    foreach ($file in $criticalFiles) {
        if (-not (Test-Path $file)) {
            throw "Critical file missing: $file"
        }
    }

    Write-Host "✅ Production build completed successfully!" -ForegroundColor Green

    # Deploy to Azure Static Web Apps
    Write-Host "☁️ Deploying to Azure Static Web Apps..." -ForegroundColor Yellow
    
    # Check if Azure CLI is installed
    $azureCliInstalled = Get-Command az -ErrorAction SilentlyContinue
    if (-not $azureCliInstalled) {
        Write-Warning "Azure CLI not found. Please install Azure CLI and run 'az login' first."
        Write-Host "Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Cyan
    } else {
        Write-Host "Azure CLI found. Proceeding with deployment..." -ForegroundColor Green
        
        # Deploy using Azure CLI
        Write-Host "Deploying CubicleRide build to Azure..." -ForegroundColor Yellow
        
        # Note: Replace with your actual Azure Static Web App deployment token
        Write-Host "Please run the following command manually with your deployment token:" -ForegroundColor Yellow
        Write-Host "az staticwebapp deploy --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP --source $BUILD_DIR" -ForegroundColor Cyan
    }

    # Post-deployment SEO checklist
    Write-Host "Post-Deployment SEO Checklist for CubicleRide:" -ForegroundColor Cyan
    Write-Host "1. Verify https://cubicleride.me loads correctly" -ForegroundColor White
    Write-Host "2. Check https://cubicleride.me/robots.txt is accessible" -ForegroundColor White
    Write-Host "3. Verify https://cubicleride.me/sitemap.xml loads" -ForegroundColor White
    Write-Host "4. Test all pages (/, /about, /features, /contact, /blog)" -ForegroundColor White
    Write-Host "5. Confirm meta tags show CubicleRide and Harshit Soni" -ForegroundColor White

    Write-Host "CubicleRide deployment script completed!" -ForegroundColor Green
    Write-Host "Next: Configure custom domain cubicleride.me in Azure Portal" -ForegroundColor Yellow

} catch {
    Write-Host "Deployment error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clean up environment variables
    Remove-Item env:REACT_APP_API_URL -ErrorAction SilentlyContinue
    Remove-Item env:REACT_APP_ENVIRONMENT -ErrorAction SilentlyContinue
    Remove-Item env:GENERATE_SOURCEMAP -ErrorAction SilentlyContinue
}
