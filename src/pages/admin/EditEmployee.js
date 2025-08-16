import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";

function EditEmployee() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [employee, setEmployee] = useState({ name: "", email: "", empId: "", phone: "", department: "", designation: "", officeLocation: "", gender: "", bio: "" });
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/admin/employees/${id}`)
            .then(res => setEmployee(res.data))
            .catch(() => setError("Failed to load employee."))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        setEmployee({ ...employee, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/employees/${id}`, employee);
            alert("Employee updated!");
            navigate("/admin/employees");
        } catch {
            alert("Failed to update employee.");
        }
    };

    if (loading) return <AdminLayout heading="Edit Employee"><div className="text-blue-600 text-sm animate-pulse">Loading employee...</div></AdminLayout>;
    if (error) return <AdminLayout heading="Edit Employee"><div className="text-red-600 text-sm">{error}</div></AdminLayout>;

    return (
        <AdminLayout heading="Edit Employee">
            <form onSubmit={handleSubmit} className="bg-white/90 p-8 rounded-xl shadow w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-blue-700">Edit Employee</h2>
                <div className="mb-4">
                    <label className="block mb-1 font-medium text-blue-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        value={employee.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium text-blue-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        value={employee.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Phone</label>
                        <input name="phone" value={employee.phone || ""} onChange={handleChange} className="w-full border border-blue-200 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Department</label>
                        <input name="department" value={employee.department || ""} onChange={handleChange} className="w-full border border-blue-200 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Designation</label>
                        <input name="designation" value={employee.designation || ""} onChange={handleChange} className="w-full border border-blue-200 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Office Location</label>
                        <input name="officeLocation" value={employee.officeLocation || ""} onChange={handleChange} className="w-full border border-blue-200 rounded px-3 py-2" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium text-blue-700">Gender</label>
                        <select name="gender" value={employee.gender || ""} onChange={handleChange} className="w-full border border-blue-200 rounded px-3 py-2">
                            <option value="">--</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium text-blue-700">Bio</label>
                    <textarea name="bio" value={employee.bio || ""} onChange={handleChange} rows={3} className="w-full border border-blue-200 rounded px-3 py-2" />
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                        onClick={() => navigate("/admin/employees")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

export default EditEmployee;