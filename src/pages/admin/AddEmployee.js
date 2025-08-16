import React, { useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

function AddEmployee(){
  const navigate = useNavigate();
  const [form,setForm] = useState({empId:'', name:'', email:'', password:'Default@123'});
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  const handleChange = e => setForm({...form,[e.target.name]: e.target.value});

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      // Single call: auth/register already creates both user + employee profile (via auth-service Feign)
      await api.post('/auth/register', { ...form, role: 'EMPLOYEE'});
      alert('Employee created. Verification email / OTP sent.');
      navigate('/admin/employees');
    } catch(err){
      const msg = err?.response?.data?.message || err?.response?.data || (err.message === 'canceled' ? 'Request canceled' : 'Failed to create employee');
      setError(msg);
    } finally { setLoading(false);} }

  return (
    <AdminLayout heading='Add Employee'>
      <form onSubmit={handleSubmit} className='bg-white/90 w-full max-w-md p-8 rounded-2xl shadow-xl mx-auto'>
        <h2 className='text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2'><FaUserPlus/> Add Employee</h2>
        {error && <div className='mb-4 text-red-600 text-sm'>{error}</div>}
        <div className='mb-4'>
          <label className='block font-medium mb-1 text-blue-700'>Employee ID</label>
          <input name='empId' value={form.empId} onChange={handleChange} required className='w-full border border-blue-200 rounded px-3 py-2'/>
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1 text-blue-700'>Name</label>
          <input name='name' value={form.name} onChange={handleChange} required className='w-full border border-blue-200 rounded px-3 py-2'/>
        </div>
        <div className='mb-4'>
          <label className='block font-medium mb-1 text-blue-700'>Email</label>
          <input type='email' name='email' value={form.email} onChange={handleChange} required className='w-full border border-blue-200 rounded px-3 py-2'/>
        </div>
        <div className='mb-6'>
          <label className='block font-medium mb-1 text-blue-700'>Password (temporary)</label>
          <input type='text' name='password' value={form.password} onChange={handleChange} required className='w-full border border-blue-200 rounded px-3 py-2'/>
        </div>
        <button disabled={loading} className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded font-semibold'>{loading? 'Creating...' : 'Create Employee'}</button>
      </form>
    </AdminLayout>
  );
}
export default AddEmployee;
