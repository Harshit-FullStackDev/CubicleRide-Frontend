import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

function OfferRide() {
    const [ride, setRide] = useState({
        origin: "",
        destination: "",
        date: "",
        arrivalTime: "",
        carDetails: "",
        totalSeats: 1,
    });
    const [locations, setLocations] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(true);
    const [activeRide, setActiveRide] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/locations")
            .then(res => setLocations(res.data))
            .catch(() => setError("Failed to load locations"));
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

    const handleChange = (e) => {
        setRide({ ...ride, [e.target.name]: e.target.value });
        setSuccess(false);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (ride.totalSeats < 1 || ride.totalSeats > 8) {
            setError("Total seats must be between 1 and 8");
            return;
        }

        const empId = localStorage.getItem("empId");
        if (!empId) {
            setError("Employee ID missing. Please log in again.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (ride.date < today) {
            setError("Please select a valid future date.");
            return;
        }
        try {
            await api.post("/ride/offer", {
                ...ride,
                empId,
            });
            setSuccess(true);
            setRide({
                origin: "",
                destination: "",
                date: "",
                arrivalTime: "",
                carDetails: "",
                totalSeats: 1,
            });
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError(err.response.data && err.response.data.message ? err.response.data.message : "You already have a published ride. Please publish a new ride after the active ride ends.");
            } else if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to offer ride. Please try again.");
            }
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">Checking your current rides...</div>
            </div>
        );
    }

    if (activeRide) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full flex flex-col items-center">
                    <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 flex items-center self-start">
                        <FaArrowLeft className="mr-2" /> Back
                    </button>
                    <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Active Ride Already Published</h2>
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded w-full text-sm mb-4">
                        You already have a published ride. Please publish a new ride after the active ride ends.
                    </div>
                    <div className="w-full text-left text-sm mb-4">
                        <p className="font-semibold mb-1">Current Active Ride:</p>
                        <p><strong>Route:</strong> {activeRide.origin} → {activeRide.destination}</p>
                        <p><strong>Date:</strong> {activeRide.date} at {activeRide.arrivalTime}</p>
                        <p><strong>Seats Left:</strong> {activeRide.availableSeats}</p>
                    </div>
                    <button onClick={() => navigate('/employee/dashboard')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition mb-2">Go to Dashboard</button>
                    <button onClick={() => navigate('/employee/join')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition">Browse Rides</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full flex flex-col items-center">
                <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 flex items-center self-start">
                    <FaArrowLeft className="mr-2" /> Back
                </button>
                <h2 className="text-3xl font-bold text-blue-700 mb-2">Offer a Ride</h2>
                <p className="text-gray-500 mb-6 text-center">Fill in your ride details and help colleagues commute!</p>

                {success && (
                    <div className="flex items-center bg-green-100 text-green-800 p-3 rounded mb-4 animate-bounce">
                        <FaCheckCircle className="mr-2 text-green-600" />
                        Ride offered successfully!
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                    <div>
                        <label className="block font-semibold mb-1">Pickup Location</label>
                        <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                            <FaMapMarkerAlt className="text-green-500 mr-2" />
                            <select name="origin" value={ride.origin} onChange={handleChange} required className="bg-transparent w-full outline-none">
                                <option value="">Select Pickup Location</option>
                                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Drop Location</label>
                        <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                            <FaMapMarkerAlt className="text-red-500 mr-2" />
                            <select name="destination" value={ride.destination} onChange={handleChange} required className="bg-transparent w-full outline-none">
                                <option value="">Select Drop Location</option>
                                {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Date</label>
                        <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                            <FaCalendarAlt className="text-purple-500 mr-2" />
                            <input name="date" type="date" min={new Date().toISOString().split("T")[0]}
                                   value={ride.date} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Arrival Time</label>
                        <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                            <FaClock className="text-yellow-500 mr-2" />
                            <input name="arrivalTime" type="time"
                                   value={ride.arrivalTime} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Car Details</label>
                        <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                            <FaCar className="text-gray-500 mr-2" />
                            <input name="carDetails" type="text" placeholder="Car model & registration"
                                   value={ride.carDetails} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Total Seats</label>
                        <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                            <FaChair className="text-pink-500 mr-2" />
                            <input name="totalSeats" type="number" min={1} max={8}
                                   value={ride.totalSeats} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition">
                        Offer Ride
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OfferRide;