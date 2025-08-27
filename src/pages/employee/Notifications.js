import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import { FaBell, FaCheckCircle, FaTimes, FaTrash, FaSync, FaSearch } from "react-icons/fa";
// import EmployeeLayout from "../../components/EmployeeLayout"; // deprecated
import PageContainer from "../../components/PageContainer";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [clearing, setClearing] = useState(false);
  const empId = localStorage.getItem("empId");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get(`/notifications/${empId}`);
      setNotifications(res.data || []);
    } catch {
      setError("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if(empId) { api.post(`/notifications/${empId}/mark-all-read`).catch(()=>{}); } }, [empId]);

  const clearOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {/* ignore */}
  };

  const clearAll = async () => {
    if (!notifications.length) return;
    setClearing(true);
    try {
      // Assuming API supports bulk clear endpoint; fallback sequential
      await Promise.all(notifications.map(n => api.delete(`/notifications/${n.id}`)));
      setNotifications([]);
    } catch {/* ignore */} finally { setClearing(false); }
  };

  // Filtering
  const filtered = useMemo(() => {
    if (!search.trim()) return notifications;
    const q = search.toLowerCase();
    return notifications.filter(n => (n.message || "").toLowerCase().includes(q));
  }, [notifications, search]);

  // Helper: robustly parse date from various possible fields
  const parseNotificationDate = (n) => {
    const raw = n.createdAt || n.created_at || n.timestamp || n.time || n.date || null;
    if (raw == null) return null;
    let d = null;
    if (typeof raw === 'number') {
      // Seconds vs ms heuristic
      d = new Date(raw < 1e12 ? raw * 1000 : raw);
    } else if (typeof raw === 'string') {
      let str = raw.trim();
      // If no timezone & looks like 'YYYY-MM-DD HH:MM:SS', insert 'T'
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(str) && !str.includes('T')) str = str.replace(' ', 'T');
      // If date only, append midnight to avoid timezone shifting
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) str += 'T00:00:00';
      d = new Date(str);
      if (isNaN(d.getTime())) {
        // Try parsing as ISO without separators (YYYYMMDDHHmmss)
        if (/^\d{14}$/.test(str)) {
          const y = str.slice(0,4), mo=str.slice(4,6), da=str.slice(6,8), hh=str.slice(8,10), mi=str.slice(10,12), se=str.slice(12,14);
          d = new Date(`${y}-${mo}-${da}T${hh}:${mi}:${se}`);
        }
      }
    }
    if (!d || isNaN(d.getTime())) return null;
    return d;
  };

  // Group by calendar day with better labeling (Today, Yesterday, Weekday, Date)
  const grouped = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const map = {};
    filtered.forEach(n => {
      const d = parseNotificationDate(n);
      let label = 'Today'; // treat missing dates as Today per user request to remove 'undated'
      if (d) {
        const dayStart = new Date(d); dayStart.setHours(0,0,0,0);
        const diffDays = Math.round((today - dayStart) / 86400000);
        if (diffDays === 0) label = 'Today';
        else if (diffDays === 1) label = 'Yesterday';
        else if (diffDays < 7) label = dayStart.toLocaleDateString(undefined,{ weekday:'long' });
        else label = dayStart.toLocaleDateString();
      }
      if (!map[label]) map[label] = [];
      map[label].push(n);
    });
    const order = Object.keys(map).sort((a,b)=>{
      const priority = k => k==='Today'?4: k==='Yesterday'?3:2; // no Undated bucket
      const pa = priority(a), pb = priority(b);
      if (pa !== pb) return pb - pa;
      const da = parseNotificationDate(map[a][0]);
      const db = parseNotificationDate(map[b][0]);
      if (da && db) return db - da;
      return a.localeCompare(b);
    });
    return order.map(label => ({ label, items: map[label] }));
  }, [filtered]);

  const relativeTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs/1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec/60); if (min<60) return `${min}m ago`;
    const hr = Math.floor(min/60); if (hr<24) return `${hr}h ago`;
    const day = Math.floor(hr/24); if (day<7) return `${day}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <PageContainer>
      <div className="relative bg-white/90 backdrop-blur rounded-2xl shadow-2xl border border-blue-100 p-6 md:p-8 w-full max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-inner">
              <FaBell className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#054652]">Notifications</h1>
              <p className="text-[11px] text-gray-500">Stay updated with ride activity</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-0 outline-none text-sm" />
            </div>
            <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg bg-[#054652] hover:bg-[#043e47] text-white font-medium flex items-center gap-1 disabled:opacity-50">
              <FaSync className={`text-xs ${loading?'animate-spin':''}`} /> Refresh
            </button>
            <button onClick={clearAll} disabled={clearing || !notifications.length} className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium flex items-center gap-1 disabled:opacity-40"><FaTrash className="text-xs"/> Clear All</button>
          </div>
        </div>
        {error && <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg">{error}</div>}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_,i)=> <div key={i} className="h-14 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <FaBell className="text-blue-400 text-2xl" />
            </div>
            <p className="font-semibold text-gray-600">You're all caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(group => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{group.label}</h3>
                <ul className="space-y-3">
                  {group.items.map(n => (
                    <li key={n.id} className="group relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-400" />
                      <div className="flex items-start gap-3 pl-5 pr-4 py-3">
                        <div className="mt-1 text-green-500"><FaCheckCircle /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-snug break-words">{n.message}</p>
                          <div className="mt-1 flex items-center flex-wrap text-[11px] text-gray-400 gap-2">
                            {(() => { const d = parseNotificationDate(n); return d ? <span title={d.toLocaleString()}>{relativeTime(d.toISOString())}</span> : null; })()}
                            {n.type && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">{n.type}</span>}
                          </div>
                        </div>
                        <button onClick={()=>clearOne(n.id)} className="text-gray-300 hover:text-red-500 transition p-1" title="Clear"><FaTimes/></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
  </PageContainer>
  );
}

export default Notifications;
