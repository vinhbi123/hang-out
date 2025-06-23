import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Image, message, Card, Spin, Typography, Button } from 'antd';
import api from '../../api/api';

const { Title } = Typography;

const EventDetail = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchEvent = async () => {
        setLoading(true);
        try {
            const response = await api.getEvent(eventId);
            const { data } = response;
            setEvent(data);
        } catch (error) {
            message.error('Lấy thông tin sự kiện thất bại. Vui lòng thử lại.');
            console.error('Error fetching event:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!eventId || eventId === 'undefined') {
            message.error('ID sự kiện không hợp lệ.');
            navigate('/business-dashboard/events');
        } else {
            fetchEvent();
        }
    }, [eventId, navigate]);

    const handleEdit = () => {
        navigate(`/business-dashboard/events/edit/${eventId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin tip="Đang tải..." />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center text-gray-500 mt-10">
                Không tìm thấy sự kiện.
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Card
                bordered={false}
                className="shadow-lg"
                title={
                    <div className="flex justify-between items-center">
                        <Button
                            onClick={() => navigate('/business-dashboard/events')}
                            className="border-gray-300 hover:bg-gray-100"
                        >
                            Quay lại danh sách
                        </Button>
                        <Title level={2} className="m-0 text-center flex-1">
                            {event.name}
                        </Title>
                        <Button
                            onClick={handleEdit}
                            type="primary"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Chỉnh sửa
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src={event.mainImageUrl}
                        alt={event.name}
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
                    <Descriptions.Item label="Tên sự kiện">{event.name}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <span className={event.active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                            {event.active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian còn lại">{event.comingDay || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Vĩ độ">{event.latitude || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Kinh độ">{event.longitude || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Địa điểm">{event.location || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{event.description || 'Không có thông tin'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày bắt đầu">
                        {event.startDate
                            ? new Date(event.startDate).toLocaleString('vi-VN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })
                            : 'Không có thông tin'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày kết thúc">
                        {event.dueDate
                            ? new Date(event.dueDate).toLocaleString('vi-VN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })
                            : 'Không có thông tin'}
                    </Descriptions.Item>
                </Descriptions>

                {event.images && event.images.length > 0 && (
                    <div className="mt-8">
                        <Title level={4}>Hình ảnh</Title>
                        <Image.PreviewGroup>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {event.images.map((image) => (
                                    <Image
                                        key={image.id}
                                        src={image.imageUrl}
                                        alt={`Ảnh ${image.id}`}
                                        width={150}
                                        height={150}
                                        fallback="https://via.placeholder.com/150"
                                        className="rounded-md object-cover"
                                    />
                                ))}
                            </div>
                        </Image.PreviewGroup>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default EventDetail;