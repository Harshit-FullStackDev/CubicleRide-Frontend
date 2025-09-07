import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MainHeader from '../components/MainHeader';
import { User, Target, Award, MapPin } from 'lucide-react';

export default function About() {
  useEffect(() => {
    document.title = 'About CubicleRide - Founded by Harshit Soni | Smart Employee Carpooling Platform';
  }, []);

  return (
    <>
      <Helmet>
        <title>About CubicleRide - Founded by Harshit Soni | Smart Employee Carpooling Platform</title>
        <meta 
          name="description" 
          content="Learn about CubicleRide, the smart employee carpooling platform founded by Harshit Soni. Transforming workplace transportation with secure, efficient ride-sharing solutions." 
        />
        <meta 
          name="keywords" 
          content="CubicleRide, Harshit Soni, about founder, employee carpooling, workplace transportation, ride sharing platform, sustainable commute" 
        />
        <link rel="canonical" href="https://www.cubicleride.me/about" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About CubicleRide - Founded by Harshit Soni | Smart Employee Carpooling Platform" />
        <meta property="og:description" content="Learn about CubicleRide, the smart employee carpooling platform founded by Harshit Soni. Transforming workplace transportation with secure, efficient ride-sharing solutions." />
        <meta property="og:url" content="https://www.cubicleride.me/about" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About CubicleRide",
            "description": "Learn about CubicleRide, founded by Harshit Soni to revolutionize employee transportation through smart carpooling solutions.",
            "url": "https://www.cubicleride.me/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "CubicleRide",
              "founder": {
                "@type": "Person",
                "name": "Harshit Soni",
                "description": "Founder and CEO of CubicleRide, passionate about sustainable workplace transportation solutions."
              },
              "foundingDate": "2024",
              "description": "Smart employee carpooling platform transforming workplace transportation"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
        <MainHeader />
        
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 lg:py-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-4 md:mb-6">
                About <span className="text-orange-600">CubicleRide</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
                Founded by <strong>Harshit Soni</strong>, CubicleRide is revolutionizing workplace transportation 
                through intelligent employee carpooling solutions that prioritize security, efficiency, and sustainability.
              </p>
            </div>
          </div>
        </section>

        {/* Founder Story */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm mb-6">
                  <User className="h-4 w-4" />
                  Founder Story
                </div>
                <h2 className="text-3xl font-semibold tracking-tight mb-6">Meet Harshit Soni</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Harshit Soni</strong>, the visionary founder of CubicleRide, recognized the growing challenges 
                    of workplace transportation in modern corporate environments. With a background in technology 
                    and a passion for sustainable solutions, Harshit identified the need for a secure, 
                    efficient carpooling platform specifically designed for enterprise environments.
                  </p>
                  <p>
                    "I saw employees struggling with expensive commutes, traffic congestion, and environmental concerns," 
                    says <strong>Harshit Soni</strong>. "CubicleRide was born from the belief that technology could 
                    solve these problems while building stronger workplace communities."
                  </p>
                  <p>
                    Under Harshit Soni's leadership, CubicleRide has grown from a simple idea to a comprehensive 
                    platform that serves organizations looking to provide their employees with smart, 
                    sustainable transportation options.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">Vision</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    To transform workplace transportation by making employee carpooling 
                    secure, efficient, and accessible for organizations worldwide.
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">Mission</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Harshit Soni founded CubicleRide to reduce commute costs, decrease traffic congestion, 
                    and promote environmental sustainability through intelligent ride-sharing technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                CubicleRide Values by Harshit Soni
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The core principles that guide CubicleRide's development and drive our commitment 
                to revolutionizing workplace transportation.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-orange-50 grid place-items-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Security First</h3>
                <p className="text-gray-600 text-sm">
                  Harshit Soni built CubicleRide with enterprise-grade security, 
                  ensuring organization-only access and complete ride transparency.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-orange-50 grid place-items-center mx-auto mb-4">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Employee-Centric</h3>
                <p className="text-gray-600 text-sm">
                  Every feature in CubicleRide is designed with employee experience in mind, 
                  making carpooling simple and stress-free.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-orange-50 grid place-items-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-600 text-sm">
                  CubicleRide promotes environmental responsibility by reducing the number 
                  of vehicles on the road and lowering carbon emissions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-3xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to Transform Your Workplace Transportation?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Join the CubicleRide revolution started by Harshit Soni. 
                Help your organization reduce costs, improve sustainability, and build stronger teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="/" 
                  className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 bg-white text-orange-700 hover:bg-orange-50 transition"
                >
                  Get Started
                </a>
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center rounded-full text-sm font-medium px-6 py-3 border border-white/50 text-white hover:bg-white/10 transition"
                >
                  Contact Us
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
