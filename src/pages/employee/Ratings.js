import React, { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import PageContainer from '../../components/PageContainer';
import { FaStar, FaSync, FaSearch } from 'react-icons/fa';

const labelsOrder = ["Outstanding","Good","Okay","Poor","Very disappointing"];

export default function Ratings() {
  const empId = localStorage.getItem('empId');
  const [tab, setTab] = useState('received');
  const [summary, setSummary] = useState(null);
  const [received, setReceived] = useState([]);
  const [given, setGiven] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!empId) return;
    setLoading(true); setError('');
    try {
      const [sumRes, recRes, givRes] = await Promise.all([
        api.get(`/ride/ratings/summary/${empId}`),
        api.get(`/ride/ratings/received/${empId}`),
        api.get('/ride/ratings/given')
      ]);
      setSummary(sumRes.data); setReceived(recRes.data||[]); setGiven(givRes.data||[]);
    } catch { setError('Failed to load ratings'); }
    finally { setLoading(false); }
  }, [empId]);
  useEffect(()=>{ load(); }, [load]);

  const filtered = useMemo(()=>{
    const list = tab==='received'? received : given;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(r=> (r.comment||'').toLowerCase().includes(q) || (r.label||'').toLowerCase().includes(q));
  }, [tab, received, given, search]);

  const starBar = (value) => {
    if (!summary) return null;
    const total = summary.total || 0;
    const pct = total ? Math.round((value/total)*100) : 0;
    return <div className="h-2 w-full bg-gray-100 rounded overflow-hidden"><div className="h-full bg-yellow-400" style={{width:pct+'%'}}/></div>;
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-2xl border border-yellow-100 shadow p-6 md:p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#054652]">Ratings</h1>
            <p className="text-xs text-gray-500">Your reputation and feedback</p>
          </div>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button onClick={()=>setTab('received')} className={`px-4 py-1 rounded-full text-xs font-semibold ${tab==='received'?'bg-white shadow text-[#054652]':'text-gray-500'}`}>Received</button>
              <button onClick={()=>setTab('given')} className={`px-4 py-1 rounded-full text-xs font-semibold ${tab==='given'?'bg-white shadow text-[#054652]':'text-gray-500'}`}>Given</button>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search comments" className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:border-yellow-400 text-xs" />
            </div>
            <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg bg-[#054652] hover:bg-[#043f49] text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50"><FaSync className={`text-[10px] ${loading?'animate-spin':''}`} />Refresh</button>
          </div>
        </div>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-2 rounded">{error}</div>}

        {tab==='received' && summary && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-bold text-[#054652]">{summary.average.toFixed(1)}</span>
                <span className="text-sm text-gray-500 mb-1">/5</span>
              </div>
              <div className="flex mb-2">
                {Array.from({length:5}).map((_,i)=><FaStar key={i} className={`h-5 w-5 ${(i < Math.round(summary.average))?'text-yellow-400':'text-gray-300'}`} />)}
              </div>
              <div className="text-[11px] text-gray-500">{summary.total} ratings</div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-3">
              {[5,4,3,2,1].map(s => {
                const map = {5:summary.five,4:summary.four,3:summary.three,2:summary.two,1:summary.one};
                return (
                  <div key={s} className="flex items-center gap-2 text-[11px]">
                    <span className="w-10 text-right font-semibold">{s}★</span>
                    {starBar(map[s]||0)}
                    <span className="w-10 text-right">{map[s]||0}</span>
                  </div>
                );
              })}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {labelsOrder.map(lbl => (
                  <div key={lbl} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1 text-[10px] border border-gray-100">
                    <span>{lbl}</span>
                    <span className="font-semibold">{summary.labelBreakdown?.[lbl]||0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? <div className="space-y-3">{[...Array(6)].map((_,i)=><div key={i} className="h-20 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 animate-pulse"/> )}</div> : (
          <ul className="space-y-3">
            {filtered.map(r => (
              <li key={r.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs text-[#054652] font-semibold">
                  <span>{r.stars}★</span>
                  {r.label && <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200 text-[10px]">{r.label}</span>}
                  <span className="text-gray-400 font-normal">Ride #{r.rideId}</span>
                </div>
                {r.comment && <p className="text-[11px] text-gray-600 leading-snug">{r.comment}</p>}
                <div className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
              </li>
            ))}
            {!filtered.length && !loading && <div className="text-center text-xs text-gray-400 py-10">No ratings.</div>}
          </ul>
        )}
      </div>
    </PageContainer>
  );
}
