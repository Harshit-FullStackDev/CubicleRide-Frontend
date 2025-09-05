import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MainHeader from '../components/MainHeader';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  Car, 
  Bell, 
  Calendar, 
  Star, 
  Lock,
  Route,
  BarChart3
} from 'lucide-react';

const features = [
  {
    icon: <Car className="h-6 w-6" />,
    title: 'Smart Ride Matching',
    description: 'CubicleRide by Harshit Soni uses intelligent algorithms to match employees with compatible routes, schedules, and preferences for optimal carpooling experiences.',
    details: ['Route compatibility analysis', 'Schedule synchronization', 'Preference matching', 'Real-time availability']
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Enterprise Security',
    description: 'Built with enterprise-grade security by Harshit Soni, featuring organization-only access, role-based permissions, and complete audit trails.',
    details: ['JWT authentication', 'Role-based access control', 'Audit logging', 'Data encryption']
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Employee Profiles',
    description: 'Comprehensive employee profiles in CubicleRide build trust and transparency, showing ride history, ratings, and verification status.',
    details: ['Verified employee profiles', 'Ride history tracking', 'Rating system', 'Trust indicators']
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'Route Intelligence',
    description: 'Harshit Soni designed smart route management with reusable pickup/drop catalogs, making ride selection fast and consistent.',
    details: ['Pickup/drop catalogs', 'Route optimization', 'Location suggestions', 'GPS integration']
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Smart Notifications',
    description: 'CubicleRide keeps everyone informed with intelligent notifications for ride updates, requests, and important changes.',
    details: ['Real-time updates', 'Ride confirmations', 'Schedule changes', 'Custom alerts']
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: 'Flexible Scheduling',
    description: 'Support for one-time rides and recurring schedules, accommodating various commute patterns and organizational needs.',
    details: ['One-time bookings', 'Recurring schedules', 'Schedule templates', 'Holiday management']
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Rating & Reviews',
    description: 'Built-in rating system helps maintain quality and trust within the CubicleRide community, ensuring positive experiences.',
    details: ['Post-ride ratings', 'Review system', 'Quality assurance', 'Community feedback']
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: 'Admin Controls',
    description: 'Comprehensive admin panel designed by Harshit Soni gives organizations full control over CubicleRide usage and policies.',
    details: ['User management', 'Policy enforcement', 'Usage analytics', 'Approval workflows']
  },
  {
    icon: <Route className="h-6 w-6" />,
    title: 'Route Analytics',
    description: 'CubicleRide provides detailed analytics on popular routes, usage patterns, and optimization opportunities for organizations.',
    details: ['Route popularity', 'Usage statistics', 'Cost savings tracking', 'Environmental impact']
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Impact Reporting',
    description: 'Track the positive impact of CubicleRide with detailed reports on cost savings, carbon reduction, and employee satisfaction.',
    details: ['Cost savings reports', 'Carbon footprint reduction', 'Usage metrics', 'ROI analysis']
  }
];

export default function Features() {
  useEffect(() => {
    document.title = 'CubicleRide Features - Smart Employee Carpooling by Harshit Soni';
  }, []);

  return (
    <>
      <Helmet>
        <title>CubicleRide Features - Smart Employee Carpooling by Harshit Soni</title>
        <meta 
          name="description" 
          content="Explore CubicleRide features designed by Harshit Soni: smart ride matching, enterprise security, route intelligence, and more for efficient employee carpooling." 
        />
        <meta 
          name="keywords" 
          content="CubicleRide features, Harshit Soni, employee carpooling features, ride sharing platform, smart matching, enterprise security, route intelligence" 
        />
        <link rel="canonical" href="https://www.cubicleride.me/features" />
        
        {/* Open Graph */}
        <meta property="og:title" content="CubicleRide Features - Smart Employee Carpooling by Harshit Soni" />
        <meta property="og:description" content="Explore CubicleRide features designed by Harshit Soni: smart ride matching, enterprise security, route intelligence, and more for efficient employee carpooling." />
        <meta property="og:url" content="https://www.cubicleride.me/features" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "CubicleRide Features",
            "description": "Comprehensive features of CubicleRide employee carpooling platform designed by Harshit Soni",
            "url": "https://www.cubicleride.me/features",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "CubicleRide",
              "creator": {
                "@type": "Person",
                "name": "Harshit Soni"
              },
              "featureList": [
                "Smart Ride Matching",
                "Enterprise Security",
                "Route Intelligence",
                "Employee Profiles",
                "Smart Notifications",
                "Admin Controls"
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <MainHeader />
        
        {/* Hero Section */}
        <section className="relative py-20 md:py-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
                <span className="text-orange-600">CubicleRide</span> Features
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Discover the comprehensive features designed by <strong>Harshit Soni</strong> to make 
                employee carpooling secure, efficient, and user-friendly for modern organizations.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center text-orange-600">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Why Choose CubicleRide by Harshit Soni?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                CubicleRide stands out with its focus on security, usability, and real business impact 
                for organizations looking to optimize employee transportation.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-orange-50 grid place-items-center mx-auto mb-6">
                  <ShieldCheck className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Enterprise-Grade Security</h3>
                <p className="text-gray-600">
                  Built by Harshit Soni with security-first mindset. CubicleRide ensures your 
                  organization's data and employee privacy are always protected.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-orange-50 grid place-items-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Employee-Centric Design</h3>
                <p className="text-gray-600">
                  Every feature in CubicleRide is designed with employee experience in mind, 
                  ensuring high adoption rates and user satisfaction.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-orange-50 grid place-items-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Measurable Impact</h3>
                <p className="text-gray-600">
                  CubicleRide provides clear metrics on cost savings, environmental impact, 
                  and employee satisfaction to demonstrate ROI.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight mb-6">
                  Built with Modern Technology
                </h2>
                <p className="text-gray-600 mb-8">
                  Harshit Soni built CubicleRide using cutting-edge technology stack to ensure 
                  scalability, reliability, and seamless user experience across all devices.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm">React.js frontend for responsive user experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Spring Boot microservices architecture</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm">JWT-based authentication and authorization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Real-time notifications and updates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Cloud-native deployment with high availability</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Platform Capabilities</h3>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">&lt; 200ms</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">10,000+</div>
                    <div className="text-sm text-gray-600">Users Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-3xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to Experience CubicleRide Features?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                See how Harshit Soni's vision for smart employee carpooling can transform 
                your organization's transportation needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="/" 
                  className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-white text-orange-700 hover:bg-orange-50 transition"
                >
                  Try CubicleRide
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border border-white/50 text-white hover:bg-white/10 transition"
                >
                  Contact Harshit Soni
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 text-gray-500 text-sm">
              <img src="/OMLogo.svg" alt="CubicleRide by Harshit Soni" className="h-8" />
              <span>© {new Date().getFullYear()} CubicleRide • Founded by Harshit Soni</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
