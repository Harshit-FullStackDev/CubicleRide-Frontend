import React, { useState ,useEffect} from "react";
import api from "../../api/axios";
import {
    FaMapMarkerAlt,
    FaCar,
    FaChair,
    FaCalendarAlt,
    FaClock,
    FaArrowLeft
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function OfferRide() {
    const [ride, setRide] = useState({
        origin: "",
        destination: "",
        date: "",
        arrivalTime: "",
        carDetails: "",
        totalSeats: 1,
    });
    const [locations, setLocations] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/locations")
            .then(res => setLocations(res.data))
            .catch(err => setError("Failed to load locations"));
    }, []);


    const handleChange = (e) => {
        setRide({ ...ride, [e.target.name]: e.target.value });
        setSuccess(false);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (ride.totalSeats < 1 || ride.totalSeats > 8) {
            setError("Total seats must be between 1 and 8");
            return;
        }

        const empId = localStorage.getItem("empId");
        if (!empId) {
            setError("Employee ID missing. Please log in again.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (ride.date < today) {
            setError("Please select a valid future date.");
            return;
        }
        try {
            await api.post("/ride/offer", {
                ...ride,
                empId,
            });
            setSuccess(true);
            setRide({
                origin: "",
                destination: "",
                date: "",
                arrivalTime: "",
                carDetails: "",
                totalSeats: 1,
            });
        } catch {
            setError("Failed to offer ride. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
                <button onClick={() => navigate(-1)} className="text-blue-600 mb-4 flex items-center">
                    <FaArrowLeft /> Back
                </button>
                <h2 className="text-3xl font-bold text-blue-700 mb-6">Offer a Ride</h2>

                {success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{success}</div>}
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                        <FaMapMarkerAlt className="text-green-500" />
                        <select name="origin" value={ride.origin} onChange={handleChange} required className="bg-transparent w-full outline-none">
                            <option value="">Select Pickup Location</option>
                            {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                        <FaMapMarkerAlt className="text-red-500" />
                        <select name="destination" value={ride.destination} onChange={handleChange} required className="bg-transparent w-full outline-none">
                            <option value="">Select Drop Location</option>
                            {locations.map(loc => <option key={loc.id} value={loc.name}>{loc.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                        <FaCalendarAlt className="text-purple-500" />
                        <input name="date" type="date" min={new Date().toISOString().split("T")[0]}
                               value={ride.date} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                        <FaClock className="text-yellow-500" />
                        <input name="arrivalTime" type="time"
                               value={ride.arrivalTime} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                        <FaCar className="text-gray-500" />
                        <input name="carDetails" type="text" placeholder="Car details (model–registration)"
                               value={ride.carDetails} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                    </div>
                    <div className="flex items-center bg-blue-50 rounded-xl px-4 py-3">
                        <FaChair className="text-pink-500" />
                        <input name="totalSeats" type="number" min={1} max={8}
                               value={ride.totalSeats} onChange={handleChange} required className="bg-transparent w-full outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
                        Offer Ride
                    </button>
                </form>
            </div>
        </div>
    );
}

export default OfferRide;