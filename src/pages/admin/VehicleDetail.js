import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCarSide, FaCheck, FaTimes } from 'react-icons/fa';

function VehicleDetail(){
  const { empId } = useParams();
  const [vehicle,setVehicle]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [rejectionReason,setRejectionReason]=useState('');
  const navigate = useNavigate();

  useEffect(()=>{ api.get(`/admin/vehicles/${empId}`).then(r=> { setVehicle(r.data); setRejectionReason(r.data.rejectionReason||'');}).catch(()=> setError('Vehicle not found')).finally(()=> setLoading(false)); },[empId]);

  const act = async(status)=>{
    if(!vehicle || !vehicle.id) return;
    if(status==='REJECTED' && !rejectionReason.trim()) { alert('Provide rejection reason'); return; }
    try{
      const body = { status, rejectionReason: status==='REJECTED'? rejectionReason: null };
      const res = await api.put(`/admin/vehicles/${vehicle.id}/verify`, body);
      setVehicle(res.data);
      alert('Updated');
    }catch{ alert('Failed'); }
  };

  if(loading) return <div className='p-10 text-center'>Loading...</div>;
  if(error) return <div className='p-10 text-center text-red-600'>{error}</div>;
  if(!vehicle) return null;

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-6'>
      <button onClick={()=>navigate('/admin/vehicles')} className='mb-4 flex items-center gap-2 text-orange-700 hover:underline'><FaArrowLeft/> Back</button>
      <div className='bg-white max-w-2xl mx-auto p-8 rounded-2xl shadow-xl'>
        <h2 className='text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700'><FaCarSide/> Vehicle of {vehicle.empId}</h2>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div><strong>Make:</strong> {vehicle.make||'-'}</div>
          <div><strong>Model:</strong> {vehicle.model||'-'}</div>
          <div><strong>Color:</strong> {vehicle.color||'-'}</div>
          <div><strong>Registration:</strong> {vehicle.registrationNumber||'-'}</div>
          <div><strong>Capacity:</strong> {vehicle.capacity||'-'}</div>
          <div><strong>Status:</strong> <span className={'px-2 py-1 rounded text-xs '+(vehicle.status==='APPROVED'?'bg-green-100 text-green-700': vehicle.status==='REJECTED'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700')}>{vehicle.status}</span></div>
        </div>
        {vehicle.proofImageUrl && <div className='mt-6'>
          <div className='font-semibold mb-2'>Proof Image</div>
          <img alt='proof' src={vehicle.proofImageUrl} className='max-h-64 object-contain border rounded'/>
        </div>}
        <div className='mt-6'>
          <label className='block font-medium text-orange-700 mb-1'>Rejection Reason</label>
          <textarea className='w-full border border-orange-300 rounded px-3 py-2' rows={3} value={rejectionReason} onChange={e=>setRejectionReason(e.target.value)} placeholder='Provide reason if rejecting'/>
        </div>
        <div className='flex gap-4 mt-6'>
          <button onClick={()=>act('APPROVED')} disabled={vehicle.status==='APPROVED'} className='flex-1 bg-green-600 disabled:opacity-50 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-green-700'><FaCheck/> Approve</button>
          <button onClick={()=>act('REJECTED')} disabled={vehicle.status==='REJECTED'} className='flex-1 bg-red-600 disabled:opacity-50 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-red-700'><FaTimes/> Reject</button>
        </div>
      </div>
    </div>
  );
}
export default VehicleDetail;
