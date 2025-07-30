import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
    FaMapMarkerAlt,
    FaCar,
    FaChair,
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaSignOutAlt,
    FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function JoinRide() {
    const [rides, setRides] = useState([]);
    const [empId, setEmpId] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
            const updatedRides = await api.get("/ride/all");
            setRides(updatedRides.data);
        } catch {
            setError("❌ Failed to join ride. You might already be part of it or it's full.");
        }
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white bg-opacity-95 p-8 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col items-center border border-blue-100">
                <button
                    onClick={() => navigate(-1)}
                    className="self-start mb-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <FaArrowLeft /> Back
                </button>
                <img src="/orangemantra Logo.png" alt="Logo" className="w-16 h-16 mb-4 rounded-full shadow" />
                <h2 className="text-3xl font-bold text-blue-700 mb-2 text-center">Join a Ride</h2>
                <p className="text-gray-500 mb-6 text-center">Browse and join available rides offered by your colleagues.</p>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 w-full text-left">Available Rides</h3>
                {rides.length === 0 ? (
                    <p className="text-gray-500">No rides available right now.</p>
                ) : (
                    <div className="space-y-4 w-full">
                        {rides.map((ride) => {
                            const isOwnRide = ride.ownerEmpId === empId;
                            const isFull = ride.availableSeats === 0;
                            return (
                                <div
                                    key={ride.id}
                                    className={`bg-blue-50 rounded-xl shadow flex flex-col md:flex-row items-center justify-between p-5 gap-4 border border-blue-100 ${
                                        isFull || isOwnRide ? "opacity-60" : "hover:shadow-lg"
                                    } transition`}
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 text-lg font-semibold text-blue-700">
                                            <FaMapMarkerAlt className="text-green-500" />
                                            <span>{ride.origin}</span>
                                            <span className="mx-2 text-gray-400">→</span>
                                            <span>{ride.destination}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                                            <span className="flex items-center gap-1">
                                                <FaCalendarAlt className="text-purple-500" /> {ride.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaClock className="text-yellow-500" /> {ride.arrivalTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-600 text-sm">
                                            <span className="flex items-center gap-1">
                                                <FaCar className="text-gray-500" /> {ride.carDetails}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaChair className="text-pink-500" /> {ride.availableSeats} seats left
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaUser className="text-blue-400" /> Owner: {ride.ownerEmpId}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => joinRide(ride.id, ride)}
                                        disabled={isOwnRide || isFull}
                                        className={`px-6 py-2 rounded-xl font-semibold transition duration-300 mt-3 md:mt-0 shadow-lg hover:shadow-xl ${
                                            isOwnRide || isFull
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
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
                    </div>
                )}
                <button
                    onClick={logout}
                    className="mt-8 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition shadow"
                >
                    <FaSignOutAlt /> Logout
                </button>
                {error && <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl mt-4 text-center w-full border border-red-200 shadow">{error}</div>}
            </div>
        </div>
    );
}

export default JoinRide;