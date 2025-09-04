# Azure Static Web App Deployment Script for PowerShell
# Run this script to deploy your React app to Azure

Write-Host "🚀 Starting Azure deployment process..." -ForegroundColor Green

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Check Azure login status
Write-Host "🔑 Checking Azure login status..." -ForegroundColor Yellow
try {
    az account show | Out-Null
    Write-Host "✅ Already logged in to Azure" -ForegroundColor Green
} catch {
    Write-Host "Please log in to Azure:" -ForegroundColor Yellow
    az login
}

# Set variables (update these with your values)
$RESOURCE_GROUP = "cubicleride-rg"
$APP_NAME = "cubicleride-frontend"
$LOCATION = "East US2"
$GITHUB_REPO = "https://github.com/YOUR_USERNAME/CubicleRide-Frontend"

Write-Host "📦 Building the application..." -ForegroundColor Yellow
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "🏗️ Creating Azure resources..." -ForegroundColor Yellow

# Create resource group if it doesn't exist
Write-Host "Creating resource group: $RESOURCE_GROUP" -ForegroundColor Cyan
az group create --name $RESOURCE_GROUP --location $LOCATION --output table

# Create static web app
Write-Host "🌐 Creating Static Web App: $APP_NAME" -ForegroundColor Cyan
az staticwebapp create `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --source $GITHUB_REPO `
  --location $LOCATION `
  --branch main `
  --app-location "/" `
  --output-location "build" `
  --output table

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment initiated successfully!" -ForegroundColor Green
    Write-Host "🔗 Your app will be available at: https://$APP_NAME.azurestaticapps.net" -ForegroundColor Cyan
    Write-Host "📊 Monitor deployment status at: https://portal.azure.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Don't forget to:" -ForegroundColor Yellow
    Write-Host "   1. Update REACT_APP_BASE_URL with your backend URL" -ForegroundColor White
    Write-Host "   2. Configure CORS in your backend" -ForegroundColor White
    Write-Host "   3. Push changes to trigger automatic deployment" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed. Please check the errors above." -ForegroundColor Red
}
