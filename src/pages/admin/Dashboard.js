import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaUserShield, FaUsers, FaCarSide, FaSignOutAlt, FaChevronRight,
    FaBars, FaTimes, FaClock, FaTools, FaClipboardCheck
} from "react-icons/fa";
import api from "../../api/axios";

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

    if (loading) return <div className="flex items-center justify-center min-h-screen text-orange-600 font-semibold animate-pulse">Loading Admin Dashboard...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-600">{error}</div>;

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-amber-100 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply bg-[radial-gradient(circle_at_20%_20%,#fcd34d,transparent_60%),radial-gradient(circle_at_80%_80%,#fb923c,transparent_55%)]" />
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-68 md:w-64 z-30 p-6 flex flex-col gap-8 bg-white/70 backdrop-blur-xl border-r border-orange-200 shadow-xl transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="flex items-center gap-4 mb-2">
                    <img src="/OMLogo.svg" alt="OrangeMantra" className="h-12 w-auto" />
                </div>
                <nav className="flex flex-col gap-1 text-sm font-medium">
                    <button onClick={() => navigate('/admin/dashboard')} className="nav-link nav-link-active"><FaUserShield /> <span>Dashboard</span></button>
                    <button onClick={() => navigate('/admin/employees')} className="nav-link"><FaUsers /> <span>Employees</span></button>
                    <button onClick={() => navigate('/admin/rides')} className="nav-link"><FaCarSide /> <span>Rides</span></button>
                    <button onClick={() => navigate('/admin/vehicles')} className="nav-link"><FaTools /> <span>Vehicles</span>{counts.pendingVehicles>0 && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">{counts.pendingVehicles}</span>}</button>
                    <button onClick={() => navigate('/admin/employees/add')} className="nav-link"><FaClipboardCheck /> <span>Add Employee</span></button>
                </nav>
                <div className="mt-auto flex flex-col gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700">
                        <div className="font-bold text-xs mb-1">Logged in as</div>
                        <div className="text-sm font-semibold">{adminName}</div>
                        <div className="text-[10px] text-orange-500 truncate">{adminEmail}</div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-danger text-sm font-semibold"><FaSignOutAlt /> Logout</button>
                </div>
            </aside>
            {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}
            {/* Main area */}
            <div className="flex-1 flex flex-col min-h-screen md:ml-64">
                {/* Header */}
                <header className="flex items-center justify-between px-5 md:px-10 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow border-b border-orange-200">
                    <button className="md:hidden text-2xl text-orange-600" onClick={()=>setSidebarOpen(!sidebarOpen)}>{sidebarOpen? <FaTimes/>:<FaBars/>}</button>
                    <div className="flex flex-col">
                        <span className="text-lg md:text-xl font-bold text-orange-700">Welcome, {adminName.split(' ')[0]}</span>
                        <span className="text-[11px] text-gray-400">Last login: {lastLogin}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow cursor-pointer border-2 border-white">{initials(adminName)}</div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl p-4 hidden group-hover:block">
                                <div className="font-bold text-orange-600 mb-1 text-sm">{adminName}</div>
                                <div className="text-[10px] text-gray-500 mb-2">{adminEmail}</div>
                                <button onClick={handleLogout} className="btn btn-danger w-full justify-center text-xs font-semibold"><FaSignOutAlt /> Logout</button>
                            </div>
                        </div>
                    </div>
                </header>
                {/* Metrics */}
                <section className="w-full max-w-7xl mx-auto px-5 md:px-10 mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
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
                {/* Lists */}
                <section className="w-full max-w-7xl mx-auto px-5 md:px-10 mt-10 grid gap-10 grid-cols-1 xl:grid-cols-3 pb-16">
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
            </div>
        </div>
    );
}

export default AdminDashboard;