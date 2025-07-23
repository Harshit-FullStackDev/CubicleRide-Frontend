import React, { useState, useEffect } from "react";
import api from "../../api/axios";

function OfferRide() {
    const [data, setData] = useState({
        route: "",
        totalSeats: 0,
        arrivalTime: ""
    });
    const [pastRides, setPastRides] = useState([]);

    const handleChange = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/ride/offer", data);
            alert("Ride offered successfully");
            setData({ route: "", totalSeats: 0, arrivalTime: "" });
            fetchPastRides();
        } catch (err) {
            alert("Error offering ride");
        }
    };

    const fetchPastRides = async () => {
        try {
            const res = await api.get("/ride/my-rides");
            setPastRides(res.data);
        } catch (err) {
            console.error("Failed to fetch past rides");
        }
    };

    useEffect(() => {
        fetchPastRides();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6">
            {/* Offer Ride Form */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto mb-10">
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

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            window.location.href = "/login";
                        }}
                        className="w-full mt-2 bg-gray-300 hover:bg-gray-400 text-black py-3 rounded-xl font-semibold transition duration-300"
                    >
                        🔒 Logout
                    </button>
                </form>
            </div>

            {/* Past Rides Section */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-700 mb-4 text-center">🕘 Past Rides You Offered</h3>
                {pastRides.length === 0 ? (
                    <p className="text-gray-500 text-center">You haven't offered any rides yet.</p>
                ) : (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                        {pastRides.map((ride) => (
                            <div
                                key={ride.id}
                                className="border border-gray-200 p-4 rounded-xl shadow-sm flex justify-between hover:shadow-md transition"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">🚗 Route: {ride.route}</p>
                                    <p className="text-sm text-gray-600">🪑 {ride.availableSeats}/{ride.totalSeats} seats available</p>
                                    <p className="text-sm text-gray-500">🕒 Arrival: {ride.arrivalTime}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OfferRide;
