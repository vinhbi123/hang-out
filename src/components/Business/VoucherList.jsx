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
    const [form] = Form.useForm();

    const fetchVouchers = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await api.getVoucherByBusinessOwner({
                pageNumber: page,
                pageSize: pageSize,
            });
            const { data } = response;
            // Filter only active vouchers
            const activeVouchers = (data.items || []).filter((item) => item.active === true).map((item) => ({
                id: item.id,
                name: item.name,
                percent: item.percent,
                validFrom: item.validFrom,
                validTo: item.validTo,
                quantity: item.quantity,
                active: item.active,
            }));
            setVoucherData(activeVouchers);
            setPagination({
                current: data.page || 1,
                pageSize: data.size || 10,
                total: data.items.filter((item) => item.active === true).length || 0,
            });
            if (activeVouchers.length === 0) {
                message.info("Không có voucher đang hoạt động để hiển thị.");
            }
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
        form.resetFields();
        setModalOpen(true);
    };

    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        form.setFieldsValue({
            name: voucher.name,
            percent: voucher.percent,
            validFrom: voucher.validFrom ? dayjs(voucher.validFrom) : null,
            validTo: voucher.validTo ? dayjs(voucher.validTo) : null,
            quantity: voucher.quantity,
        });
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
                    message.error(`Failed to delete voucher: ${error.message || "Unknown error"}`);
                }
            },
        });
    };

    const handleSave = async (values) => {
        setSubmitting(true);
        try {
            // Construct payload based on whether it's create or edit
            const payload = editingVoucher
                ? {
                    name: values.name,
                    percent: values.percent,
                    validFrom: values.validFrom.toISOString(),
                    validTo: values.validTo.toISOString(),
                    quantity: values.quantity,
                }
                : {
                    voucherName: values.name,
                    percent: values.percent,
                    validFrom: values.validFrom.toISOString(),
                    validTo: values.validTo.toISOString(),
                    quantity: values.quantity,
                };

            console.log("Voucher data being sent:", payload);

            if (editingVoucher) {
                await api.editVoucher(editingVoucher.id, payload);
                message.success("Voucher updated successfully!");
            } else {
                await api.createVoucher(payload);
                message.success("Voucher created successfully!");
            }

            setModalOpen(false);
            form.resetFields();
            fetchVouchers(pagination.current, pagination.pageSize);
        } catch (error) {
            const errorMessage = error.message.includes("duplicate")
                ? "Voucher name already exists!"
                : error.message || "Unknown error";
            message.error(`Failed to ${editingVoucher ? "update" : "create"} voucher: ${errorMessage}`);
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
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
            align: "center",
        },
        {
            title: "End Date",
            dataIndex: "validTo",
            key: "validTo",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
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
                title={<h2 className="text-2xl font-semibold text-blue-600">🎁 Voucher List</h2>}
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
                onOk={() => form.submit()}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setModalOpen(false);
                            form.resetFields();
                        }}
                    >
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => form.submit()}
                        loading={submitting}
                    >
                        {editingVoucher ? "Save" : "Create"}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="name"
                        label="Voucher Name"
                        rules={[{ required: true, message: "Please enter voucher name!" }]}
                    >
                        <Input placeholder="Enter voucher name" />
                    </Form.Item>
                    <Form.Item
                        name="percent"
                        label="Discount (%)"
                        rules={[
                            { required: true, message: "Please enter discount percentage!" },
                            { type: "number", min: 0, max: 100, message: "Discount must be between 0 and 100!" },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            max={100}
                            placeholder="0-100"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="validFrom"
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
                        name="validTo"
                        label="End Date"
                        rules={[
                            { required: true, message: "Please select end date!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || !getFieldValue("validFrom") || value >= getFieldValue("validFrom")) {
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
                                current && current < form.getFieldValue("validFrom") || current < dayjs().startOf("day")
                            }
                        />
                    </Form.Item>
                    <Form.Item
                        name="quantity"
                        label="Quantity"
                        rules={[
                            { required: true, message: "Please enter quantity!" },
                            { type: "number", min: 0, message: "Quantity must be non-negative!" },
                        ]}
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