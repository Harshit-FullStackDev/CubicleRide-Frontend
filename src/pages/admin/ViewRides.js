import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaCarSide, FaUser, FaRoute, FaChair, FaUsers } from "react-icons/fa";

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-600 font-semibold">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl">
                <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
                    <FaCarSide className="text-blue-500" /> All Rides
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Owner (Emp ID)</th>
                            <th className="py-2 px-4 border-b text-left">Route</th>
                            <th className="py-2 px-4 border-b text-left">Seats</th>
                            <th className="py-2 px-4 border-b text-left">Joined Employees</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rides.map(ride => (
                            <tr key={ride.id} className="hover:bg-blue-50">
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    {ride.ownerEmpId || <span className="text-gray-400 italic">N/A</span>}
                                </td>
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaRoute className="text-gray-400" />
                                    {ride.route || <span className="text-gray-400 italic">N/A</span>}
                                </td>
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaChair className="text-gray-400" />
                                    {(ride.availableSeats !== undefined && ride.totalSeats !== undefined)
                                        ? `${ride.availableSeats}/${ride.totalSeats}`
                                        : <span className="text-gray-400 italic">N/A</span>}
                                </td>
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaUsers className="text-gray-400" />
                                    {ride.joinedEmpIds && ride.joinedEmpIds.length > 0
                                        ? ride.joinedEmpIds.join(", ")
                                        : <span className="text-gray-400 italic">No joined employees</span>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ViewRides;