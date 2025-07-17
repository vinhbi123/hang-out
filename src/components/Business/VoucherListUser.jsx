import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Spin, message, Tag } from 'antd';
import moment from 'moment';
import 'moment/locale/vi';
import api from '../../api/api';

const VoucherListUser = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10, // Test with smaller pageSize
        total: 0,
    });
    const [emailFilter, setEmailFilter] = useState('');

    const fetchVouchers = async (page = 1, pageSize = 10, email = '') => {
        setLoading(true);
        try {
            const response = await api.getUserVoucherByBusiness({
                pageNumber: page,
                pageSize,
                email,
            });
            console.log('API Response:', response.data);
            setVouchers(response.data.items);
            setPagination({
                current: response.data.page,
                pageSize: response.data.size,
                total: response.data.total,
            });
            console.log('Updated Pagination:', {
                current: response.data.page,
                pageSize: response.data.size,
                total: response.data.total,
            });
        } catch (error) {
            message.error('Không thể tải danh sách voucher');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pagination) => {
        console.log('Table Change:', pagination);
        fetchVouchers(pagination.current, pagination.pageSize, emailFilter);
    };

    const handleSearch = () => {
        fetchVouchers(1, pagination.pageSize, emailFilter);
    };

    const handleUseVoucher = async (voucherId, accountId) => {
        setLoading(true);
        try {
            await api.clickUseVoucher({ voucherId, accountId });
            message.success('Đã sử dụng voucher thành công');
            fetchVouchers(pagination.current, pagination.pageSize, emailFilter);
        } catch (error) {
            message.error('Không thể sử dụng voucher');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const columns = [
        {
            title: 'Tên Voucher',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giảm (%)',
            dataIndex: 'percent',
            key: 'percent',
            render: (value) => <span>{value}%</span>,
            align: 'center',
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'validFrom',
            key: 'validFrom',
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
            align: 'center',
        },
        {
            title: 'Kết thúc',
            dataIndex: 'validTo',
            key: 'validTo',
            render: (text) => moment(text).format('DD/MM/YYYY HH:mm'),
            align: 'center',
        },
        {
            title: 'Đã sử dụng',
            dataIndex: 'isUsed',
            key: 'isUsed',
            align: 'center',
            render: (isUsed) =>
                isUsed ? (
                    <Tag color="red">Đã dùng</Tag>
                ) : (
                    <Tag color="green">Chưa dùng</Tag>
                ),
        },
        {
            title: 'Email người dùng',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Button
                    type="primary"
                    disabled={record.isUsed}
                    onClick={() => handleUseVoucher(record.id, record.accountId)}
                    className={`h-8 px-4 ${record.isUsed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} rounded-md`}
                >
                    Sử dụng
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">🎁 Danh sách Voucher</h1>
            <div className="flex items-center mb-6 w-full max-w-md">
                <Input
                    placeholder="Lọc theo email người dùng"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    style={{ height: '40px' }}
                />
                <Button
                    type="primary"
                    onClick={handleSearch}
                    className="ml-3 h-10 bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                    Tìm kiếm
                </Button>
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={vouchers}
                    rowKey={(record) => `${record.id}-${record.accountId}`}
                    pagination={{
                        ...pagination,
                        showTotal: (total) => `Tổng cộng ${total} voucher`,
                    }}
                    onChange={handleTableChange}
                    className="bg-white shadow-lg rounded-lg overflow-hidden"
                    rowClassName="hover:bg-gray-50"
                    bordered
                />
            </Spin>
        </div>
    );
};

export default VoucherListUser;