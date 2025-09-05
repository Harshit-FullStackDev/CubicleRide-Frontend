import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MainHeader from '../components/MainHeader';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'How CubicleRide by Harshit Soni is Revolutionizing Employee Transportation',
    excerpt: 'Discover how Harshit Soni\'s vision for smart employee carpooling is transforming workplace transportation with CubicleRide platform.',
    author: 'Harshit Soni',
    date: '2025-09-01',
    readTime: '5 min read',
    category: 'Founder Insights',
    image: '/blog/founder-story.jpg'
  },
  {
    id: 2,
    title: 'The Technology Behind CubicleRide: A Deep Dive by Founder Harshit Soni',
    excerpt: 'Harshit Soni explains the technical architecture and innovative features that make CubicleRide the smartest employee carpooling platform.',
    author: 'Harshit Soni',
    date: '2025-08-28',
    readTime: '8 min read',
    category: 'Technology',
    image: '/blog/technology-deep-dive.jpg'
  },
  {
    id: 3,
    title: 'Sustainable Workplace Transportation: CubicleRide\'s Environmental Impact',
    excerpt: 'Learn how CubicleRide by Harshit Soni is helping organizations reduce their carbon footprint through intelligent ride sharing.',
    author: 'CubicleRide Team',
    date: '2025-08-25',
    readTime: '6 min read',
    category: 'Sustainability',
    image: '/blog/environmental-impact.jpg'
  },
  {
    id: 4,
    title: 'Enterprise Security in Employee Carpooling: CubicleRide\'s Approach',
    excerpt: 'Harshit Soni discusses how CubicleRide ensures enterprise-grade security while maintaining user-friendly employee carpooling experience.',
    author: 'Harshit Soni',
    date: '2025-08-20',
    readTime: '7 min read',
    category: 'Security',
    image: '/blog/enterprise-security.jpg'
  },
  {
    id: 5,
    title: 'Success Stories: Organizations Thriving with CubicleRide',
    excerpt: 'Real-world case studies showing how companies are saving costs and improving employee satisfaction with CubicleRide platform.',
    author: 'CubicleRide Team',
    date: '2025-08-15',
    readTime: '10 min read',
    category: 'Case Studies',
    image: '/blog/success-stories.jpg'
  },
  {
    id: 6,
    title: 'The Future of Workplace Mobility: Insights from Harshit Soni',
    excerpt: 'CubicleRide founder Harshit Soni shares his vision for the future of employee transportation and workplace mobility solutions.',
    author: 'Harshit Soni',
    date: '2025-08-10',
    readTime: '9 min read',
    category: 'Future Vision',
    image: '/blog/future-mobility.jpg'
  }
];

export default function Blog() {
  useEffect(() => {
    document.title = 'CubicleRide Blog - Insights from Harshit Soni | Employee Carpooling Trends';
  }, []);

  return (
    <>
      <Helmet>
        <title>CubicleRide Blog - Insights from Harshit Soni | Employee Carpooling Trends</title>
        <meta 
          name="description" 
          content="Read the latest insights from Harshit Soni, founder of CubicleRide. Explore trends in employee carpooling, workplace transportation, and sustainable mobility solutions." 
        />
        <meta 
          name="keywords" 
          content="CubicleRide blog, Harshit Soni insights, employee carpooling trends, workplace transportation, sustainable mobility, founder articles" 
        />
        <link rel="canonical" href="https://www.cubicleride.me/blog" />
        
        {/* Open Graph */}
        <meta property="og:title" content="CubicleRide Blog - Insights from Harshit Soni | Employee Carpooling Trends" />
        <meta property="og:description" content="Read the latest insights from Harshit Soni, founder of CubicleRide. Explore trends in employee carpooling, workplace transportation, and sustainable mobility solutions." />
        <meta property="og:url" content="https://www.cubicleride.me/blog" />
        <meta property="og:type" content="blog" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "CubicleRide Blog",
            "description": "Insights and articles from Harshit Soni and the CubicleRide team about employee carpooling and workplace transportation",
            "url": "https://www.cubicleride.me/blog",
            "author": {
              "@type": "Person",
              "name": "Harshit Soni"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CubicleRide",
              "founder": {
                "@type": "Person",
                "name": "Harshit Soni"
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
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-6">
                <span className="text-orange-600">CubicleRide</span> Blog
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Insights from <strong>Harshit Soni</strong> and the CubicleRide team. 
                Stay updated on employee carpooling trends, workplace transportation innovations, 
                and sustainable mobility solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                Featured Article
              </div>
              <h2 className="text-2xl font-semibold mb-4">Latest from Harshit Soni</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden lg:grid lg:grid-cols-2 lg:gap-8">
              <div className="aspect-[16/9] lg:aspect-auto bg-gradient-to-br from-orange-200 to-amber-200"></div>
              <div className="p-8 lg:py-12">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    {blogPosts[0].category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(blogPosts[0].date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {blogPosts[0].readTime}
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 leading-tight">
                  {blogPosts[0].title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 grid place-items-center">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{blogPosts[0].author}</div>
                      <div className="text-xs text-gray-500">Founder, CubicleRide</div>
                    </div>
                  </div>
                  
                  <button className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition">
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                All Articles
              </h2>
              <p className="text-gray-600">
                Explore our collection of articles on employee carpooling, workplace transportation, and insights from Harshit Soni.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <article key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-[16/9] bg-gradient-to-br from-orange-100 to-amber-100"></div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2 leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-orange-100 grid place-items-center">
                          <User className="h-3 w-3 text-orange-600" />
                        </div>
                        <span className="text-xs text-gray-500">{post.author}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-3xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Stay Updated with CubicleRide
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Get the latest insights from Harshit Soni and updates about CubicleRide directly in your inbox. 
                Join our community of workplace transportation innovators.
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-6 py-3 bg-white text-orange-700 hover:bg-orange-50 rounded-lg font-medium transition">
                    Subscribe
                  </button>
                </div>
                <p className="text-white/70 text-xs mt-3">
                  No spam. Updates from Harshit Soni and CubicleRide team only.
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
