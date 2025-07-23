import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const [data, setData] = useState({
        empId: "",
        name: "",
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role === "EMPLOYEE") navigate("/employee/dashboard");
        else if (token && role === "ADMIN") navigate("/admin/dashboard");
    }, [navigate]);

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/auth/register", data);
            alert("Registered! Please login.");
            navigate("/login");
        } catch (err) {
            alert("Registration failed");
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center blur-sm"
                style={{ backgroundImage: `url('/orangemantra Logo.png')` }}
            ></div>

            {/* Overlay for form content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Employee Registration</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="empId"
                            placeholder="Employee ID"
                            value={data.empId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            name="name"
                            placeholder="Name"
                            value={data.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            name="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={handleChange}
                            required
                            type="email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            name="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={handleChange}
                            required
                            type="password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl transition duration-300 font-semibold"
                        >
                            Register
                        </button>
                        <p className="text-center text-sm mt-4 text-gray-600">
                            Already have an account?{" "}
                            <span
                                onClick={() => navigate("/login")}
                                className="text-purple-700 font-semibold cursor-pointer hover:underline"
                            >
                                Login
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;
