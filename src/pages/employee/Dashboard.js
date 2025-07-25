import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

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
        <div className="relative min-h-screen">
            {/* Blurred Background */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-sm"
                style={{ backgroundImage: `url('/orangemantra Logo.png')` }}
            ></div>
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Navbar */}
                <div className="flex justify-between items-center bg-white bg-opacity-90 shadow-md px-6 py-4">
                    <h1 className="text-2xl font-serif text-orange-600">🚘 Orangemantra Carpool</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold"
                    >
                        🔒 Logout
                    </button>
                </div>
                {/* Profile & Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white bg-opacity-80 rounded-2xl shadow-lg p-6 mt-6 mx-6">
                    <div className="flex items-center space-x-4">
                        <img
                            src="/orangemantra%20Logo.png"
                            alt="Orange Mantra"
                            className="w-16 h-16 rounded-full border-2 border-orange-500"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-orange-700">{empName}</h2>
                            <p className="text-gray-600">Employee</p>
                        </div>
                    </div>
                    <div className="flex space-x-8 mt-4 sm:mt-0">
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{stats.total}</div>
                            <div className="text-gray-500">Rides Published</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{stats.seats}</div>
                            <div className="text-gray-500">Seats Available</div>
                        </div>
                    </div>
                </div>
                {/* Notifications */}
                <div className="mx-6 mt-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow">
                        <h3 className="font-semibold text-yellow-700 mb-2">🔔 Notifications</h3>
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
                {/* Dashboard Cards */}
                <div className="flex-grow flex flex-col items-center justify-start p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-12 mt-6">
                        <Link
                            to="/employee/offer"
                            className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:scale-105 transition duration-300 text-center"
                        >
                            <div className="text-4xl mb-2">🚗</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Offer a Ride</h3>
                            <p className="text-gray-600">Have a seat available? Let others join you!</p>
                        </Link>
                        <Link
                            to="/employee/join"
                            className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:scale-105 transition duration-300 text-center"
                        >
                            <div className="text-4xl mb-2">🧍</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Join a Ride</h3>
                            <p className="text-gray-600">Looking for a ride? Find one nearby!</p>
                        </Link>
                    </div>
                    {/* Published Rides Section */}
                    <div className="bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl w-full max-w-3xl">
                        <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">🛣️ Your Published Rides</h3>
                        {publishedRides.length === 0 ? (
                            <p className="text-gray-500 text-center">You haven’t published any rides yet.</p>
                        ) : (
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {publishedRides.map((ride) => (
                                    <div
                                        key={ride.id}
                                        className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                🛣 {ride.origin} → {ride.destination}
                                            </p>
                                            <p className="text-sm text-gray-600">📅 Date: {ride.date}</p>
                                            <p className="text-sm text-gray-600">🚘 Car: {ride.carDetails}</p>
                                            <p className="text-sm text-gray-600">
                                                🪑 {ride.availableSeats}/{ride.totalSeats} seats available
                                            </p>
                                            <p className="text-sm text-gray-500">🕒 Arrival: {ride.arrivalTime}</p>
                                        </div>
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(ride.id)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ride.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;