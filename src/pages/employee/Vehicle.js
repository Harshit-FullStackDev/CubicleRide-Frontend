import React, { useEffect, useState } from 'react';
import { FaCar, FaUpload, FaCheckCircle, FaTimesCircle, FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import api from '../../api/axios';
import EmployeeLayout from '../../components/EmployeeLayout';

// Vehicle submission & status page
export default function VehiclePage() {
  const [form, setForm] = useState({ make:'', model:'', color:'', registrationNumber:'', capacity:4 });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState(null); // {status, rejectionReason, ...}
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchVehicle(); }, []);

  const fetchVehicle = async () => {
    setMessage('');
    try {
      const res = await api.get('/vehicle/my');
      setStatus(res.data);
      setForm({
        make: res.data.make || '',
        model: res.data.model || '',
        color: res.data.color || '',
        registrationNumber: res.data.registrationNumber || '',
        capacity: res.data.capacity || 4
      });
      setImagePreview(res.data.proofImageUrl || '');
    } catch { /* ignore if not found */ }
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setMessage('');
    try {
      // store image in localStorage (demo only) and send meta + dataURL
      let proofImageName = status?.proofImageName;
      let proofImageUrl = status?.proofImageUrl;
      if (imageFile && imagePreview) {
        proofImageName = imageFile.name;
        proofImageUrl = imagePreview;
        localStorage.setItem('vehicleProof_'+proofImageName, imagePreview);
      }
      const res = await api.post('/vehicle', { ...form, proofImageName, proofImageUrl });
      setStatus(res.data);
      setMessage('Vehicle submitted. Status: '+res.data.status);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit vehicle');
    } finally { setLoading(false); }
  };

  const statusBadge = () => {
    if (!status) return null;
    const s = status.status;
    let cls = 'bg-gray-200 text-gray-700';
    if (s === 'APPROVED') cls = 'bg-green-100 text-green-700';
    else if (s === 'REJECTED') cls = 'bg-red-100 text-red-700';
    else if (s === 'PENDING') cls = 'bg-yellow-100 text-yellow-700';
    return <span className={'px-3 py-1 rounded-full text-xs font-semibold '+cls}>{s}</span>;
  };

  return (
    <EmployeeLayout heading='My Vehicle'>
      <div className="bg-white/90 shadow-2xl rounded-2xl p-8 max-w-xl w-full mx-auto">
  {/* Back button removed as per UI update */}
        <h2 className="text-3xl font-bold text-blue-700 mb-2 flex items-center gap-2"><FaCar/> Vehicle Verification</h2>
        <p className="text-gray-500 mb-4 text-sm">Provide your car details and proof image. An admin will verify it. Only approved vehicles can publish rides.</p>
        {status && (
          <div className="mb-4 flex items-center gap-3 text-sm">
            {statusBadge()}
            {status.status === 'APPROVED' && <span className="flex items-center text-green-700"><FaCheckCircle className="mr-1"/>Approved. You can offer rides.</span>}
            {status.status === 'PENDING' && <span className="flex items-center text-yellow-700"><FaSyncAlt className="mr-1 animate-spin"/>Waiting for approval.</span>}
            {status.status === 'REJECTED' && <span className="flex items-center text-red-600"><FaTimesCircle className="mr-1"/>Rejected: {status.rejectionReason}</span>}
          </div>
        )}
        {message && <div className="mb-4 text-sm text-blue-700 bg-blue-50 p-3 rounded">{message}</div>}
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Make</label>
              <input name="make" value={form.make} onChange={handleChange} required className="w-full bg-blue-50 px-4 py-2 rounded outline-none" placeholder="Maruti" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Model</label>
              <input name="model" value={form.model} onChange={handleChange} required className="w-full bg-blue-50 px-4 py-2 rounded outline-none" placeholder="Swift" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Color</label>
              <input name="color" value={form.color} onChange={handleChange} className="w-full bg-blue-50 px-4 py-2 rounded outline-none" placeholder="White" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Registration No.</label>
              <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} required className="w-full bg-blue-50 px-4 py-2 rounded outline-none" placeholder="HR26AB1234" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Capacity (Seats)</label>
              <input type="number" name="capacity" min={2} max={8} value={form.capacity} onChange={handleChange} required className="w-full bg-blue-50 px-4 py-2 rounded outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Proof Image (RC / Insurance)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer bg-blue-50 px-4 py-2 rounded hover:bg-blue-100 text-blue-700 font-semibold"><FaUpload className="mr-2"/>Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden"/></label>
              {imagePreview && <img src={imagePreview} alt="preview" className="h-20 rounded shadow border" />}
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><FaInfoCircle/> Image stored locally (demo). Clearing browser storage removes it.</p>
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold flex items-center justify-center gap-2">{loading && <FaSyncAlt className="animate-spin"/>} {status ? 'Update Vehicle' : 'Submit Vehicle'}</button>
        </form>
      </div>
    </EmployeeLayout>
  );
}
