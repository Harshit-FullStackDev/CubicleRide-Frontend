import React from "react";
import JoinRideList from "../../components/JoinRideList";
import MainHeader from "../../components/MainHeader";

export default function JoinRide() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50/50 via-white to-white">
            <MainHeader />
            <main className="flex-1 w-full py-4 md:py-6">
                <JoinRideList full layout="search" />
            </main>
            <footer className="mt-auto py-10 text-center text-xs text-gray-400">© {new Date().getFullYear()} OrangeMantra Carpool</footer>
        </div>
    );
}