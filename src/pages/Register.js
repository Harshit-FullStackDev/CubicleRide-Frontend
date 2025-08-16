import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaIdBadge, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

function Register() {
    const [data, setData] = useState({
        empId: "",
        name: "",
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const empRef = useRef(null);

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
        setErrors({});
        // quick email validation client-side
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setErrors({ email: "Please enter a valid email." });
            return;
        }
        try {
            await api.post("/auth/register", data);
            alert("Registered! Please check your email for OTP.");
            navigate("/otp-verify", { state: { email: data.email } });
        } catch (err) {
            const status = err?.response?.status;
            const raw = err?.response?.data;
            let msgText = "Registration failed";
            if (typeof raw === "string") {
                msgText = raw;
            } else if (raw && typeof raw === "object") {
                msgText = raw.message || raw.error || msgText;
            } else if (err?.message) {
                msgText = err.message;
            }
            if (status === 409 || (typeof msgText === "string" && msgText.toLowerCase().includes("already"))) {
                setErrors({ form: "Already registered" });
            } else {
                setErrors({ form: String(msgText) });
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50">
            <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/OMLogo.svg" alt="OrangeMantra" className="h-10 w-auto" />
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm">
                    <a href="/#features" className="hover:text-orange-600 transition-colors">Features</a>
                    <a href="/#how" className="hover:text-orange-600 transition-colors">How it works</a>
                    <a href="/#trust" className="hover:text-orange-600 transition-colors">Trust & Safety</a>
                </nav>
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/login" className="px-4 py-2 rounded-full font-medium border border-orange-200 text-orange-700 hover:bg-orange-50">Sign in</Link>
                </div>
            </header>
            <main className="flex-1 w-full mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center px-6 md:px-12 py-10">
                <div className="hidden lg:flex flex-col gap-6 pr-8">
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight">Create your <span className="text-orange-600">account</span></h1>
                    <p className="text-gray-600 text-lg max-w-md">Register to start publishing or joining office rides. We keep it internal & secure.</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Only verified employees can sign up.</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Preset routes & approval controls for safety.</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Manage rides, seats, and history any time.</span></li>
                    </ul>
                </div>
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg ring-1 ring-orange-100 p-8 relative overflow-hidden">
                        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-orange-100 blur-2xl opacity-70" />
                        <div className="relative">
                            <h2 className="text-2xl font-semibold tracking-tight mb-1">Register</h2>
                            <p className="text-sm text-gray-500 mb-6">Set up your internal commute profile</p>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {errors.form && (<div className="bg-red-50 text-red-700 border border-red-200 text-sm p-3 rounded-lg">{errors.form}</div>)}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Employee ID</label>
                                    <div className="flex items-center gap-3 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                        <FaIdBadge className="text-orange-400" />
                                        <input ref={empRef} name="empId" value={data.empId} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Name</label>
                                    <div className="flex items-center gap-3 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                        <FaUser className="text-orange-400" />
                                        <input name="name" value={data.name} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Email</label>
                                    <div className="flex items-center gap-3 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                        <FaEnvelope className="text-orange-400" />
                                        <input name="email" type="email" value={data.email} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm" />
                                    </div>
                                    {errors.email && <div className="text-red-600 text-xs mt-1">{errors.email}</div>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Password</label>
                                    <div className="flex items-center gap-3 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                        <FaLock className="text-orange-400" />
                                        <input name="password" type="password" value={data.password} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600">Create account</button>
                                <p className="text-center text-xs text-gray-600">Already have an account? <Link to="/login" className="text-orange-600 font-medium hover:underline">Sign in</Link></p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} orangemantra • Internal use</footer>
            <div className="mt-2 text-xs text-gray-500"> Developed By • Harshit Soni .</div>
        </div>
    );
}

export default Register;