import React from 'react';
import { Avatar, Dropdown, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        navigate('/login');
        message.success('Đăng xuất thành công');
    };

    const handleChangePassword = () => {
        // Điều hướng dựa trên vai trò
        navigate(role === 'BusinessOwner' ? '/business-dashboard/change-password' : '/change-password');
    };

    const menu = {
        items: [
            {
                key: '1',
                label: 'Đổi Mật Khẩu',
                onClick: handleChangePassword,
            },
            {
                key: '2',
                label: 'Đăng Xuất',
                danger: true,
                onClick: handleLogout,
            },
        ],
    };

    return (
        <header className="shadow p-4 flex justify-between items-center">
            <h1 className="font-bold text-gray-800 text-2xl">
                {role === 'BusinessOwner' ? 'Bảng Điều Khiển Chủ Doanh Nghiệp' : 'Bảng Điều Khiển Quản Trị'}
            </h1>

            <Dropdown menu={menu} placement="bottomRight" arrow>
                <div className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition">
                    <div className="relative">
                        <Avatar size={40} src="https://i.pravatar.cc/150?img=12" />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 border-2 border-white rounded-full" />
                    </div>

                    <div className="text-left leading-tight">
                        <div className="text-sm font-medium text-gray-900">
                            {role ? `Trang ${role}` : 'Trang Quản Trị'}
                        </div>
                        <div className="text-xs text-gray-500">{role || 'Quản Trị'}</div>
                    </div>

                    <DownOutlined className="text-gray-400" />
                </div>
            </Dropdown>
        </header>
    );
}

export default Header;