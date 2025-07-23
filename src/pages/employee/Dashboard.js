import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios"; // Make sure this path is correct

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [empName, setEmpName] = useState("");
    const [publishedRides, setPublishedRides] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "EMPLOYEE") {
            navigate("/login");
        }

        const storedName = localStorage.getItem("name") || "Employee";
        setEmpName(storedName);

        fetchPublishedRides();
    }, [navigate]);

    const fetchPublishedRides = async () => {
        try {
            const res = await api.get("/ride/my-rides");
            setPublishedRides(res.data);
        } catch (err) {
            console.error("Failed to fetch published rides", err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="relative min-h-screen">
            {/* Blurred Background */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-sm"
                style={{ backgroundImage: `url('/orangemantra Logo.png')` }}
            ></div>

            {/* Dashboard Content */}
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

                {/* Dashboard Cards */}
                <div className="flex-grow flex flex-col items-center justify-start p-6">
                    <h2 className="text-3xl font-bold text-orange-600 mb-8">Welcome, {empName} 👋</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
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
                                        className="border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition"
                                    >
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
