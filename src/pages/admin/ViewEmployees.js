import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaUser, FaEnvelope, FaRoute } from "react-icons/fa";

function ViewEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/admin/employees")
            .then(res => setEmployees(res.data))
            .catch(() => setError("Failed to load employees."))
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
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
                <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
                    <FaUser className="text-blue-500" /> Employees
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-lg">
                        <thead>
                        <tr>
                            <th className="py-2 px-4 border-b text-left">Name</th>
                            <th className="py-2 px-4 border-b text-left">Email</th>
                            <th className="py-2 px-4 border-b text-left">Route</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map(emp => (
                            <tr key={emp.empId} className="hover:bg-blue-50">
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaUser className="text-gray-400" /> {emp.name}
                                </td>
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaEnvelope className="text-gray-400" /> {emp.email}
                                </td>
                                <td className="py-2 px-4 border-b flex items-center gap-2">
                                    <FaRoute className="text-gray-400" /> {emp.route}
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

export default ViewEmployees;