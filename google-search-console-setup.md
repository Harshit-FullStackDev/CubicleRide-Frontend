# Google Search Console Setup Guide for CubicleRide
# Step-by-step guide to submit CubicleRide to Google Search Console
# By Harshit Soni - Founder, CubicleRide

## 🔍 Google Search Console Setup for CubicleRide

### Step 1: Add CubicleRide Property
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click "Add Property"
3. Select "URL prefix" and enter: `https://cubicleride.me`
4. Click "Continue"

### Step 2: Verify Ownership
Choose one of these verification methods:

#### Option A: HTML File Upload (Recommended)
1. Download the HTML verification file from Google
2. Upload it to your CubicleRide build folder
3. Redeploy to Azure Static Web Apps
4. Verify the file is accessible at: `https://cubicleride.me/[verification-file].html`

#### Option B: HTML Meta Tag
1. Add this meta tag to your index.html (already in build):
```html
<meta name="google-site-verification" content="[YOUR-VERIFICATION-CODE]" />
```

#### Option C: DNS Verification
1. Add TXT record to cubicleride.me domain DNS
2. Use the verification code provided by Google

### Step 3: Submit Sitemap
1. After verification, go to "Sitemaps" in the left menu
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Verify it shows as "Success"

### Step 4: Monitor Indexing
1. Go to "URL Inspection" tool
2. Test key URLs:
   - `https://cubicleride.me/`
   - `https://cubicleride.me/about`
   - `https://cubicleride.me/features`
   - `https://cubicleride.me/contact`

### Step 5: Set Up Alerts
1. Go to "Settings" → "Users and permissions"
2. Add email alerts for:
   - Critical errors
   - Coverage issues
   - Manual actions

## 📊 Key Metrics to Monitor

### Search Performance
- **Target Keywords**: CubicleRide, Harshit Soni
- **Click-through Rate**: Aim for >3%
- **Average Position**: Track ranking improvements
- **Impressions**: Monitor brand visibility

### Coverage Report
- **Valid Pages**: Ensure all pages are indexed
- **Errors**: Fix any crawling issues
- **Warnings**: Address mobile usability issues

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: <2.5s
- **First Input Delay (FID)**: <100ms
- **Cumulative Layout Shift (CLS)**: <0.1

## 🎯 Expected Timeline
- **Week 1**: Site verification and sitemap submission
- **Week 2-4**: Initial indexing of CubicleRide pages
- **Month 2-3**: Search performance data becomes available
- **Month 3-6**: Ranking improvements for "CubicleRide" and "Harshit Soni"

## ✅ Post-Setup Actions
1. Request indexing for all main pages
2. Monitor "Discover" tab for content suggestions
3. Check "Links" report for backlink opportunities
4. Use "Performance" data to optimize content

---
*Setup completed by: Harshit Soni*
*Date: September 5, 2025*
