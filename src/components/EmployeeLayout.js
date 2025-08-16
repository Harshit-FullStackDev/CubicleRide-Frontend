import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaPlus, FaUsers, FaBell, FaCar, FaUser, FaSignOutAlt, FaHistory } from 'react-icons/fa';

const navItems = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: <FaUser /> },
  { to: '/employee/offer', label: 'Offer Ride', icon: <FaPlus /> },
  { to: '/employee/join', label: 'Join Ride', icon: <FaUsers /> },
  { to: '/employee/notifications', label: 'Notifications', icon: <FaBell /> },
  { to: '/employee/history/published', label: 'Published', icon: <FaHistory /> },
  { to: '/employee/history/joined', label: 'Joined', icon: <FaUsers /> },
  { to: '/employee/vehicle', label: 'Vehicle', icon: <FaCar /> },
  { to: '/employee/profile', label: 'Profile', icon: <FaUser /> }
];

const EmployeeLayout = ({ children, heading, subheading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Standard keys set via auth utilities / login
  const empName = localStorage.getItem('name') || '';
  const empEmail = localStorage.getItem('email') || '';
  const initials = empName.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      <div className="pointer-events-none select-none" aria-hidden="true">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
      </div>
      <aside className={`fixed z-40 top-0 left-0 h-full w-64 p-6 flex flex-col gap-8 bg-white/70 backdrop-blur-xl border-r border-orange-100 shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center gap-3 mb-4">
          <img src="/OMLogo.svg" alt="OrangeMantra" className="h-10 w-auto" />
        </div>
        <nav className="flex flex-col gap-1 text-sm font-medium">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={()=>setOpen(false)} className={`nav-link ${active ? 'nav-link-active' : ''}`}>{item.icon}<span>{item.label}</span></Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 text-xs">
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 text-orange-700 backdrop-blur">
            <div className="font-bold text-[11px] mb-1 uppercase tracking-wide">Logged in as</div>
            <div className="text-sm font-semibold truncate">{empName || '—'}</div>
            {empEmail && <div className="text-[10px] text-orange-500 truncate">{empEmail}</div>}
          </div>
          <button onClick={handleLogout} className="btn btn-danger text-sm font-semibold"><FaSignOutAlt /> Logout</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={()=>setOpen(false)} />}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
          <button className="md:hidden text-2xl text-orange-600" onClick={()=>setOpen(!open)}>{open ? <FaTimes/> : <FaBars/>}</button>
          <div className="flex flex-col">
            {heading && <h1 className="text-lg md:text-xl font-bold text-gray-800">{heading}</h1>}
            {subheading && <span className="text-[11px] text-gray-400 mt-0.5">{subheading}</span>}
          </div>
          <div className="relative group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold shadow ring-2 ring-orange-200 cursor-pointer">{initials}</div>
            <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-orange-100 p-4 hidden group-hover:block z-50">
              <div className="text-sm font-semibold text-gray-800 mb-1 truncate">{empName}</div>
              <div className="text-[11px] text-gray-500 mb-3 break-all">{empEmail}</div>
              <button onClick={handleLogout} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white"><FaSignOutAlt /> Logout</button>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
        <footer className="py-6 text-center text-[11px] text-orange-600 font-medium opacity-70">© {new Date().getFullYear()} OrangeMantra Carpool Platform</footer>
      </div>
    </div>
  );
};

export default EmployeeLayout;
