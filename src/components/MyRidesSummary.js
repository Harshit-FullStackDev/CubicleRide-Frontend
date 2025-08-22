import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaChair, FaCar, FaUsers } from 'react-icons/fa';

// Lightweight summary of a user's published & joined rides (active / upcoming)
export default function MyRidesSummary() {
  const empId = localStorage.getItem('empId');
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState([]);
  const [joined, setJoined] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if(!empId) return;
    setLoading(true); setError('');
    try {
      const [pRes, jRes] = await Promise.all([
        api.get('/ride/my-rides'),
        api.get(`/ride/joined/${empId}`)
      ]);
      const now = new Date();
      const upcoming = r => {
        try { return r.status?.toUpperCase() === 'ACTIVE' || new Date(`${r.date}T${r.arrivalTime}`) > now; } catch { return true; }
      };
      setPublished((pRes.data||[]).filter(upcoming));
      setJoined((jRes.data||[]).filter(upcoming));
    } catch { setError('Could not load your rides'); }
    setLoading(false);
  }, [empId]);

  useEffect(()=>{ load(); }, [load]);
  useEffect(() => {
    const refresh = () => load();
    window.addEventListener('ride:updated', refresh);
    return () => window.removeEventListener('ride:updated', refresh);
  }, [load]);

  if(!empId) return null;
  return (
    <div className="rounded-3xl border bg-white/70 backdrop-blur p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Your Rides</h2>
        <button onClick={load} className="text-xs text-orange-600 hover:underline">Refresh</button>
      </div>
      {loading && <div className="text-xs text-blue-600 animate-pulse">Loading...</div>}
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      {!loading && !error && published.length===0 && joined.length===0 && <div className="text-xs text-gray-500">No active or upcoming rides yet.</div>}
      <div className="grid lg:grid-cols-2 gap-4">
        {published.slice(0,3).map(r => (
          <RideCard key={`p-${r.id}`} ride={r} label="Published" />
        ))}
        {joined.slice(0,3).map(r => (
          <RideCard key={`j-${r.id}`} ride={r} label="Joined" joined />
        ))}
      </div>
  {(published.length>3 || joined.length>3) && <p className="mt-3 text-[11px] text-gray-500">Showing first few. Open Manage Rides for full list.</p>}
    </div>
  );
}

function RideCard({ ride, label, joined }) {
  return (
    <div className="relative rounded-2xl bg-blue-50 border border-blue-100 p-4 flex flex-col gap-2 text-[11px]">
      <div className="flex items-center gap-2 font-semibold text-blue-700 text-sm">
        <FaMapMarkerAlt className="text-green-500" /> {ride.origin}
        <span className="mx-1 text-gray-400">→</span>
        {ride.destination}
      </div>
      <div className="flex flex-wrap gap-3 text-gray-600">
        <span className="inline-flex items-center gap-1"><FaCalendarAlt className="text-blue-500" /> {ride.date}</span>
        <span className="inline-flex items-center gap-1"><FaClock className="text-yellow-500" /> {ride.arrivalTime}</span>
        <span className="inline-flex items-center gap-1"><FaChair className="text-pink-500" /> {ride.availableSeats}/{ride.totalSeats}</span>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${label==='Published'?'bg-indigo-100 text-indigo-700':'bg-amber-100 text-amber-700'}`}>{label}</span>
        {ride.instantBookingEnabled !== undefined && (
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">{ride.instantBookingEnabled? 'Instant':'Review'}</span>
        )}
        {joined && <span className="inline-flex items-center gap-1 text-[10px] text-green-600"><FaUsers /> Joined</span>}
        {ride.carDetails && <span className="inline-flex items-center gap-1 text-[10px] text-gray-500"><FaCar /> {ride.carDetails}</span>}
      </div>
    </div>
  );
}
