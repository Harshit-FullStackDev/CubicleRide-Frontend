import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaEnvelope, FaKey, FaRedo } from "react-icons/fa";

function OtpVerify() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [info, setInfo] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const otpRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const em = location.state?.email || localStorage.getItem('pending_email');
        if (em) setEmail(em);
        if (em) {
            localStorage.setItem('pending_email', em);
            setInfo('Enter the code sent to your email.');
            setResendCooldown(30);
            timerRef.current = setInterval(()=>{
                setResendCooldown(p=>{ if(p<=1){ clearInterval(timerRef.current); return 0;} return p-1;});
            },1000);
            setTimeout(()=>otpRef.current?.focus(),80);
        }
        return ()=> timerRef.current && clearInterval(timerRef.current);
    }, [location.state]);

    const verify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await api.post('/auth/verify-otp', { email, otp: otp.trim() });
            setInfo('Verified! Redirecting...');
            setTimeout(()=>navigate('/login', { replace:true }), 1500);
        } catch (err) {
            const raw = err?.response?.data;
            let msg = 'Invalid or expired code';
            if (typeof raw === 'string') msg = raw; else if (raw && typeof raw === 'object') msg = raw.message || raw.error || msg;
            setError(msg);
        } finally { setLoading(false);}    
    };

    const resend = async () => {
        if (resendCooldown>0) return;
        setError("");
        try {
            setInfo('Resending code...');
            await api.post('/auth/resend-otp', { email });
            setInfo('New code sent.');
            setResendCooldown(30);
            timerRef.current && clearInterval(timerRef.current);
            timerRef.current = setInterval(()=>{
                setResendCooldown(p=>{ if(p<=1){ clearInterval(timerRef.current); return 0;} return p-1;});
            },1000);
        } catch {
            setError('Could not resend code');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-amber-50">
            <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/OMLogo.svg" alt="OrangeMantra" className="h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/login" className="px-4 py-2 rounded-full font-medium border border-orange-200 text-orange-700 hover:bg-orange-50">Sign in</Link>
                </div>
            </header>
            <main className="flex-1 w-full mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center px-6 md:px-12 py-10">
                <div className="hidden lg:flex flex-col gap-6 pr-8">
                    <h1 className="text-4xl font-semibold leading-tight tracking-tight">Almost there<span className="text-orange-600">!</span></h1>
                    <p className="text-gray-600 text-lg max-w-md">We just need to confirm your work email before you can start sharing or joining rides.</p>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Secure internal-only verification.</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Protecting employee network integrity.</span></li>
                        <li className="flex items-start gap-2"><span className="mt-1 text-orange-500">•</span><span>Fast resend and smart session checks.</span></li>
                    </ul>
                </div>
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg ring-1 ring-orange-100 p-8 relative overflow-hidden">
                        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-orange-100 blur-2xl opacity-70" />
                        <div className="relative">
                            <h2 className="text-2xl font-semibold tracking-tight mb-1">Verify your email</h2>
                            <p className="text-sm text-gray-500 mb-6">Enter the code we sent to <span className="font-medium text-orange-600">{email || 'your email'}</span></p>
                            {info && <div className="bg-orange-50 text-orange-700 border border-orange-200 text-xs p-3 rounded-lg mb-4">{info}</div>}
                            {error && <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-3 rounded-lg mb-4">{error}</div>}
                            <form onSubmit={verify} className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">Email</label>
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <FaEnvelope className="text-orange-400" />
                                        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="bg-transparent w-full outline-none text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-600">One-Time Password</label>
                                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                        <FaKey className="text-orange-400" />
                                        <input ref={otpRef} value={otp} onChange={e=>setOtp(e.target.value)} inputMode="numeric" maxLength={8} placeholder="Enter code" className="bg-transparent w-full outline-none tracking-widest text-sm font-medium" required />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-gray-500">
                                    <button type="button" onClick={resend} disabled={resendCooldown>0} className={`inline-flex items-center gap-1 font-medium ${resendCooldown>0? 'text-gray-400 cursor-not-allowed':'text-orange-600 hover:underline'}`}>
                                        <FaRedo className="text-[10px]" /> {resendCooldown>0? `Resend in ${resendCooldown}s`:'Resend code'}
                                    </button>
                                    <Link to="/register" className="hover:underline">Back to register</Link>
                                </div>
                                <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600">{loading? 'Verifying...':'Verify & Continue'}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-gray-500">© {new Date().getFullYear()} orangemantra • Internal use</footer>
            <div className="text-center text-xs text-gray-500"> Developed By • Harshit Soni .</div>
        </div>
    );
}

export default OtpVerify;

