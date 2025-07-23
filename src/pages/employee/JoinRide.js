import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function JoinRide() {
    const [rides, setRides] = useState([]);
    const [empId, setEmpId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/ride/all").then(res => setRides(res.data));
    }, []);

    const joinRide = async (id) => {
        if (!empId.trim()) {
            setError("Please enter your Employee ID before joining a ride.");
            return;
        }

        setError(""); // clear previous error
        try {
            await api.post(`/ride/join/${id}`, { empId });
            alert("Successfully joined the ride.");
        } catch {
            alert("Failed to join ride.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 p-6 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Join a Ride</h2>

                <div className="mb-6">
                    <input
                        placeholder="Enter Your Employee ID"
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {error && (
                        <p className="text-red-600 mt-2 text-sm">{error}</p>
                    )}
                </div>

                <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Rides</h3>
                {rides.length === 0 ? (
                    <p className="text-gray-500">No rides available right now.</p>
                ) : (
                    <div className="space-y-4">
                        {rides.map((ride) => (
                            <div
                                key={ride.id}
                                className="border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">🚗 Route: {ride.route}</p>
                                    <p className="text-sm text-gray-600">🪑 Seats Left: {ride.availableSeats}</p>
                                    <p className="text-sm text-gray-500">🕒 Arrival: {ride.arrivalTime}</p>
                                </div>
                                <button
                                    onClick={() => joinRide(ride.id)}
                                    disabled={!empId.trim()}
                                    className={`px-5 py-2 rounded-xl font-semibold transition duration-300 ${
                                        empId.trim()
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    Join
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("role");
                                window.location.href = "/login";
                            }}
                            className="mt-6 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition"
                        >
                            🔒 Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JoinRide;
