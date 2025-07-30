import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

function Login() {
    const [data, setData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token && role === "EMPLOYEE") navigate("/employee/dashboard");
        else if (token && role === "ADMIN") navigate("/admin/dashboard");
    }, [navigate]);

    const handleChange = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login", data);
            const token = res.data.token;
            localStorage.setItem("token", token);
            const payload = JSON.parse(atob(token.split(".")[1]));
            const role = payload.role;
            const empId = payload.empId;
            const name = payload.name;
            localStorage.setItem("role", role);
            if (role === "EMPLOYEE") localStorage.setItem("empId", empId);
            else if (role === "ADMIN") localStorage.setItem("adminId", empId);
            localStorage.setItem("empId", empId);
            if (name) localStorage.setItem("name", name);
            localStorage.setItem("email", data.email);
            if (role === "EMPLOYEE") navigate("/employee/dashboard");
            else if (role === "ADMIN") navigate("/admin/dashboard");
            else alert("Unknown role");
        } catch {
            alert("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
                <img src="/orangemantra Logo.png" alt="Logo" className="w-16 h-16 mb-4 rounded-full shadow" />
                <h2 className="text-3xl font-bold text-orange-500 mb-6 text-center">Employee Login</h2>
                {loading ? (
                    <div className="text-center text-orange-600 text-xl font-semibold animate-pulse">
                        Logging in, please wait...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                            <FaEnvelope className="text-orange-400" />
                            <input
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                                required
                                type="email"
                                className="bg-transparent w-full outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                            <FaLock className="text-orange-400" />
                            <input
                                name="password"
                                placeholder="Password"
                                type="password"
                                onChange={handleChange}
                                required
                                className="bg-transparent w-full outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-orange-600 hover:bg-blue-700 text-white py-3 rounded-xl transition font-semibold mt-2"
                        >
                            Login
                        </button>
                        <p className="text-center text-sm mt-4 text-gray-600">
                            Don&#39;t have an account?{" "}
                            <span
                                onClick={() => navigate("/register")}
                                className="text-orange-700 font-semibold cursor-pointer hover:underline"
                            >
                                Register
                            </span>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;