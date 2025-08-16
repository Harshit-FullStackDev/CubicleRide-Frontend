import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaIdBadge, FaUser, FaEnvelope, FaLock, FaKey, FaRedo } from "react-icons/fa";

function Register() {
    const [data, setData] = useState({
        empId: "",
        name: "",
        email: "",
        password: ""
    });
    const [step, setStep] = useState("form"); // form | otp | success
    const [otp, setOtp] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [infoMsg, setInfoMsg] = useState("");
    const [errors, setErrors] = useState({});
    const empRef = useRef(null);
    const otpRef = useRef(null);
    const resendTimerRef = useRef(null);

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

    const startResendCooldown = () => {
        setResendCooldown(45); // seconds
        resendTimerRef.current && clearInterval(resendTimerRef.current);
        resendTimerRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(resendTimerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step !== 'form') return; // safeguard
        setErrors({});
        setInfoMsg("");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setErrors({ email: "Please enter a valid email." });
            return;
        }
        try {
            await api.post("/auth/register", data);
            setStep("otp");
            setInfoMsg("Registered! We've sent a verification code to your email.");
            startResendCooldown();
            setTimeout(() => otpRef.current?.focus(), 50);
        } catch (err) {
            const status = err?.response?.status;
            const raw = err?.response?.data;
            let msgText = "Registration failed";
            if (typeof raw === "string") msgText = raw;
            else if (raw && typeof raw === "object") msgText = raw.message || raw.error || msgText;
            else if (err?.message) msgText = err.message;
            if (status === 409 || (typeof msgText === "string" && msgText.toLowerCase().includes("already"))) {
                setErrors({ form: "Already registered" });
            } else {
                setErrors({ form: String(msgText) });
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp.trim()) return setErrors({ otp: 'Enter OTP received in email.' });
        setErrors({});
        setVerifying(true);
        setInfoMsg("");
        try {
            await api.post('/auth/verify-otp', { email: data.email, otp: otp.trim() });
            setStep('success');
            setInfoMsg('Email verified! Redirecting to sign in...');
            setTimeout(() => navigate('/login', { replace: true }), 1800);
        } catch (err) {
            const raw = err?.response?.data;
            let msg = 'Invalid or expired OTP';
            if (typeof raw === 'string') msg = raw;
            else if (raw && typeof raw === 'object') msg = raw.message || raw.error || msg;
            setErrors({ otp: msg });
        } finally {
            setVerifying(false);
        }
    };

    const resendOtp = async () => {
        if (resendCooldown > 0) return; // avoid spam
        setErrors(prev => ({ ...prev, resend: undefined }));
        setInfoMsg('Resending code...');
        const attempts = [
            { url: '/auth/resend-otp', payload: { email: data.email } },
            { url: '/auth/otp/resend', payload: { email: data.email } },
            { url: '/auth/resend-otp', payload: { emailId: data.email } }, // alternate key naming
        ];
        for (let i = 0; i < attempts.length; i++) {
            try {
                await api.post(attempts[i].url, attempts[i].payload);
                setInfoMsg('A new code has been sent.');
                startResendCooldown();
                return;
            } catch (err) {
                // try next endpoint unless last
                if (i === attempts.length - 1) {
                    const raw = err?.response?.data;
                    let msg = 'Could not resend code';
                    if (typeof raw === 'string') msg = raw;
                    else if (raw && typeof raw === 'object') msg = raw.message || raw.error || msg;
                    setInfoMsg('');
                    setErrors(prev => ({ ...prev, resend: msg }));
                }
            }
        }
    };

    useEffect(() => () => { resendTimerRef.current && clearInterval(resendTimerRef.current); }, []);

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
                            {step === 'form' && (
                                <>
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
                                </>
                            )}
                            {step === 'otp' && (
                                <>
                                    <h2 className="text-2xl font-semibold tracking-tight mb-1">Verify your email</h2>
                                    <p className="text-sm text-gray-500 mb-6">We sent a 6-digit code to <span className="font-medium text-orange-600">{data.email}</span></p>
                                    {infoMsg && <div className="bg-orange-50 border border-orange-200 text-orange-700 text-xs p-3 rounded-lg mb-4">{infoMsg}</div>}
                                    {errors.form && (<div className="bg-red-50 text-red-700 border border-red-200 text-sm p-3 rounded-lg mb-4">{errors.form}</div>)}
                                    <form onSubmit={handleVerify} className="space-y-5">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-600">One-Time Password</label>
                                            <div className="flex items-center gap-3 bg-gray-50 focus-within:bg-white border border-gray-200 rounded-xl px-4 py-3 transition">
                                                <FaKey className="text-orange-400" />
                                                <input ref={otpRef} name="otp" value={otp} onChange={(e)=>setOtp(e.target.value)} inputMode="numeric" maxLength={8} placeholder="Enter code" className="bg-transparent w-full outline-none tracking-widest text-sm font-medium" />
                                            </div>
                                            {errors.otp && <div className="text-red-600 text-xs mt-1">{errors.otp}</div>}
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                                            <button type="button" onClick={resendOtp} disabled={resendCooldown>0} className={`inline-flex items-center gap-1 font-medium ${resendCooldown>0? 'text-gray-400 cursor-not-allowed':'text-orange-600 hover:underline'}`}>
                                                <FaRedo className="text-[10px]" /> {resendCooldown>0? `Resend in ${resendCooldown}s`:'Resend code'}
                                            </button>
                                            <button type="button" onClick={()=>{setStep('form'); setOtp(''); setInfoMsg(''); setErrors({});}} className="hover:underline">Edit details</button>
                                        </div>
                                        <button type="submit" disabled={verifying} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600">
                                            {verifying? 'Verifying...':'Verify & Continue'}
                                        </button>
                                        <p className="text-center text-xs text-gray-600">Already verified? <Link to="/login" className="text-orange-600 font-medium hover:underline">Sign in</Link></p>
                                        {errors.resend && <div className="text-red-600 text-[11px] text-center">{errors.resend}</div>}
                                    </form>
                                </>
                            )}
                            {step === 'success' && (
                                <div className="text-center py-10 space-y-4">
                                    <div className="mx-auto h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h2 className="text-xl font-semibold">Email verified</h2>
                                    <p className="text-sm text-gray-500">Redirecting you to sign in...</p>
                                    {infoMsg && <div className="text-xs text-green-700">{infoMsg}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} orangemantra • Internal use</footer>
             <div className="text-center text-xs text-gray-500"> Developed By • Harshit Soni .</div>
        </div>
    );
}

export default Register;