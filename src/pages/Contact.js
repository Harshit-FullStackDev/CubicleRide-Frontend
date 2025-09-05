import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MainHeader from '../components/MainHeader';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function Contact() {
  useEffect(() => {
    document.title = 'Contact CubicleRide - Get in Touch with Harshit Soni | Founder & CEO';
  }, []);

  return (
    <>
      <Helmet>
        <title>Contact CubicleRide - Get in Touch with Harshit Soni | Founder & CEO</title>
        <meta 
          name="description" 
          content="Contact Harshit Soni, founder of CubicleRide. Get in touch for partnership opportunities, support, or learn more about our employee carpooling platform." 
        />
        <meta 
          name="keywords" 
          content="contact CubicleRide, Harshit Soni contact, CubicleRide support, employee carpooling contact, founder contact, partnership" 
        />
        <link rel="canonical" href="https://www.cubicleride.me/contact" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Contact CubicleRide - Get in Touch with Harshit Soni | Founder & CEO" />
        <meta property="og:description" content="Contact Harshit Soni, founder of CubicleRide. Get in touch for partnership opportunities, support, or learn more about our employee carpooling platform." />
        <meta property="og:url" content="https://www.cubicleride.me/contact" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact CubicleRide",
            "description": "Get in touch with Harshit Soni and the CubicleRide team for support, partnerships, and inquiries.",
            "url": "https://www.cubicleride.me/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "CubicleRide",
              "founder": {
                "@type": "Person",
                "name": "Harshit Soni"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "harshiitsonii@gmail.com"
              }
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
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
                Contact <span className="text-orange-600">CubicleRide</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Get in touch with <strong>Harshit Soni</strong> and the CubicleRide team. 
                We're here to help with partnerships, support, and any questions about our 
                employee carpooling platform.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                      placeholder="your.email@company.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition"
                    >
                      <option value="">Select a subject</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="demo">Request Demo</option>
                      <option value="general">General Question</option>
                      <option value="founder">Speak with Harshit Soni</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition resize-none"
                      placeholder="Tell us about your needs or questions regarding CubicleRide..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 outline-none"
                  >
                    Send Message to CubicleRide Team
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Get in touch directly</h2>
                <div className="space-y-6">
                  
                  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email Harshit Soni</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          Reach out directly to CubicleRide's founder for partnerships and strategic discussions.
                        </p>
                        <a 
                          href="mailto:harshit@cubicleride.me" 
                          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          harshit@cubicleride.me
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">General Support</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          For technical support, account questions, and general inquiries about CubicleRide.
                        </p>
                        <a 
                          href="mailto:support@cubicleride.me" 
                          className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                        >
                          support@cubicleride.me
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Response Time</h3>
                        <p className="text-gray-600 text-sm">
                          Harshit Soni and the CubicleRide team typically respond within 24 hours. 
                          For urgent matters, please indicate priority in your subject line.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Based in India</h3>
                        <p className="text-gray-600 text-sm">
                          CubicleRide by Harshit Soni is headquartered in India, 
                          serving organizations globally with our employee carpooling platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Common questions about CubicleRide and getting in touch with our team.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold mb-2">How can I speak directly with Harshit Soni?</h3>
                <p className="text-gray-600 text-sm">
                  You can reach Harshit Soni directly at harshit@cubicleride.me for partnership discussions, 
                  strategic inquiries, or to learn more about CubicleRide's vision and roadmap.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold mb-2">What's the best way to request a CubicleRide demo?</h3>
                <p className="text-gray-600 text-sm">
                  Use our contact form above and select "Request Demo" as the subject. 
                  Include your organization size and specific needs so we can tailor the demo accordingly.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold mb-2">Does CubicleRide offer implementation support?</h3>
                <p className="text-gray-600 text-sm">
                  Yes! Harshit Soni and the CubicleRide team provide comprehensive implementation support, 
                  training, and ongoing assistance to ensure successful deployment in your organization.
                </p>
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
