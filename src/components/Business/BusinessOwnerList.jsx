import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import api from '../../api/api';
import BusinessOwnerDetail from './BusinessDetail';


const BusinessOwnerList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedBusinessId, setSelectedBusinessId] = useState(null); // Changed to store businessId

    useEffect(() => {
        fetchBusinesses();
    }, [page, pageSize]);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const response = await api.getBusinessByOwner({ pageNumber: page, pageSize });
            const { data } = response;
            setBusinesses(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            message.error('Không thể tải danh sách doanh nghiệp. Vui lòng thử lại.');
            console.error('Lỗi khi tải danh sách doanh nghiệp:', error);
        } finally {
            setLoading(false);
        }
    };

    const showBusinessDetails = (record) => {
        setSelectedBusinessId(record.id); // Store only the businessId
    };

    const handleBack = () => {
        setSelectedBusinessId(null);
    };

    const columns = [
        {
            title: 'Tên Doanh Nghiệp',
            dataIndex: 'businessName',
            key: 'businessName',
            sorter: (a, b) => a.businessName.localeCompare(b.businessName),
        },
        {
            title: 'Ảnh Chính',
            dataIndex: 'mainImage',
            key: 'mainImage',
            render: (text) => (
                <img src={text} alt={text} className="w-16 h-16 object-cover rounded-md" />
            ),
        },
        {
            title: 'Giờ Mở Cửa',
            dataIndex: 'openingHours',
            key: 'openingHours',
        },
        {
            title: 'Địa Chỉ',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Tỉnh/Thành Phố',
            dataIndex: 'province',
            key: 'province',
        },
        {
            title: 'Danh Mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => showBusinessDetails(record)}
                    className="text-blue-500 hover:text-blue-700"
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                {selectedBusinessId ? (
                    <BusinessOwnerDetail businessId={selectedBusinessId} onBack={handleBack} />
                ) : (
                    <>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-center text-gray-800">
                                Doanh Nghiệp Của Tôi
                            </h2>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <Table
                                columns={columns}
                                dataSource={businesses}
                                loading={loading}
                                rowKey="id"
                                locale={{
                                    emptyText: <span className="text-gray-500">Không có doanh nghiệp nào.</span>,
                                }}
                                rowClassName="hover:bg-gray-50 transition-colors"
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BusinessOwnerList;