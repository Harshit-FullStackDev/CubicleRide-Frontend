import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ensureValidSession, getRole } from '../utils/auth';

const ProtectedRoute = ({ children, role }) => {
    const location = useLocation();
    const valid = ensureValidSession();
    const currentRole = getRole();
    if (!valid || !currentRole || (role && currentRole !== role)) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return children;
};

export default React.memo(ProtectedRoute);
