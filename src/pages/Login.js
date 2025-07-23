import React, { useState , useEffect} from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [data, setData] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role === "EMPLOYEE") navigate("/employee/dashboard");
        else if (token && role === "ADMIN") navigate("/admin/dashboard");
    }, [navigate]);


    const handleChange = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", data);

            const token = res.data.token;
            localStorage.setItem("token", token);

            // Decode JWT to extract role
            const payload = JSON.parse(atob(token.split(".")[1]));
            const role = payload.role;
            localStorage.setItem("role", role);

            if (role === "EMPLOYEE") navigate("/employee/dashboard");
            else if (role === "ADMIN") navigate("/admin/dashboard");
            else alert("Unknown role");

        } catch (err) {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-cyan-500 to-green-400 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Employee Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition duration-300 font-semibold"
                    >
                        Login
                    </button>
                    <p className="text-center text-sm mt-4 text-gray-600">
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/register")}
                            className="text-blue-700 font-semibold cursor-pointer hover:underline"
                        >
                            Register
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
