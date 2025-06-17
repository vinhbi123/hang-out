
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from '../components/Business/BackgroundImage';
import RegisterBusinessForm from '../components/Business/RegisterBusinessForm';



const RegisterBusinessPage = () => {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate('/login');
    };

    const handleSuccess = () => {
        navigate('/login');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white px-12">
            <BackgroundImage />
            <div className="w-1/2 bg-white p-6 rounded-r-lg overflow-auto max-h-screen">
                <div className="max-w-sm mx-auto mt-6">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-gray-800">Đăng Ký Doanh Nghiệp</h2>
                    <p className="text-center text-gray-500 text-base mb-6">Nhập thông tin để tạo tài khoản doanh nghiệp</p>
                    <RegisterBusinessForm onCancel={handleCancel} onSuccess={handleSuccess} />
                </div>
            </div>
        </div>
    );
};

export default RegisterBusinessPage;
