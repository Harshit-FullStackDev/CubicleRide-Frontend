import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserShield, FaUsers, FaCarSide, FaSignOutAlt } from "react-icons/fa";
import api from "../../api/axios";

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ employees: 0, rides: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [empRes, rideRes] = await Promise.all([
                    api.get("/admin/employees/count"),
                    api.get("/admin/rides/count"),
                ]);
                setStats({
                    employees: empRes.data.count,
                    rides: rideRes.data.count,
                });
            } catch {
                setStats({ employees: 0, rides: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
                {/* Profile Section */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-orange-100 rounded-full p-3">
                        <FaUserShield className="text-3xl text-orange-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Welcome, Admin!</h2>
                        <p className="text-gray-500 text-sm">Manage your organization efficiently</p>
                    </div>
                </div>
                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center bg-gray-50 rounded-xl p-4 shadow">
                        <div className="mr-3 text-2xl">
                            <FaUsers className="text-blue-500" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold">
                                {loading ? "..." : stats.employees}
                            </div>
                            <div className="text-gray-500 text-xs">Employees</div>
                        </div>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-xl p-4 shadow">
                        <div className="mr-3 text-2xl">
                            <FaCarSide className="text-green-500" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold">
                                {loading ? "..." : stats.rides}
                            </div>
                            <div className="text-gray-500 text-xs">Rides</div>
                        </div>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex flex-col gap-4">
                    <Link
                        to="/admin/employees"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                    >
                        <FaUsers /> View Employees
                    </Link>
                    <Link
                        to="/admin/rides"
                        className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                    >
                        <FaCarSide /> View All Rides
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;