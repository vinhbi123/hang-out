import React, { useState } from 'react';
import { Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const Login = () => {
    const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const authData = {
                emailOrPhoneNumber,
                password,
            };
            const response = await authApi.authenticate(authData);

            // Check role before showing success message
            if (response.data.role === 'BusinessOwner') {
                message.success('Đăng nhập thành công!');
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('role', response.data.role);
                navigate('/business-dashboard');
            } else if (response.data.role === 'Admin') {
                message.success('Đăng nhập thành công!');
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('role', response.data.role);
                navigate('/');
            } else {
                // Only show error for unsupported roles
                message.error('Đăng nhập sai vai trò.');
            }
        } catch (error) {
            message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            console.error('Authentication error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterRedirect = () => {
        navigate('/registerbusiness');
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Đăng Nhập</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700">Số Điện Thoại hoặc Email</label>
                    <Input
                        placeholder="Nhập số điện thoại hoặc email"
                        size="large"
                        className="mt-2 text-2xl p-5 h-14 rounded-lg"
                        value={emailOrPhoneNumber}
                        onChange={(e) => setEmailOrPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-lg font-medium text-gray-700">Mật Khẩu</label>
                    <Input.Password
                        placeholder="Nhập mật khẩu"
                        size="large"
                        className="mt-2 text-2xl p-5 h-14 rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    onClick={handleRegisterRedirect}
                    className="w-full border-gray-300 hover:bg-gray-50 py-4 px-6 text-xl font-semibold rounded-lg"
                >
                    ĐĂNG KÝ DOANH NGHIỆP
                </button>
                <button
                    type="submit"
                    className="w-full bg-[#E0BA94] text-white py-4 px-6 text-xl font-semibold rounded-lg hover:bg-[#faddc2]"
                    disabled={loading}
                >
                    {loading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
                </button>
            </form>
        </div>
    );
};

export default Login;