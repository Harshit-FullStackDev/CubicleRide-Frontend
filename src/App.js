import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const EmployeeDashboard = lazy(() => import('./pages/employee/Dashboard'));
const OfferRide = lazy(() => import('./pages/employee/OfferRide'));
const JoinRide = lazy(() => import('./pages/employee/JoinRide'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ViewEmployees = lazy(() => import('./pages/admin/ViewEmployees'));
const ViewRides = lazy(() => import('./pages/admin/ViewRides'));
const EditRide = lazy(() => import('./pages/employee/EditRide'));
const EditEmployee = lazy(() => import('./pages/admin/EditEmployee'));
const AddEmployee = lazy(() => import('./pages/admin/AddEmployee'));
const Vehicles = lazy(() => import('./pages/admin/Vehicles'));
const VehicleDetail = lazy(() => import('./pages/admin/VehicleDetail'));
const OtpVerify = lazy(() => import('./components/OTPVerify'));
const Notifications = lazy(() => import('./pages/employee/Notifications'));
const PublishedHistory = lazy(() => import('./pages/employee/PublishedHistory'));
const JoinedHistory = lazy(() => import('./pages/employee/JoinedHistory'));
const VehiclePage = lazy(() => import('./pages/employee/Vehicle'));
const Profile = lazy(() => import('./pages/employee/Profile'));
const Landing = lazy(() => import('./pages/Landing'));
const Inbox = lazy(() => import('./pages/employee/Inbox'));

function App() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading...</div>}>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/otp-verify" element={<OtpVerify />} />
                <Route path="/employee/dashboard" element={<ProtectedRoute role="EMPLOYEE"><EmployeeDashboard /></ProtectedRoute>} />
                <Route path="/employee/offer" element={<ProtectedRoute role="EMPLOYEE"><OfferRide /></ProtectedRoute>} />
                <Route path="/employee/join" element={<ProtectedRoute role="EMPLOYEE"><JoinRide /></ProtectedRoute>} />
                <Route path="/employee/notifications" element={<ProtectedRoute role="EMPLOYEE"><Notifications /></ProtectedRoute>} />
                <Route path="/employee/history/published" element={<ProtectedRoute role="EMPLOYEE"><PublishedHistory /></ProtectedRoute>} />
                <Route path="/employee/history/joined" element={<ProtectedRoute role="EMPLOYEE"><JoinedHistory /></ProtectedRoute>} />
                <Route path="/employee/edit/:id" element={<ProtectedRoute role="EMPLOYEE"><EditRide /></ProtectedRoute>} />
                <Route path="/employee/vehicle" element={<ProtectedRoute role="EMPLOYEE"><VehiclePage /></ProtectedRoute>} />
                <Route path="/employee/profile" element={<ProtectedRoute role="EMPLOYEE"><Profile /></ProtectedRoute>} />
                <Route path="/employee/inbox" element={<ProtectedRoute role="EMPLOYEE"><Inbox /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/employees" element={<ProtectedRoute role="ADMIN"><ViewEmployees /></ProtectedRoute>} />
                <Route path="/admin/employees/add" element={<ProtectedRoute role="ADMIN"><AddEmployee /></ProtectedRoute>} />
                <Route path="/admin/employees/edit/:id" element={<ProtectedRoute role="ADMIN"><EditEmployee /></ProtectedRoute>} />
                <Route path="/admin/rides" element={<ProtectedRoute role="ADMIN"><ViewRides /></ProtectedRoute>} />
                <Route path="/admin/vehicles" element={<ProtectedRoute role="ADMIN"><Vehicles /></ProtectedRoute>} />
                <Route path="/admin/vehicles/:empId" element={<ProtectedRoute role="ADMIN"><VehicleDetail /></ProtectedRoute>} />
                <Route path="*" element={<div className="p-10 text-center">Not Found</div>} />
            </Routes>
        </Suspense>
    );
}

export default App;
