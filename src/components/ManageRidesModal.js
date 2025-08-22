import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaCar, FaEdit, FaTimesCircle, FaUsers, FaCheckCircle, FaTimes, FaComments
} from 'react-icons/fa';

/**
 * Ride management panel (dashboard replacement inside a modal)
 */
export default function ManageRidesModal({ onClose }) {
  const navigate = useNavigate();
  const [empId] = useState(() => localStorage.getItem('empId') || '');
  const [published, setPublished] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('published');

  const load = useCallback(async () => {
    if(!empId) return;
    setLoading(true); setError('');
    try {
      const [pRes, jRes] = await Promise.all([
        api.get('/ride/my-rides'),
        api.get(`/ride/joined/${empId}`)
      ]);
      setPublished(pRes.data || []);
      setJoined(jRes.data || []);
    } catch (e) {
      setError('Failed to load rides');
    } finally { setLoading(false); }
  }, [empId]);

  useEffect(() => { load(); }, [load]);

  const formatDate = useCallback((dateStr) => {
    if(!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
  }, []);
  const formatTime = useCallback((timeStr) => timeStr?.slice(0,5) || '—', []);

  const handleEdit = useCallback((id) => navigate(`/employee/edit/${id}`), [navigate]);
  const handleCancel = useCallback(async (id) => {
    if(!window.confirm('Cancel this ride?')) return;
    try { await api.post(`/ride/cancel/${id}`); load(); } catch { alert('Failed to cancel'); }
  }, [load]);
  const approveRequest = useCallback(async (rideId, pendingEmpId) => {
    try { await api.post(`/ride/approve/${rideId}`, { empId: pendingEmpId }); load(); } catch { alert('Approve failed'); }
  }, [load]);
  const declineRequest = useCallback(async (rideId, pendingEmpId) => {
    try { await api.post(`/ride/decline/${rideId}`, { empId: pendingEmpId }); load(); } catch { alert('Decline failed'); }
  }, [load]);
  const handleLeave = useCallback(async (id) => {
    if(!window.confirm('Leave this ride?')) return;
    try { await api.post(`/ride/leave/${id}`, { empId }); load(); } catch { alert('Failed to leave'); }
  }, [empId, load]);
  const goChat = useCallback((rideId, otherEmpId) => navigate(`/employee/inbox?rideId=${rideId}&emp=${otherEmpId}`), [navigate]);

  // ESC close
  useEffect(() => {
    const onKey = (e) => { if(e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pendingTotal = published.reduce((acc, r) => acc + (r.pendingEmployees?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-[1000] flex items-start md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-white/95 backdrop-blur border border-orange-100 shadow-xl flex flex-col">
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white/60">
          <div>
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-3">
              <span>Ride Management</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">{published.length} published</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">{joined.length} joined</span>
              {pendingTotal>0 && <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold" title="Pending join requests">{pendingTotal} pending</span>}
            </h2>
            <p className="text-[11px] text-gray-500">Edit, approve, cancel or leave rides without leaving the page.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="text-xs font-semibold text-orange-600 hover:underline">Refresh</button>
            <button onClick={onClose} className="px-3 py-1.5 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-semibold">Close</button>
          </div>
        </header>
        <div className="px-6 pt-3 flex items-center gap-3 text-sm">
          <TabButton active={tab==='published'} onClick={()=>setTab('published')}>Published Rides</TabButton>
          <TabButton active={tab==='joined'} onClick={()=>setTab('joined')}>Joined Rides</TabButton>
          <div className="ml-auto flex items-center gap-2 text-[11px] text-gray-500">
            <span className="hidden md:inline">ESC to close</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 mt-4 custom-scroll">
          {loading && <div className="text-sm text-blue-600 animate-pulse">Loading rides...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && tab==='published' && (
            published.length === 0 ? <EmptyState text="You haven't published any rides yet." /> : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {published.map(r => (
                  <div key={r.id} className="relative rounded-2xl bg-white border border-orange-100 hover:border-orange-200 p-5 shadow-sm group">
                    <div className="flex items-center gap-3 mb-1">
                      <FaMapMarkerAlt className="text-green-500" />
                      <span className="font-semibold">{r.origin}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-semibold">{r.destination}</span>
                    </div>
                    <MetaRow icon={<FaCalendarAlt className="text-purple-500" />} label={formatDate(r.date)} />
                    <MetaRow icon={<FaClock className="text-yellow-500" />} label={formatTime(r.arrivalTime)} />
                    <MetaRow icon={<FaCar className="text-gray-500" />} label={r.carDetails} />
                    <MetaRow icon={<FaChair className="text-pink-500" />} label={`${r.availableSeats}/${r.totalSeats} seats`} />
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status || 'Active'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">{r.instantBookingEnabled ? 'Instant' : 'Review'}</span>
                      {r.fare && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">₹{r.fare}/seat</span>}
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="text-[11px] font-semibold text-blue-700 flex items-center gap-1"><FaUsers /> Joined Employees</div>
                      {r.joinedEmployees && r.joinedEmployees.length>0 ? (
                        <ul className="ml-4 list-disc text-[11px] text-gray-700 space-y-0.5">
                          {r.joinedEmployees.map(emp => (
                            <li key={emp.empId} className="flex items-center gap-2">
                              <span>{emp.name} ({emp.empId})</span>
                              <button onClick={()=>goChat(r.id, emp.empId)} className="text-[10px] px-2 py-0.5 rounded bg-orange-600 hover:bg-orange-700 text-white">Chat</button>
                            </li>
                          ))}
                        </ul>
                      ) : <div className="text-[11px] text-gray-400 ml-1">No employees joined</div>}
                      {!r.instantBookingEnabled && (
                        <div className="mt-2">
                          <div className="text-[11px] font-semibold text-indigo-700 mb-1">Pending Requests</div>
                          {r.pendingEmployees && r.pendingEmployees.length>0 ? r.pendingEmployees.map(p => (
                            <div key={p.empId} className="flex items-center justify-between bg-indigo-50 rounded px-2 py-1 text-[11px] mb-1">
                              <span>{p.name} ({p.empId})</span>
                              <div className="flex gap-1">
                                <button onClick={()=>approveRequest(r.id, p.empId)} className="w-6 h-6 flex items-center justify-center rounded bg-green-600 hover:bg-green-700 text-white"><FaCheckCircle /></button>
                                <button onClick={()=>declineRequest(r.id, p.empId)} className="w-6 h-6 flex items-center justify-center rounded bg-red-600 hover:bg-red-700 text-white"><FaTimes /></button>
                              </div>
                            </div>
                          )) : <div className="text-[11px] text-gray-400">No pending requests</div>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={()=>handleEdit(r.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-medium"><FaEdit /> Edit</button>
                      <button onClick={()=>handleCancel(r.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium"><FaTimesCircle /> Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {!loading && !error && tab==='joined' && (
            joined.length === 0 ? <EmptyState text="You haven't joined any rides yet." /> : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                {joined.map(r => (
                  <div key={r.id} className="relative rounded-2xl bg-white border border-amber-100 hover:border-amber-200 p-5 shadow-sm group">
                    <div className="flex items-center gap-3 mb-1">
                      <FaMapMarkerAlt className="text-green-500" />
                      <span className="font-semibold">{r.origin}</span>
                      <span className="mx-2 text-gray-400">→</span>
                      <span className="font-semibold">{r.destination}</span>
                    </div>
                    <MetaRow icon={<FaCalendarAlt className="text-purple-500" />} label={formatDate(r.date)} />
                    <MetaRow icon={<FaClock className="text-yellow-500" />} label={formatTime(r.arrivalTime)} />
                    <MetaRow icon={<FaCar className="text-gray-500" />} label={r.carDetails} />
                    <MetaRow icon={<FaChair className="text-pink-500" />} label={`${r.availableSeats}/${r.totalSeats} seats`} />
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${r.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.status || 'Active'}</span>
                      {r.fare && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">₹{r.fare}/seat</span>}
                    </div>
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-green-700 flex items-center gap-1"><FaUsers /> Joined Employees</div>
                      {r.joinedEmployees && r.joinedEmployees.length>0 ? (
                        <ul className="ml-4 list-disc text-[11px] text-gray-700 space-y-0.5">
                          {r.joinedEmployees.map(emp => (
                            <li key={emp.empId}>{emp.name} ({emp.empId})</li>
                          ))}
                        </ul>
                      ) : <div className="text-[11px] text-gray-400 ml-1">No one else yet</div>}
                    </div>
                    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={()=>goChat(r.id, r.ownerEmpId)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-medium"><FaComments /> Chat Owner</button>
                      <button onClick={()=>handleLeave(r.id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium">Leave</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ icon, label }) {
  return <div className="flex items-center gap-2 text-sm text-gray-600"><span className="shrink-0">{icon}</span>{label}</div>;
}
function EmptyState({ text }) { return <div className="text-sm text-gray-400">{text}</div>; }
function TabButton({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-full text-xs font-semibold transition ${active ? 'bg-orange-600 text-white shadow' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>{children}</button>
  );
}
