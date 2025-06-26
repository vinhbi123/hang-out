import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import React from 'react';

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (<> <div className="flex h-screen bg-gray-100">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div
            className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-60' : 'ml-240'
                } lg:ml-0`}
        >
            <Header />
            <main className="flex-1 p-6 overflow-auto">
                <Outlet />
            </main>
        </div>
    </div></>

    );
}

export default AdminLayout;