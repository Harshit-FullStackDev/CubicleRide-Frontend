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

    const handleChange = (e) => {
        setRide({ ...ride, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/ride/offer", ride);
            alert("Ride offered successfully!");
            setRide({
                origin: "",
                destination: "",
                date: "",
                arrivalTime: "",
                carDetails: "",
                totalSeats: 1,
            });
        } catch (error) {
            alert("Failed to offer ride. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 flex justify-center items-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">🚗 Offer a Ride</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="origin"
                        placeholder="Origin (e.g., Gurgaon)"
                        value={ride.origin}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="destination"
                        placeholder="Destination (e.g., Noida)"
                        value={ride.destination}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="date"
                        name="date"
                        value={ride.date}
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
                        placeholder="Car Details (e.g., Maruti Swift DL8CAF1234)"
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
