import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaChair, FaSignOutAlt, FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function JoinRide() {
    const [rides, setRides] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const empId = localStorage.getItem("empId");
    const pickup = localStorage.getItem("pickup");
    const drop = localStorage.getItem("drop");

    useEffect(() => {
        if (!empId) {
            navigate("/login");
            return;
        }
        api.get("/ride/all").then(res => {
            const filtered = res.data.filter(r => r.origin === pickup && r.destination === drop);
            setRides(filtered);
        }).catch(err => {
            setError("Failed to load rides.");
        });
    }, [pickup, drop, empId, navigate]);

    const joinRide = async (id, ride) => {
        setError("");
        try {
            await api.post(`/ride/join/${id}`, { empId });
            alert(`Joined ride from ${ride.origin} to ${ride.destination}!`);
            const updated = await api.get("/ride/all");
            const filtered = updated.data.filter(r => r.origin === pickup && r.destination === drop);
            setRides(filtered);
        } catch {
            setError("Failed to join ride—maybe it's full or you're already in.");
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-3xl">
                <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 mb-4">
                    <FaArrowLeft /> Back
                </button>
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Join a Ride</h2>
                <p className="mb-6">Showing rides matching your <strong>{pickup}</strong> → <strong>{drop}</strong> preference</p>

                {rides.length === 0 && <p className="text-gray-500">No matching rides found.</p>}
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

                <div className="space-y-4">
                    {rides.map(ride => {
                        const isFull = ride.availableSeats === 0;
                        const isOwn = ride.ownerEmpId === empId;
                        return (
                            <div key={ride.id}
                                 className={`bg-blue-50 rounded-xl p-4 flex justify-between items-center border ${
                                     (isFull || isOwn) ? "opacity-60" : "hover:shadow-lg"
                                 }`}>
                                <div>
                                    <div className="text-lg font-semibold text-blue-700">
                                        <FaMapMarkerAlt className="text-green-500" /> {ride.origin} → {ride.destination}
                                    </div>
                                    <div className="text-gray-600 text-sm mt-1">
                                        <FaCalendarAlt /> {ride.date}<span className="ml-4"><FaClock /> {ride.arrivalTime}</span>
                                    </div>
                                    <div className="text-gray-600 text-sm mt-1">
                                        <FaCar /> {ride.carDetails} <span className="ml-4"><FaChair /> {ride.availableSeats} seats left</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => joinRide(ride.id, ride)}
                                    disabled={isFull || isOwn}
                                    className={`px-6 py-2 rounded font-semibold transition ${
                                        (isFull || isOwn) ? "bg-gray-300 text-gray-500 cursor-not-allowed" :
                                            "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                >
                                    {isOwn ? "Your Ride" : (isFull ? "Full" : "Join")}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <button onClick={logout} className="mt-8 flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold">
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
}

export default JoinRide;
