import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaUserShield, FaUsers, FaCarSide, FaSignOutAlt, FaChevronRight,
    FaBars, FaTimes, FaClock, FaTools, FaClipboardCheck
} from "react-icons/fa";
import api from "../../api/axios";
import AdminLayout from "../../components/AdminLayout";

// Reusable status badge helper
const StatusBadge = ({ label, color }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold bg-${color}-100 text-${color}-700`}>{label}</span>
);

function AdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [rides, setRides] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [counts, setCounts] = useState({ employees: 0, rides: 0, pendingVehicles: 0 });
    const [error, setError] = useState(null);

    const adminName = localStorage.getItem("name") || "Admin";
    const adminEmail = localStorage.getItem("email") || "admin@company.com";
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

    const handleLogout = () => { localStorage.clear(); navigate("/login"); };

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
                    <div className="card card-gradient-neutral flex items-center gap-4">
                        <div className="metric-pill neutral"><small>Uptime</small><FaClock className="metric-icon"/><span style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',fontWeight:700}}>∞</span></div>
                        <div className="flex-1">
                            <p className="text-[11px] uppercase tracking-wide text-subtle font-semibold">System</p>
                            <h3 className="text-lg font-bold text-slate-700">Health</h3>
                            <p className="text-[10px] text-subtle mt-1">All services active</p>
                        </div>
                    </div>
            </section>
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