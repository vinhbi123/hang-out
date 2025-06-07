import { useLocation, useNavigate } from 'react-router-dom';
import {
    HomeOutlined,


    LeftOutlined,
    RightOutlined,
    ShopOutlined,
    UserOutlined,

} from '@ant-design/icons';
import React from 'react';
import LogoImage from '../../assets/Bird Design4 1.png';
function Sidebar({ collapsed, setCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: '/', icon: <HomeOutlined />, label: 'Trang chủ' },
        { key: '/business', icon: <ShopOutlined />, label: 'Doanh Nghiệp' },
        { key: '/listusers', icon: <UserOutlined />, label: 'Người Dùng' },


    ];

    return (
        <div
            className={`bg-white text-gray-700 flex flex-col h-screen transition-all duration-300 shadow-md ${collapsed ? 'w-20' : 'w-60'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center justify-center p-6 bg-white">
                <img
                    src={LogoImage}
                    alt="Logo"
                    className={`${collapsed ? 'w-10' : 'w-24'} h-auto transition-all duration-300`}
                />
            </div>




            <nav className="flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <div
                        key={item.key}
                        onClick={() => navigate(item.key)}
                        className={`flex items-center p-4 cursor-pointer transition-colors ${location.pathname === item.key
                            ? 'bg-[#FDE7D3] text-gray-900 font-medium'
                            : 'hover:bg-[#FDE7D3] hover:text-gray-900'
                            }`}
                    >
                        <div className="text-xl">{item.icon}</div>
                        <span className={`ml-4 ${collapsed ? 'hidden' : ''}`}>{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* Nút đóng/mở ở dưới cùng bên phải */}
            <div className="p-4 border-t border-gray-200 flex justify-end">
                <div
                    onClick={() => setCollapsed(!collapsed)}
                    className="cursor-pointer hover:text-[#F5CAA0] transition-colors"
                >
                    {collapsed ? <RightOutlined /> : <LeftOutlined />}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
