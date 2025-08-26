import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaClock } from "react-icons/fa";
import api from "../../api/axios";
// import EmployeeLayout from "../../components/EmployeeLayout"; // deprecated
import PageContainer from "../../components/PageContainer";

function EditRide() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ride, setRide] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    // removed separate errors state; derive validation from fieldErrors
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [vehicleCapacity, setVehicleCapacity] = useState(null);
    const [fareInput, setFareInput] = useState("");

    // Fetch ride details
    useEffect(() => {
        const fetchRide = async () => {
            try {
                const res = await api.get(`/ride/edit/${id}`);
                setRide(res.data);
                if (res.data.fare != null) setFareInput(res.data.fare);
            } catch (err) {
                alert("Failed to fetch ride details.");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };
        fetchRide();
    }, [id, navigate]);

    // Fetch location list
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await api.get("/locations");
                setLocations(res.data);
            } catch (err) {
                console.error("Failed to load locations", err);
            }
        };
        fetchLocations();
    }, []);

    // Fetch vehicle info for capacity constraint
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/vehicle/my');
                if (res.data) {
                    const cap = parseInt(res.data.capacity, 10);
                    if (!isNaN(cap) && cap > 0) setVehicleCapacity(cap);
                }
            } catch (e) {
                // silently ignore, fallback to default max (8)
            }
        })();
    }, []);

    // Clamp seats when capacity or ride loads
    useEffect(() => {
        if (!ride) return;
        if (vehicleCapacity != null) {
            if (ride.totalSeats > vehicleCapacity || ride.availableSeats > vehicleCapacity) {
                setRide(r => ({
                    ...r,
                    totalSeats: Math.min(r.totalSeats, vehicleCapacity),
                    availableSeats: Math.min(r.availableSeats, vehicleCapacity, Math.min(r.totalSeats, vehicleCapacity)),
                }));
            }
        }
    }, [vehicleCapacity, ride]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'totalSeats') {
            let v = parseInt(value || '1', 10);
            if (isNaN(v) || v < 1) v = 1;
            const max = vehicleCapacity != null ? vehicleCapacity : 8;
            if (v > max) v = max;
            setRide(r => ({ ...r, totalSeats: v, availableSeats: Math.min(r.availableSeats, v) }));
            return;
        }
        if (name === 'availableSeats') {
            let v = parseInt(value || '0', 10);
            if (isNaN(v) || v < 0) v = 0;
            const maxAvail = Math.min(ride.totalSeats || 0, vehicleCapacity != null ? vehicleCapacity : 9999);
            if (v > maxAvail) v = maxAvail;
            setRide(r => ({ ...r, availableSeats: v }));
            return;
        }
        setRide({ ...ride, [name]: value });
    };

    // Derived validation errors mirroring OfferRide constraints
    const fieldErrors = useMemo(() => {
        if (!ride) return {};
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
                try {
                    const selected = new Date(`${ride.date}T${ride.arrivalTime}`);
                    if (selected < new Date()) errs.arrivalTime = 'Time already passed';
                } catch { /* ignore */ }
            }
        }
        if (!ride.carDetails) errs.carDetails = 'Car details required';
        if (!ride.totalSeats || ride.totalSeats < 1) errs.totalSeats = 'Min 1 seat';
        if (vehicleCapacity != null && ride.totalSeats > vehicleCapacity) errs.totalSeats = `Max ${vehicleCapacity}`;
        if (ride.availableSeats > ride.totalSeats) errs.availableSeats = 'Cannot exceed total';
        if (vehicleCapacity != null && ride.availableSeats > vehicleCapacity) errs.availableSeats = `Max ${vehicleCapacity}`;
        if (fareInput) {
            const f = parseFloat(fareInput);
            if (isNaN(f) || f < 0) errs.fare = 'Invalid fare';
        }
        return errs;
    }, [ride, fareInput, vehicleCapacity]);

    // Dynamic min time for today (mirrors OfferRide component)
    const minTime = useMemo(() => {
        if (!ride?.date) return undefined;
        const todayStr = new Date().toISOString().split('T')[0];
        if (ride.date !== todayStr) return undefined;
        const now = new Date();
        const mins = now.getMinutes();
        const rounded = new Date(now.getTime() + ((5 - (mins % 5 || 5)) * 60000));
        return rounded.toISOString().substring(11,16);
    }, [ride?.date]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // mark all touched on submit
        setTouched({ origin:true, destination:true, date:true, arrivalTime:true, carDetails:true, totalSeats:true, availableSeats:true, fare:true });
    if (Object.keys(fieldErrors).length) return; // prevent submit if errors
        setSubmitting(true);
        try {
            const payload = { ...ride };
            if (fareInput) payload.fare = parseFloat(fareInput);
            else payload.fare = null;
            await api.put(`/ride/edit/${id}`, payload);
            alert("Ride updated!");
            window.dispatchEvent(new CustomEvent('ride:updated'));
            navigate("/");
        } catch (err) {
            alert("Failed to update ride.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(t => ({ ...t, [name]: true }));
        // sync errors on blur
    // no-op: relying on derived fieldErrors
    };

    if (loading || !ride) return <PageContainer><h1 className="text-xl font-semibold mb-4">Edit Ride</h1><div className="flex items-center gap-2 text-blue-600 text-sm"><span className="animate-spin h-5 w-5 border-b-2 border-blue-500 rounded-full inline-block"/> Loading...</div></PageContainer>;

    return (
                <PageContainer>
            <div className="bg-white/90 shadow-lg rounded-xl p-8 w-full max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-[#054652] flex items-center gap-2">
                    <FaCar className="text-[#054652]" /> Edit Ride
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaMapMarkerAlt /> Origin
                            </label>
                            <select
                                name="origin"
                                value={ride.origin}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="border p-2 w-full rounded"
                            >
                                <option value="">Select Origin</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                            {touched.origin && fieldErrors.origin && <span className="text-red-500 text-xs">{fieldErrors.origin}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaMapMarkerAlt /> Destination
                            </label>
                            <select
                                name="destination"
                                value={ride.destination}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="border p-2 w-full rounded"
                            >
                                <option value="">Select Destination</option>
                                {locations.map((loc) => (
                                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                                ))}
                            </select>
                            {touched.destination && fieldErrors.destination && <span className="text-red-500 text-xs">{fieldErrors.destination}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaCalendarAlt /> Date
                            </label>
                            <input
                                name="date"
                                type="date"
                                value={ride.date}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={new Date().toISOString().split('T')[0]}
                                className="border p-2 w-full rounded"
                            />
                            {touched.date && fieldErrors.date && <span className="text-red-500 text-xs">{fieldErrors.date}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaClock /> Arrival Time
                            </label>
                            <input
                                name="arrivalTime"
                                type="time"
                                value={ride.arrivalTime}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                min={minTime}
                                className="border p-2 w-full rounded"
                            />
                            {ride.date && minTime && <span className="text-gray-500 text-[10px] block mt-0.5">Earliest today: {minTime}</span>}
                            {touched.arrivalTime && fieldErrors.arrivalTime && <span className="text-red-500 text-xs">{fieldErrors.arrivalTime}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaCar /> Car Details
                            </label>
                            <input
                                name="carDetails"
                                value={ride.carDetails}
                                disabled
                                className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
                                placeholder="Car Details"
                            />
                            {touched.carDetails && fieldErrors.carDetails && <span className="text-red-500 text-xs">{fieldErrors.carDetails}</span>}
                            <span className="text-[10px] text-gray-500">Car details come from approved vehicle. Edit on Vehicle page.</span>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Fare (per seat, optional)</label>
                            <input
                                name="fare"
                                type="number"
                                min="0"
                                step="0.01"
                                value={fareInput}
                                onChange={(e)=>setFareInput(e.target.value)}
                                onBlur={handleBlur}
                                className="border p-2 w-full rounded"
                                placeholder="e.g. 50"
                            />
                            {touched.fare && fieldErrors.fare && <span className="text-red-500 text-xs">{fieldErrors.fare}</span>}
                            <span className="text-[10px] text-gray-500">Leave blank for free ride.</span>
                        </div>

                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaUsers /> Total Seats
                            </label>
                            <input
                                name="totalSeats"
                                type="number"
                                min={1}
                                max={vehicleCapacity != null ? vehicleCapacity : 8}
                                value={ride.totalSeats}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="border p-2 w-full rounded"
                                placeholder="Total Seats"
                            />
                            {touched.totalSeats && fieldErrors.totalSeats && <span className="text-red-500 text-xs">{fieldErrors.totalSeats}</span>}
                            {vehicleCapacity != null && !fieldErrors.totalSeats && <span className="text-gray-500 text-xs">Capacity limit: {vehicleCapacity}</span>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium flex items-center gap-1">
                                <FaUsers /> Available Seats
                            </label>
                            <input
                                name="availableSeats"
                                type="number"
                                min={0}
                                max={Math.min(ride.totalSeats || 0, vehicleCapacity != null ? vehicleCapacity : ride.totalSeats || 0)}
                                value={ride.availableSeats}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="border p-2 w-full rounded"
                                placeholder="Available Seats"
                            />
                            {touched.availableSeats && fieldErrors.availableSeats && <span className="text-red-500 text-xs">{fieldErrors.availableSeats}</span>}
                            {vehicleCapacity != null && !fieldErrors.availableSeats && <span className="text-gray-500 text-xs">Within capacity: {vehicleCapacity}</span>}
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block mb-1 font-medium">Booking Mode</label>
                            <div className="flex items-center justify-between bg-blue-50 border rounded p-3 text-sm">
                                <span className="font-semibold text-blue-700">{ride.instantBookingEnabled ? 'Instant Booking (auto-accept)' : 'Review Requests (manual)'}</span>
                                <button type="button" onClick={() => setRide(r => ({...r, instantBookingEnabled: !r.instantBookingEnabled}))} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">Switch</button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">If manual, joiners become pending until you approve.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            type="submit"
                            disabled={submitting || Object.keys(fieldErrors).length > 0}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            {submitting ? "Saving..." : Object.keys(fieldErrors).length ? 'Fix Errors' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-semibold transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
    </PageContainer>
    );
}

export default EditRide;
