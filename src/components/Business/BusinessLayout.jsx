import React, { useState } from 'react'
import Header from '../Admin/Header';
import BusinessSidebar from './BusinessSidebar';
import { Outlet } from 'react-router-dom';

function BusinessLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            <BusinessSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-60' : 'ml-240'
                    } lg:ml-0`}
            >
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default BusinessLayout