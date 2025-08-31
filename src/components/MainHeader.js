import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRole, getName, clearSession, ensureValidSession } from '../utils/auth';
import { FaSearch, FaPlus, FaSignOutAlt, FaBell, FaHistory, FaInbox, FaCar, FaUser, FaChevronDown, FaTachometerAlt } from 'react-icons/fa';
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

  useEffect(() => { setMenuOpen(false); setFindOpen(false); }, [location.pathname]);

  const logout = useCallback(() => {
    clearSession();
    setMenuOpen(false);
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
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-orange-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          {/* Left: Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer select-none flex items-center" aria-label="Home">
            <img src="/OMLogo.svg" alt="CubicleRide" className="h-10 w-auto" />
          </div>
          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm mx-auto">
            <a href="/#features" className="hover:text-[#00AFF5] transition-colors">Features</a>
            <a href="/#om" className="hover:text-[#00AFF5] transition-colors">CubicleRide</a>
            <a href="/#how" className="hover:text-[#00AFF5] transition-colors">How it works</a>
            <a href="/#trust" className="hover:text-[#00AFF5] transition-colors">Trust & Safety</a>
          </nav>
          {/* Right actions */}
          {!isEmployee && (
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-full font-small border border-black text-grey-700 hover:bg-orange-50">Sign in</button>
              <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-full font-small border border-orange-400 text-orange-700 hover:bg-orange-50">Register</button>
            </div>
          )}
          {isEmployee && (
            <div className="flex items-center gap-6 text-sm">
        <button onClick={() => navigate('/employee/offer')} className="unstyled-header-btn hidden sm:inline-flex items-center gap-1 text-[#054652] hover:text-[#00AFF5] font-medium focus:outline-none">
                <FaPlus className="text-[#054652] font-bold" /> <span>Publish a ride</span>
              </button>
              <div className="relative flex items-center">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o=>!o)}
          className="unstyled-header-btn flex items-center gap-2 focus:outline-none group"
                >
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br text-[#054652] font-semibold flex items-center justify-center shadow">
                    {initials}
                  </span>
                  <FaChevronDown className={`text-[#5f7c81] text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
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
