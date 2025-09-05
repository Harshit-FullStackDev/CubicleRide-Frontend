# CubicleRide SEO Deployment Verification Script
# Verify all SEO optimizations are live on the production site
# Test URLs and SEO elements for CubicleRide and Harshit Soni ranking

Write-Host "🔍 CubicleRide SEO Deployment Verification" -ForegroundColor Green
Write-Host "Checking live deployment for SEO optimizations..." -ForegroundColor Yellow

# Production URLs to verify
$productionDomain = "https://salmon-sand-087aeff00.1.azurestaticapps.net"
$customDomain = "https://cubicleride.me"  # Use this when custom domain is configured

# Use the Azure Static Web App URL for now, switch to custom domain when ready
$baseURL = $productionDomain

$urlsToCheck = @(
    "$baseURL",
    "$baseURL/about",
    "$baseURL/features", 
    "$baseURL/contact",
    "$baseURL/blog",
    "$baseURL/robots.txt",
    "$baseURL/sitemap.xml",
    "$baseURL/manifest.json"
)

Write-Host "`n📋 Testing Core URLs..." -ForegroundColor Cyan

foreach ($url in $urlsToCheck) {
    try {
        Write-Host "Testing: $url" -ForegroundColor White
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Status: $($response.StatusCode) OK" -ForegroundColor Green
            
            # Check for SEO elements in main pages
            if ($url -notmatch "(robots\.txt|sitemap\.xml|manifest\.json)") {
                $content = $response.Content
                
                # Check for CubicleRide mentions
                if ($content -match "CubicleRide") {
                    Write-Host "  ✅ Contains 'CubicleRide' branding" -ForegroundColor Green
                } else {
                    Write-Host "  ❌ Missing 'CubicleRide' branding" -ForegroundColor Red
                }
                
                # Check for Harshit Soni mentions
                if ($content -match "Harshit Soni") {
                    Write-Host "  ✅ Contains 'Harshit Soni' attribution" -ForegroundColor Green
                } else {
                    Write-Host "  ❌ Missing 'Harshit Soni' attribution" -ForegroundColor Red
                }
                
                # Check for meta description
                if ($content -match 'meta name="description"') {
                    Write-Host "  ✅ Has meta description" -ForegroundColor Green
                } else {
                    Write-Host "  ❌ Missing meta description" -ForegroundColor Red
                }
                
                # Check for structured data
                if ($content -match 'application/ld\+json') {
                    Write-Host "  ✅ Has structured data" -ForegroundColor Green
                } else {
                    Write-Host "  ❌ Missing structured data" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  ❌ Status: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "🎯 SEO Meta Tags Verification" -ForegroundColor Cyan
try {
    $mainPage = Invoke-WebRequest -Uri $baseURL -TimeoutSec 10
    $content = $mainPage.Content
    
    Write-Host "Checking main page SEO elements..." -ForegroundColor White
    
    # Title tag check
    if ($content -match '<title[^>]*>([^<]+)</title>') {
        $title = $matches[1]
        Write-Host "📝 Title: $title" -ForegroundColor Yellow
        if ($title -match "CubicleRide" -and $title -match "Harshit Soni") {
            Write-Host "  ✅ Title contains both CubicleRide and Harshit Soni" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Title missing brand or founder name" -ForegroundColor Red
        }
    }
    
    # Meta description check
    if ($content -match 'meta name="description" content="([^"]+)"') {
        $description = $matches[1]
        Write-Host "📄 Description: $($description.Substring(0, [Math]::Min(100, $description.Length)))..." -ForegroundColor Yellow
        if ($description -match "CubicleRide" -and $description -match "Harshit Soni") {
            Write-Host "  ✅ Description contains both CubicleRide and Harshit Soni" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Description missing brand or founder name" -ForegroundColor Red
        }
    }
    
    # Author meta tag check
    if ($content -match 'meta name="author" content="([^"]+)"') {
        $author = $matches[1]
        Write-Host "👤 Author: $author" -ForegroundColor Yellow
        if ($author -match "Harshit Soni") {
            Write-Host "  ✅ Author properly attributed to Harshit Soni" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Author not properly attributed" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Error checking main page: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🌐 Social Media Meta Tags" -ForegroundColor Cyan
try {
    $content = (Invoke-WebRequest -Uri $baseURL -TimeoutSec 10).Content
    
    # Open Graph tags
    $ogTags = @("og:title", "og:description", "og:image", "og:url", "og:type")
    foreach ($tag in $ogTags) {
        if ($content -match "property=`"$tag`"") {
            Write-Host "  ✅ $tag present" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $tag missing" -ForegroundColor Red
        }
    }
    
    # Twitter Card tags
    $twitterTags = @("twitter:card", "twitter:title", "twitter:description", "twitter:image")
    foreach ($tag in $twitterTags) {
        if ($content -match "property=`"$tag`"") {
            Write-Host "  ✅ $tag present" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $tag missing" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Error checking social media tags: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🤖 Technical SEO Checks" -ForegroundColor Cyan

# Robots.txt verification
try {
    $robots = Invoke-WebRequest -Uri "$baseURL/robots.txt" -TimeoutSec 10 -UseBasicParsing
    if ($robots.Content -match "User-agent" -and $robots.Content -match "Sitemap") {
        Write-Host "✅ robots.txt properly configured" -ForegroundColor Green
    } else {
        Write-Host "❌ robots.txt incomplete" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ robots.txt not accessible" -ForegroundColor Red
}

# Sitemap.xml verification
try {
    $sitemap = Invoke-WebRequest -Uri "$baseURL/sitemap.xml" -TimeoutSec 10 -UseBasicParsing
    if ($sitemap.Content -match "<urlset" -and $sitemap.Content -match "<url>") {
        Write-Host "✅ sitemap.xml properly formatted" -ForegroundColor Green
    } else {
        Write-Host "❌ sitemap.xml malformed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ sitemap.xml not accessible" -ForegroundColor Red
}

Write-Host "`n🎉 Verification Complete!" -ForegroundColor Green
Write-Host "------------------------------------" -ForegroundColor Yellow
Write-Host "Next Steps for SEO Success:" -ForegroundColor White
Write-Host "1. 📊 Submit sitemap to Google Search Console" -ForegroundColor Cyan
Write-Host "2. 🏢 Create Google Business Profile" -ForegroundColor Cyan
Write-Host "3. 🔗 Start backlink building campaign" -ForegroundColor Cyan
Write-Host "4. 📱 Set up social media profiles" -ForegroundColor Cyan
Write-Host "5. ✍️ Begin content marketing strategy" -ForegroundColor Cyan
Write-Host "6. 📈 Monitor rankings for 'CubicleRide' and 'Harshit Soni'" -ForegroundColor Cyan

Write-Host "`n🎯 Target Rankings:" -ForegroundColor Yellow
Write-Host "• CubicleRide: #1 position (Brand search)" -ForegroundColor White
Write-Host "• Harshit Soni: Top 5 position (Founder search)" -ForegroundColor White
Write-Host "• Employee transportation: Top 10 position" -ForegroundColor White

Write-Host "`n📊 Current URLs to Track:" -ForegroundColor Yellow
Write-Host "• Production: $baseURL" -ForegroundColor White
Write-Host "• Custom Domain: https://cubicleride.me (when configured)" -ForegroundColor White
