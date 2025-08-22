import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaChair, FaCheckCircle, FaUserFriends } from 'react-icons/fa';

export default function JoinRideList({ full = false, overlay = false, limit }) {
  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({ pickup: localStorage.getItem('pickup') || '', drop: localStorage.getItem('drop') || '' });
  const empId = localStorage.getItem('empId');

  const applyFilters = useCallback((data, f) => {
    const { pickup, drop } = f;
    return (pickup || drop) ? data.filter(r => (!pickup || r.origin === pickup) && (!drop || r.destination === drop)) : data;
  }, []);

  const loadRides = useCallback(async (activeFilters = filters) => {
    try {
      const { data } = await api.get('/ride/active');
      setRides(applyFilters(data, activeFilters));
    } catch { setError('Failed to load rides.'); }
  }, [applyFilters, filters]);

  useEffect(() => { if(empId){ api.get('/locations').then(r=>setLocations(r.data)).catch(()=>{}); loadRides(); } }, [empId, loadRides]);
  useEffect(() => { loadRides(); }, [filters.pickup, filters.drop, loadRides]);

  const handleFilterChange = (e) => {
    const next = { ...filters, [e.target.name]: e.target.value };
    setFilters(next);
    localStorage.setItem('pickup', next.pickup);
    localStorage.setItem('drop', next.drop);
  };

  const joinRide = async (id, ride) => {
    setError(''); setSuccess('');
    try {
      await api.post(`/ride/join/${id}`, { empId });
      setSuccess(ride.instantBookingEnabled ? `Joined ${ride.origin} → ${ride.destination}` : `Request sent for ${ride.origin} → ${ride.destination}`);
      setRides(prev => prev.map(r => r.id === id ? { ...r, availableSeats: Math.max(0,(r.availableSeats||0)-1), joinedEmployees: [...(r.joinedEmployees||[]), { empId }] } : r));
      api.get('/ride/active').then(({data}) => setRides(applyFilters(data, filters))).catch(()=>{});
    } catch { setError('Failed to join ride.'); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const visible = limit ? rides.slice(0, limit) : rides;

  return (
    <div className={overlay ? 'max-h-[70vh] overflow-y-auto pr-1 custom-scroll' : ''}>
      {full && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
            <FaMapMarkerAlt className="text-green-500" />
            <select name="pickup" value={filters.pickup} onChange={handleFilterChange} className="bg-transparent w-full outline-none text-sm">
              <option value="">Pickup</option>
              {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
            <FaMapMarkerAlt className="text-red-500" />
            <select name="drop" value={filters.drop} onChange={handleFilterChange} className="bg-transparent w-full outline-none text-sm">
              <option value="">Drop</option>
              {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
            </select>
          </div>
        </div>
      )}
      {!full && <p className="text-xs text-gray-500 mb-3">Showing latest rides{filters.pickup||filters.drop?` for ${filters.pickup||'any'} → ${filters.drop||'any'}`:''}</p>}
      {success && <div className="flex items-center bg-green-100 text-green-800 p-2 rounded mb-3 text-xs"><FaCheckCircle className="mr-2" />{success}</div>}
      {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-3 text-xs">{error}</div>}
      {visible.length === 0 && !error && <div className="text-gray-500 text-sm py-6 text-center">No matching rides.</div>}
      <div className="space-y-4">
        {visible.map(ride => {
          const isFull = ride.availableSeats === 0 || (ride.status && ride.status !== 'Active');
          const isOwn = ride.ownerEmpId === empId;
          const hasJoined = ride.joinedEmployees?.some(e => e.empId === empId);
          const isPending = !ride.instantBookingEnabled && ride.pendingEmployees?.some(e => e.empId === empId);
          return (
            <div key={ride.id} className={`bg-blue-50 rounded-xl p-4 flex flex-col border-2 transition-all ${isFull? 'border-red-300 opacity-60' : isOwn? 'border-yellow-300 opacity-80' : 'border-green-300 hover:shadow-2xl'}`}>
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
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isOwn?'bg-yellow-100 text-yellow-700':isFull?'bg-red-100 text-red-700':hasJoined?'bg-green-100 text-green-700':isPending?'bg-indigo-100 text-indigo-700':'bg-green-100 text-green-700'}`}>
                  {isOwn? 'Your Ride' : isFull? (ride.status && ride.status!=='Active'? ride.status : 'Full'): hasJoined? 'Joined': isPending? 'Pending':'Available'}
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
                  disabled={isFull || isOwn || hasJoined || isPending}
                  onClick={() => joinRide(ride.id, ride)}
                  className={`px-4 py-1.5 rounded text-xs font-semibold ${ (isFull||isOwn||hasJoined||isPending)? 'bg-gray-300 text-gray-500 cursor-not-allowed':'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >{isOwn? 'Your Ride': isFull? 'Full': hasJoined? 'Joined': isPending? 'Pending':'Join'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
