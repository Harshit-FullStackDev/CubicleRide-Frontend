import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaCarSide, FaCheck, FaTimes, FaSearch, FaArrowLeft } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

function Vehicles(){
  const [vehicles,setVehicles]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [error,setError]=useState(null);
  const navigate = useNavigate();

  useEffect(()=>{ api.get('/admin/vehicles').then(r=> setVehicles(r.data)).catch(()=> setError('Failed to load vehicles')).finally(()=> setLoading(false)); },[]);

  const filtered = vehicles.filter(v => {
    const key = (v.empId+' '+(v.make||'')+' '+(v.model||'')+' '+(v.registrationNumber||'')).toLowerCase();
    return key.includes(search.toLowerCase());
  });

  if(loading) return <AdminLayout heading='Vehicles'><div className='text-orange-600 text-sm animate-pulse'>Loading vehicles...</div></AdminLayout>;
  if(error) return <AdminLayout heading='Vehicles'><div className='text-red-600 text-sm'>{error}</div></AdminLayout>;

  return (
    <AdminLayout heading='Vehicles'>
      <div className='flex items-center justify-between mb-6'>
        <button onClick={()=>navigate('/admin/dashboard')} className='flex items-center gap-2 text-orange-700 hover:underline text-sm'><FaArrowLeft/> Back</button>
        <div className='relative max-w-xs w-full'>
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 text-xs' />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search vehicle...' className='w-full border border-orange-300 rounded px-3 py-2 pl-9 text-sm'/>
        </div>
      </div>
      <div className='mb-4 relative max-w-sm'>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search vehicle...' className='w-full border border-orange-300 rounded px-3 py-2 pl-9'/>
        <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-orange-400' />
      </div>
      <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {filtered.map(v => (
          <div key={v.id||v.empId} className='bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-orange-100'>
            <div className='font-semibold text-lg'>{v.make} {v.model}</div>
            <div className='text-sm text-gray-600'>Reg: {v.registrationNumber||'-'}</div>
            <div className='text-sm'>Capacity: {v.capacity||'-'}</div>
            <div className='text-sm'>Employee: {v.empId}</div>
            <div className='mt-2'>Status: <span className={'px-2 py-1 rounded text-xs '+(v.status==='APPROVED'?'bg-green-100 text-green-700': v.status==='REJECTED'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700')}>{v.status}</span></div>
            <button onClick={()=>navigate(`/admin/vehicles/${v.empId}`)} className='mt-auto bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 text-sm'>Manage</button>
          </div>
        ))}
      </div>
  </AdminLayout>
  );
}
export default Vehicles;
