import React, { useState } from 'react';
import AdminLogin from '../components/Admin/AdminLogin';
import bachgrouldImage from '../../src/assets/Background.png';
import Login from '../components/Admin/AdminLogin';

const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState('admin');

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white px-12 py-5">
            <div className="relative w-1/2">
                <img
                    src={bachgrouldImage}
                    alt="beach"
                    className="w-full h-full object-cover rounded-r-[50px]"
                />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white rounded-b-2xl p-2 mt-2">
                    <img
                        src="src/assets/Bird Design4 1.png" // bạn đổi path thành của bạn
                        alt="Bird Logo"
                        className="w-20 h-20 object-contain"
                    />
                </div>
            </div>
            <div className="w-1/2 bg-white p-6 rounded-r-lg overflow-auto max-h-screen">
                <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-extrabold mb-4 text-center">Chào mừng trở lại</h2>
                    <p className="text-center text-gray-600 mb-5">Vui lòng nhập thông tin đăng nhập của bạn</p>
                    <div className="flex justify-around mt-10">
                        <button
                            onClick={() => handleRoleSelect('admin')}
                            className={`flex flex-col items-center p-15 rounded-lg border border-gray-300 hover:bg-orange-200 ${selectedRole === 'admin' ? 'bg-orange-100' : 'bg-white'}`}
                        >
                            <span className="text-xl">👤</span>
                            <span className="mt-1 text-sm">Admin</span>
                        </button>
                        <button
                            onClick={() => handleRoleSelect('doctor')}
                            className={`flex flex-col items-center p-15 rounded-lg border border-gray-300 hover:bg-orange-200 ${selectedRole === 'doctor' ? 'bg-orange-100' : 'bg-white'}`}
                        >
                            <span className="text-xl">🏥</span>
                            <span className="mt-1 text-sm">Bussiness</span>
                        </button>
                    </div>

                    <Login />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;