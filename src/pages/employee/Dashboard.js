import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FaUser, FaMapMarkerAlt, FaCar, FaChair, FaCalendarAlt, FaClock, FaEdit, FaTrash, FaBell } from "react-icons/fa";

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [empName, setEmpName] = useState("");
    const [publishedRides, setPublishedRides] = useState([]);
    const [stats, setStats] = useState({ total: 0, seats: 0 });
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "EMPLOYEE") {
            navigate("/login");
        }
        const storedName = localStorage.getItem("name") || "Employee";
        setEmpName(storedName);
        fetchPublishedRides();
        fetchNotifications();
    }, [navigate]);

    const fetchPublishedRides = async () => {
        try {
            const res = await api.get("/ride/my-rides");
            setPublishedRides(res.data);
            let total = res.data.length;
            let seats = res.data.reduce((sum, ride) => sum + ride.availableSeats, 0);
            setStats({ total, seats });
        } catch (err) {
            console.error("Failed to fetch published rides", err);
        }
    };

    const fetchNotifications = async () => {
        setNotifications([
            { id: 1, message: "Your ride to Noida was joined by 2 employees." },
            { id: 2, message: "You have 1 new ride request." }
        ]);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleEdit = (id) => {
        navigate(`/employee/edit/${id}`);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/ride/${id}`);
            fetchPublishedRides();
        } catch (err) {
            alert("Failed to delete ride.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-0">
            {/* Navbar */}
            <div className="flex justify-between items-center bg-white bg-opacity-90 shadow-md px-8 py-4">
                <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                    <img src="/orangemantra%20Logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
                    Orangemantra Carpool
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold"
                >
                    🔒 Logout
                </button>
            </div>
            {/* Profile Card */}
            <div className="max-w-4xl mx-auto mt-8">
                <div className="bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-8 p-8">
                    <img
                        src="/orangemantra%20Logo.png"
                        alt="Avatar"
                        className="w-24 h-24 rounded-full border-4 border-blue-400"
                    />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-blue-700">{empName}</h2>
                        <p className="text-gray-500">Employee</p>
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
            </div>
            {/* Notifications */}
            <div className="max-w-4xl mx-auto mt-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow flex items-center gap-4">
                    <FaBell className="text-yellow-500 text-2xl" />
                    <div>
                        <h3 className="font-semibold text-yellow-700 mb-1">Notifications</h3>
                        {notifications.length === 0 ? (
                            <p className="text-gray-500">No new notifications.</p>
                        ) : (
                            <ul className="list-disc pl-5 space-y-1">
                                {notifications.map((n) => (
                                    <li key={n.id} className="text-gray-700">{n.message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            {/* Dashboard Actions */}
            <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link
                    to="/employee/offer"
                    className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition"
                >
                    <FaCar className="text-blue-500 text-4xl mb-2" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Offer a Ride</h3>
                    <p className="text-gray-600 text-center">Have a seat available? Let others join you!</p>
                </Link>
                <Link
                    to="/employee/join"
                    className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition"
                >
                    <FaUser className="text-green-500 text-4xl mb-2" />
                    <h3 className="text-xl font-bold text-gray-800 mb-1">Join a Ride</h3>
                    <p className="text-gray-600 text-center">Looking for a ride? Find one nearby!</p>
                </Link>
            </div>
            {/* Published Rides */}
            <div className="max-w-4xl mx-auto mt-10 mb-10">
                <h3 className="text-2xl font-bold text-blue-700 mb-4 text-center">Your Published Rides</h3>
                {publishedRides.length === 0 ? (
                    <p className="text-gray-500 text-center">You haven’t published any rides yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {publishedRides.map((ride) => (
                            <div
                                key={ride.id}
                                className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 hover:shadow-2xl transition"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <FaMapMarkerAlt className="text-green-500" />
                                    <span className="font-semibold">{ride.origin}</span>
                                    <span className="mx-2 text-gray-400">→</span>
                                    <span className="font-semibold">{ride.destination}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaCalendarAlt className="text-purple-500" />
                                    <span>{ride.date}</span>
                                    <FaClock className="ml-4 text-yellow-500" />
                                    <span>{ride.arrivalTime}</span>
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
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleEdit(ride.id)}
                                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ride.id)}
                                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeDashboard;