import React, { useState, useEffect } from 'react';
import { Card, List, message, Image, Pagination, Button, Popconfirm } from 'antd';
import { HeartFilled, CalendarOutlined, ClockCircleOutlined, TagOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import SplashScreen from '../SplashScreen';

const Business = () => {
    const [businesses, setBusinesses] = useState([]);
    const [hotBusinesses, setHotBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showSplash, setShowSplash] = useState(true); // State to control splash screen
    const pageSize = 20;

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinesses = async () => {
            setLoading(true);
            try {
                const response = await api.getBusiness({ pageNumber: currentPage, pageSize });
                const businessData = response.data.items[0]?.businesses || [];
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

        // Show splash screen for 5 seconds on mount, then fetch data
        const splashTimer = setTimeout(() => {
            setShowSplash(false);
            fetchBusinesses(); // Fetch data after splash
        }, 1000);

        return () => clearTimeout(splashTimer); // Cleanup timer on unmount
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = async (businessId) => {
        try {
            await api.deleteBusiness(businessId);
            message.success('Xóa doanh nghiệp thành công!');
            setBusinesses(businesses.filter((item) => item.id !== businessId));
            setHotBusinesses(hotBusinesses.filter((item) => item.id !== businessId));
            setTotalItems(totalItems - 1);
        } catch (error) {
            message.error('Không thể xóa doanh nghiệp. Vui lòng thử lại.');
            console.error('Error deleting business:', error);
        }
    };

    return (
        <> <div className="p-6">
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Danh sách doanh nghiệp</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/business/add')}
                >
                    Thêm
                </Button>
            </div>

            {/* Danh sách doanh nghiệp nổi bật */}
            <h2 className="text-2xl font-bold mb-4 mt-8 flex items-center">
                <img
                    src="src/assets/Animation - 1749649878254.gif"
                    alt="Flame"
                    style={{ height: '24px', width: '24px', marginRight: '8px' }}
                />
                Doanh nghiệp nổi bật
            </h2>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                dataSource={hotBusinesses}
                loading={loading}
                locale={{ emptyText: 'Không có dữ liệu doanh nghiệp nổi bật' }}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            hoverable
                            className="business-card"
                            style={{
                                width: '100%',
                                maxWidth: '240px',
                                height: '360px',
                                display: 'flex',
                                flexDirection: 'column',
                                margin: '0 auto',
                            }}
                            bodyStyle={{
                                padding: '12px',
                                flex: '1 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            cover={
                                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                    <Image
                                        src={item.mainImage}
                                        alt={item.businessName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        fallback="https://via.placeholder.com/180"
                                        preview={false}
                                    />
                                    {item.totalLike > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(255,255,255,0.85)',
                                            padding: '2px 8px',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            color: '#ff4d4f',
                                            fontWeight: 500,
                                        }}>
                                            <HeartFilled style={{ marginRight: 4 }} /> {item.totalLike}
                                        </div>
                                    )}
                                </div>
                            }
                            onClick={(e) => {
                                if (!e.target.closest('.ant-btn')) {
                                    navigate(`/business/${item.id}`);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start text-base font-semibold mb-2">
                                <span style={{
                                    flex: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {item.businessName}
                                </span>
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

                            <div className="text-sm text-gray-700 space-y-1 flex-grow">
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <TagOutlined /> <strong>Danh mục:</strong> {item.categoryName}
                                </p>
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <CalendarOutlined /> <strong>Bắt đầu:</strong> {item.startDay || 'Không có thông tin'}
                                </p>
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <CalendarOutlined /> <strong>Kết thúc:</strong> {item.endDay || 'Không có thông tin'}
                                </p>
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <ClockCircleOutlined /> <strong>Giờ mở cửa:</strong> {item.openingHours || 'Không có thông tin'}
                                </p>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

            {/* Danh sách doanh nghiệp thông thường */}
            <h2 className="text-2xl font-bold mb-4 mt-8">Doanh nghiệp</h2>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                dataSource={businesses}
                loading={loading}
                locale={{ emptyText: 'Không có dữ liệu doanh nghiệp' }}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            hoverable
                            className="business-card"
                            style={{
                                width: '100%',
                                maxWidth: '240px',
                                height: '360px',
                                display: 'flex',
                                flexDirection: 'column',
                                margin: '0 auto',
                            }}
                            bodyStyle={{
                                padding: '12px',
                                flex: '1 0 auto',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            cover={
                                <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                                    <Image
                                        src={item.mainImage}
                                        alt={item.businessName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        fallback="https://via.placeholder.com/180"
                                        preview={false}
                                    />
                                    {item.totalLike > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(255,255,255,0.85)',
                                            padding: '2px 8px',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                            color: '#ff4d4f',
                                            fontWeight: 500,
                                        }}>
                                            <HeartFilled style={{ marginRight: 4 }} /> {item.totalLike}
                                        </div>
                                    )}
                                </div>
                            }
                            onClick={(e) => {
                                if (!e.target.closest('.ant-btn')) {
                                    navigate(`/business/${item.id}`);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start text-base font-semibold mb-2">
                                <span style={{
                                    flex: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {item.businessName}
                                </span>
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

                            <div className="text-sm text-gray-700 space-y-1 flex-grow">
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <TagOutlined /> <strong>Danh mục:</strong> {item.categoryName}
                                </p>
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <CalendarOutlined /> <strong>Bắt đầu:</strong> {item.startDay || 'Không có thông tin'}
                                </p>
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <CalendarOutlined /> <strong>Kết thúc:</strong> {item.endDay || 'Không có thông tin'}
                                </p>
                                <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <ClockCircleOutlined /> <strong>Giờ mở cửa:</strong> {item.openingHours || 'Không có thông tin'}
                                </p>
                            </div>
                        </Card>
                    </List.Item>
                )}
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
        </div></>

    );
};

export default Business;