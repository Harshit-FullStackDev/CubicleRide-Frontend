import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  MapPin,
  Users,
  Sparkles,
  Car,
  Award,
  Globe2,
  Building2,
  Star,
  PlusCircle,
  Bell,
  Clock,
  User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRole } from '../utils/auth';
import MainHeader from '../components/MainHeader';
import JoinRideList from '../components/JoinRideList';
import MyRidesSummary from '../components/MyRidesSummary';

// Minimal Button & Card primitives
const Button = ({ variant = 'solid', className = '', children, type = 'button', ...rest }) => {
  const base =
    'inline-flex items-center justify-center rounded-full text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const styles = {
    solid: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-600',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'text-gray-700 hover:text-orange-600',
    secondary: 'bg-white text-orange-700 hover:bg-orange-50',
  };
  return (
    <button type={type} className={`${base} px-5 py-2.5 ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
};
const Card = ({ className = '', children }) => (
  <div className={`bg-white border border-orange-100 shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className = '', children }) => <div className={className}>{children}</div>;

// Your original feature set (kept)
const features = [
  { icon: <Car className="h-6 w-6" />, title: 'Offer or Join', desc: 'Post a ride in seconds or join one that matches your route & timing.' },
  { icon: <ShieldCheck className="h-6 w-6" />, title: 'Secure by Design', desc: 'Org‑only access, role permissions & provenance on every ride.' },
  { icon: <Users className="h-6 w-6" />, title: 'People-first', desc: 'Clear capacity, profiles & history reduce chat back‑and‑forth.' },
  { icon: <MapPin className="h-6 w-6" />, title: 'Route Intelligence', desc: 'Reusable pickup / drop catalogs keep choices fast & consistent.' },
];

// How-it-works (kept)
const steps = [
  { step: '01', title: 'Sign in', desc: 'Authenticate with your company workspace token.' },
  { step: '02', title: 'Select Route', desc: 'Pick pickup, drop & recurrence (one‑time or weekdays).' },
  { step: '03', title: 'Offer or Join', desc: 'System surfaces matches; you confirm in one tap.' },
  { step: '04', title: 'Ride & Improve', desc: 'Save money, reduce congestion & CO₂ each trip.' },
];

// Testimonials (kept)
const testimonials = [
  { quote: 'My monthly commute expense dropped ~40% without adding planning overhead.', author: 'Aarav · Frontend Engineer' },
  { quote: 'Reusable pickup points eliminated the daily “where are you?” chats.', author: 'Meera · Delivery Lead' },
  { quote: 'Knowing profiles & past rides exist builds instant trust.', author: 'Rohit · QA Analyst' },
];

/** --- New: OrangeMantra factual content (sourced from orangemantra.com) --- */

// High-level stats & facts (paraphrased, non-marketing)
const omHighlights = [
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Founded in 2001',
    desc: 'Two+ decades of engineering digital solutions.',
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Rated 4.8/5',
    desc: 'Based on 1,085+ client reviews across 5,600+ projects.',
  },
  {
    icon: <Globe2 className="h-5 w-5" />,
    title: 'Global Delivery',
    desc: 'Work delivered across the U.S., Europe, APAC, and MEA.',
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: 'Recognized by Clutch',
    desc: 'Top-rated app development company (India).',
  },
];

// Top service families from OM site
const omServices = [
  { title: 'Ecommerce', url: 'https://www.orangemantra.com/services/', blurb: 'Storefronts, headless, marketplaces, and growth ops.' },
  { title: 'Enterprise Development', url: 'https://www.orangemantra.com/services/', blurb: 'Custom apps, integrations, data, and automation.' },
  { title: 'Mobile Apps', url: 'https://www.orangemantra.com/services/', blurb: 'Native iOS/Android, cross-platform, and PWA.' },
  { title: 'Emerging Tech', url: 'https://www.orangemantra.com/services/', blurb: 'AI/ML, IoT/IIoT, analytics, and platform engineering.' },
  { title: 'Managed IT', url: 'https://www.orangemantra.com/services/', blurb: 'SRE, cloud, security, and support.' },
  { title: 'Digital Marketing', url: 'https://www.orangemantra.com/services/', blurb: 'Acquisition, content, and performance marketing.' },
  { title: 'QA & Testing', url: 'https://www.orangemantra.com/services/', blurb: 'Automation, performance, and release quality.' },
];

// Representative client brands publicly featured by OM
const omClients = ['IKEA', 'Hero', 'Nestlé', 'Panasonic', 'AND', 'Tata', 'PVR', 'Decathlon', "Haldiram’s"];

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-semibold tracking-tight">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

export default function Landing() {
  const navigate = useNavigate();

  // NOTE: We no longer redirect EMPLOYEE users away; they now land here post-login.
  useEffect(() => {
    const role = getRole();
    if (role === 'ADMIN') navigate('/admin/dashboard');
    document.title = role === 'EMPLOYEE' ? 'Your Commute · OrangeMantra Carpool' : 'OrangeMantra Carpool Platform';
  }, [navigate]);

  const role = getRole();
  const isEmployee = role === 'EMPLOYEE';

  // Employee-specific landing (post-login) – functional first
  if (isEmployee) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white text-gray-900 relative">
        <a href="#employee-join" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-white shadow px-3 py-2 rounded-md text-xs font-medium text-orange-700">Skip to rides</a>
        <MainHeader />
        {/* Top: Join a ride with search filters */}
        <section className="pt-8 pb-4" id="employee-join">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  <span className="bg-[#054652] bg-clip-text text-transparent text-[32px]">Find / Join a Ride</span> 
                </h1>
              </div>
              <div className="rounded-3xl border border-orange-100/70 bg-white/80 backdrop-blur p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                <JoinRideList full />
              </div>
              <div className="rounded-3xl border bg-white/70 backdrop-blur p-5 shadow-sm">
                <h2 className="text-sm font-semibold mb-2 text-[#054652]">Suggestions</h2>
                <ul className="text-[11px] text-gray-600 space-y-1">
                  <li>• Broaden pickup or drop to surface more rides.</li>
                  <li>• Offer a ride if you regularly commute this route.</li>
                  <li>• Edit / approve / cancel using avatar → Manage Rides.</li>
                </ul>
                <button onClick={()=>navigate('/employee/offer')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#054652] hover:text-[#0a7f8c]">
                  <PlusCircle className="h-3.5 w-3.5" /> Offer a ride
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <MyRidesSummary />
              <div className="rounded-3xl border bg-white/80 backdrop-blur p-5 shadow-sm">
                <h2 className="text-lg font-semibold tracking-tight mb-3 text-[#054652] font-bold">Quick Actions</h2>
                <ul className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 text-xs" aria-label="Quick actions">
                  <li>
                    <button onClick={()=>navigate('/employee/offer')} className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#054652] hover:bg-[#0a7f8c] text-white font-medium px-3 py-2 transition">
                      <PlusCircle className="h-4 w-4" /> <span>Publish</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={()=>navigate('/employee/join')} className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#054652] hover:bg-[#0a7f8c] text-white font-medium px-3 py-2 transition">
                      <Car className="h-4 w-4" /> <span>Browse</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={()=>navigate('/employee/notifications')} className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#054652] hover:bg-[#0a7f8c] text-white font-medium px-3 py-2 transition">
                      <Bell className="h-4 w-4" /> <span>Alerts</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={()=>navigate('/employee/history/published')} className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-300 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 transition">
                      <Clock className="h-4 w-4 text-gray-500" /> <span>History</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={()=>navigate('/employee/vehicle')} className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-300 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 transition">
                      <Car className="h-4 w-4 text-gray-500" /> <span>Vehicle</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={()=>navigate('/employee/profile')} className="group w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-300 hover:bg-gray-200 text-gray-700 font-medium px-3 py-2 transition">
                      <UserIcon className="h-4 w-4 text-gray-500" /> <span>Profile</span>
                    </button>
                  </li>
                </ul>
                <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">Need deeper management? Use <span className="font-medium">Manage Rides</span> in your avatar menu.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Focused OrangeMantra context (condensed) */}
  <section id="om" className="pt-6 md:pt-8 pb-12 md:pb-16 bg-gradient-to-b from-white to-orange-50/40" aria-labelledby="om-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 md:mb-12 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <h2 id="om-heading" className="text-2xl md:text-3xl font-semibold tracking-tight text-[#054652]">OrangeMantra at a glance</h2>
                <p className="text-gray-600 mt-2 max-w-2xl text-sm md:text-base">Engineering, mobility, and workplace experience powering our internal commute platform.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {omHighlights.map((h,i)=>(
    <div key={i} className="rounded-2xl border bg-white p-5 flex items-start gap-3 hover:shadow-sm transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center text-orange-700">{h.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{h.title}</div>
                    <div className="text-[13px] text-gray-600">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust & Safety slice */}
    <section id="trust" className="py-12 md:py-16" aria-labelledby="trust-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-start">
            <div>
      <h2 id="trust-heading" className="text-2xl md:text-3xl font-semibold tracking-tight text-[#054652]">Trust & Safety</h2>
              <ul className="mt-5 space-y-3 text-sm text-gray-600">
                <li>• Organization-only access with JWT & role-based controls.</li>
                <li>• Ride history, approval flows & verified vehicles.</li>
                <li>• Manual or instant booking modes.</li>
                <li>• Persistent visibility via Manage Rides modal.</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <button onClick={()=>navigate('/employee/offer')} className="px-5 py-2.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium">Publish Now</button>
                <button onClick={()=>navigate('/employee/join')} className="px-5 py-2.5 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium">Browse Rides</button>
              </div>
            </div>
            <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center text-orange-700"><ShieldCheck className="h-5 w-5" /></div>
                <div className="font-medium">Controls you can trust</div>
              </div>
              <p className="text-sm text-gray-600">All rides are internal. Owners manage seats & approvals; employees build commute reliability.</p>
              <div className="flex items-center gap-2 text-xs text-gray-500"><Sparkles className="h-4 w-4 text-orange-600" /> Continuous improvements shipped.</div>
            </div>
          </div>
        </section>

        {/* Footer reused */}
  <footer id="footer" className="py-12 border-t" aria-labelledby="footer-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center gap-3">
                  <img src="/OMLogo.svg" alt="OrangeMantra" className="h-10 w-auto" />
                </div>
                <p className="text-sm text-gray-600 mt-3 max-w-md">Private internal ride sharing for OrangeMantra teams.</p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                  <span>Developed by <span className="font-medium text-gray-700">Harshit Soni</span></span>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">Workspace</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#employee-join" className="hover:text-orange-600">Find a Ride</a></li>
                  <li><a href="/employee/offer" className="hover:text-orange-600">Offer Ride</a></li>
                  <li><a href="/employee/history/published" className="hover:text-orange-600">History</a></li>
                  <li><a href="/employee/vehicle" className="hover:text-orange-600">Vehicle</a></li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-2">Company</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#om" className="hover:text-orange-600">About</a></li>
                  <li><a href="#trust" className="hover:text-orange-600">Trust & Safety</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 text-xs text-gray-500">© {new Date().getFullYear()} OrangeMantra • Internal use.</div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white text-gray-900 relative">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 bg-white shadow px-3 py-2 rounded-md text-xs font-medium text-orange-700">Skip to content</a>
      {/* Unified persistent header */}
      <MainHeader />

      {/* Hero */}
      <section className="relative overflow-hidden" id="hero" aria-label="Hero">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs w-fit">
                <Sparkles className="h-3.5 w-3.5" />
                Employee Commute, Reimagined
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight" id="main">
                Commute smarter with your <span className="text-orange-600">team</span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-xl">
                A secure internal carpool platform for OrangeMantra. Cut cost, save time & lower emissions—while retaining full control & transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={() => navigate('/register')}>
                  Get started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate('/login')}>Sign in</Button>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6 max-w-md">
                <Stat value="8 seats" label="per ride (max)" />
                <Stat value="≈40%" label="avg savings" />
                <Stat value="Org-only" label="access" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-4 md:p-6">
                <div className="h-full rounded-2xl border border-dashed border-orange-300/70 grid place-items-center text-center p-6">
                  <div>
                    <div className="mb-2 text-sm text-gray-500">Preview</div>
                    <div className="text-xl font-medium">Actionable Ride Cards</div>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                      Nearby rides & smart suggestions—no complex forms, just pick & go.
                    </p>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="rounded-2xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-orange-100 grid place-items-center">
                                <Car className="h-5 w-5 text-orange-700" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Campus → Sector 44</div>
                                <div className="text-xs text-gray-500">Mon–Fri • 3 seats</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Join Section for logged-in employees */}
      {getRole() === 'EMPLOYEE' && (
        <section className="py-10 md:py-14" id="quick-join">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Available rides</h2>
                  <button onClick={() => navigate('/employee/join')} className="text-sm font-medium text-orange-600 hover:underline">View all</button>
                </div>
                <div className="rounded-3xl border bg-white/70 backdrop-blur p-4 md:p-6 shadow-sm">
                  <JoinRideList limit={4} />
                </div>
              </div>
              <MyRidesSummary />
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section id="features" className="py-16 md:py-24" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-14">
            <h2 id="features-heading" className="text-2xl md:text-3xl font-semibold tracking-tight">Built for modern workplaces</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">Enterprise-grade security, humane UX & measurable sustainability impact.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, idx) => (
              <motion.div key={idx} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 250, damping: 18 }}>
                <Card className="rounded-2xl h-full">
                  <CardContent className="p-5">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-700 grid place-items-center mb-4">{f.icon}</div>
                    <div className="font-medium mb-1">{f.title}</div>
                    <div className="text-sm text-gray-600">{f.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: OrangeMantra section (facts, services, clients, awards) */}
      <section id="om" className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">OrangeMantra at a glance</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              A trusted digital transformation partner powering products and platforms for brands worldwide.
            </p>
          </div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {omHighlights.map((h, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center text-orange-700">{h.icon}</div>
                <div>
                  <div className="font-medium">{h.title}</div>
                  <div className="text-sm text-gray-600">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="mb-12">
            <div className="font-medium mb-3">What OrangeMantra builds</div>
            <div className="grid md:grid-cols-3 gap-5">
              {omServices.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border bg-white p-5 hover:shadow-sm transition"
                >
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.blurb}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Clients marquee */}
          <div className="rounded-2xl border bg-white p-5 overflow-hidden">
            <div className="text-sm font-medium mb-3">Trusted by leading brands</div>
            <div className="whitespace-nowrap animate-[scroll_25s_linear_infinite]" style={{ maskImage: 'linear-gradient(90deg,transparent,black 10%,black 90%,transparent)' }}>
              <div className="inline-flex gap-6 text-gray-700 text-sm">
                {omClients.concat(omClients).map((c, i) => (
                  <span key={`${c}-${i}`} className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100">{c}</span>
                ))}
              </div>
            </div>
            <style>{`
              @keyframes scroll { 0%{ transform: translateX(0);} 100%{ transform: translateX(-50%);} }
            `}</style>
          </div>
        </div>
      </section>

      {/* How it works */}
  <section id="how" className="py-16 md:py-24" aria-labelledby="how-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-14">
    <h2 id="how-heading" className="text-2xl md:text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">Simple and safe—focus on work, not traffic.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {steps.map((s, idx) => (
              <div key={idx} className="rounded-2xl border bg-white p-5">
                <div className="text-xs font-medium text-orange-700">{s.step}</div>
                <div className="font-medium mt-1">{s.title}</div>
                <div className="text-sm text-gray-600 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
  <section id="trust" className="py-16 md:py-24" aria-labelledby="public-trust-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
      <h2 id="public-trust-heading" className="text-2xl md:text-3xl font-semibold tracking-tight">Trust & Safety by design</h2>
              <ul className="mt-5 space-y-3 text-sm text-gray-600">
                <li>• Organization-only access with JWT and role-based authorization.</li>
                <li>• Ride history, member profiles, and admin visibility for governance.</li>
                <li>• Optional approval flows and preset routes for safety.</li>
                <li>• Notifications to ride owners when someone joins.</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Button onClick={() => navigate('/security')}>Security brief</Button>
                <Button variant="outline" onClick={() => navigate('/admin/guide')}>Admin guide</Button>
              </div>
            </div>
            <div>
              <div className="rounded-3xl border bg-white p-6 shadow-sm mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center"><ShieldCheck className="h-5 w-5 text-orange-700" /></div>
                  <div className="font-medium">Controls you can trust</div>
                </div>
                <div className="mt-4 text-sm text-gray-600">Configure pickup/drop catalogs, seat limits, and access— matching policies.</div>
              </div>
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 grid place-items-center"><Users className="h-5 w-5 text-orange-700" /></div>
                  <div className="font-medium">Human-centered experience</div>
                </div>
                <div className="mt-4 text-sm text-gray-600">Delightful, simple flows—so adoption is natural.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
  <section className="py-16 md:py-24 bg-orange-50/60" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-14">
    <h2 id="testimonials-heading" className="text-2xl md:text-3xl font-semibold tracking-tight">What our teams say</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">Stories from early adopters.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, idx) => (
              <Card key={idx} className="rounded-2xl">
                <CardContent className="p-5">
                  <p className="text-sm">“{t.quote}”</p>
                  <div className="text-xs text-gray-500 mt-3">{t.author}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
  <section className="py-16 md:py-24" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
        <h3 id="cta-heading" className="text-2xl md:text-3xl font-semibold tracking-tight">Ready to roll?</h3>
                <p className="text-white/90 mt-2 max-w-xl">Launch the carpool workspace and invite your squad.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                <Button variant="secondary" className="text-orange-700" onClick={() => navigate('/login')}>Open App</Button>
                <a
                  href="https://www.orangemantra.com/services/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10">Explore OM Services</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with professional credit */}
  <footer id="footer" className="py-12 border-t" aria-labelledby="public-footer-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3">
                <img src="/OMLogo.svg" alt="OrangeMantra" className="h-10 w-auto" />
              </div>
              <p className="text-sm text-gray-600 mt-3 max-w-md">An internal, secure ride-sharing experience.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
                <span>Developed by <span className="font-medium text-gray-700">Harshit Soni</span></span>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Product</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-orange-600">Features</a></li>
                <li><a href="#om" className="hover:text-orange-600">OrangeMantra</a></li>
                <li><a href="#how" className="hover:text-orange-600">How it works</a></li>
                <li><a href="#trust" className="hover:text-orange-600">Trust & Safety</a></li>
              </ul>
            </div>

            <div>
              <div className="font-medium mb-2">Company</div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="https://www.orangemantra.com/career/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 hover:text-orange-600 transition"
                  >
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[10px] font-semibold text-orange-700 group-hover:bg-orange-200">NEW</span>
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.orangemantra.com/services/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-orange-600 transition"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.orangemantra.com/awards-and-media/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-orange-600 transition"
                  >
                    Awards & Media
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500">© {new Date().getFullYear()} OrangeMantra • Internal use.</div>
        </div>
      </footer>
    </div>
  );
}
