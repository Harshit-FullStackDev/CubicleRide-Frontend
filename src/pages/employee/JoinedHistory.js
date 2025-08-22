import React, { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaSearch, FaSync, FaFilter, FaUser } from "react-icons/fa";
// import EmployeeLayout from "../../components/EmployeeLayout"; // deprecated
import PageContainer from "../../components/PageContainer";

function JoinedHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("DATE_DESC");
  const empId = localStorage.getItem("empId");

  const load = useCallback( async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get(`/ride/history/joined/${empId}`);
      setRides(res.data || []);
    } catch {
      setError("Failed to load joined rides");
    } finally { setLoading(false); }
  }, [empId]);
  useEffect(()=>{ load(); }, [load]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '';

  const filtered = useMemo(() => rides.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const blob = `${r.origin} ${r.destination} ${r.ownerName||''} ${r.ownerEmpId||''}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  }), [rides, statusFilter, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a,b)=>{
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
    const uniqueDrivers = new Set(rides.map(r=>r.ownerEmpId)).size;
    return { total, byStatus, uniqueDrivers };
  }, [rides]);

  const statusOptions = ['ALL', ...Array.from(new Set(rides.map(r=>r.status)))];

  return (
    <PageContainer>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold tracking-tight'>Joined Rides History</h1>
        <p className='text-xs text-gray-500 mt-1'>Your past participation in rides</p>
      </div>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-green-700">Joined Rides History</h1>
            <p className="text-sm text-gray-500 mt-1">Your past participation in rides.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-green-400 focus:ring-0 outline-none" />
            </div>
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="py-2 px-3 rounded-lg border border-gray-200 bg-white focus:border-green-400">
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sort} onChange={e=>setSort(e.target.value)} className="py-2 px-3 rounded-lg border border-gray-200 bg-white focus:border-green-400">
              <option value="DATE_DESC">Newest Date</option>
              <option value="DATE_ASC">Oldest Date</option>
              <option value="TIME_ASC">Time ↑</option>
              <option value="TIME_DESC">Time ↓</option>
            </select>
            <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-1 disabled:opacity-50"><FaSync className={`text-xs ${loading?'animate-spin':''}`} />Refresh</button>
          </div>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 bg-white/80 backdrop-blur rounded-xl border border-green-100 shadow-sm">
            <div className="text-[11px] text-gray-500">Total Joined</div>
            <div className="text-xl font-bold text-green-700">{stats.total}</div>
          </div>
          <div className="p-4 bg-white/80 backdrop-blur rounded-xl border border-green-100 shadow-sm">
            <div className="text-[11px] text-gray-500">Drivers</div>
            <div className="text-xl font-bold text-green-700">{stats.uniqueDrivers}</div>
          </div>
          {Object.entries(stats.byStatus).map(([st,count]) => (
            <div key={st} className="p-4 bg-white/80 backdrop-blur rounded-xl border border-green-100 shadow-sm">
              <div className="text-[11px] text-gray-500">{st}</div>
              <div className="text-xl font-bold text-green-700">{count}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i)=>(
              <div key={i} className="h-48 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5"><FaFilter className="text-green-400 text-2xl"/></div>
            <p className="font-semibold text-gray-600">No rides match your filters.</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting search or status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map(ride => {
              const badgeColors = ride.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' : ride.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200';
              return (
                <div key={ride.id} className="group relative bg-white/90 backdrop-blur rounded-2xl shadow hover:shadow-lg transition border border-green-100 p-5 flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FaMapMarkerAlt className="text-green-500" />
                    <span className="truncate">{ride.origin}</span>
                    <span className="text-gray-400">→</span>
                    <span className="truncate">{ride.destination}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2"><FaCalendarAlt className="text-green-600" /> {formatDate(ride.date)}</div>
                    <div className="flex items-center gap-2"><FaClock className="text-yellow-600" /> {ride.arrivalTime?.slice(0,5) || '—'}</div>
                    <div className="flex items-center gap-2"><FaUser className="text-indigo-500" /> {ride.ownerName} ({ride.ownerEmpId}) {ride.ownerPhone && <span className="text-green-600 font-semibold">📞 {ride.ownerPhone}</span>}</div>
                    {ride.fare && <div className="flex items-center gap-2 text-indigo-600">Fare: ₹{ride.fare}/seat</div>}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${badgeColors}`}>{ride.status}</span>
                    <span className="text-[11px] text-gray-400">Seats: {ride.availableSeats}/{ride.totalSeats}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  </PageContainer>
  );
}

export default JoinedHistory;
