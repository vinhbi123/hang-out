import React, { useState } from 'react';
import { Input, message } from 'antd';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import authApi from '../../api/authApi';


const Login = () => {
    const [emailOrPhoneNumber, setEmailOrPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const authData = {
                emailOrPhoneNumber,
                password,
            };
            const response = await authApi.authenticate(authData);
            message.success('Đăng nhập thành công!');
            // Log the response including the role
            console.log('Login response:', {
                accessToken: response.data.accessToken,
                accountId: response.data.accountId,
                role: response.data.role,
            });
            // Store token and role in localStorage
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('role', response.data.role);

            // Redirect based on role
            if (response.data.role === 'BusinessOwner') {
                navigate('/business-dashboard');
            } else if (response.data.role === 'Admin') {
                navigate('/');
            } else {
                // Handle other roles if necessary
                message.warning('Vai trò không được hỗ trợ.');
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
        <div className="max-w-md mx-auto  p-4">
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
                </div><button
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