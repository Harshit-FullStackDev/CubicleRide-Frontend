import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import EmployeeLayout from "../../components/EmployeeLayout";
import {
    FaMapMarkerAlt, FaCalendarAlt, FaClock, FaCar, FaChair, FaCheckCircle, FaUserFriends
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function JoinRide() {
    const [rides, setRides] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [locations, setLocations] = useState([]);
    const [filters, setFilters] = useState({ pickup: localStorage.getItem("pickup") || "", drop: localStorage.getItem("drop") || "" });
    const navigate = useNavigate();
    const empId = localStorage.getItem("empId");

    useEffect(() => {
        if (!empId) {
            navigate("/login");
            return;
        }
        api.get("/locations").then(res => setLocations(res.data)).catch(() => {});
        loadRides();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empId, navigate]);

    const loadRides = async () => {
        try {
            const { data } = await api.get("/ride/active");
            // Single pass filter (micro-opt) – O(n) once instead of up to 2 passes
            const { pickup, drop } = filters;
            const list = (pickup || drop) ? data.filter(r => (!pickup || r.origin === pickup) && (!drop || r.destination === drop)) : data;
            setRides(list);
        } catch {
            setError("Failed to load rides.");
        }
    };

    const handleFilterChange = (e) => {
        const next = { ...filters, [e.target.name]: e.target.value };
        setFilters(next);
        localStorage.setItem("pickup", next.pickup);
        localStorage.setItem("drop", next.drop);
    };

    useEffect(() => {
        loadRides();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.pickup, filters.drop]);

    const joinRide = async (id, ride) => {
        setError("");
        setSuccess("");
        try {
            await api.post(`/ride/join/${id}`, { empId });
            setSuccess(ride.instantBookingEnabled ? `Joined ride from ${ride.origin} to ${ride.destination}!` : `Request sent for ride ${ride.origin} → ${ride.destination}. Awaiting approval.`);
            // Optimistically update instead of refetching entire list, then refresh minimal
            setRides(prev => prev.map(r => r.id === id ? { ...r, availableSeats: Math.max(0, (r.availableSeats||0)-1), joinedEmployees: [...(r.joinedEmployees||[]), { empId }] } : r));
            // Fetch latest snapshot in background (seat counts / status) without blocking UX
            api.get("/ride/active").then(({ data }) => {
                const { pickup, drop } = filters;
                const filtered = (pickup || drop) ? data.filter(r => (!pickup || r.origin === pickup) && (!drop || r.destination === drop)) : data;
                setRides(filtered);
            }).catch(()=>{});
        } catch {
            setError("Failed to join ride—maybe it's full or you're already in.");
        }
    };

    const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";

    return (
        <EmployeeLayout heading="Join a Ride">
            <div className="max-w-3xl mx-auto">
                <div className="mb-4">
                    <p className="text-xs text-gray-500">Showing rides {filters.pickup || filters.drop ? `${filters.pickup || 'any'} → ${filters.drop || 'any'}` : 'for all locations'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                        <FaMapMarkerAlt className="text-green-500" />
                        <select name="pickup" value={filters.pickup} onChange={handleFilterChange} className="bg-transparent w-full outline-none">
                            <option value="">Select Pickup Location</option>
                            {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3">
                        <FaMapMarkerAlt className="text-red-500" />
                        <select name="drop" value={filters.drop} onChange={handleFilterChange} className="bg-transparent w-full outline-none">
                            <option value="">Select Drop Location</option>
                            {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                        </select>
                    </div>
                </div>

                {success && (
                    <div className="flex items-center bg-green-100 text-green-800 p-3 rounded mb-4 animate-bounce">
                        <FaCheckCircle className="mr-2 text-green-600" />
                        {success}
                    </div>
                )}
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                {rides.length === 0 && !error && (
                    <div className="text-gray-500 text-center py-8">
                        <FaCar className="text-4xl mb-2 text-blue-300 animate-pulse" />
                        No matching rides found.
                    </div>
                )}

                <div className="space-y-4 mt-6">
                    {rides.map(ride => {
                        const isFull = ride.availableSeats === 0 || (ride.status && ride.status !== "Active");
                        const isOwn = ride.ownerEmpId === empId;
                        const hasJoined = ride.joinedEmployees?.some(e => e.empId === empId);
                        const isPending = !ride.instantBookingEnabled && ride.pendingEmployees?.some(e => e.empId === empId);
                        return (
                            <div key={ride.id}
                                 className={`bg-blue-50 rounded-xl p-5 flex flex-col border-2 transition-all ${
                                     isFull ? "border-red-300 opacity-60" :
                                         isOwn ? "border-yellow-300 opacity-80" :
                                             "border-green-300 hover:shadow-2xl"
                                 }`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 border-2 border-blue-400 shadow">
                                        {getInitials(ride.ownerName)}
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-green-500" /> {ride.origin}
                                            <span className="mx-2 text-gray-400">→</span>
                                            {ride.destination}
                                        </div>
                                        <div className="text-gray-600 text-sm mt-1 flex items-center gap-4">
                                            <FaCalendarAlt /> {ride.date}
                                            <FaClock /> {ride.arrivalTime}
                                        </div>
                                        <div className="text-gray-600 text-sm mt-1 flex items-center gap-4">
                                            <FaCar /> {ride.carDetails}
                                            <FaChair /> {ride.availableSeats} seats left
                                            {ride.fare && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">₹{ride.fare}/seat</span>}
                                        </div>
                                        <div className="text-gray-700 text-xs mt-2">
                                            <strong>Owner:</strong> {ride.ownerName} ({ride.ownerEmpId}) {ride.ownerPhone ? <span className="ml-2 text-green-600 font-semibold">📞 {ride.ownerPhone}</span> : <span className="ml-2 text-gray-400">{hasJoined ? (isPending ? 'awaiting approval' : 'phone unavailable') : 'join to view phone'}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 mb-2">
                                    <div className="flex items-center text-blue-600 font-semibold text-sm mb-1">
                                        <FaUserFriends className="mr-1" /> Joined Employees:
                                    </div>
                                    {ride.joinedEmployees && ride.joinedEmployees.length > 0 ? (
                                        <ul className="ml-6 list-disc text-xs text-gray-700">
                                            {ride.joinedEmployees.map(emp => (
                                                <li key={emp.empId}>
                                                    {emp.name} ({emp.empId}) {emp.phone && isOwn && <span className="text-green-600 font-semibold">📞 {emp.phone}</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="ml-6 text-gray-400 text-xs">No one has joined yet.</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            isOwn ? "bg-yellow-100 text-yellow-700" :
                                                isFull ? "bg-red-100 text-red-700" :
                                                    hasJoined ? "bg-green-100 text-green-700" :
                                                        isPending ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                                        }`}>
                                            {isOwn ? "Your Ride" : isFull ? (ride.status && ride.status !== "Active" ? ride.status : "Full") : hasJoined ? "Joined" : isPending ? "Pending" : "Available"}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700" title={ride.instantBookingEnabled ? 'Auto join enabled' : 'Owner reviews join requests'}>
                                            {ride.instantBookingEnabled ? 'Instant' : 'Review'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => joinRide(ride.id, ride)}
                                        disabled={isFull || isOwn || hasJoined || isPending}
                                        className={`px-6 py-2 rounded font-semibold transition ${
                                            (isFull || isOwn || hasJoined || isPending) ? "bg-gray-300 text-gray-500 cursor-not-allowed" :
                                                "bg-blue-600 hover:bg-blue-700 text-white"
                                        }`}
                                    >
                                        {isOwn ? "Your Ride" : isFull ? "Full" : hasJoined ? "Joined" : isPending ? "Pending" : "Join"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </EmployeeLayout>
    );
}

export default JoinRide;