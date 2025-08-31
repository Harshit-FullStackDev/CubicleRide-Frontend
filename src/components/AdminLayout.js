import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUserShield, FaUsers, FaCarSide, FaTools, FaClipboardCheck, FaSignOutAlt } from 'react-icons/fa';
import { ensureValidSession, getRole, getName, getEmail, clearSession } from '../utils/auth';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminName, setAdminName] = useState(getName() || 'Admin');
  const [adminEmail, setAdminEmail] = useState(getEmail() || '');

  // Session + role hardening (redundant with ProtectedRoute but defensive)
  useEffect(() => {
    if (!ensureValidSession() || getRole() !== 'ADMIN') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // In case localStorage changed in another tab
    const sync = () => {
      setAdminName(getName() || 'Admin');
      setAdminEmail(getEmail() || '');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    navigate('/login', { replace: true });
  }, [navigate]);

  const initials = (adminName || 'A').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-orange-50 via-white to-white relative overflow-hidden">
      {/* Decorative radial accents */}
      <div className="pointer-events-none select-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col gap-6 bg-white/75 backdrop-blur-xl border-r border-orange-100 shadow-xl px-5 pt-6 pb-5 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center gap-3 mb-2">
          <img src="/OMLogo.svg" alt="CubicleRide" className="h-10 w-auto" />
        </div>
        <nav className="flex-1 flex flex-col gap-1 text-sm font-medium" role="menu">
          {adminNav.map(item => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            return (
              <button
                key={item.to}
                type="button"
                onClick={() => { navigate(item.to); setOpen(false); }}
                className={`nav-link ${active ? 'nav-link-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.icon}<span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 text-xs">
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-100 text-orange-700 backdrop-blur">
            <div className="font-bold text-[11px] mb-1 uppercase tracking-wide">Logged in as</div>
            <div className="text-sm font-semibold truncate" title={adminName}>{adminName}</div>
            {adminEmail && <div className="text-[10px] text-orange-500 truncate" title={adminEmail}>{adminEmail}</div>}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger text-sm font-semibold inline-flex items-center gap-2 justify-center"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {open && <button aria-label="Close navigation overlay" className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur border-b border-orange-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden text-2xl text-orange-600"
              aria-label={open ? 'Close navigation' : 'Open navigation'}
              onClick={() => setOpen(o => !o)}
            >
              {open ? <FaTimes /> : <FaBars />}
            </button>
            <div className="flex flex-col">
              {heading && <h1 className="text-lg md:text-xl font-semibold text-gray-800 tracking-tight">{heading}</h1>}
              {subheading && <span className="text-[11px] text-gray-500 mt-0.5">{subheading}</span>}
            </div>
          </div>
          <div className="relative">
            <button
              type="button"
              className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold shadow ring-2 ring-orange-200 focus:outline-none focus:ring-4 focus:ring-orange-300"
              onClick={() => setProfileOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Admin menu"
            >
              {initials}
            </button>
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-orange-100 p-4 z-50"
              >
                <div className="text-sm font-semibold text-gray-800 mb-1 truncate" title={adminName}>{adminName}</div>
                {adminEmail && <div className="text-[11px] text-gray-500 mb-3 break-all" title={adminEmail}>{adminEmail}</div>}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-orange-600 hover:bg-orange-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
  <footer className="py-6 text-center text-[11px] text-orange-600 font-medium opacity-70">© {new Date().getFullYear()} CubicleRide Platform</footer>
      </div>
    </div>
  );
};

export default AdminLayout;
