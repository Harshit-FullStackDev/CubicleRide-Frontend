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
        setInfo('Resending code...');
        try {
            await api.post('/auth/resend-otp', { email });
            setInfo('New code sent.');
            setResendCooldown(30);
            timerRef.current && clearInterval(timerRef.current);
            timerRef.current = setInterval(()=>{
                setResendCooldown(p=>{ if(p<=1){ clearInterval(timerRef.current); return 0;} return p-1;});
            },1000);
        } catch (err) {
            const raw = err?.response?.data;
            let msg = 'Could not resend code';
            if (typeof raw === 'string') msg = raw; else if (raw && typeof raw === 'object') msg = raw.message || raw.error || msg;
            setError(msg);
            setInfo('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <header className="h-16 flex items-center justify-between px-4 md:px-6 lg:px-12 border-b bg-white/80 backdrop-blur sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/OMLogo.svg" alt="CubicleRide" className="h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-3 text-sm">
                    <Link to="/login" className="px-4 py-2 rounded-full font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">Sign in</Link>
                </div>
            </header>
            <main className="flex-1 w-full mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-center px-4 md:px-6 lg:px-12 py-10">
                <div className="hidden lg:flex flex-col gap-6 pr-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2">
                        <FaKey className="h-4 w-4" />
                        Secure Verification
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                        Verify your email
                        <span className="block text-blue-600 text-3xl xl:text-4xl mt-2">
                            Quick & Secure
                        </span>
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-md">
                        We've sent a verification code to your email. Enter it below to confirm your account and get started with CubicleRide.
                    </p>
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 font-semibold text-xs">1</span>
                            </div>
                            <span>Check your email inbox (and spam folder)</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 font-semibold text-xs">2</span>
                            </div>
                            <span>Enter the 6-digit verification code below</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 font-semibold text-xs">3</span>
                            </div>
                            <span>Complete registration and start using CubicleRide</span>
                        </div>
                    </div>
                </div>
                <div className="w-full max-w-md mx-auto">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 blur-3xl opacity-60" />
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 blur-3xl opacity-40" />
                        <div className="relative">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <FaEnvelope className="h-7 w-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight mb-2">Check Your Email</h2>
                                <p className="text-sm text-gray-600">
                                    We sent a verification code to
                                    <br />
                                    <span className="font-semibold text-blue-600">{email || 'your email'}</span>
                                </p>
                            </div>
                            
                            {info && (
                                <div className="bg-blue-50 text-blue-800 border border-blue-200 text-sm p-4 rounded-lg mb-4 flex items-start gap-2">
                                    <FaEnvelope className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <span>{info}</span>
                                </div>
                            )}
                            {error && (
                                <div className="bg-red-50 text-red-800 border border-red-200 text-sm p-4 rounded-lg mb-4 flex items-start gap-2">
                                    <span className="text-red-500 font-bold">!</span>
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <form onSubmit={verify} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50 text-gray-600"
                                            placeholder="your.email@company.com"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Verification Code</label>
                                    <div className="relative">
                                        <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            ref={otpRef}
                                            type="text"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-center text-lg font-mono tracking-widest"
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                            autoComplete="one-time-code"
                                            inputMode="numeric"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <button 
                                        type="button" 
                                        onClick={resend} 
                                        disabled={resendCooldown>0} 
                                        className={`inline-flex items-center gap-2 font-medium transition-colors ${
                                            resendCooldown>0 
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-blue-600 hover:text-blue-700'
                                        }`}
                                    >
                                        <FaRedo className="h-3 w-3" /> 
                                        {resendCooldown>0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                                    </button>
                                    <Link to="/register" className="text-gray-500 hover:text-gray-700 transition-colors">
                                        Back to register
                                    </Link>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading || !otp.trim()}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Verifying...</span>
                                        </div>
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-gray-500">
                <div>© {new Date().getFullYear()} CubicleRide • Smart Employee Carpooling Platform</div>
                <div className="mt-1">Developed by Harshit Soni</div>
            </footer>
        </div>
    );
}

export default OtpVerify;

