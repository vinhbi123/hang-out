import React, { useState, useEffect } from "react";
import {
    Table,
    message,
    Card,
    Pagination,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Button,
    Space,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../api/api";

const VoucherList = () => {
    const [voucherData, setVoucherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData] = Form.useForm();

    const fetchVouchers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.getVoucherByBusinessOwner({
                pageNumber: page,
                pageSize: pageSize,
            });
            const { data } = response;
            // Normalize API response to match table and form expectations
            setVoucherData(
                (data.items || []).map((item) => ({
                    id: item.id,
                    name: item.voucherName, // Map voucherName to name
                    percent: item.percent,
                    validFrom: item.validFrom,
                    validTo: item.validTo,
                    quantity: item.quantity,
                }))
            );
            setPagination({
                current: data.page || 1,
                pageSize: data.size || 10,
                total: data.total || 0,
            });
        } catch (error) {
            message.error(`Failed to fetch vouchers: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const handleAddNew = () => {
        setEditingVoucher(null);
        formData.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        formData.setFields([
            {
                name: "voucherName",
                value: voucher.name,
            },
            {
                name: "percentDiscount",
                value: voucher.percent,
            },
            {
                name: "validFromDate",
                value: voucher.validFrom ? dayjs(voucher.validFrom) : null,
            },
            {
                name: "validToDate",
                value: voucher.validTo ? dayjs(voucher.validTo) : null,
            },
            {
                name: "quantityAvailable",
                value: voucher.quantity,
            },
        ]);
        setModalOpen(true);
    };

    const handleDelete = async (voucherId) => {
        Modal.confirm({
            title: "Are you sure you want to delete this voucher?",
            onOk: async () => {
                try {
                    await api.deleteVoucher(voucherId);
                    message.success("Voucher deleted successfully!");
                    fetchVouchers(pagination.current, pagination.pageSize);
                } catch (error) {
                    message.error(`Failed to delete voucher: ${error.message}`);
                }
            },
        });
    };

    const handleSave = async (values) => {
        setSubmitting(true);
        try {
            const voucherData = {
                voucherName: values.voucherName, // Fixed: Use voucherName
                percent: values.percentDiscount,
                validFrom: values.validFromDate.toISOString(),
                validTo: values.validToDate.toISOString(),
                quantity: values.quantityAvailable,
            };

            // Debug: Log the payload
            console.log("Voucher data being sent:", voucherData);

            if (editingVoucher) {
                await api.editVoucher(editingVoucher.id, voucherData);
                message.success("Voucher updated successfully!");
            } else {
                await api.createVoucher(voucherData);
                message.success("Voucher created successfully!");
            }

            setModalOpen(false);
            formData.resetFields();
            fetchVouchers(pagination.current, pagination.pageSize);
        } catch (error) {
            const errorMessage = error.message.includes("duplicate")
                ? "Voucher name already exists!"
                : error.message;
            message.error(
                `Failed to ${editingVoucher ? "update" : "create"} voucher: ${errorMessage}`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (id) => <span className="text-gray-600">{id}</span>,
        },
        {
            title: "Voucher Name",
            dataIndex: "name",
            key: "name",
            render: (name) => <span className="font-medium text-blue-600">{name}</span>,
        },
        {
            title: "Discount (%)",
            dataIndex: "percent",
            key: "percent",
            render: (value) => (
                <Tag color="green" className="font-semibold">
                    {value}%
                </Tag>
            ),
            align: "center",
        },
        {
            title: "Start Date",
            dataIndex: "validFrom",
            key: "validFrom",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
            align: "center",
        },
        {
            title: "End Date",
            dataIndex: "validTo",
            key: "validTo",
            render: (date) => new Date(date).toLocaleDateString("vi-VN"),
            align: "center",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            render: (value) => <span className="text-gray-600">{value}</span>,
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (_, record) => (
                <Space key={record.id} size="middle">
                    <Button
                        type="link"
                        onClick={() => handleEdit(record)}
                        className="text-blue-600 hover:text-blue-500"
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-500"
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Card
                title={
                    <h2 className="text-2xl font-semibold text-blue-600">🎁 Voucher List</h2>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Add Voucher
                    </Button>
                }
                bordered={false}
                className="shadow-xl rounded-xl border border-gray-100"
            >
                <Table
                    columns={columns}
                    dataSource={voucherData}
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
                title={editingVoucher ? "Edit Voucher" : "Create Voucher"}
                open={isModalOpen}
                onOk={() => formData.submit()}
                onCancel={() => setModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => formData.submit()}
                        loading={submitting}
                    >
                        {editingVoucher ? "Save" : "Create"}
                    </Button>,
                ]}
            >
                <Form form={formData} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="voucherName"
                        label="Voucher Name"
                        rules={[{ required: true, message: "Please enter voucher name!" }]}
                    >
                        <Input placeholder="Enter voucher name" />
                    </Form.Item>
                    <Form.Item
                        name="percentDiscount"
                        label="Discount (%)"
                        rules={[{ required: true, message: "Please enter discount percentage!" }]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            placeholder="0-100"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="validFromDate"
                        label="Start Date"
                        rules={[{ required: true, message: "Please select start date!" }]}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            style={{ width: "100%" }}
                            disabledDate={(current) => current && current < dayjs().startOf("day")}
                        />
                    </Form.Item>
                    <Form.Item
                        name="validToDate"
                        label="End Date"
                        rules={[
                            { required: true, message: "Please select end date!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("validFromDate") <= value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("End date must be after start date!"));
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            style={{ width: "100%" }}
                            disabledDate={(current) =>
                                current && current < formData.getFieldValue("validFromDate")
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="quantityAvailable"
                        label="Quantity"
                        rules={[{ required: true, message: "Please enter quantity!" }]}
                    >
                        <InputNumber
                            min={0}
                            placeholder="Enter quantity"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default VoucherList;