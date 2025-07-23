import React from "react";
import { Link ,useNavigate} from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-xl text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
                <div className="flex flex-col gap-4">
                    <Link
                        to="/admin/employees"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        👥 View Employees
                    </Link>
                    <Link
                        to="/admin/rides"
                        className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        🚘 View All Rides
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        🔒 Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
