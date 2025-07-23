import React from "react";
import { Link ,useNavigate} from "react-router-dom";

function EmployeeDashboard() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-xl text-center">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Employee Dashboard</h2>
                <div className="flex flex-col gap-4">
                    <Link
                        to="/employee/offer"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold transition duration-300"
                    >
                        🚗 Offer a Ride
                    </Link>
                    <Link
                        to="/employee/join"
                        className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold transition duration-300"
                    >
                        🧍 Join a Ride
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-lg font-semibold transition duration-300"
                    >
                        🔒 Logout
                    </button>

                </div>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
