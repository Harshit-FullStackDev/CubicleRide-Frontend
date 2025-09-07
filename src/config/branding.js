// CubicleRide Branding Configuration
export const BRANDING_CONFIG = {
  appName: 'CubicleRide',
  brandName: 'CubicleRide',
  companyName: 'CubicleRide',
  founderName: 'Harshit Soni',
  tagline: 'Smart Employee Carpooling Platform',
  description: 'Safe, secure, and convenient carpooling solution for modern workplaces',
  
  // Email Template Configuration
  emailTemplates: {
    verification: {
      subject: 'CubicleRide Email Verification',
      title: 'Verify Your CubicleRide Account',
      headerText: 'Welcome to CubicleRide',
      footerText: 'CubicleRide - Smart Employee Carpooling Platform'
    },
    otp: {
      subject: 'Your CubicleRide Verification Code',
      title: 'CubicleRide Verification',
      headerText: 'CubicleRide Account Verification',
      description: 'Use this code to verify your CubicleRide account'
    }
  },

  // API Configuration
  apiConfig: {
    platform: 'CubicleRide',
    templateConfig: {
      appName: 'CubicleRide',
      brandName: 'CubicleRide',
      companyName: 'CubicleRide',
      platform: 'CubicleRide'
    }
  },

  // UI Colors
  colors: {
    primary: '#ea580c', // orange-600
    secondary: '#0ea5e9', // sky-500
    accent: '#8b5cf6', // violet-500
    success: '#22c55e', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444' // red-500
  },

  // Contact Information
  contact: {
    email: 'harshit@cubicleride.me',
    supportEmail: 'support@cubicleride.me',
    website: 'https://www.cubicleride.me'
  }
};

export default BRANDING_CONFIG;
