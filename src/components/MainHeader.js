import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRole, getName, clearSession, ensureValidSession } from '../utils/auth';
import { FaSearch, FaPlus, FaSignOutAlt, FaBell, FaHistory, FaInbox, FaCar, FaUser, FaChevronDown } from 'react-icons/fa';
import JoinRideList from './JoinRideList';

export default function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const [name, setName] = useState(getName());
  const [menuOpen, setMenuOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);

  useEffect(() => {
    const sync = () => { setRole(getRole()); setName(getName()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => { setMenuOpen(false); setFindOpen(false); }, [location.pathname]);

  const logout = useCallback(() => {
    clearSession();
    setMenuOpen(false);
    navigate('/login');
  }, [navigate]);

  const initials = (name || 'E').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
  const isEmployee = role === 'EMPLOYEE';
  useEffect(() => { ensureValidSession(); }, []);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Left: Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer select-none flex items-center" aria-label="Home">
            <img src="/OMLogo.svg" alt="OrangeMantra" className="h-10 w-auto" />
          </div>
          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm mx-auto">
            <a href="/#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="/#om" className="hover:text-orange-600 transition-colors">OrangeMantra</a>
            <a href="/#how" className="hover:text-orange-600 transition-colors">How it works</a>
            <a href="/#trust" className="hover:text-orange-600 transition-colors">Trust & Safety</a>
          </nav>
          {/* Right actions */}
          {!isEmployee && (
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => navigate('/login')} className="hidden sm:inline text-gray-700 hover:text-orange-600">Sign in</button>
              <button onClick={() => navigate('/register')} className="text-orange-600 hover:text-orange-700 font-medium">Register</button>
            </div>
          )}
          {isEmployee && (
            <div className="flex items-center gap-6 text-sm">
        <button onClick={() => setFindOpen(true)} className="unstyled-header-btn inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium focus:outline-none">
                <FaSearch className="text-orange-600" /> <span>Search</span>
              </button>
        <button onClick={() => navigate('/employee/offer')} className="unstyled-header-btn hidden sm:inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium focus:outline-none">
                <FaPlus className="text-orange-600" /> <span>Publish a ride</span>
              </button>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o=>!o)}
          className="unstyled-header-btn flex items-center gap-2 focus:outline-none group"
                >
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white font-semibold flex items-center justify-center shadow">
                    {initials}
                  </span>
                  <FaChevronDown className={`text-orange-600 text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                {menuOpen && (
          <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-white/95 backdrop-blur border border-orange-100 rounded-xl shadow-lg p-2 z-[999]">
                    <div className="px-2 py-1 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Workspace</div>
                    <MenuLink to="/employee/offer" icon={<FaPlus />}>Offer Ride</MenuLink>
                    <MenuLink to="/employee/join" icon={<FaSearch />}>Join Ride</MenuLink>
                    <MenuLink to="/employee/notifications" icon={<FaBell />}>Notifications</MenuLink>
                    <MenuLink to="/employee/history/published" icon={<FaHistory />}>Published History</MenuLink>
                    <MenuLink to="/employee/history/joined" icon={<FaHistory />}>Joined History</MenuLink>
                    <MenuLink to="/employee/inbox" icon={<FaInbox />}>Inbox</MenuLink>
                    <MenuLink to="/employee/vehicle" icon={<FaCar />}>Vehicle</MenuLink>
                    <MenuLink to="/employee/profile" icon={<FaUser />}>Profile</MenuLink>
                    <div className="mt-3 border-t pt-3">
                      <button onClick={logout} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      {findOpen && isEmployee && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-orange-100 p-6 md:p-8 overflow-hidden">
            <button onClick={()=>setFindOpen(false)} aria-label="Close" className="absolute top-3 right-3 px-3 py-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold">Close</button>
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-4">Find a Ride</h2>
            <JoinRideList full overlay />
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ to, icon, children }) {
  const navigate = useNavigate();
  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={()=>navigate(to)}
      onKeyDown={e=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(to);} }}
      className="cursor-pointer select-none w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-orange-50 text-sm text-gray-700 focus:outline-none focus:bg-orange-50"
    >
      <span className="text-orange-600 text-xs">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
