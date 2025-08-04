// src/pages/employee/Dashboard.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
    FaUser, FaMapMarkerAlt, FaCar, FaChair, FaCalendarAlt, FaClock,
    FaEdit, FaTrash, FaBell, FaEnvelope, FaCheckCircle
} from "react-icons/fa";


function EmployeeDashboard() {
    const navigate = useNavigate();
    const [empName, setEmpName] = useState("");
    const [empEmail, setEmpEmail] = useState("");
    const [empId, setEmpId] = useState("");
    const [publishedRides, setPublishedRides] = useState([]);
    const [joinedRides, setJoinedRides] = useState([]);
    const [stats, setStats] = useState({ total: 0, seats: 0 });
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastLogin, setLastLogin] = useState("");

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
    }, [navigate]);

    const fetchDashboardData = async (empId) => {
        setLoading(true);
        try {
            const [ridesRes, joinedRes, notifRes] = await Promise.all([
                api.get("/ride/my-rides"),
                api.get(`/ride/joined/${empId}`),
                api.get(`/notifications/${empId}`).catch(() => ({
                    data: [
                        { id: 1, message: "Your ride to Noida was joined by 2 employees." },
                        { id: 2, message: "You have 1 new ride request." }
                    ]
                }))
            ]);
            setPublishedRides(ridesRes.data);
            setJoinedRides(joinedRes.data);
            let total = ridesRes.data.length;
            let seats = ridesRes.data.reduce((sum, ride) => sum + ride.availableSeats, 0);
            setStats({ total, seats });
            setNotifications(notifRes.data);
            setError(null);
        } catch (err) {
            setError("Failed to load dashboard data.");
        }
        setLoading(false);
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

    if (loading) return <div className="text-center mt-10 text-lg text-blue-700 animate-pulse">Loading dashboard...</div>;
    if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;

    const handleClearNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch {
            alert("Failed to clear notification.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-0">
            {/* Navbar */}

            <nav className="flex justify-between items-center bg-white bg-opacity-95 shadow-md px-8 py-4 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                    <img src="/orangemantra%20Logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
                    Orangemantra Carpool
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                    title="Logout"
                >
                    <span className="mr-2">🔒</span> Logout
                </button>
            </nav>
            {/* Profile Card */}
            <section className="max-w-4xl mx-auto mt-8">
                <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-8 p-8 border border-blue-100">
                    {empName !== "Employee" ? (
                        <img
                            src="/orangemantra%20Logo.png"
                            alt="Avatar"
                            className="w-24 h-24 rounded-full border-4 border-blue-400 shadow"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 border-4 border-blue-400 shadow">
                            {getInitials(empName)}
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-blue-700">{empName}</h2>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <FaEnvelope /> <span>{empEmail}</span>
                        </div>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Employee</span>
                        <div className="mt-2 text-gray-400 text-sm">Last login: {lastLogin}</div>
                        <div className="flex gap-8 mt-4">
                            <div className="flex items-center gap-2">
                                <FaCar className="text-blue-500" />
                                <span className="font-semibold">{stats.total}</span>
                                <span className="text-gray-500">Rides Published</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaChair className="text-pink-500" />
                                <span className="font-semibold">{stats.seats}</span>
                                <span className="text-gray-500">Seats Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Notifications */}
            <section className="max-w-4xl mx-auto mt-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow flex items-center gap-4 animate-fade-in">
                    <FaBell className="text-yellow-500 text-2xl animate-bounce" />
                    <div>
                        <h3 className="font-semibold text-yellow-700 mb-1">Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500">No new notifications.</p>
                        ) : (
                            <ul className="list-disc pl-5 space-y-1">
                                {notifications.map((n) => (
                                    <li key={n.id} className="text-gray-700 flex items-center gap-2">
                                        <FaCheckCircle className="text-green-400" /> {n.message}
                                        <button
                                            onClick={() => handleClearNotification(n.id)}
                                            className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                                            title="Clear Notification"
                                        >
                                            &#10006;
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
            {/* Dashboard Actions */}
            <section className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link
                    to="/employee/offer"
                    className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition border border-blue-100 hover:border-blue-300 group"
                >
                    <FaCar className="text-blue-500 text-4xl mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Offer a Ride</h3>
                    <p className="text-gray-600 text-center">Have a seat available? Let others join you!</p>
                </Link>
                <Link
                    to="/employee/join"
                    className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition border border-green-100 hover:border-green-300 group"
                >
                    <FaUser className="text-green-500 text-4xl mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Join a Ride</h3>
                    <p className="text-gray-600 text-center">Looking for a ride? Find one nearby!</p>
                </Link>
            </section>
            {/* Published Rides */}
            <section className="max-w-4xl mx-auto mt-10 mb-10">
                <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">Your Published Rides</h3>
                {publishedRides.length === 0 ? (
                    <p className="text-gray-500 text-center">You haven’t published any rides yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {publishedRides.map((ride) => (
                            <div
                                key={ride.id}
                                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:shadow-2xl transition border border-gray-100 hover:border-blue-200 group"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FaMapMarkerAlt className="text-green-500" />
                                    <span className="font-semibold">{ride.origin}</span>
                                    <span className="mx-2 text-gray-400">→</span>
                                    <span className="font-semibold">{ride.destination}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-purple-500" />
                                    <span>{formatDate(ride.date)}</span>
                                    <FaClock className="ml-4 text-yellow-500" />
                                    <span>{formatTime(ride.arrivalTime)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCar className="text-gray-500" />
                                    <span>{ride.carDetails}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaChair className="text-pink-500" />
                                    <span>
                                        {ride.availableSeats}/{ride.totalSeats} seats available
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${ride.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                                        {ride.status || "Active"}
                                    </span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleEdit(ride.id)}
                                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                                        title="Edit Ride"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ride.id)}
                                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                                        title="Delete Ride"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            <section className="max-w-4xl mx-auto mt-10 mb-10">
                <h3 className="text-2xl font-bold text-green-700 mb-4 text-center">Rides You've Joined</h3>
                {joinedRides.length === 0 ? (
                    <p className="text-gray-500 text-center">You haven’t joined any rides yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {joinedRides.map((ride) => (
                            <div
                                key={ride.id}
                                className="bg-green-50 rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:shadow-2xl transition border border-green-200 group"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FaMapMarkerAlt className="text-green-500" />
                                    <span className="font-semibold">{ride.origin}</span>
                                    <span className="mx-2 text-gray-400">→</span>
                                    <span className="font-semibold">{ride.destination}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-purple-500" />
                                    <span>{formatDate(ride.date)}</span>
                                    <FaClock className="ml-4 text-yellow-500" />
                                    <span>{formatTime(ride.arrivalTime)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCar className="text-gray-500" />
                                    <span>{ride.carDetails}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaChair className="text-pink-500" />
                                    <span>
                            {ride.availableSeats}/{ride.totalSeats} seats available
                        </span>
                                </div>
                                <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${ride.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                            {ride.status || "Active"}
                        </span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleLeave(ride.id)}
                                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
                                        title="Leave Ride"
                                    >
                                        <FaUser /> Leave
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default EmployeeDashboard;