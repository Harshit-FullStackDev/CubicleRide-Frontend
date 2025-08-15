import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
    FaUser, FaMapMarkerAlt, FaCar, FaChair, FaCalendarAlt, FaClock,
    FaEdit, FaTrash, FaBell, FaCheckCircle, FaSignOutAlt, FaBars, FaTimes, FaPlus, FaUsers, FaTools
} from "react-icons/fa";

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [empName, setEmpName] = useState("");
    const [empEmail, setEmpEmail] = useState("");
    const [empId, setEmpId] = useState("");
    const [publishedRides, setPublishedRides] = useState([]);
    const [joinedRides, setJoinedRides] = useState([]);
    const [stats, setStats] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastLogin, setLastLogin] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [vehicleStatus, setVehicleStatus] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "EMPLOYEE") {
            navigate("/login");
        }
        setEmpName(localStorage.getItem("name") || "Employee");
        setEmpEmail(localStorage.getItem("email") || "employee@company.com");
        const id = localStorage.getItem("empId") || "";
        setEmpId(id);
        setLastLogin(localStorage.getItem("lastLogin") || new Date().toLocaleString());
        fetchDashboardData(id);
        fetchVehicleStatus();
    }, [navigate]);

    const fetchDashboardData = async (empId) => {
        setLoading(true);
        try {
            const [ridesRes, joinedRes] = await Promise.all([
                api.get("/ride/my-rides"),
                api.get(`/ride/joined/${empId}`)
            ]);
            setPublishedRides(ridesRes.data);
            setJoinedRides(joinedRes.data);
            let total = ridesRes.data.length;
            setStats({ total });
            setError(null);
        } catch (err) {
            setError("Failed to load dashboard data.");
        }
        setLoading(false);
    };

    const fetchVehicleStatus = async () => {
        try {
            const res = await api.get('/vehicle/my');
            setVehicleStatus(res.data);
        } catch {
            setVehicleStatus(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleEdit = (id) => {
        navigate(`/employee/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ride?")) return;
        try {
            await api.delete(`/ride/${id}`);
            fetchDashboardData(empId);
        } catch (err) {
            alert("Failed to delete ride.");
        }
    };

    const approveRequest = async (rideId, pendingEmpId) => {
        try {
            await api.post(`/ride/approve/${rideId}`, { empId: pendingEmpId });
            fetchDashboardData(empId);
        } catch { alert('Failed to approve request'); }
    };
    const declineRequest = async (rideId, pendingEmpId) => {
        try {
            await api.post(`/ride/decline/${rideId}`, { empId: pendingEmpId });
            fetchDashboardData(empId);
        } catch { alert('Failed to decline request'); }
    };

    const handleLeave = async (id) => {
        if (!window.confirm("Leave this ride?")) return;
        try {
            await api.post(`/ride/leave/${id}`, { empId });
            fetchDashboardData(empId);
        } catch (err) {
            alert("Failed to leave ride.");
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const formatTime = (timeStr) => timeStr?.slice(0, 5);

    const getInitials = (name) => name.split(" ").map(n => n[0]).join("").toUpperCase();

    // Animated card classes
    const cardAnim = "transition-transform duration-300 ease-out transform hover:scale-[1.015]";
    const glass = "om-glass";

    if (loading) return <div className="flex items-center justify-center min-h-screen text-blue-700 animate-pulse text-xl font-bold">Loading dashboard...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-600 text-lg">{error}</div>;

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
            {/* Background image */}
            <img src="/new-bg.png" alt="background" className="fixed inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none select-none" style={{filter: 'blur(2px)'}} />
            {/* Sidebar */}
            <aside className={`fixed z-30 top-0 left-0 h-full w-64 p-6 flex flex-col gap-8 ${glass} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
                <div className="flex items-center gap-3 mb-8">
                    <img src="/orangemantra%20Logo.png" alt="Logo" className="w-10 h-10 rounded-full shadow-lg border-2 border-blue-200" />
                    <span className="text-2xl font-bold tracking-tight select-none bg-gradient-to-r from-orange-500 to-indigo-500 bg-clip-text text-transparent">Orange<span className='text-blue-400'>Mantra</span></span>
                </div>
                <nav className="flex flex-col gap-2 font-medium">
                    <Link to="/employee/dashboard" className="nav-link nav-link-active"><FaUser /> <span>Dashboard</span></Link>
                    <Link to="/employee/offer" className="nav-link"><FaPlus /> <span>Offer a Ride</span></Link>
                    <Link to="/employee/join" className="nav-link"><FaUsers /> <span>Join a Ride</span></Link>
                    <Link to="/employee/notifications" className="nav-link"><FaBell /> <span>Notifications</span></Link>
                    <Link to="/employee/history/published" className="nav-link"><FaCar /> <span>Published History</span></Link>
                    <Link to="/employee/history/joined" className="nav-link"><FaUsers /> <span>Joined History</span></Link>
                    <Link to="/employee/vehicle" className="nav-link"><FaCar /> <span>My Vehicle</span>{vehicleStatus && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-gray-200">{vehicleStatus.status}</span>}</Link>
                    <Link to="/employee/profile" className="nav-link"><FaUser /> <span>My Profile</span></Link>
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                    <button onClick={handleLogout} className="btn btn-danger font-semibold"><FaSignOutAlt /> Logout</button>
                </div>
            </aside>
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen md:ml-64">
                {/* Navbar */}
                <header className="flex items-center justify-between px-4 md:px-10 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-lg shadow border-b border-blue-100">
                    <button className="md:hidden text-2xl text-blue-700" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-blue-700">Welcome, {empName.split(' ')[0]}</span>
                        <span className="hidden md:inline text-gray-400 text-sm ml-2">Last login: {lastLogin}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="icon-pill" style={{border:'2px solid #6366f1'}}>
                                {getInitials(empName)}
                            </div>
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg p-3 hidden group-hover:block z-50">
                                <div className="text-blue-700 font-bold mb-2">{empName}</div>
                                <div className="text-xs text-gray-500 mb-2">{empEmail}</div>
                                <button onClick={handleLogout} className="btn btn-danger w-full justify-center font-semibold"><FaSignOutAlt /> Logout</button>
                            </div>
                        </div>
                    </div>
                </header>
                {/* Stats Cards */}
                <section className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-4 fade-in">
                    <div className={`card card-gradient-blue ${cardAnim} text-center flex items-center gap-5`}>
                        <div className="metric-pill">
                            <small>Total</small>
                            {stats.total}
                            <FaCar className="metric-icon" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm tracking-wide text-subtle font-semibold uppercase">Published</p>
                            <h3 className="text-lg font-bold text-indigo-700">Rides</h3>
                            <p className="text-xs text-subtle mt-1">All rides you have offered.</p>
                        </div>
                    </div>
                    <Link to="/employee/notifications" className={`card card-gradient-amber ${cardAnim} text-center flex items-center gap-5`}>
                        <div className="metric-pill orange">
                            <small>Now</small>
                            <FaBell className="metric-icon" />
                            {/** Placeholder count if needed later */}
                            <span style={{position:'absolute', inset:'0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:700}}>⚡</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm tracking-wide text-subtle font-semibold uppercase">Notifications</p>
                            <h3 className="text-lg font-bold text-amber-600">Updates</h3>
                            <p className="text-xs text-subtle mt-1">See ride activity & alerts.</p>
                        </div>
                    </Link>
                    <Link to="/employee/history/joined" className={`card card-gradient-green ${cardAnim} text-center flex items-center gap-5`}>
                        <div className="metric-pill green">
                            <small>Joined</small>
                            <FaUsers className="metric-icon" />
                            <span style={{position:'absolute', inset:'0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:700}}>👥</span>
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm tracking-wide text-subtle font-semibold uppercase">History</p>
                            <h3 className="text-lg font-bold text-green-700">Rides</h3>
                            <p className="text-xs text-subtle mt-1">List of rides you joined.</p>
                        </div>
                    </Link>
                </section>
                {/* Parallel Published & Joined Rides */}
                <section className="w-full max-w-7xl mx-auto mt-10 px-4 pb-12 animate-fade-in-up">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {/* Published Column */}
                        <div className="flex flex-col min-h-[60vh]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-2xl font-bold text-blue-700">Your Published Rides</h3>
                                <Link to="/employee/offer" className="btn btn-primary text-xs font-semibold"><FaPlus /> New</Link>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-6 max-h-[65vh] custom-scroll">
                                {publishedRides.length === 0 ? (
                                    <p className="text-gray-400 text-center py-10">You haven’t published any rides yet.</p>
                                ) : (
                                    publishedRides.map(ride => (
                                        <div key={ride.id} className={`${glass} ${cardAnim} rounded-2xl p-6 flex flex-col gap-3 relative group`}>
                                            <div className="flex items-center gap-3 mb-1">
                                                <FaMapMarkerAlt className="text-green-500" />
                                                <span className="font-semibold">{ride.origin}</span>
                                                <span className="mx-2 text-gray-400">→</span>
                                                <span className="font-semibold">{ride.destination}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                                <FaCalendarAlt className="text-purple-500" />
                                                <span>{formatDate(ride.date)}</span>
                                                <FaClock className="ml-2 text-yellow-500" />
                                                <span>{formatTime(ride.arrivalTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaCar className="text-gray-500" />
                                                <span>{ride.carDetails}</span>
                                                {ride.fare && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">₹{ride.fare}/seat</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaChair className="text-pink-500" />
                                                <span>{ride.availableSeats}/{ride.totalSeats} seats</span>
                                                <div className="progress-track ml-2" title={`Occupancy: ${ride.totalSeats - ride.availableSeats}/${ride.totalSeats}`}>
                                                    <div className="progress-bar" style={{ width: `${((ride.totalSeats - ride.availableSeats) / ride.totalSeats) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`badge ${ride.status === 'Active' ? 'badge-success' : 'badge-muted'}`}>
                                                    {ride.status === 'Active' ? <FaCheckCircle /> : <FaClock />} {ride.status || 'Active'}
                                                </span>
                                                <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold" title={ride.instantBookingEnabled ? 'Passengers auto-join' : 'You review each request'}>
                                                    {ride.instantBookingEnabled ? 'Instant' : 'Review'}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-xs text-blue-700">
                                                <strong>Owner:</strong> {ride.ownerName} ({ride.ownerEmpId})
                                            </div>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-blue-700">Joined Employees:</span>
                                                </div>
                                                {ride.joinedEmployees && ride.joinedEmployees.length > 0 ? (
                                                    <ul className="ml-2 list-disc text-xs text-gray-700">
                                                        {ride.joinedEmployees.map(emp => (
                                                            <li key={emp.empId}>{emp.name} ({emp.empId})</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-xs text-gray-400 ml-2">No employees joined</span>
                                                )}
                                                {!ride.instantBookingEnabled && ride.pendingEmployees && (
                                                    <div className="mt-3 border-t pt-2">
                                                        <div className="text-xs font-semibold text-indigo-700 mb-1">Pending Requests:</div>
                                                        {ride.pendingEmployees.length === 0 && <div className="text-[10px] text-gray-400">No pending requests.</div>}
                                                        {ride.pendingEmployees.map(p => (
                                                            <div key={p.empId} className="flex items-center justify-between text-[11px] bg-indigo-50 rounded px-2 py-1 mb-1">
                                                                <span>{p.name} ({p.empId})</span>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => approveRequest(ride.id, p.empId)} className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded">✔</button>
                                                                    <button onClick={() => declineRequest(ride.id, p.empId)} className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded">✖</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(ride.id)} className="btn btn-primary text-xs"><FaEdit /> Edit</button>
                                                <button onClick={() => handleDelete(ride.id)} className="btn btn-danger text-xs"><FaTrash /> Delete</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        {/* Joined Column */}
                        <div className="flex flex-col min-h-[60vh]">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-2xl font-bold text-green-700">Rides You've Joined</h3>
                                <Link to="/employee/join" className="btn btn-outline text-xs font-semibold"><FaUsers /> Find</Link>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-6 max-h-[65vh] custom-scroll">
                                {joinedRides.length === 0 ? (
                                    <p className="text-gray-400 text-center py-10">You haven’t joined any rides yet.</p>
                                ) : (
                                    joinedRides.map(ride => (
                                        <div key={ride.id} className={`bg-green-50 ${cardAnim} rounded-2xl p-6 flex flex-col gap-3 border border-green-200 relative group`}>
                                            <div className="flex items-center gap-3 mb-1">
                                                <FaMapMarkerAlt className="text-green-500" />
                                                <span className="font-semibold">{ride.origin}</span>
                                                <span className="mx-2 text-gray-400">→</span>
                                                <span className="font-semibold">{ride.destination}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                                <FaCalendarAlt className="text-purple-500" />
                                                <span>{formatDate(ride.date)}</span>
                                                <FaClock className="ml-2 text-yellow-500" />
                                                <span>{formatTime(ride.arrivalTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaCar className="text-gray-500" />
                                                <span>{ride.carDetails}</span>
                                                {ride.fare && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">₹{ride.fare}/seat</span>}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaChair className="text-pink-500" />
                                                <span>{ride.availableSeats}/{ride.totalSeats} seats</span>
                                                <div className="progress-track ml-2" title={`Occupancy: ${ride.totalSeats - ride.availableSeats}/${ride.totalSeats}`}>
                                                    <div className="progress-bar" style={{ width: `${((ride.totalSeats - ride.availableSeats) / ride.totalSeats) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`badge ${ride.status === 'Active' ? 'badge-success' : 'badge-muted'}`}>{ride.status || 'Active'}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-blue-700">
                                                <strong>Owner:</strong> {ride.ownerName} ({ride.ownerEmpId})
                                            </div>
                                            <div className="mt-2">
                                                <div className="flex items-center text-green-700 font-semibold text-xs mb-1">
                                                    <FaUsers className="mr-1" /> Joined Employees:
                                                </div>
                                                {ride.joinedEmployees && ride.joinedEmployees.length > 0 ? (
                                                    <ul className="ml-6 list-disc text-xs text-gray-700">
                                                        {ride.joinedEmployees.map(emp => (
                                                            <li key={emp.empId}>{emp.name} ({emp.empId})</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="ml-6 text-gray-400 text-xs">No one has joined yet.</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleLeave(ride.id)} className="btn btn-danger text-xs"><FaUser /> Leave</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
export default EmployeeDashboard;

