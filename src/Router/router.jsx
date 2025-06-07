// src/router/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import React from 'react';
import AdminLayout from '../components/Admin/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Admindasboard from '../components/Admin/Admindasboard';
import LoginPage from '../page/LoginPage';
import BusinessLayout from '../components/Business/BusinessLayout';

import BussinessDasboard from '../components/Business/BussinessDasboard';
import Business from '../components/Admin/Business';
import BusinessDetail from '../components/Admin/BusinessDetail';
import AddBusiness from '../components/Admin/AddBusiness';
import ListUser from '../components/Admin/ListUser';



const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute allowedRole="Admin" >
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Business /> },
            { path: "/business", element: <Business /> },
            { path: "/business/:businessId", element: <BusinessDetail /> },
            { path: "/business/add", element: <AddBusiness /> },
            { path: "/listusers", element: <ListUser /> },
        ],
    },
    {
        path: '/business-dashboard',
        element: (
            <ProtectedRoute allowedRole="BusinessOwner">
                <BusinessLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <BussinessDasboard /> },

        ],
    },
]);

export default router;