// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import React from 'react';
const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');

    if (!token || role !== allowedRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;