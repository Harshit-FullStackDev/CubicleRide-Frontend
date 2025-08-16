import React, { useState, useEffect, useMemo } from "react";
import api from "../../api/axios";
import {
    FaMapMarkerAlt,
    FaCar,
    FaChair,
    FaCalendarAlt,
    FaClock,
    FaArrowLeft,
    FaCheckCircle
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import EmployeeLayout from "../../components/EmployeeLayout";

function OfferRide() {
    const [ride, setRide] = useState({
        origin: "",
        destination: "",
        date: "",
        arrivalTime: "",
        carDetails: "",
        totalSeats: 1,
        instantBookingEnabled: true,
    fare: "",
    });
    const [locations, setLocations] = useState([]);
    const [success, setSuccess] = useState(false);
    const [globalError, setGlobalError] = useState("");
    const [checking, setChecking] = useState(true);
    const [activeRide, setActiveRide] = useState(null);
    const [vehicleStatus, setVehicleStatus] = useState(null);
    const [vehicleCapacity, setVehicleCapacity] = useState(null);
    const [baseCarDetails, setBaseCarDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/locations")
            .then(res => setLocations(res.data))
            .catch(() => setGlobalError("Failed to load locations"));
    }, []);

    // Check if user already has an active (upcoming) ride
    useEffect(() => {
        let ignore = false;
        const fetchMyRides = async () => {
            try {
                const res = await api.get("/ride/my-rides");
                const now = new Date();
                const upcoming = res.data.filter(r => r.status === 'Active' && r.date && r.arrivalTime);
                // Ensure still before arrival time
                for (const r of upcoming) {
                    try {
                        const scheduled = new Date(`${r.date}T${r.arrivalTime}`);
                        if (scheduled > now) {
                            if (!ignore) setActiveRide(r);
                            break;
                        }
                    } catch (e) { /* ignore parse issues */ }
                }
            } catch (e) {
                // If unauthorized, show generic message handled later on submit
            } finally {
                if (!ignore) setChecking(false);
            }
        };
        fetchMyRides();
        return () => { ignore = true; };
    }, []);

    // Check vehicle status
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/vehicle/my');
                setVehicleStatus(res.data);
                if (res.data && res.data.status === 'APPROVED') {
                    const detailsParts = [];
                    if (res.data.make) detailsParts.push(res.data.make);
                    if (res.data.model) detailsParts.push(res.data.model);
                    if (res.data.registrationNumber) detailsParts.push('(' + res.data.registrationNumber + ')');
                    const details = detailsParts.join(' ').trim();
                    setBaseCarDetails(details);
                    setVehicleCapacity(res.data.capacity || 4);
                    setRide(r => ({ ...r, carDetails: details, totalSeats: Math.min(r.totalSeats || 1, res.data.capacity || 4) }));
                }
            } catch {
                setVehicleStatus(null);
            }
        })();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'carDetails') return; // locked
        if (name === 'totalSeats') {
            let v = parseInt(value || '1', 10);
            if (Number.isNaN(v)) v = 1;
            if (vehicleCapacity != null) {
                v = Math.max(1, Math.min(vehicleCapacity, v));
            } else {
                v = Math.max(1, Math.min(8, v));
            }
            setRide(r => ({ ...r, totalSeats: v }));
        } else {
            setRide(r => ({ ...r, [name]: value }));
        }
        setSuccess(false);
        setGlobalError("");
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(t => ({ ...t, [name]: true }));
    };

    // Derived validation errors
    const fieldErrors = useMemo(() => {
        const errs = {};
        if (!ride.origin) errs.origin = 'Required';
        if (!ride.destination) errs.destination = 'Required';
        if (ride.origin && ride.destination && ride.origin === ride.destination) errs.destination = 'Pickup and drop cannot be same';
        if (!ride.date) errs.date = 'Required';
        if (ride.date) {
            const todayStr = new Date().toISOString().split('T')[0];
            if (ride.date < todayStr) errs.date = 'Cannot be past';
        }
        if (!ride.arrivalTime) errs.arrivalTime = 'Required';
        if (ride.arrivalTime && ride.date) {
            const todayStr = new Date().toISOString().split('T')[0];
            if (ride.date === todayStr) {
                const now = new Date();
                const selected = new Date(`${ride.date}T${ride.arrivalTime}`);
                if (selected < now) errs.arrivalTime = 'Time already passed';
            }
        }
        if (ride.totalSeats < 1) errs.totalSeats = 'Min 1 seat';
        if (vehicleCapacity != null && ride.totalSeats > vehicleCapacity) errs.totalSeats = `Max ${vehicleCapacity}`;
        if (ride.fare) {
            const f = parseFloat(ride.fare);
            if (isNaN(f) || f < 0) errs.fare = 'Invalid fare';
        }
        return errs;
    }, [ride, vehicleCapacity]);

    const hasErrors = Object.keys(fieldErrors).length > 0;

    const incrementSeats = (delta) => {
        setRide(r => {
            let v = (r.totalSeats || 1) + delta;
            const max = vehicleCapacity != null ? vehicleCapacity : 8;
            if (v < 1) v = 1;
            if (v > max) v = max;
            return { ...r, totalSeats: v };
        });
    };

    // Dynamic min time for today
    const minTime = useMemo(() => {
        if (!ride.date) return undefined;
        const todayStr = new Date().toISOString().split('T')[0];
        if (ride.date !== todayStr) return undefined;
        const now = new Date();
        // Round up to next 5 minutes for nicer UX
        const mins = now.getMinutes();
        const rounded = new Date(now.getTime() + ((5 - (mins % 5 || 5)) * 60000));
        return rounded.toISOString().substring(11,16);
    }, [ride.date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    setTouched({ origin: true, destination: true, date: true, arrivalTime: true, totalSeats: true, fare: true });
        setGlobalError("");
        if (hasErrors) return;

        const empId = localStorage.getItem("empId");
        if (!empId) {
            setGlobalError("Session expired. Please log in again.");
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/ride/offer", { ...ride, empId });
            setSuccess(true);
            setRide(r => ({
                origin: "",
                destination: "",
                date: "",
                arrivalTime: "",
                carDetails: baseCarDetails || "",
                totalSeats: 1,
                instantBookingEnabled: r.instantBookingEnabled, // preserve preference
                fare: "",
            }));
            setTouched({});
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setGlobalError(err.response?.data?.message || "You already have a published ride. Please publish a new ride after the active ride ends.");
            } else if (err.response?.data?.message) {
                setGlobalError(err.response.data.message);
            } else {
                setGlobalError("Failed to offer ride. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (checking) return <EmployeeLayout heading="Offer a Ride"><div className="animate-pulse text-blue-600 text-sm">Preparing form...</div></EmployeeLayout>;

    if (activeRide) return (
        <EmployeeLayout heading="Offer a Ride" subheading="Active ride already published">
            <div className="max-w-md mx-auto bg-white shadow-2xl rounded-2xl p-8 flex flex-col items-center">
                <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">Active Ride Already Published</h2>
                <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded w-full text-sm mb-4">You already have a published ride. Publish a new ride after it ends.</div>
                <div className="w-full text-left text-sm mb-4 space-y-1">
                    <p className="font-semibold">Current Active Ride:</p>
                    <p><strong>Route:</strong> {activeRide.origin} → {activeRide.destination}</p>
                    <p><strong>Date:</strong> {activeRide.date} at {activeRide.arrivalTime}</p>
                    <p><strong>Seats Left:</strong> {activeRide.availableSeats}</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <button onClick={() => navigate('/employee/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">Go to Dashboard</button>
                    <button onClick={() => navigate('/employee/join')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition">Browse Rides</button>
                </div>
            </div>
        </EmployeeLayout>
    );

    if (!vehicleStatus || vehicleStatus.status !== 'APPROVED') return (
        <EmployeeLayout heading="Offer a Ride" subheading="Vehicle verification required">
            <div className="max-w-md mx-auto bg-white shadow-2xl rounded-2xl p-8 text-center">
                <h2 className="text-xl font-bold text-blue-700 mb-4">Vehicle Verification Required</h2>
                <p className="text-sm text-gray-600 mb-4">Submit your vehicle details and have them approved before offering a ride.</p>
                {vehicleStatus && vehicleStatus.status === 'PENDING' && <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded mb-4 text-sm">Your vehicle is pending approval.</div>}
                {vehicleStatus && vehicleStatus.status === 'REJECTED' && <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded mb-4 text-sm">Rejected: {vehicleStatus.rejectionReason}</div>}
                <Link to="/employee/vehicle" className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">Go to Vehicle Page</Link>
            </div>
        </EmployeeLayout>
    );

    return (
        <EmployeeLayout heading="Offer a Ride" subheading="Help colleagues commute">
            <div className="relative bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-6 md:p-10 w-full max-w-5xl grid md:grid-cols-2 gap-8 border border-blue-100 mx-auto">
                <div className="md:col-span-2 flex items-center justify-between -mt-2">
                    <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium group">
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                    <span className="text-xs text-gray-400">Carpool • Offer Ride</span>
                </div>
                <div className="md:col-span-2">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600">Offer a Ride</h1>
                    <p className="text-sm text-gray-500 mt-1">Help colleagues commute and reduce congestion. Provide accurate details for a smooth experience.</p>
                </div>

                {success && (
                    <div className="md:col-span-2 flex items-start gap-3 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <FaCheckCircle className="text-green-500 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold">Ride published!</p>
                            <p className="text-green-700">Others can now discover and join your ride.</p>
                        </div>
                        <button onClick={()=>setSuccess(false)} className="ml-auto text-xs text-green-600 hover:underline">Dismiss</button>
                    </div>
                )}
                {globalError && (
                    <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                        {globalError}
                    </div>
                )}

                {/* Left column: form */}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="space-y-5">
                        {/* Booking mode */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Booking Mode</label>
                            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl px-4 py-3 text-xs sm:text-sm border border-blue-100">
                                <span className="mr-3 font-medium text-blue-700 flex-1">{ride.instantBookingEnabled ? 'Instant Booking (auto-accept)' : 'Review Requests (manual)'}</span>
                                <button type="button" onClick={() => setRide(r => ({...r, instantBookingEnabled: !r.instantBookingEnabled}))} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm text-xs">Switch</button>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Manual mode lets you approve or decline pending join requests.</p>
                        </div>
                        {/* Origin */}
                        <div>
                            <label htmlFor="origin" className="block text-sm font-semibold mb-1">Pickup Location</label>
                            <div className={`flex items-center rounded-xl px-4 py-3 border transition ${touched.origin && fieldErrors.origin ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-blue-50 focus-within:border-blue-400'}`}>
                                <FaMapMarkerAlt className="text-green-500 mr-2 shrink-0" />
                                <select id="origin" name="origin" value={ride.origin} onChange={handleChange} onBlur={handleBlur} className="bg-transparent w-full outline-none text-sm" required>
                                    <option value="">Select Pickup Location</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                                </select>
                            </div>
                            {touched.origin && fieldErrors.origin && <p className="text-xs text-red-600 mt-1">{fieldErrors.origin}</p>}
                        </div>
                        {/* Destination */}
                        <div>
                            <label htmlFor="destination" className="block text-sm font-semibold mb-1">Drop Location</label>
                            <div className={`flex items-center rounded-xl px-4 py-3 border transition ${touched.destination && fieldErrors.destination ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-blue-50 focus-within:border-blue-400'}`}>
                                <FaMapMarkerAlt className="text-red-500 mr-2 shrink-0" />
                                <select id="destination" name="destination" value={ride.destination} onChange={handleChange} onBlur={handleBlur} className="bg-transparent w-full outline-none text-sm" required>
                                    <option value="">Select Drop Location</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                                </select>
                            </div>
                            {touched.destination && fieldErrors.destination && <p className="text-xs text-red-600 mt-1">{fieldErrors.destination}</p>}
                        </div>
                        {/* Date */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-semibold mb-1">Date</label>
                            <div className={`flex items-center rounded-xl px-4 py-3 border transition ${touched.date && fieldErrors.date ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-blue-50 focus-within:border-blue-400'}`}>
                                <FaCalendarAlt className="text-purple-500 mr-2" />
                                <input id="date" name="date" type="date" min={new Date().toISOString().split('T')[0]} value={ride.date} onChange={handleChange} onBlur={handleBlur} required className="bg-transparent w-full outline-none text-sm" />
                            </div>
                            {touched.date && fieldErrors.date && <p className="text-xs text-red-600 mt-1">{fieldErrors.date}</p>}
                        </div>
                        {/* Time */}
                        <div>
                            <label htmlFor="arrivalTime" className="block text-sm font-semibold mb-1">Arrival Time</label>
                            <div className={`flex items-center rounded-xl px-4 py-3 border transition ${touched.arrivalTime && fieldErrors.arrivalTime ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-blue-50 focus-within:border-blue-400'}`}>
                                <FaClock className="text-yellow-500 mr-2" />
                                <input id="arrivalTime" name="arrivalTime" type="time" value={ride.arrivalTime} min={minTime} onChange={handleChange} onBlur={handleBlur} required className="bg-transparent w-full outline-none text-sm" />
                            </div>
                            {ride.date && minTime && <p className="text-[11px] text-gray-500 mt-1">Earliest today: {minTime}</p>}
                            {touched.arrivalTime && fieldErrors.arrivalTime && <p className="text-xs text-red-600 mt-1">{fieldErrors.arrivalTime}</p>}
                        </div>
                        {/* Car details (locked) */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Car Details</label>
                            <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 opacity-80 cursor-not-allowed" title="Car details come from approved vehicle">
                                <FaCar className="text-gray-500 mr-2" />
                                <input name="carDetails" type="text" value={ride.carDetails} disabled className="bg-transparent w-full outline-none text-sm" placeholder="Car model & registration" />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Change via Vehicle page (will trigger re-approval).</p>
                        </div>
                        {/* Seats */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Total Seats</label>
                            <div className={`flex items-center rounded-xl px-3 py-2 border bg-blue-50/70 backdrop-blur transition ${touched.totalSeats && fieldErrors.totalSeats ? 'border-red-300 bg-red-50' : 'border-blue-100 focus-within:border-blue-400'}`}>
                                <button type="button" onClick={() => incrementSeats(-1)} className="w-9 h-9 rounded-lg bg-white shadow text-blue-600 font-bold text-lg flex items-center justify-center disabled:opacity-40" disabled={ride.totalSeats <= 1}>-</button>
                                <div className="flex-1 flex items-center justify-center select-none">
                                    <FaChair className="text-pink-500 mr-2" />
                                    <input name="totalSeats" type="number" min={1} max={vehicleCapacity || 8} value={ride.totalSeats} onChange={handleChange} onBlur={handleBlur} className="w-16 text-center bg-transparent outline-none font-semibold" />
                                </div>
                                <button type="button" onClick={() => incrementSeats(1)} className="w-9 h-9 rounded-lg bg-white shadow text-blue-600 font-bold text-lg flex items-center justify-center disabled:opacity-40" disabled={vehicleCapacity != null ? ride.totalSeats >= vehicleCapacity : ride.totalSeats >= 8}>+</button>
                            </div>
                            <div className="flex justify-between items-start">
                                {vehicleCapacity != null && <p className="text-[11px] text-gray-500 mt-1">Capacity: up to {vehicleCapacity} seats.</p>}
                                {touched.totalSeats && fieldErrors.totalSeats && <p className="text-xs text-red-600 mt-1">{fieldErrors.totalSeats}</p>}
                            </div>
                        </div>
                        {/* Fare */}
                        <div>
                            <label className="block text-sm font-semibold mb-1">Fare per Seat (optional)</label>
                            <div className={`flex items-center rounded-xl px-4 py-3 border transition ${touched.fare && fieldErrors.fare ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-blue-50 focus-within:border-blue-400'}`}>
                                <span className="text-gray-500 mr-2">₹</span>
                                <input name="fare" type="number" min="0" step="0.01" value={ride.fare} onChange={handleChange} onBlur={handleBlur} placeholder="0 (free)" className="bg-transparent w-full outline-none text-sm" />
                            </div>
                            {touched.fare && fieldErrors.fare && <p className="text-xs text-red-600 mt-1">{fieldErrors.fare}</p>}
                            <p className="text-[11px] text-gray-500 mt-1">Leave blank for free ride.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={submitting || hasErrors} className={`flex-1 relative overflow-hidden group rounded-xl py-3 font-semibold text-white shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed ${hasErrors ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            <span className={`${submitting ? 'opacity-0' : 'opacity-100'} transition`}>Offer Ride</span>
                            {submitting && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </span>
                            )}
                        </button>
                        <button type="button" onClick={() => { setRide(r => ({ ...r, origin:'', destination:'', date:'', arrivalTime:'', totalSeats:1, fare:"" })); setTouched({}); setGlobalError(''); setSuccess(false); }} className="px-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium">Reset</button>
                    </div>
                </form>

                {/* Right column: Dynamic summary */}
                <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                        <h2 className="text-sm font-semibold tracking-wide uppercase opacity-90">Live Preview</h2>
                        <p className="mt-1 text-lg font-bold flex items-center">{ride.origin || 'Pickup'} <span className="mx-2 text-white/60">→</span> {ride.destination || 'Drop'}</p>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-white/70">Date</span><span>{ride.date || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-white/70">Arrival</span><span>{ride.arrivalTime || '—'}</span></div>
                            <div className="flex justify-between"><span className="text-white/70">Seats</span><span>{ride.totalSeats}</span></div>
                            <div className="flex justify-between"><span className="text-white/70">Mode</span><span>{ride.instantBookingEnabled ? 'Instant' : 'Manual'}</span></div>
                            <div className="flex justify-between"><span className="text-white/70">Fare</span><span>{ride.fare ? `₹${ride.fare}` : 'Free'}</span></div>
                        </div>
                        <div className="mt-5 text-[11px] text-white/80">Review the preview before publishing. Changes update instantly.</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                        <h3 className="font-semibold text-sm mb-2">Tips for a Great Ride</h3>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                            <li>Set an arrival time slightly earlier than needed.</li>
                            <li>Keep car details updated for trust & safety.</li>
                            <li>Use manual mode if you prefer screening riders.</li>
                            <li>Reset the form anytime using the Reset button.</li>
                        </ul>
                    </div>
                    <div className="text-[11px] text-gray-400">By offering a ride you agree to the community guidelines.</div>
                </div>
            </div>
        </EmployeeLayout>
    );
}

export default OfferRide;