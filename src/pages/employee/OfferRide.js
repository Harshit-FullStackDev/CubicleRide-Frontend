import React, { useState } from "react";
import api from "../../api/axios";

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

    const handleChange = (e) => {
        setRide({ ...ride, [e.target.name]: e.target.value });
        setSuccess(false); // clear success on change
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const empId = localStorage.getItem("empId");
        if (!empId) {
            setError("Employee ID missing. Please log in again.");
            return;
        }

        // Optional: Prevent past dates
        const today = new Date().toISOString().split("T")[0];
        if (ride.date < today) {
            setError("Please select a valid future date.");
            return;
        }

        try {
            await api.post("/ride/offer", {
                ...ride,
                empId, // backend expects this!
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
        } catch (error) {
            setError("Failed to offer ride. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 flex justify-center items-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🚗 Offer a Ride</h2>

                {success && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl mb-4 text-center font-medium">
                        ✅ Ride offered successfully!
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl mb-4 text-center font-medium">
                        ❌ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="origin"
                        placeholder="Pickup Location (e.g., Gurgaon Sector 29)"
                        value={ride.origin}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="destination"
                        placeholder="Drop Location (e.g., Noida Sector 62)"
                        value={ride.destination}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="date"
                        name="date"
                        value={ride.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="time"
                        name="arrivalTime"
                        value={ride.arrivalTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="carDetails"
                        placeholder="Car (e.g., Maruti Swift - DL8CAF1234)"
                        value={ride.carDetails}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        name="totalSeats"
                        min={1}
                        value={ride.totalSeats}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition duration-300"
                    >
                        🚘 Submit Ride Offer
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OfferRide;
