import React, { useState, useEffect } from 'react';
import { Table, message, Card, Pagination, Tag, Modal, Form, Input, InputNumber, DatePicker, Button } from 'antd';
import api from '../../api/api';
import moment from 'moment';

const VoucherList = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [form] = Form.useForm();

    const fetchVouchers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.getVoucherByBusinessOwner({ pageNumber: page, pageSize });
            const { data } = response;
            setVouchers(data.items);
            setPagination({
                current: data.page,
                pageSize: data.size,
                total: data.total,
            });
        } catch (error) {
            message.error(`Không thể tải danh sách voucher: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        form.setFieldsValue({
            name: voucher.name,
            percent: voucher.percent,
            validFrom: moment(voucher.validFrom),
            validTo: moment(voucher.validTo),
            quantity: voucher.quantity,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (voucherId) => {
        try {
            await api.deleteVoucher(voucherId);
            message.success('Xóa voucher thành công!');
            fetchVouchers(pagination.current, pagination.pageSize); // Tải lại danh sách
        } catch (error) {
            message.error(`Xóa voucher thất bại: ${error.message}`);
        }
    };

    const handleSave = async (values) => {
        try {
            await api.editVoucher(editingVoucher.id, {
                name: values.name,
                percent: values.percent,
                validFrom: values.validFrom.toISOString(),
                validTo: values.validTo.toISOString(),
                quantity: values.quantity,
            });
            message.success('Cập nhật voucher thành công!');
            setIsModalVisible(false);
            fetchVouchers(pagination.current, pagination.pageSize); // Tải lại danh sách
        } catch (error) {
            message.error(`Cập nhật voucher thất bại: ${error.message}`);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <span className="text-gray-700">{text}</span>,
        },
        {
            title: 'Tên Voucher',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-medium text-blue-600">{text}</span>,
        },
        {
            title: 'Phần trăm giảm',
            dataIndex: 'percent',
            key: 'percent',
            render: (value) => (
                <Tag color="green" className="font-semibold">{value}%</Tag>
            ),
            align: 'center',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'validFrom',
            key: 'validFrom',
            render: (text) => new Date(text).toLocaleDateString('vi-VN'),
            align: 'center',
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'validTo',
            key: 'validTo',
            render: (text) => new Date(text).toLocaleDateString('vi-VN'),
            align: 'center',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (value) => <span className="text-gray-700">{value}</span>,
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className="space-x-2">
                    <Button type="link" onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800">
                        Edit
                    </Button>
                    <Button type="link" onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-800">
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Card
                title={<h2 className="text-2xl font-semibold text-indigo-700">🎁 Danh sách Voucher</h2>}
                bordered={false}
                className="shadow-xl rounded-xl border border-gray-100"
            >
                <Table
                    columns={columns}
                    dataSource={vouchers}
                    loading={loading}
                    rowKey="id"
                    pagination={false}
                    className="mt-4"
                    rowClassName="hover:bg-gray-50"
                    bordered
                />
                <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={(page, pageSize) =>
                        setPagination({ ...pagination, current: page, pageSize })
                    }
                    className="mt-4 text-right"
                />
            </Card>

            <Modal
                title="Chỉnh sửa Voucher"
                visible={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()}>
                        Lưu
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="name"
                        label="Tên Voucher"
                        rules={[{ required: true, message: 'Vui lòng nhập tên voucher!' }]}
                    >
                        <Input placeholder="Nhập tên voucher" />
                    </Form.Item>
                    <Form.Item
                        name="percent"
                        label="Phần trăm giảm (%)"
                        rules={[{ required: true, message: 'Vui lòng nhập phần trăm!' }]}
                    >
                        <InputNumber min={0} max={100} placeholder="0-100" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="validFrom"
                        label="Ngày bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="validTo"
                        label="Ngày kết thúc"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        <InputNumber min={0} placeholder="Nhập số lượng" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default VoucherList;