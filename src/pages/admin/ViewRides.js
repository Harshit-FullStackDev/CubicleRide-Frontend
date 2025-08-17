import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaUser, FaMapMarkerAlt, FaCar, FaChair, FaUsers, FaCalendarAlt, FaClock } from "react-icons/fa";
import AdminLayout from "../../components/AdminLayout";

function ViewRides() {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/admin/rides")
            .then(res => setRides(res.data))
            .catch(() => setError("Failed to load rides."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <AdminLayout heading="Rides"><div className="text-blue-600 text-sm animate-pulse">Loading rides...</div></AdminLayout>;
    if (error) return <AdminLayout heading="Rides"><div className="text-red-600 text-sm">{error}</div></AdminLayout>;

    return (
        <AdminLayout heading="All Rides">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rides.map(ride => (
                    <div key={ride.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 hover:shadow-2xl transition relative">
                        <div className="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">{ride.status || 'ACTIVE'}</div>
                        <div className="flex items-center gap-3 mb-2">
                            <FaUser className="text-blue-400" />
                            <span className="font-semibold text-gray-700">Owner:</span>
                            <span className="text-gray-800">{ride.ownerEmpId || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-green-500" />
                            <span className="font-semibold">{ride.origin || ride.route?.split('->')[0] || "?"}</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="font-semibold">{ride.destination || ride.route?.split('->')[1] || "?"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-purple-500" />
                            <span>{ride.date || "N/A"}</span>
                            <FaClock className="ml-4 text-yellow-500" />
                            <span>{ride.arrivalTime || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FaCar className="text-gray-500" />
                            <span>{ride.carDetails || "N/A"}</span>
                            {ride.fare && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">₹{ride.fare}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                            <FaChair className="text-pink-500" />
                            <span>
                                {ride.availableSeats !== undefined && ride.totalSeats !== undefined
                                    ? `${ride.availableSeats}/${ride.totalSeats} seats`
                                    : "N/A"}
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaUsers className="text-indigo-500 mt-0.5" />
                            <span className="text-sm flex-1">
                                {ride.joinedEmpIds && ride.joinedEmpIds.length > 0
                                    ? ride.joinedEmpIds.join(", ")
                                    : <span className="text-gray-400 italic">No joined employees</span>}
                            </span>
                        </div>
                        <div className="text-[10px] font-medium text-gray-500 mt-1">Booking: {ride.instantBookingEnabled? 'Instant':'Approval'}</div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

export default ViewRides;