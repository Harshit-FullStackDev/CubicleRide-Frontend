import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserShield, FaUsers, FaCarSide, FaTools, FaClipboardCheck, FaSignOutAlt } from 'react-icons/fa';

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <FaUserShield /> },
  { to: '/admin/employees', label: 'Employees', icon: <FaUsers /> },
  { to: '/admin/rides', label: 'Rides', icon: <FaCarSide /> },
  { to: '/admin/vehicles', label: 'Vehicles', icon: <FaTools /> },
  { to: '/admin/employees/add', label: 'Add Employee', icon: <FaClipboardCheck /> }
];

const AdminLayout = ({ children, heading, subheading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const adminName = localStorage.getItem('name') || 'Admin';
  const adminEmail = localStorage.getItem('email') || '';
  const initials = adminName.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-amber-100 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply bg-[radial-gradient(circle_at_20%_20%,#fcd34d,transparent_60%),radial-gradient(circle_at_80%_80%,#fb923c,transparent_55%)]" />
      <aside className={`fixed top-0 left-0 h-full w-68 md:w-64 z-40 p-6 flex flex-col gap-8 bg-white/70 backdrop-blur-xl border-r border-orange-200 shadow-xl transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-4 mb-2">
          <img src="/OMLogo.svg" alt="OrangeMantra" className="h-12 w-auto" />
        </div>
        <nav className="flex flex-col gap-1 text-sm font-medium">
          {adminNav.map(item => {
            const active = location.pathname === item.to;
            return (
              <button key={item.to} onClick={()=>{navigate(item.to); setOpen(false);}} className={`nav-link ${active ? 'nav-link-active' : ''}`}>{item.icon}<span>{item.label}</span></button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 text-xs">
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700">
            <div className="font-bold text-[11px] mb-1 uppercase tracking-wide">Logged in as</div>
            <div className="text-sm font-semibold">{adminName}</div>
            <div className="text-[10px] text-orange-500 truncate">{adminEmail}</div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger text-sm font-semibold"><FaSignOutAlt /> Logout</button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={()=>setOpen(false)} />}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <header className="flex items-center justify-between px-5 md:px-10 py-4 sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow border-b border-orange-200">
          <button className="md:hidden text-2xl text-orange-600" onClick={()=>setOpen(!open)}>{open ? <FaTimes/> : <FaBars/>}</button>
          <div className="flex flex-col">
            {heading && <h1 className="text-lg md:text-xl font-bold text-orange-700">{heading}</h1>}
            {subheading && <span className="text-[11px] text-gray-400">{subheading}</span>}
          </div>
          <div className="relative group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow cursor-pointer border-2 border-white">{initials}</div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl p-4 hidden group-hover:block">
              <div className="font-bold text-orange-600 mb-1 text-sm">{adminName}</div>
              <div className="text-[10px] text-gray-500 mb-2">{adminEmail}</div>
              <button onClick={handleLogout} className="btn btn-danger w-full justify-center text-xs font-semibold"><FaSignOutAlt /> Logout</button>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-10 py-8">{children}</main>
        <footer className="py-6 text-center text-[11px] text-orange-600 font-medium opacity-70">© {new Date().getFullYear()} OrangeMantra Carpool Platform</footer>
      </div>
    </div>
  );
};

export default AdminLayout;
