import React, { useState, useEffect } from 'react';
import { Descriptions, Image, message, Card, Spin, Typography, List, Button } from 'antd';
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import api from '../../api/api';

const BusinessOwnerDetail = ({ businessId, onBack }) => {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Khởi tạo useNavigate

    // Fetch business details
    useEffect(() => {
        const fetchBusinessDetail = async () => {
            if (!businessId) {
                message.error('Business ID is required');
                return;
            }
            setLoading(true);
            try {
                const response = await api.getBusinessDetail(businessId);
                setBusiness(response.data);
            } catch (error) {
                message.error('Không thể tải chi tiết doanh nghiệp. Vui lòng thử lại.');
                console.error('Error fetching business:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessDetail();
    }, [businessId]);

    // Hàm điều hướng đến trang chỉnh sửa
    const handleEdit = () => {
        navigate(`/business-dashboard/edit/${businessId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin tip="Đang tải..." />
            </div>
        );
    }

    if (!business) {
        return <div className="text-center text-gray-500 mt-10">Không tìm thấy doanh nghiệp.</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Card
                title={<h2 className="text-2xl font-semibold text-center">{business.name}</h2>}
                bordered={false}
                className="shadow-lg"
                extra={
                    <div className="flex gap-2">
                        <Button onClick={handleEdit} type="primary" className="bg-blue-600 hover:bg-blue-700">
                            Chỉnh sửa
                        </Button>
                        <Button onClick={onBack} className="border-gray-300 hover:bg-gray-100">
                            Quay lại danh sách
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src={business.mainImageUrl}
                        alt={business.name}
                        width={250}
                        height={250}
                        fallback="https://via.placeholder.com/250"
                        className="rounded-md object-cover"
                    />
                </div>

                <Descriptions
                    layout="vertical"
                    bordered
                    column={3}
                    labelStyle={{ fontWeight: 'bold' }}
                >
                    <Descriptions.Item label="Tên doanh nghiệp">{business.name}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <span className={business.active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                            {business.active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thể loại">{business.vibe || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Vĩ độ">{business.latitude}</Descriptions.Item>
                    <Descriptions.Item label="Kinh độ">{business.longitude}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">{business.address}</Descriptions.Item>
                    <Descriptions.Item label="Tỉnh/Thành phố">{business.province}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{business.description}</Descriptions.Item>
                    <Descriptions.Item label="Giờ mở cửa">{business.openingHours || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">{business.startDay}</Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">{business.endDay}</Descriptions.Item>
                    <Descriptions.Item label="Số lượt thích">{business.totalLike}</Descriptions.Item>
                    <Descriptions.Item label="Danh mục">{business.category}</Descriptions.Item>
                </Descriptions>

                {business.images && business.images.length > 0 && (
                    <div className="mt-8">
                        <Typography.Title level={4}>Hình ảnh khác</Typography.Title>
                        <Image.PreviewGroup>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {business.images.map((img) => (
                                    <Image
                                        key={img.imageId}
                                        src={img.url}
                                        width={150}
                                        height={150}
                                        alt={`Ảnh ${img.imageId}`}
                                        fallback="https://via.placeholder.com/150"
                                        className="rounded-md object-cover"
                                    />
                                ))}
                            </div>
                        </Image.PreviewGroup>
                    </div>
                )}

                {business.events && business.events.length > 0 && (
                    <div className="mt-8">
                        <Typography.Title level={4}>Sự kiện</Typography.Title>
                        <List
                            bordered
                            dataSource={business.events}
                            renderItem={(item) => (
                                <List.Item key={item.eventId}>
                                    <div className="flex flex-col md:flex-row gap-4 w-full">
                                        <Image
                                            src={item.mainImageUrl}
                                            alt={item.name}
                                            width={150}
                                            height={100}
                                            fallback="https://via.placeholder.com/150"
                                            className="rounded-md object-cover"
                                        />
                                        <div>
                                            <Typography.Text strong>{item.name}</Typography.Text>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Thời gian: </span>
                                                {new Date(item.startDate).toLocaleString('vi-VN', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })} -{' '}
                                                {new Date(item.dueDate).toLocaleString('vi-VN', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Địa điểm: </span>
                                                {item.location}
                                            </p>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BusinessOwnerDetail;