import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaChair, FaCheckCircle, FaUserFriends } from 'react-icons/fa';

export default function JoinRideList({ full = false, overlay = false, limit, layout }) {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    pickup: localStorage.getItem('pickup') || '',
    drop: localStorage.getItem('drop') || '',
    date: localStorage.getItem('rideDate') || '',
    passengers: parseInt(localStorage.getItem('passengers') || '1', 10) || 1,
    instant: localStorage.getItem('instant') === 'true' ? true : false,
    sort: localStorage.getItem('sort') || 'earliest',
    minFare: localStorage.getItem('minFare') || '',
    maxFare: localStorage.getItem('maxFare') || ''
  });
  const [timeFilters, setTimeFilters] = useState({ early:false, afterEvening:false });
  const empId = localStorage.getItem('empId');

  const applyFilters = useCallback((data, f) => {
    const { pickup, drop, date, passengers } = f;
    return data.filter(r => (
      (!pickup || r.origin === pickup) &&
      (!drop || r.destination === drop) &&
      (!date || r.date === date) &&
      (typeof passengers !== 'number' || passengers <= 0 || (r.availableSeats || 0) >= passengers)
    ));
  }, []);

  const loadRides = useCallback(async (activeFilters = filters) => {
    try {
      const params = new URLSearchParams();
      if (activeFilters.pickup) params.append('origin', activeFilters.pickup);
      if (activeFilters.drop) params.append('destination', activeFilters.drop);
      if (activeFilters.date) params.append('date', activeFilters.date);
      if (activeFilters.instant) params.append('instant', 'true');
      if (activeFilters.minFare) params.append('minFare', activeFilters.minFare);
      if (activeFilters.maxFare) params.append('maxFare', activeFilters.maxFare);
      if (activeFilters.passengers) params.append('passengers', String(activeFilters.passengers));
      if (activeFilters.sort) params.append('sort', activeFilters.sort);
      const { data } = await api.get('/ride/active?'+params.toString());
      setRides(applyFilters(data, activeFilters));
    } catch { setError('Failed to load rides.'); }
  }, [applyFilters, filters]);

  useEffect(() => { if(empId){ api.get('/locations').then(r=>setLocations(r.data)).catch(()=>{}); loadRides(); } }, [empId, loadRides]);
  useEffect(() => { loadRides(); }, [filters.pickup, filters.drop, filters.date, filters.passengers, filters.instant, filters.sort, filters.minFare, filters.maxFare, timeFilters, loadRides]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'passengers') {
      let num = parseInt(value || '1', 10);
      if (isNaN(num) || num < 1) num = 1;
      if (num > 8) num = 8; // UI cap
      val = num;
    }
    const next = { ...filters, [name]: val };
    setFilters(next);
    localStorage.setItem('pickup', next.pickup);
    localStorage.setItem('drop', next.drop);
  localStorage.setItem('rideDate', next.date || '');
  localStorage.setItem('passengers', String(next.passengers));
  localStorage.setItem('instant', next.instant ? 'true':'false');
  localStorage.setItem('sort', next.sort || '');
  localStorage.setItem('minFare', next.minFare || '');
  localStorage.setItem('maxFare', next.maxFare || '');
  };

  const joinRide = async (id, ride) => {
    setError(''); setSuccess('');
    try {
      const passengers = filters.passengers || 1;
      await api.post(`/ride/join/${id}`, { empId, passengers });
      const phrase = passengers > 1 ? `${passengers} seats` : 'seat';
      setSuccess(ride.instantBookingEnabled ? `Joined ${ride.origin} → ${ride.destination} (${phrase})` : `Request sent (${phrase}) for ${ride.origin} → ${ride.destination}`);
      setRides(prev => prev.map(r => r.id === id ? { ...r, availableSeats: Math.max(0,(r.availableSeats||0)-passengers), joinedEmployees: [...(r.joinedEmployees||[]), { empId }] } : r));
      api.get('/ride/active').then(({data}) => setRides(applyFilters(data, filters))).catch(()=>{});
    } catch { setError('Failed to join ride.'); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const visible = limit ? rides.slice(0, limit) : rides;

  // Layout override to mimic marketplace style
  const wrapperClass = layout === 'search' ? 'max-w-7xl mx-auto px-3 md:px-6' : '';
  return (
    <div className={overlay ? 'max-h-[70vh] overflow-y-auto pr-1 custom-scroll' : ''}>
      {layout === 'search' && (
        <div className="w-full bg-white shadow-sm border rounded-2xl p-4 md:p-5 mb-5 flex flex-col md:flex-row gap-4">
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <FaMapMarkerAlt className="text-green-600" />
              <select name="pickup" value={filters.pickup} onChange={handleFilterChange} className="bg-transparent outline-none text-sm min-w-[140px]">
                <option value="">Origin</option>
                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <FaMapMarkerAlt className="text-red-500" />
              <select name="drop" value={filters.drop} onChange={handleFilterChange} className="bg-transparent outline-none text-sm min-w-[140px]">
                <option value="">Destination</option>
                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <FaCalendarAlt className="text-blue-600" />
              <input type="date" name="date" value={filters.date} onChange={handleFilterChange} min={new Date().toISOString().split('T')[0]} className="bg-transparent outline-none text-sm" />
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <FaChair className="text-pink-500" />
              <input type="number" name="passengers" min={1} max={8} value={filters.passengers} onChange={handleFilterChange} className="w-16 bg-transparent outline-none text-sm" />
              <span className="text-xs text-gray-500">passenger{filters.passengers>1?'s':''}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <label className="flex items-center gap-2 text-xs font-medium text-blue-700"><input type="checkbox" name="instant" checked={filters.instant} onChange={(e)=>handleFilterChange({target:{name:'instant', value:e.target.checked}})} /> Instant</label>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2">
              <select name="sort" value={filters.sort} onChange={handleFilterChange} className="bg-transparent outline-none text-xs">
                <option value="earliest">Earliest departure</option>
                <option value="price">Lowest price</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button onClick={()=>loadRides()} className="bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-6 py-2 rounded-xl shadow">Search</button>
          </div>
        </div>
      )}
      <div className={wrapperClass + ' flex flex-col lg:flex-row gap-6'}>
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Sort by</h3>
            {['earliest','price'].map(opt => (
              <label key={opt} className={`flex items-center gap-2 text-sm cursor-pointer ${filters.sort===opt?'text-blue-600 font-medium':'text-gray-600'}`}> 
                <input type="radio" name="sort" value={opt} checked={filters.sort===opt} onChange={handleFilterChange} /> {opt==='earliest'?'Earliest departure':'Lowest price'}
              </label>
            ))}
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Departure time</h3>
            <button type="button" onClick={()=>setTimeFilters(t=>({...t, early:!t.early}))} className={`w-full text-left text-sm px-3 py-1.5 rounded-lg border ${timeFilters.early?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>12:01 - 18:00</button>
            <button type="button" onClick={()=>setTimeFilters(t=>({...t, afterEvening:!t.afterEvening}))} className={`w-full text-left text-sm px-3 py-1.5 rounded-lg border ${timeFilters.afterEvening?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}>After 18:00</button>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Fare</h3>
            <div className="flex items-center gap-2">
              <input type="number" name="minFare" value={filters.minFare} onChange={handleFilterChange} placeholder="Min" className="w-1/2 text-sm border rounded-lg px-2 py-1" />
              <input type="number" name="maxFare" value={filters.maxFare} onChange={handleFilterChange} placeholder="Max" className="w-1/2 text-sm border rounded-lg px-2 py-1" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Options</h3>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="instant" checked={filters.instant} onChange={(e)=>handleFilterChange({target:{name:'instant', value:e.target.checked}})} /> Instant booking</label>
            <button type="button" onClick={()=>{ setFilters(f=>({...f, minFare:'', maxFare:'', instant:false, sort:'earliest'})); setTimeFilters({early:false, afterEvening:false}); }} className="text-xs text-blue-600 hover:underline">Clear all</button>
          </div>
        </aside>
        {/* Ride list */}
        <div className="flex-1">
          {success && <div className="flex items-center bg-green-100 text-green-800 p-2 rounded mb-4 text-xs"><FaCheckCircle className="mr-2" />{success}</div>}
          {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-xs">{error}</div>}
          {visible.length === 0 && !error && <div className="text-gray-500 text-sm py-10 text-center bg-white rounded-xl border">No matching rides.</div>}
          <div className="space-y-4">
        {visible.map(ride => {
          const isFull = ride.availableSeats === 0 || (ride.status && ride.status !== 'Active');
          const isOwn = ride.ownerEmpId === empId;
          const hasJoined = ride.joinedEmployees?.some(e => e.empId === empId);
          const isPending = !ride.instantBookingEnabled && ride.pendingEmployees?.some(e => e.empId === empId);
          const insufficientSeats = (ride.availableSeats || 0) < (filters.passengers || 1);
          const totalFare = ride.fare ? (ride.fare * (filters.passengers || 1)) : 0;
          return (
            <div key={ride.id} className={`bg-blue-50 rounded-xl p-4 flex flex-col border-2 transition-all ${(isFull||insufficientSeats)? 'border-red-300 opacity-60' : isOwn? 'border-yellow-300 opacity-80' : 'border-green-300 hover:shadow-2xl'}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 border-2 border-blue-400 shadow">{getInitials(ride.ownerName)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-500" /> {ride.origin}
                    <span className="mx-1 text-gray-400">→</span>
                    {ride.destination}
                  </div>
                  <div className="text-gray-600 text-[11px] mt-1 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-blue-500" /> {ride.date}</span>
                    <span className="inline-flex items-center gap-1"><FaClock className="text-yellow-500" /> {ride.arrivalTime}</span>
                    <span className="inline-flex items-center gap-1"><FaCar className="text-indigo-500" /> {ride.carDetails}</span>
                    <span className="inline-flex items-center gap-1"><FaChair className="text-pink-500" /> {ride.availableSeats} left</span>
                    {ride.fare && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">₹{ride.fare}/seat</span>}
                    {ride.fare && (filters.passengers||1) > 1 && !insufficientSeats && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full" title="Total fare for selected passengers">₹{totalFare} total</span>}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isOwn?'bg-yellow-100 text-yellow-700':(isFull||insufficientSeats)?'bg-red-100 text-red-700':hasJoined?'bg-green-100 text-green-700':isPending?'bg-indigo-100 text-indigo-700':'bg-green-100 text-green-700'}`}>
                  {isOwn? 'Your Ride' : (isFull? (ride.status && ride.status!=='Active'? ride.status : 'Full') : insufficientSeats? 'Not enough seats' : hasJoined? 'Joined': isPending? 'Pending':'Available')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700" title={ride.instantBookingEnabled? 'Auto join enabled':'Owner reviews join requests'}>
                  {ride.instantBookingEnabled? 'Instant':'Review'}
                </span>
                <span className="text-[11px] text-blue-700 font-medium">Owner: {ride.ownerName} ({ride.ownerEmpId})</span>
              </div>
              {full && ride.joinedEmployees && ride.joinedEmployees.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center text-blue-600 font-semibold text-[11px] mb-1"><FaUserFriends className="mr-1" /> Joined:</div>
                  <ul className="ml-5 list-disc text-[11px] text-gray-600 space-y-0.5">
                    {ride.joinedEmployees.map(emp => <li key={emp.empId}>{emp.name} ({emp.empId})</li>)}
                  </ul>
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  disabled={isFull || insufficientSeats || isOwn || hasJoined || isPending}
                  onClick={() => joinRide(ride.id, ride)}
                  className={`px-4 py-1.5 rounded text-xs font-semibold ${(isFull||insufficientSeats||isOwn||hasJoined||isPending)? 'bg-gray-300 text-gray-500 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >{isOwn? 'Your Ride': isFull? 'Full': insufficientSeats? 'Seats < need': hasJoined? 'Joined': isPending? 'Pending': (ride.fare? `Join ₹${totalFare}`:'Join')}</button>
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
}
