import React, { useState, useEffect } from 'react';
import { Card, List, message, Image, Pagination, Tag, Button, Popconfirm } from 'antd';
import {
    HeartFilled,
    EnvironmentOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    TagOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

// Styles for fixed card layout
const cardStyle = {
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
};

const imageStyle = {
    height: '180px',
    objectFit: 'cover',
};

const bodyStyle = {
    flex: '1 1 auto',
    overflowY: 'auto',
    padding: '16px',
};

const Business = () => {
    const [businesses, setBusinesses] = useState([]);
    const [hotBusinesses, setHotBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 20;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            try {
                const response = await api.getBusiness({ pageNumber: currentPage, pageSize });
                const businessData = response.data.items[0]?.businesses || [];
                // Filter hot businesses to only include those with totalLike > 0
                const hotBusinessData = (response.data.items[0]?.hotBusinesses || []).filter(
                    (business) => business.totalLike > 0
                );
                setBusinesses(businessData);
                setHotBusinesses(hotBusinessData);
                setTotalItems((businessData.length + hotBusinessData.length) || 0);
            } catch (error) {
                message.error('Không thể tải danh sách doanh nghiệp. Vui lòng thử lại.');
                console.error('Error fetching businesses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = async (businessId) => {
        try {
            await api.deleteBusiness(businessId);
            message.success('Xóa doanh nghiệp thành công!');
            setBusinesses(businesses.filter((item) => item.id !== businessId));
            // Also filter hotBusinesses to maintain totalLike > 0 condition
            setHotBusinesses(hotBusinesses.filter((item) => item.id !== businessId));
            setTotalItems(totalItems - 1);
        } catch (error) {
            message.error('Không thể xóa doanh nghiệp. Vui lòng thử lại.');
            console.error('Error deleting business:', error);
        }
    };

    const renderBusinessCard = (item) => (
        <List.Item style={{ height: '100%' }}>
            <Card
                hoverable
                style={cardStyle}
                cover={
                    <Image
                        src={item.mainImage}
                        alt={item.businessName}
                        style={imageStyle}
                        fallback="https://via.placeholder.com/180"
                        preview={false}
                    />
                }
                onClick={(e) => {
                    if (!e.target.closest('.ant-btn')) {
                        navigate(`/business/${item.id}`);
                    }
                }}
                bodyStyle={bodyStyle}
            >
                <Card.Meta
                    title={
                        <div className="text-lg font-semibold flex justify-between items-center">
                            {item.businessName}
                            <div className="flex items-center gap-2">
                                {item.totalLike > 0 && (
                                    <span className="text-red-500 flex items-center gap-1 text-base">
                                        <HeartFilled /> {item.totalLike}
                                    </span>
                                )}
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa doanh nghiệp này?"
                                    onConfirm={() => handleDelete(item.id)}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        size="small"
                                    />
                                </Popconfirm>
                            </div>
                        </div>
                    }
                    description={
                        <div className="text-sm text-gray-700 space-y-1">
                            <p><TagOutlined /> <strong>Danh mục:</strong> {item.categoryName}</p>
                            <p><CalendarOutlined /> <strong>Bắt đầu:</strong> {item.startDay || 'Không có thông tin'}</p>
                            <p><CalendarOutlined /> <strong>Kết thúc:</strong> {item.endDay || 'Không có thông tin'}</p>
                            <p><ClockCircleOutlined /> <strong>Giờ mở cửa:</strong> {item.openingHours || 'Không có thông tin'}</p>
                            <p><EnvironmentOutlined /> <strong>Địa chỉ:</strong> {item.addresss}</p>
                            <p><strong>Tỉnh/Thành phố:</strong> {item.province}</p>
                            <p><strong>Vĩ độ:</strong> {item.latidue || 'Không có'}</p>
                            <p><strong>Kinh độ:</strong> {item.longtidue || 'Không có'}</p>
                        </div>
                    }
                />
            </Card>
        </List.Item>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Danh sách doanh nghiệp</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/business/add')}
                >
                    Add
                </Button>
            </div>
            <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={businesses}
                loading={loading}
                renderItem={renderBusinessCard}
                locale={{ emptyText: 'Không có dữ liệu doanh nghiệp' }}
            />

            <h2 className="text-2xl font-bold mb-4 mt-8">Danh sách doanh nghiệp nổi bật</h2>
            <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={hotBusinesses}
                loading={loading}
                renderItem={renderBusinessCard}
                locale={{ emptyText: 'Không có dữ liệu doanh nghiệp nổi bật' }}
            />

            {totalItems > 0 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};

export default Business;