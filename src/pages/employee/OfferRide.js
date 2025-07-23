import React, { useState } from "react";
import api from "../../api/axios";

function OfferRide() {
    const [data, setData] = useState({
        route: "",
        totalSeats: 0,
        arrivalTime: ""
    });

    const handleChange = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/ride/offer", data);
            alert("Ride offered successfully");
            setData({ route: "", totalSeats: 0, arrivalTime: "" });
        } catch (err) {
            alert("Error offering ride");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Offer a Ride</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="route"
                        placeholder="Route"
                        value={data.route}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                        name="totalSeats"
                        placeholder="Number of Seats"
                        type="number"
                        value={data.totalSeats}
                        onChange={handleChange}
                        required
                        min={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                        name="arrivalTime"
                        placeholder="Arrival Time"
                        type="time"
                        value={data.arrivalTime}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold transition duration-300"
                    >
                        🚗 Offer Ride
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OfferRide;
