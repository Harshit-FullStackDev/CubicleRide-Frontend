import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function JoinRide() {
    const [rides, setRides] = useState([]);
    const [empId, setEmpId] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const id = localStorage.getItem("empId");
        if (id) setEmpId(id);

        api.get("/ride/all").then((res) => setRides(res.data));
    }, []);

    const joinRide = async (id, ride) => {
        setError("");
        try {
            await api.post(`/ride/join/${id}`, { empId });
            alert(`🎉 You have successfully joined the ride from ${ride.origin} to ${ride.destination}!`);
            // Refresh available rides list after joining
            const updatedRides = await api.get("/ride/all");
            setRides(updatedRides.data);
        } catch {
            alert("❌ Failed to join ride. You might already be part of it or it's full.");
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-yellow-400 via-red-400 to-pink-500 p-6 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Join a Ride</h2>

                <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Rides</h3>
                {rides.length === 0 ? (
                    <p className="text-gray-500">No rides available right now.</p>
                ) : (
                    <div className="space-y-4">
                        {rides.map((ride) => {
                            const isOwnRide = ride.ownerEmpId === empId;
                            const isFull = ride.availableSeats === 0;
                            return (
                                <div
                                    key={ride.id}
                                    className={`border p-4 rounded-xl shadow-sm flex items-center justify-between ${
                                        isFull || isOwnRide ? "bg-gray-100" : "bg-white"
                                    } hover:shadow-md transition`}
                                >
                                    <div>
                                        <p className="font-semibold text-gray-800">
                                            🛣 {ride.origin} → {ride.destination}
                                        </p>
                                        <p className="text-sm text-gray-600">📅 {ride.date}</p>
                                        <p className="text-sm text-gray-600">🚘 Car: {ride.carDetails}</p>
                                        <p className="text-sm text-gray-600">🪑 Seats Left: {ride.availableSeats}</p>
                                        <p className="text-sm text-gray-600">🧑 Owner: {ride.ownerEmpId}</p>
                                        <p className="text-sm text-gray-500">🕒 Arrival: {ride.arrivalTime}</p>
                                    </div>
                                    <button
                                        onClick={() => joinRide(ride.id, ride)}
                                        disabled={isOwnRide || isFull}
                                        className={`px-5 py-2 rounded-xl font-semibold transition duration-300 ${
                                            isOwnRide || isFull
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-red-500 hover:bg-red-600 text-white"
                                        }`}
                                    >
                                        {isOwnRide
                                            ? "Your Ride"
                                            : isFull
                                                ? "Full"
                                                : "Join"}
                                    </button>
                                </div>
                            );
                        })}

                        <button
                            onClick={logout}
                            className="mt-6 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition"
                        >
                            🔒 Logout
                        </button>
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        </div>
    );
}

export default JoinRide;
