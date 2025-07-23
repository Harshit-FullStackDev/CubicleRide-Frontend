import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function ViewRides() {
    const [rides, setRides] = useState([]);

    useEffect(() => {
        api.get("/admin/rides").then(res => setRides(res.data));
    }, []);

    return (
        <div>
            <h2>All Rides</h2>
            {rides.map(ride => (
                <div key={ride.rideId}>
                    Ride by {ride.ownerId} | Route: {ride.route} | Seats: {ride.availableSeats}/{ride.totalSeats}
                </div>
            ))}
        </div>
    );
}

export default ViewRides;
