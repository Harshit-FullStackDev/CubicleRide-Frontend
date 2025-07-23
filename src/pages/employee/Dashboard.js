import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function EmployeeDashboard() {
    const navigate = useNavigate();
    const [empName, setEmpName] = useState("");

    useEffect(() => {
        // Optional: You can fetch name from backend or localStorage
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "EMPLOYEE") {
            navigate("/login");
        }

        // For demo, you can store the name during login/registration
        const storedName = localStorage.getItem("name") || "Employee";
        setEmpName(storedName);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="relative min-h-screen">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-sm"
                style={{ backgroundImage: `url('orangemantra Logo.png')` }}
            ></div>

            {/* Overlay Content */}
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Navbar */}
                <div className="flex justify-between items-center bg-white bg-opacity-90 shadow-md px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-800">🚘 Orangemantra Carpool</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold"
                    >
                        🔒 Logout
                    </button>
                </div>

                {/* Dashboard Body */}
                <div className="flex-grow flex flex-col items-center justify-center p-6">
                    <h2 className="text-3xl font-bold text-white mb-8">Welcome, {empName} 👋</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
                        {/* Offer a Ride */}
                        <Link
                            to="/employee/offer"
                            className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:scale-105 transition duration-300 text-center"
                        >
                            <div className="text-4xl mb-2">🚗</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Offer a Ride</h3>
                            <p className="text-gray-600">Have a seat available? Let others join you!</p>
                        </Link>

                        {/* Join a Ride */}
                        <Link
                            to="/employee/join"
                            className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-6 hover:shadow-2xl transform hover:scale-105 transition duration-300 text-center"
                        >
                            <div className="text-4xl mb-2">🧍</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Join a Ride</h3>
                            <p className="text-gray-600">Looking for a ride? Find one nearby!</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
