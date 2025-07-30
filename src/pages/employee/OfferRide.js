import React, { useState } from "react";
import api from "../../api/axios";
import {
    FaMapMarkerAlt,
    FaCar,
    FaChair,
    FaCalendarAlt,
    FaClock,
    FaArrowLeft
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
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setRide({ ...ride, [e.target.name]: e.target.value });
        setSuccess(false);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        } catch {
            setError("Failed to offer ride. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border border-blue-100">
                <button
                    onClick={() => navigate(-1)}
                    className="self-start mb-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <FaArrowLeft /> Back
                </button>
                <img src="/orangemantra Logo.png" alt="Logo" className="w-16 h-16 mb-4 rounded-full shadow" />
                <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">Offer a Ride</h2>
                <p className="text-gray-500 mb-6 text-center">Fill in the details to publish your ride for others to join.</p>
                {success && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl mb-4 text-center font-medium border border-green-200 shadow">
                        ✅ Ride offered successfully!
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl mb-4 text-center font-medium border border-red-200 shadow">
                        ❌ {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 focus-within:ring-2 focus-within:ring-blue-300 transition">
                        <FaMapMarkerAlt className="text-green-500" />
                        <input
                            type="text"
                            name="origin"
                            placeholder="Pickup Location"
                            value={ride.origin}
                            onChange={handleChange}
                            required
                            className="bg-transparent w-full outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 focus-within:ring-2 focus-within:ring-blue-300 transition">
                        <FaMapMarkerAlt className="text-red-500" />
                        <input
                            type="text"
                            name="destination"
                            placeholder="Drop Location"
                            value={ride.destination}
                            onChange={handleChange}
                            required
                            className="bg-transparent w-full outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 focus-within:ring-2 focus-within:ring-blue-300 transition">
                        <FaCalendarAlt className="text-purple-500" />
                        <input
                            type="date"
                            name="date"
                            value={ride.date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={handleChange}
                            required
                            className="bg-transparent w-full outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 focus-within:ring-2 focus-within:ring-blue-300 transition">
                        <FaClock className="text-yellow-500" />
                        <input
                            type="time"
                            name="arrivalTime"
                            value={ride.arrivalTime}
                            onChange={handleChange}
                            required
                            className="bg-transparent w-full outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 focus-within:ring-2 focus-within:ring-blue-300 transition">
                        <FaCar className="text-gray-500" />
                        <input
                            type="text"
                            name="carDetails"
                            placeholder="Car (e.g., Maruti Swift - DL8CAF1234)"
                            value={ride.carDetails}
                            onChange={handleChange}
                            required
                            className="bg-transparent w-full outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 focus-within:ring-2 focus-within:ring-blue-300 transition">
                        <FaChair className="text-pink-500" />
                        <input
                            type="number"
                            name="totalSeats"
                            min={1}
                            value={ride.totalSeats}
                            onChange={handleChange}
                            required
                            className="bg-transparent w-full outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition mt-2 shadow-lg hover:shadow-xl"
                    >
                        Offer Ride
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OfferRide;