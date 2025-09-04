# Azure Deployment Guide for CubicleRide Frontend

## Overview
This guide will help you deploy your React frontend to Azure using Azure Static Web Apps.

## Prerequisites
- Azure account with an active subscription
- GitHub account (for automatic deployments)
- Azure CLI installed (optional but recommended)

## Deployment Options

### Option 1: Azure Static Web Apps (Recommended)

#### Step 1: Create Azure Static Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web Apps" and select it
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `cubicleride-frontend` (or your preferred name)
   - **Plan type**: Free (for development) or Standard (for production)
   - **Hosting plan**: Free
   - **Azure Functions and staging details**: Leave default
   - **Deployment details**:
     - **Source**: GitHub
     - **GitHub account**: Your GitHub account
     - **Organization**: Your GitHub username
     - **Repository**: CubicleRide-Frontend
     - **Branch**: main

#### Step 2: Configure Build Settings
During creation, Azure will detect your React app and configure:
- **App location**: `/` (root of repository)
- **API location**: `` (leave empty)
- **Output location**: `build`

#### Step 3: Update Backend URL
1. In Azure Portal, go to your Static Web App
2. Go to "Configuration" in the left menu
3. Add an application setting:
   - **Name**: `REACT_APP_BASE_URL`
   - **Value**: `https://your-backend-app-name.azurewebsites.net`
4. Click "Save"

#### Step 4: Deploy
The GitHub Actions workflow will automatically trigger when you push to the main branch.

### Option 2: Manual Deployment

#### Step 1: Build the Application
```bash
npm install
npm run build
```

#### Step 2: Deploy using Azure CLI
```bash
# Install Azure CLI if not already installed
# Then login
az login

# Create resource group
az group create --name cubicleride-rg --location "East US"

# Create static web app
az staticwebapp create \
  --name cubicleride-frontend \
  --resource-group cubicleride-rg \
  --source https://github.com/YOUR_USERNAME/CubicleRide-Frontend \
  --location "East US2" \
  --branch main \
  --app-location "/" \
  --output-location "build"
```

## Configuration Files Created

### 1. `.env.production`
Contains the production backend URL.

### 2. `staticwebapp.config.json`
Configuration for Azure Static Web Apps:
- Handles routing for React Router
- Sets up fallback routes
- Configures MIME types

### 3. `.github/workflows/azure-static-web-apps.yml`
GitHub Actions workflow for automatic deployment on push to main branch.

## Post-Deployment Steps

### 1. Update Backend URL
Replace `your-backend-app-name` in the following files with your actual Azure backend URL:
- `.env.production`
- `.env`

### 2. Configure Custom Domain (Optional)
1. In Azure Portal, go to your Static Web App
2. Go to "Custom domains" in the left menu
3. Click "Add" and follow the instructions

### 3. Enable HTTPS (Automatic)
Azure Static Web Apps automatically provides HTTPS.

### 4. Monitor Deployment
1. Check the "GitHub Actions" tab in your repository for deployment status
2. Check "Overview" in Azure Portal for the live URL

## Environment Variables
Make sure to update these in your Azure Static Web App configuration:
- `REACT_APP_BASE_URL`: Your backend API URL

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check the build logs in GitHub Actions
2. **API Calls Fail**: Verify the `REACT_APP_BASE_URL` is correct
3. **Routing Issues**: Ensure `staticwebapp.config.json` is properly configured
4. **CORS Issues**: Configure CORS in your backend to allow your frontend domain

### Useful Commands:
```bash
# Test build locally
npm run build

# Serve build locally for testing
npx serve -s build

# Check for linting errors
npm run test
```

## Next Steps
1. Update the backend URL in `.env.production` with your actual Azure backend URL
2. Commit and push the changes to trigger deployment
3. Monitor the deployment in GitHub Actions
4. Test your application at the provided Azure URL

## Security Considerations
- Enable authentication if needed
- Configure CORS properly in your backend
- Use environment variables for sensitive configuration
- Consider enabling Azure Front Door for additional security and performance

## Cost Optimization
- Use the Free tier for development/testing
- Monitor usage in Azure Portal
- Consider using Azure CDN for better performance globally
