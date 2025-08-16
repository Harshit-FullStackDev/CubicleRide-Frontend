import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { storeSession, getRole } from '../utils/auth';

function Login() {
    const [data, setData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const emailRef = useRef(null);

    useEffect(() => {
    const role = getRole();
    if (role === 'EMPLOYEE') navigate('/employee/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
        // focus email on load for quick login
        setTimeout(() => emailRef.current?.focus(), 0);
    }, [navigate]);

    const handleChange = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const res = await api.post("/auth/login", {
                email: data.email,
                password: data.password
            });
            const token = res.data.token;
            const ok = storeSession(token);
            if (!ok) throw new Error('Invalid token');
            localStorage.setItem('email', data.email);
            const payload = JSON.parse(atob(token.split('.')[1]));
            const redirect = location.state?.from || (payload.role === 'EMPLOYEE' ? '/employee/dashboard' : '/admin/dashboard');
            navigate(redirect, { replace: true });
        } catch (err) {
            setErrors({ form: "Invalid credentials" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Top bar */}
            <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 grid place-items-center text-white font-semibold text-xs">OM</div>
                    <div className="text-lg font-semibold tracking-tight"><span className="text-orange-600">Orange </span>mantra</div>
                </Link>
                <nav className="hidden md:flex items-center gap-8 text-sm">
                    <a href="/#features" className="hover:text-orange-600 transition-colors">Features</a>
                    <a href="/#how" className="hover:text-orange-600 transition-colors">How it works</a>
                    <a href="/#trust" className="hover:text-orange-600 transition-colors">Trust & Safety</a>
                </nav>
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/register" className="px-4 py-2 rounded-full font-medium border border-orange-200 text-orange-700 hover:bg-orange-50">Register</Link>
                </div>
            </header>
            {/* Content */}
            <main className="flex-1 w-full mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center px-6 md:px-12 py-10">
                {/* Marketing panel */}
                <div className="hidden lg:flex flex-col gap-6 pr-8">
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight">Welcome back <span className="text-orange-600">traveller</span></h1>
                    <p className="text-gray-600 text-lg max-w-md">Sign in to offer a ride, join one, and coordinate daily commutes with your team. Fewer cars. Lower costs. Happier mornings.</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Verified internal workspace, no external riders.</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Smart suggestions & instant or review-based joining flows.</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Transparent ride history & secure profiles.</span></li>
                    </ul>
                </div>
                {/* Auth card */}
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg ring-1 ring-orange-100 p-8 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-100 blur-2xl opacity-70" />
                        <div className="relative">
                            <h2 className="text-2xl font-semibold tracking-tight mb-1">Sign in</h2>
                            <p className="text-sm text-gray-500 mb-6">Access your internal carpool workspace</p>
                            {loading ? (
                                <div className="text-center text-orange-600 text-sm font-medium animate-pulse py-10">Logging in...</div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {errors.form && (<div className="bg-red-50 text-red-700 border border-red-200 text-sm p-3 rounded-lg">{errors.form}</div>)}
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Email</label>
                                        <div className="flex items-center gap-3 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                            <FaEnvelope className="text-orange-400" />
                                            <input ref={emailRef} name="email" type="email" autoComplete="email" value={data.email} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-600">Password</label>
                                        <div className="flex items-center gap-3 bg-gray-50 hover:bg-white focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                            <FaLock className="text-orange-400" />
                                            <input name="password" type="password" autoComplete="current-password" value={data.password} onChange={handleChange} required className="bg-transparent w-full outline-none text-sm" />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600">Sign in</button>
                                    <p className="text-center text-xs text-gray-600">Don&apos;t have an account? <Link to="/register" className="text-orange-600 font-medium hover:underline">Register</Link></p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} Orange Mantra • Internal use</footer>
        </div>
    );
}

export default Login;