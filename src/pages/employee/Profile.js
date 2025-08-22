import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
// import EmployeeLayout from '../../components/EmployeeLayout'; // deprecated
import PageContainer from '../../components/PageContainer';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaIdBadge, FaMapMarkerAlt, FaSave, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const empId = localStorage.getItem('empId');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [profile, setProfile] = useState({
    empId: '', name: '', email: '', phone: '', department: '', designation: '', officeLocation: '', gender: '', bio: ''
  });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get(`/employee/${empId}`);
      setProfile(p => ({ ...p, ...res.data }));
    } catch {
      setError('Failed to load profile');
    } finally { setLoading(false); }
  }, [empId]);

  useEffect(()=>{ if(!empId){ navigate('/login'); return; } load(); }, [empId, navigate, load]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const save = async () => {
    setSaving(true); setError(''); setMsg('');
    try {
  await api.put(`/employee/${empId}`, profile);
  // Persist updated name locally for dashboards etc.
  if (profile.name) localStorage.setItem('name', profile.name);
  setMsg('Profile updated');
      setEditing(false);
    } catch { setError('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <PageContainer><h1 className='text-xl font-semibold mb-4'>My Profile</h1><div className='text-blue-700 text-sm'>Loading profile...</div></PageContainer>;

  return (
    <PageContainer>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold tracking-tight'>My Profile</h1>
        <p className='text-xs text-gray-500 mt-1'>View and update your personal information</p>
      </div>
      <div className='max-w-3xl mx-auto bg-white/90 backdrop-blur border border-indigo-100 shadow-xl rounded-2xl p-6 md:p-10'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl md:text-3xl font-extrabold text-indigo-700 flex items-center gap-2'><FaUser/> My Profile</h1>
          {!editing ? <button onClick={()=>setEditing(true)} className='px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2'><FaEdit/> Edit</button> : (
            <div className='flex gap-2'>
              <button onClick={save} disabled={saving} className='px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60'><FaSave/>{saving?'Saving...':'Save'}</button>
              <button onClick={()=>{ setEditing(false); load(); }} className='px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold'>Cancel</button>
            </div>) }
        </div>
        {error && <div className='mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm'>{error}</div>}
        {msg && <div className='mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm'>{msg}</div>}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Field icon={<FaIdBadge/>} label='Employee ID'>
            <span className='font-mono text-sm'>{profile.empId}</span>
          </Field>
          <Field icon={<FaUser/>} label='Full Name'>
            {editing ? <input name='name' value={profile.name} onChange={handleChange} className='input'/> : <span>{profile.name}</span>}
          </Field>
          <Field icon={<FaEnvelope/>} label='Email (locked)'>
            <span className='opacity-70'>{profile.email}</span>
          </Field>
          <Field icon={<FaPhone/>} label='Phone'>
            {editing ? <input name='phone' value={profile.phone||''} onChange={handleChange} className='input' placeholder='e.g. +91 98765 43210'/> : <span>{profile.phone||'—'}</span>}
          </Field>
          <Field icon={<FaBuilding/>} label='Department'>
            {editing ? <input name='department' value={profile.department||''} onChange={handleChange} className='input'/> : <span>{profile.department||'—'}</span>}
          </Field>
          <Field icon={<FaBuilding/>} label='Designation'>
            {editing ? <input name='designation' value={profile.designation||''} onChange={handleChange} className='input'/> : <span>{profile.designation||'—'}</span>}
          </Field>
          <Field icon={<FaMapMarkerAlt/>} label='Office Location'>
            {editing ? <input name='officeLocation' value={profile.officeLocation||''} onChange={handleChange} className='input'/> : <span>{profile.officeLocation||'—'}</span>}
          </Field>
          <Field icon={<FaUser/>} label='Gender'>
            {editing ? <select name='gender' value={profile.gender||''} onChange={handleChange} className='input'><option value=''>Select</option><option>Male</option><option>Female</option><option>Other</option></select> : <span>{profile.gender||'—'}</span>}
          </Field>
          <div className='md:col-span-2'>
            <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-1'><FaUser/> Bio</label>
            {editing ? <textarea name='bio' value={profile.bio||''} onChange={handleChange} rows={3} className='w-full rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-0 text-sm p-3 resize-none' placeholder='Short introduction (max 240 chars)' maxLength={240}/> : (
              <div className='text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]'>{profile.bio || 'No bio provided.'}</div>
            )}
            {editing && <div className='text-[10px] text-gray-400 mt-1 text-right'>{(profile.bio||'').length}/240</div>}
          </div>
        </div>
      </div>
  </PageContainer>
  );
}

const Field = ({ icon, label, children }) => (
  <div>
    <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2 mb-1'>{icon} {label}</label>
    <div className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2 min-h-[42px]'>
      {children}
    </div>
  </div>
);

export default Profile;
