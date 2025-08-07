import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaMapMarkerAlt } from "react-icons/fa";

function Login() {
    const [data, setData] = useState({ email: "", password: "", pickup: "", drop: "" });
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token && role === "EMPLOYEE") navigate("/employee/dashboard");
        else if (token && role === "ADMIN") navigate("/admin/dashboard");

        api.get("/locations")
            .then(res => setLocations(res.data))
            .catch(err => console.error("Locations load failed", err));
    }, [navigate]);

    const handleChange = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/auth/login", {
                email: data.email,
                password: data.password
            });
            const token = res.data.token;
            localStorage.setItem("token", token);
            const payload = JSON.parse(atob(token.split(".")[1]));
            localStorage.setItem("role", payload.role);
            localStorage.setItem("empId", payload.empId);
            localStorage.setItem("name", payload.name);
            localStorage.setItem("email", data.email);
            localStorage.setItem("pickup", data.pickup);
            localStorage.setItem("drop", data.drop);

            if (payload.role === "EMPLOYEE") navigate("/employee/dashboard");
            else navigate("/admin/dashboard");
        } catch {
            alert("Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            backgroundImage: "url('/microsoft-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
        }}>
            <div className="bg-white-400 bg-opacity-95 p-8 rounded-2xl shadow-1xl w-fit max-w-md flex flex-col items-center">
                <img src="/orangemantra Logo.png" alt="Logo" className="w-16 h-16 mb-4 rounded-full shadow" />
                <h2 className="text-3xl font-bold text-orange-500 mb-6 text-center font-serif italic">Welcome Back!</h2>
                <p className="mb-6 text-white font-bold text-center">Login to continue and select your ride locations.</p>
                {loading ? (
                    <div className="text-center text-orange-600 text-xl font-semibold animate-pulse">
                        Logging in, please wait...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                            <FaEnvelope className="text-orange-400" />
                            <input name="email" type="email" placeholder="Email"
                                   className="bg-transparent w-full outline-none"
                                   value={data.email} onChange={handleChange} required />
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                            <FaLock className="text-orange-400" />
                            <input name="password" type="password" placeholder="Password"
                                   className="bg-transparent w-full outline-none"
                                   value={data.password} onChange={handleChange} required />
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                            <FaMapMarkerAlt className="text-green-500" />
                            <select name="pickup" value={data.pickup} onChange={handleChange} required
                                    className="bg-transparent w-full outline-none">
                                <option value="">Select Pickup Location</option>
                                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                            <FaMapMarkerAlt className="text-red-500" />
                            <select name="drop" value={data.drop} onChange={handleChange} required
                                    className="bg-transparent w-full outline-none">
                                <option value="">Select Drop Location</option>
                                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                            </select>
                        </div>
                        <button type="submit"
                                className="w-full bg-orange-600 hover:bg-blue-700 text-white py-3 rounded-xl transition font-semibold mt-2">
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