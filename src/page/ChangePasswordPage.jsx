import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import LogoImage from '../../src/assets/Bird Design4 1.png';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const role = localStorage.getItem('role');

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await api.changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            message.success('Đổi mật khẩu thành công');
            navigate(role === 'BusinessOwner' ? '/business-dashboard' : '/');
        } catch (error) {
            message.error(error.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 bg-gray-100 flex flex-col items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex items-center justify-start mb-6">
                    <img src={LogoImage} alt="HangOut Logo" className="w-16 h-16 mr-4" />
                    <h1 className="text-3xl font-bold text-orange-500">HangOut</h1>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đổi Mật Khẩu</h2>
                <Form
                    name="change-password"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        label="Mật Khẩu Cũ"
                        name="oldPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu cũ' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                        ]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu cũ"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật Khẩu Mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                        ]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu mới"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded-md"
                        >
                            Đổi Mật Khẩu
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="default"
                            onClick={() => navigate(role === 'BusinessOwner' ? '/business-dashboard' : '/')}
                            className="w-full rounded-md"
                        >
                            Quay Lại Bảng Điều Khiển
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;