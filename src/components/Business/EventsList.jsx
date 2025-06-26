import React, { useState, useEffect } from 'react';
import { Table, message, Spin, Button, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const { confirm } = Modal;

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const navigate = useNavigate();

    const fetchEvents = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.getMyEvents({ page, size: pageSize });
            const { data } = response;
            console.log('getMyEvents response:', data); // Debug log
            // Đảm bảo mapping đúng trường eventId
            const mappedEvents = data.items.map((item) => ({
                ...item,
                eventId: item.eventId || item.id, // Fallback nếu API trả về id thay vì eventId
            }));
            setEvents(mappedEvents);
            setPagination({
                current: data.page,
                pageSize: data.size,
                total: data.total,
            });
            if (data.items.length === 0) {
                message.info('Không có sự kiện nào để hiển thị.');
            }
        } catch (error) {
            message.error('Lấy danh sách sự kiện thất bại. Vui lòng thử lại.');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (pagination) => {
        fetchEvents(pagination.current, pagination.pageSize);
    };

    const handleAddEvent = () => {
        navigate('/business-dashboard/events/add');
    };

    const handleDeleteEvent = (eventId, eventName) => {
        confirm({
            title: 'Xác nhận xóa sự kiện',
            content: `Bạn có chắc muốn xóa sự kiện "${eventName}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                setLoading(true);
                try {
                    await api.deleteEvent(eventId);
                    message.success('Xóa sự kiện thành công!');
                    fetchEvents(pagination.current, pagination.pageSize);
                } catch (error) {
                    message.error('Xóa sự kiện thất bại. Vui lòng thử lại.');
                    console.error('Error deleting event:', error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleViewDetails = (eventId) => {
        if (!eventId) {
            message.error('ID sự kiện không hợp lệ.');
            return;
        }
        console.log('Navigating to event:', eventId); // Debug log
        navigate(`/business-dashboard/events/${eventId}`);
    };

    const columns = [
        {
            title: 'Tên sự kiện',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'mainImage',
            key: 'mainImage',
            render: (text) => (
                <img src={text} alt="Event" className="w-16 h-16 object-cover rounded" />
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        // {
        //     title: 'Ngày diễn ra',
        //     dataIndex: 'comingDay',
        //     key: 'comingDay',
        // },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button
                        type="primary"
                        onClick={() => handleViewDetails(record.eventId)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Chi tiết
                    </Button>
                    <Button
                        danger
                        onClick={() => handleDeleteEvent(record.eventId, record.name)}
                    >
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Danh sách sự kiện</h2>
                <Button
                    type="primary"
                    onClick={handleAddEvent}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Thêm Sự Kiện
                </Button>
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={events}
                    rowKey="eventId"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50'],
                        onChange: (page, pageSize) =>
                            handleTableChange({ current: page, pageSize }),
                    }}
                    className="shadow-md rounded-lg"
                />
            </Spin>
        </div>
    );
};

export default EventsList;