import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRole, getName, clearSession, ensureValidSession } from '../utils/auth';
import { FaSearch, FaPlus, FaSignOutAlt, FaBell, FaHistory, FaInbox, FaCar, FaUser, FaChevronDown, FaTachometerAlt, FaBars, FaTimes } from 'react-icons/fa';
import api from '../api/axios';
import chatSocket from '../utils/chatSocket';
import JoinRideList from './JoinRideList';
import ManageRidesModal from './ManageRidesModal';

export default function MainHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(getRole());
  const [name, setName] = useState(getName());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const empId = localStorage.getItem('empId');

  useEffect(() => {
    const sync = () => { setRole(getRole()); setName(getName()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => { setMenuOpen(false); setFindOpen(false); setMobileMenuOpen(false); }, [location.pathname]);

  const logout = useCallback(() => {
    clearSession();
    setMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  }, [navigate]);

  const initials = (name || 'E').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
  const isEmployee = role === 'EMPLOYEE';
  useEffect(() => { ensureValidSession(); }, []);

  // Poll notifications & chat unread every 20s; also update on websocket events
  useEffect(() => {
    if (!isEmployee || !empId) return;
    let mounted = true;
    const fetchCounts = async () => {
      try {
        const [nRes, cRes] = await Promise.all([
          api.get(`/notifications/${empId}/count`).catch(()=>({data:{unread:0}})),
          api.get('/ride/chat/conversations').catch(()=>({data:[]}))
        ]);
        if (!mounted) return;
        setNotifCount(nRes.data.unread||0);
        const totalUnread = (cRes.data||[]).reduce((sum,c)=> sum + (c.unread||0),0);
        setChatUnread(totalUnread);
      } catch { /* ignore */ }
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 20000);
    // chat websocket listener for live increment & read resets
    chatSocket.connect();
    const off = chatSocket.addListener(evt => {
      if (evt && typeof evt === 'object') {
        if (evt.type === 'read') {
          // force refresh counts
          fetchCounts();
        } else if (evt.content) {
          // new message delivered to me
          if (evt.toEmpId === empId) setChatUnread(c => c + 1);
        }
      }
    });
    return () => { mounted=false; clearInterval(id); off(); };
  }, [isEmployee, empId]);



  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur bg-white/95 border-b border-orange-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer select-none flex items-center flex-shrink-0" aria-label="Home">
            <img src="/OMLogo.svg" alt="CubicleRide - Smart Employee Carpooling Platform" className="h-10 w-auto" />
          </div>
          
          {/* Center Nav - Desktop Only */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/features" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Features</a>
            <a href="/about" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">About</a>
            <a href="/blog" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Blog</a>
            <a href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">Contact</a>
          </nav>
          
          {/* Right actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {!isEmployee && (
              <>
                <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-full font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                  Sign in
                </button>
                <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-full font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors">
                  Register
                </button>
              </>
            )}
            {isEmployee && (
              <>
                <button onClick={() => navigate('/employee/offer')} className="hidden lg:flex items-center gap-2 px-4 py-2 text-[#054652] hover:text-orange-600 font-medium transition-colors">
                  <FaPlus className="text-sm" /> 
                  <span>Publish a ride</span>
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(o=>!o)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold flex items-center justify-center shadow-lg">
                      {initials}
                    </span>
                    <FaChevronDown className={`text-gray-500 text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {menuOpen && (
                    <div role="menu" className="absolute right-0 top-full mt-2 w-60 bg-white/95 backdrop-blur border border-orange-100 rounded-xl shadow-lg p-2 z-[999]">
                      <div className="px-2 py-1 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Workspace</div>
                      <button onClick={()=>{setManageOpen(true); setMenuOpen(false);}} className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-orange-50 text-sm text-[#054652]">
                        <FaTachometerAlt className="text-xs" /> <span>Manage Rides</span>
                      </button>
                      <MenuLink to="/employee/offer" icon={<FaPlus />}>Offer Ride</MenuLink>
                      <MenuLink to="/employee/join" icon={<FaSearch />}>Join Ride</MenuLink>
                      <MenuLink
                        to="/employee/notifications"
                        icon={
                          <span className="relative inline-block">
                            <FaBell />
                            {notifCount > 0 && (
                              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold shadow z-30 pointer-events-none border-2 border-white">{notifCount > 99 ? '99+' : notifCount}</span>
                            )}
                          </span>
                        }
                      >
                        Notifications
                      </MenuLink>
                      <MenuLink to="/employee/history/published" icon={<FaHistory />}>Published History</MenuLink>
                      <MenuLink to="/employee/history/joined" icon={<FaHistory />}>Joined History</MenuLink>
                      <MenuLink
                        to="/employee/inbox"
                        icon={
                          <span className="relative inline-block">
                            <FaInbox />
                            {chatUnread > 0 && (
                              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold shadow z-30 pointer-events-none border-2 border-white">{chatUnread > 99 ? '99+' : chatUnread}</span>
                            )}
                          </span>
                        }
                      >
                        Inbox
                      </MenuLink>
                      <MenuLink to="/employee/ratings" icon={<span className="font-semibold text-xs">★</span>}>Ratings</MenuLink>
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
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-orange-600 focus:outline-none focus:text-orange-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur border-t border-orange-100 shadow-lg z-40">
            <nav className="px-4 py-4 space-y-2">
              <a 
                href="/features" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="/about" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="/blog" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>
              <a 
                href="/contact" 
                className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              
              {!isEmployee && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button 
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} 
                    className="w-full px-4 py-3 text-left text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} 
                    className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Register
                  </button>
                </div>
              )}
              
              {isEmployee && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button 
                    onClick={() => { navigate('/employee/offer'); setMobileMenuOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    <FaPlus className="text-sm" />
                    Publish a ride
                  </button>
                  <button 
                    onClick={() => { setManageOpen(true); setMobileMenuOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    <FaTachometerAlt className="text-sm" />
                    Manage Rides
                  </button>
                  <button 
                    onClick={() => { navigate('/employee/join'); setMobileMenuOpen(false); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  >
                    <FaSearch className="text-sm" />
                    Join Ride
                  </button>
                  <button 
                    onClick={logout} 
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium mt-4"
                  >
                    <FaSignOutAlt className="text-sm" />
                    Logout
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
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
      {manageOpen && isEmployee && (
        <ManageRidesModal onClose={()=>setManageOpen(false)} />
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
      className="cursor-pointer select-none w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-orange-50 text-sm text-[#054652] focus:outline-none focus:bg-orange-50"
    >
      <span className="text-[orange-600] text-xs">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
