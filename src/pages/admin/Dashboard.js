import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUsers, FaCarSide, FaChevronRight, FaClock, FaTools } from "react-icons/fa";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

// Reusable status badge helper
const StatusBadge = ({ label, color }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-${color}-100 text-${color}-700`}>{label}</span>
);

function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    // Removed unused sidebar open state
    const [employees, setEmployees] = useState([]);
    const [rides, setRides] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [counts, setCounts] = useState({ employees: 0, rides: 0, pendingVehicles: 0 });
    const [error, setError] = useState(null);
    const [healthOpen, setHealthOpen] = useState(false);
    const [healthLoading, setHealthLoading] = useState(false);
    const [healthData, setHealthData] = useState([]); // [{service,status,latency}]

    const adminName = localStorage.getItem("name") || "Admin";
    // Removed unused adminEmail
    const lastLogin = useMemo(() => localStorage.getItem("lastLogin") || new Date().toLocaleString(), []);

    useEffect(() => {
        localStorage.setItem("lastLogin", new Date().toLocaleString());
        const fetchAll = async () => {
            try {
                const [empCount, rideCount, empList, rideList, vehicleList] = await Promise.all([
                    api.get("/admin/employees/count").catch(() => ({ data: { count: 0 } })),
                    api.get("/admin/rides/count").catch(() => ({ data: { count: 0 } })),
                    api.get("/admin/employees").catch(() => ({ data: [] })),
                    api.get("/admin/rides").catch(() => ({ data: [] })),
                    api.get("/admin/vehicles").catch(() => ({ data: [] }))
                ]);
                setEmployees(empList.data || []);
                setRides(rideList.data || []);
                const vList = vehicleList.data || [];
                setVehicles(vList);
                setCounts({
                    employees: empCount.data.count || (empList.data?.length || 0),
                    rides: rideCount.data.count || (rideList.data?.length || 0),
                    pendingVehicles: vList.filter(v => v.status === 'PENDING').length
                });
            } catch (e) {
                setError("Failed to load dashboard data.");
            } finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    const fetchHealth = async () => {
        setHealthLoading(true);
        setHealthOpen(true);
        const endpoints = [
            { service: 'admin-service', url: '/admin/health' },
            { service: 'auth-service', url: '/auth/health' },
            { service: 'employee-service', url: '/employee/health' },
            { service: 'ride-service', url: '/ride/health' },
            { service: 'api-gateway', url: '/gateway/health' }
        ];
        const results = [];
        for (const ep of endpoints) {
            const start = performance.now();
            try {
                const res = await api.get(ep.url, { timeout: 5000 });
                results.push({
                    service: ep.service,
                    status: (res.data?.status || 'UNKNOWN').toUpperCase(),
                    latency: Math.round(performance.now() - start)
                });
            } catch (e) {
                results.push({ service: ep.service, status: 'DOWN', latency: null });
            }
        }
        setHealthData(results.sort((a,b)=> a.service.localeCompare(b.service)));
        setHealthLoading(false);
    };

    // Removed unused logout handler

    const recentEmployees = useMemo(() => employees.slice(-5).reverse(), [employees]);
    const recentRides = useMemo(() => rides.slice(-5).reverse(), [rides]);
    const pendingVehicles = useMemo(() => vehicles.filter(v => v.status === 'PENDING').slice(0,5), [vehicles]);

    // Utility for initials
    const initials = (n) => (n||'?').split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);

    if (loading) return <AdminLayout heading="Dashboard"><div className="text-orange-600 font-semibold animate-pulse text-sm">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout heading="Dashboard"><div className="text-red-600 text-sm">{error}</div></AdminLayout>;

    return (
        <AdminLayout heading={`Welcome, ${adminName.split(' ')[0]}`} subheading={`Last login: ${lastLogin}`}>
            <section className="w-full grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-10">
                    <div onClick={()=>navigate('/admin/employees')} className="card card-gradient-blue cursor-pointer flex items-center gap-4">
                        <div className="metric-pill"><small>Total</small>{counts.employees}<FaUsers className="metric-icon"/></div>
                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-subtle font-semibold">Employees</p>
                            <h3 className="text-lg font-bold text-indigo-700">Directory</h3>
                            <p className="text-[10px] text-subtle mt-1">All registered employees</p>
                        </div>
                    </div>
                    <div onClick={()=>navigate('/admin/rides')} className="card card-gradient-green cursor-pointer flex items-center gap-4">
                        <div className="metric-pill green"><small>Total</small>{counts.rides}<FaCarSide className="metric-icon"/></div>
                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-subtle font-semibold">Rides</p>
                            <h3 className="text-lg font-bold text-green-700">Activity</h3>
                            <p className="text-[10px] text-subtle mt-1">System-wide rides</p>
                        </div>
                    </div>
                    <div onClick={()=>navigate('/admin/vehicles')} className="card card-gradient-amber cursor-pointer flex items-center gap-4 relative">
                        <div className="metric-pill orange"><small>Pending</small>{counts.pendingVehicles}<FaTools className="metric-icon"/></div>
                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-subtle font-semibold">Vehicles</p>
                            <h3 className="text-lg font-bold text-amber-600">Approvals</h3>
                            <p className="text-[10px] text-subtle mt-1">Awaiting verification</p>
                        </div>
                    </div>
                    <div onClick={fetchHealth} className="card card-gradient-neutral flex items-center gap-4 relative overflow-hidden cursor-pointer group">
                        <div className="metric-pill neutral"><small>{healthLoading? 'Chk..':'Uptime'}</small><FaClock className="metric-icon"/><span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.05rem',fontWeight:700}}>∞</span></div>
                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-subtle font-semibold flex items-center gap-1">System <span className="hidden sm:inline text-[9px] font-normal px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 group-hover:bg-slate-300">click</span></p>
                            <h3 className="text-lg font-bold text-slate-700">Health</h3>
                            <p className="text-[10px] text-subtle mt-1">{healthLoading? 'Checking services...':'Tap to view status'}</p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-slate-200/40" />
                    </div>
            </section>
            {healthOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={()=>setHealthOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 ring-1 ring-slate-200 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-slate-800">System Health</h4>
                            <button onClick={()=>setHealthOpen(false)} className="text-slate-500 hover:text-slate-700 text-sm">Close</button>
                        </div>
                        {healthLoading && <div className="text-xs text-orange-600 animate-pulse">Gathering service status...</div>}
                        {!healthLoading && (
                            <ul className="divide-y divide-slate-100">
                                {healthData.map(h => (
                                    <li key={h.service} className="py-2 flex items-center text-sm gap-3">
                                        <span className="w-36 font-medium text-slate-700 truncate">{h.service}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${h.status==='UP'?'bg-green-100 text-green-700': h.status==='DOWN'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{h.status}</span>
                                        <span className="ml-auto text-[11px] text-slate-500">{h.latency!==null? h.latency+'ms':'—'}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                            <button disabled={healthLoading} onClick={fetchHealth} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50">Retry</button>
                            <button onClick={()=>setHealthOpen(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 text-slate-700 hover:bg-slate-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
            <section className="w-full grid gap-10 grid-cols-1 xl:grid-cols-3 pb-8">
                    {/* Recent Employees */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-indigo-700 flex items-center gap-2"><FaUsers className="text-indigo-400"/> Recent Employees</h3>
                            <Link to="/admin/employees" className="text-xs font-semibold text-indigo-600 hover:underline">View All</Link>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-white/60 backdrop-blur-lg shadow-sm divide-y divide-indigo-50">
                            {recentEmployees.length===0 && <div className="p-4 text-xs text-gray-400">No employees yet.</div>}
                            {recentEmployees.map(e => (
                                <button key={e.empId} onClick={()=>navigate(`/admin/employees/edit/${e.empId}`)} className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center gap-3 group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow">
                                        {initials(e.name||e.empId)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-indigo-700 truncate">{e.name || 'Unknown'}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{e.email}</div>
                                    </div>
                                    <FaChevronRight className="text-indigo-300 group-hover:text-indigo-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Recent Rides */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-green-700 flex items-center gap-2"><FaCarSide className="text-green-400"/> Recent Rides</h3>
                            <Link to="/admin/rides" className="text-xs font-semibold text-green-600 hover:underline">View All</Link>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-green-100 bg-white/60 backdrop-blur-lg shadow-sm divide-y divide-green-50">
                            {recentRides.length===0 && <div className="p-4 text-xs text-gray-400">No rides yet.</div>}
                            {recentRides.map(r => (
                                <div key={r.id} className="px-4 py-3 flex items-center gap-3 hover:bg-green-50 cursor-default group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center text-[11px] font-bold shadow">{(r.origin||'?').slice(0,2).toUpperCase()}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-green-700 truncate">{r.origin} → {r.destination}</div>
                                        <div className="text-[10px] text-gray-500">Seats {r.availableSeats}/{r.totalSeats}</div>
                                    </div>
                                    <StatusBadge label={r.status || 'Active'} color={r.status==='Active'?'green':'gray'} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Pending Vehicles */}
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-amber-700 flex items-center gap-2"><FaTools className="text-amber-400"/> Pending Vehicles</h3>
                            <Link to="/admin/vehicles" className="text-xs font-semibold text-amber-600 hover:underline">Manage</Link>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-amber-100 bg-white/60 backdrop-blur-lg shadow-sm divide-y divide-amber-50">
                            {pendingVehicles.length===0 && <div className="p-4 text-xs text-gray-400">No pending approvals.</div>}
                            {pendingVehicles.map(v => (
                                <button key={v.id || v.empId} onClick={()=>navigate(`/admin/vehicles/${v.empId}`)} className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-center gap-3 group">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-[11px] font-bold shadow">{(v.make||'?').slice(0,2).toUpperCase()}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-amber-700 truncate">{v.make} {v.model}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{v.registrationNumber}</div>
                                    </div>
                                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold">PENDING</span>
                                    <FaChevronRight className="text-amber-300 group-hover:text-amber-500" />
                                </button>
                            ))}
                        </div>
                    </div>
            </section>
        </AdminLayout>
    );
}

export default AdminDashboard;