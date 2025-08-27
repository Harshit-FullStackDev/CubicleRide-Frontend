import React, { useEffect, useState, useMemo } from "react";
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSearch, FaSync, FaFilter, FaStar } from "react-icons/fa";
import api from "../../api/axios";
// import EmployeeLayout from "../../components/EmployeeLayout"; // deprecated
import PageContainer from "../../components/PageContainer";

function PublishedHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("DATE_DESC");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/ride/history/published");
      setRides(res.data || []);
    } catch {
      setError("Failed to load history");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';

  const filtered = useMemo(() => {
    return rides.filter(r => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const blob = `${r.origin} ${r.destination} ${r.carDetails || ''}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [rides, statusFilter, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a,b) => {
      switch (sort) {
        case 'DATE_ASC': return new Date(a.date) - new Date(b.date);
        case 'TIME_ASC': return (a.arrivalTime||'').localeCompare(b.arrivalTime||'');
        case 'TIME_DESC': return (b.arrivalTime||'').localeCompare(a.arrivalTime||'');
        case 'DATE_DESC':
        default: return new Date(b.date) - new Date(a.date);
      }
    });
    return copy;
  }, [filtered, sort]);

  const stats = useMemo(() => {
    const total = rides.length;
    const byStatus = rides.reduce((acc,r)=>{acc[r.status]=(acc[r.status]||0)+1; return acc;},{});
    return { total, byStatus };
  }, [rides]);

  const statusOptions = ['ALL', ...Array.from(new Set(rides.map(r=>r.status)))];

  const [ratingRide, setRatingRide] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stars, setStars] = useState(5);
  const [label, setLabel] = useState("Outstanding");
  const [comment, setComment] = useState("");
  const [ratedPairs, setRatedPairs] = useState(()=> new Set()); // key: rideId|targetEmpId
  const [toast, setToast] = useState(null);

  const openRate = (ride, passengerEmpId) => {
    setRatingRide({...ride, targetEmpId: passengerEmpId});
    setStars(5); setLabel("Outstanding"); setComment("");
  };
  const submit = async () => {
    if (!ratingRide) return; setSubmitting(true);
    try {
      await api.post('/ride/ratings', { rideId: ratingRide.id, targetEmpId: ratingRide.targetEmpId, stars, label, comment });
      const key = `${ratingRide.id}|${ratingRide.targetEmpId}`;
      setRatedPairs(prev=> new Set(prev).add(key));
      setToast({type:'success', msg:'Rating submitted'});
      setRatingRide(null);
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const canRatePassenger = (ride, empId) => {
    // Only after date passed or status Completed/Cancelled
    const today = new Date();
    const rideDate = ride.date ? new Date(ride.date) : null;
  const past = (ride.status && ride.status !== 'Active') || (rideDate && rideDate < new Date(today.toDateString()));
    if (!past) return false;
    const key = `${ride.id}|${empId}`;
    if (ratedPairs.has(key)) return false;
    return true;
  };

  // Optionally prefetch given ratings to populate ratedPairs (lightweight)
  React.useEffect(()=>{
    api.get('/ride/ratings/given').then(res=>{
      const set = new Set();
      (res.data||[]).forEach(r=> set.add(`${r.rideId}|${r.targetEmpId}`));
      setRatedPairs(set);
    }).catch(()=>{});
  }, []);

  return (
    <PageContainer>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#054652] text-center">Published Ride History</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">Review your past offered rides and performance.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-blue-400 focus:ring-0 outline-none" />
            </div>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="py-2 px-3 rounded-lg border border-gray-200 bg-white focus:border-blue-400">
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="py-2 px-3 rounded-lg border border-gray-200 bg-white focus:border-blue-400">
              <option value="DATE_DESC">Newest Date</option>
              <option value="DATE_ASC">Oldest Date</option>
              <option value="TIME_ASC">Time ↑</option>
              <option value="TIME_DESC">Time ↓</option>
            </select>
            <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg bg-[#054652] hover:bg-[#043e47] text-white font-medium flex items-center gap-1 disabled:opacity-50"><FaSync className={`text-xs ${loading?'animate-spin':''}`} />Refresh</button>
          </div>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white/80 backdrop-blur rounded-xl border border-blue-100 shadow-sm">
            <div className="text-[11px] text-gray-500">Total Rides</div>
            <div className="text-xl font-bold text-blue-700">{stats.total}</div>
          </div>
          {Object.entries(stats.byStatus).map(([st,count]) => (
            <div key={st} className="p-4 bg-white/80 backdrop-blur rounded-xl border border-blue-100 shadow-sm">
              <div className="text-[11px] text-gray-500">{st}</div>
              <div className="text-xl font-bold text-blue-700">{count}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="h-48 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5"><FaFilter className="text-blue-400 text-2xl"/></div>
            <p className="font-semibold text-gray-600">No rides match your filters.</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting search or status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(ride => {
              const badgeColors = ride.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' : ride.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200';
              return (
                <div key={ride.id} className="group relative bg-white/90 backdrop-blur rounded-2xl shadow hover:shadow-lg transition border border-blue-100 p-5 flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaMapMarkerAlt className="text-green-500" />
                    <span className="truncate">{ride.origin}</span>
                    <span className="text-gray-400">→</span>
                    <span className="truncate">{ride.destination}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> {formatDate(ride.date)}</div>
                    <div className="flex items-center gap-2"><FaClock className="text-yellow-500" /> {ride.arrivalTime?.slice(0,5) || '—'}</div>
                    <div className="flex items-center gap-2"><FaCar className="text-indigo-500" /> {ride.carDetails || '—'}</div>
                    {ride.fare && <div className="flex items-center gap-2 text-indigo-600 text-[11px]">Fare: ₹{ride.fare}/seat</div>}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${badgeColors}`}>{ride.status}</span>
                    <span className="text-[11px] text-gray-400">Seats: {ride.availableSeats}/{ride.totalSeats}</span>
                  </div>
                  {ride.joinedEmployees && ride.joinedEmployees.length > 0 && (
                    <div className="mt-3 border-t pt-2">
                      <div className="text-[11px] font-semibold text-indigo-700 mb-1">Passengers</div>
                      <ul className="text-[11px] text-gray-600 space-y-1">
                        {ride.joinedEmployees.map(e => {
                          const show = canRatePassenger(ride, e.empId);
                          return (
                            <li key={e.empId} className="flex items-center justify-between gap-2">
                              <span>{e.name} ({e.empId}) {e.phone && <span className="text-green-600 font-semibold">📞 {e.phone}</span>}</span>
                              {show && <button onClick={()=>openRate(ride, e.empId)} className="text-[10px] px-2 py-1 rounded bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 flex items-center gap-1"><FaStar className="text-[10px]" /> Rate</button>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#054652] text-white text-xs px-4 py-2 rounded shadow" onAnimationEnd={()=>setTimeout(()=>setToast(null),2500)}>{toast.msg}</div>
      )}
      {ratingRide && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-yellow-100 p-6 relative">
            <button onClick={()=>setRatingRide(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
            <h3 className="text-lg font-semibold text-[#054652] mb-2 flex items-center gap-2"><FaStar className="text-yellow-400" /> Rate Passenger</h3>
            <p className="text-xs text-gray-500 mb-4">Ride #{ratingRide.id} • {ratingRide.origin} → {ratingRide.destination}</p>
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({length:5}).map((_,i)=> (
                  <button key={i} onClick={()=>setStars(i+1)} className="focus:outline-none">
                    <FaStar className={`h-6 w-6 ${(i < stars)?'text-yellow-400':'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <select value={label} onChange={e=>setLabel(e.target.value)} className="w-full border rounded px-2 py-1 text-xs mb-2">
                {['Outstanding','Good','Okay','Poor','Very disappointing'].map(l=> <option key={l}>{l}</option>)}
              </select>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Comment (optional)" className="w-full border rounded px-2 py-1 text-xs" />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button onClick={()=>setRatingRide(null)} className="px-3 py-2 rounded border text-gray-600">Cancel</button>
              <button onClick={submit} disabled={submitting} className="px-4 py-2 rounded bg-[#054652] hover:bg-[#043f49] text-white disabled:opacity-50">Submit</button>
            </div>
          </div>
        </div>
      )}
  </PageContainer>
  );
}

export default PublishedHistory;
