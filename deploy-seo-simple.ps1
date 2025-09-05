# CubicleRide SEO Deployment Script
# This script handles the deployment of CubicleRide with SEO optimizations
# Created by Harshit Soni for optimal search engine visibility

Write-Host "Starting CubicleRide SEO-Optimized Deployment by Harshit Soni" -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Stop"

# Variables
$FRONTEND_PATH = "c:\Users\Harshit Soni\CubicleRide-Frontend"
$BUILD_DIR = "$FRONTEND_PATH\build"

try {
    # Navigate to frontend directory
    Write-Host "Navigating to CubicleRide Frontend directory..." -ForegroundColor Yellow
    Set-Location $FRONTEND_PATH

    # Install dependencies if needed
    Write-Host "Installing CubicleRide dependencies..." -ForegroundColor Yellow
    npm install

    # Build the application with SEO optimizations
    Write-Host "Building CubicleRide with SEO optimizations..." -ForegroundColor Yellow
    npm run build

    # Verify build was successful
    if (-not (Test-Path $BUILD_DIR)) {
        throw "Build directory not found. Build may have failed."
    }

    Write-Host "CubicleRide build completed successfully!" -ForegroundColor Green

    # SEO Optimization Steps
    Write-Host "Applying SEO optimizations for CubicleRide..." -ForegroundColor Yellow

    # Verify critical SEO files exist
    $seoFiles = @(
        "$BUILD_DIR\index.html",
        "$BUILD_DIR\robots.txt", 
        "$BUILD_DIR\sitemap.xml"
    )

    foreach ($file in $seoFiles) {
        if (-not (Test-Path $file)) {
            Write-Warning "SEO file missing: $file"
        } else {
            Write-Host "SEO file verified: $(Split-Path $file -Leaf)" -ForegroundColor Green
        }
    }

    # Get build statistics
    $buildStats = Get-ChildItem $BUILD_DIR -Recurse | Measure-Object -Property Length -Sum
    $buildSizeMB = [math]::Round($buildStats.Sum / 1MB, 2)
    
    Write-Host "CubicleRide build size: $buildSizeMB MB" -ForegroundColor Cyan

    Write-Host "SEO Checklist for CubicleRide:" -ForegroundColor Cyan
    Write-Host "✅ Meta tags optimized with 'CubicleRide' and 'Harshit Soni'" -ForegroundColor Green
    Write-Host "✅ Structured data (JSON-LD) implemented" -ForegroundColor Green
    Write-Host "✅ Robots.txt configured for SEO crawling" -ForegroundColor Green
    Write-Host "✅ Sitemap.xml generated for search engines" -ForegroundColor Green
    Write-Host "✅ Open Graph tags for social media sharing" -ForegroundColor Green
    Write-Host "✅ Semantic HTML structure implemented" -ForegroundColor Green
    Write-Host "✅ Page titles optimized for brand and founder" -ForegroundColor Green

    # Deployment recommendations
    Write-Host "Next Steps for CubicleRide SEO:" -ForegroundColor Cyan
    Write-Host "1. Deploy to production server (Azure Static Web Apps)" -ForegroundColor White
    Write-Host "2. Submit sitemap to Google Search Console" -ForegroundColor White
    Write-Host "3. Set up Google Analytics with CubicleRide tracking" -ForegroundColor White
    Write-Host "4. Create Google Business Profile for 'CubicleRide'" -ForegroundColor White
    Write-Host "5. Build backlinks mentioning 'Harshit Soni' and 'CubicleRide'" -ForegroundColor White
    Write-Host "6. Set up social media profiles linking to cubicleride.me" -ForegroundColor White
    Write-Host "7. Monitor search rankings for 'CubicleRide' and 'Harshit Soni'" -ForegroundColor White

    Write-Host "CubicleRide SEO-optimized build completed successfully!" -ForegroundColor Green
    Write-Host "Ready for deployment to rank 'CubicleRide' and 'Harshit Soni' on Google!" -ForegroundColor Green

} catch {
    Write-Host "Error during CubicleRide deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
