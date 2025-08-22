import React from "react";
import PageContainer from "../../components/PageContainer";
import JoinRideList from "../../components/JoinRideList";

// Simplified after extraction of logic into JoinRideList
export default function JoinRide() {
    return (
        <PageContainer>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Join a Ride</h1>
                <p className="text-xs text-gray-500 mt-1">Browse and join available carpool rides</p>
            </div>
            <JoinRideList full />
        </PageContainer>
    );
}