
import React, { useState, useEffect } from 'react';
import { Descriptions, Image, message, Card, Spin, Typography, List, Button, Modal, Form, Input, DatePicker, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/api';
import moment from 'moment';
import 'moment/locale/vi';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

moment.locale('vi');

// Component to handle map click events
const LocationMarker = ({ setPosition, form }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            form.setFieldsValue({
                Latitude: e.latlng.lat.toFixed(6),
                Longitude: e.latlng.lng.toFixed(6),
            });
        },
    });

    return null;
};

const BusinessOwnerDetail = ({ businessId, onBack }) => {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.0452396, 105.724084]); // Default: Cần Thơ

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
                setPosition([parseFloat(response.data.latitude), parseFloat(response.data.longitude)]);
            } catch (error) {
                message.error('Không thể tải chi tiết doanh nghiệp. Vui lòng thử lại.');
                console.error('Error fetching business:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinessDetail();
    }, [businessId]);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setMainImagePreview(null);
        setAdditionalImagesPreview([]);
        setPosition(business ? [parseFloat(business.latitude), parseFloat(business.longitude)] : [10.0452396, 105.724084]);
    };

    const handleCreateEvent = async (values) => {
        try {
            const formData = new FormData();
            formData.append('Name', values.Name);
            formData.append('StartDate', moment(values.StartDate).startOf('day').toISOString());
            formData.append('DueDate', moment(values.DueDate).startOf('day').toISOString());
            formData.append('Location', values.Location);
            formData.append('Description', values.Description || '');
            formData.append('Latitude', values.Latitude);
            formData.append('Longitude', values.Longitude);
            formData.append('BusinessId', business.id || '');
            if (values.MainImageUrl) {
                formData.append('MainImageUrl', values.MainImageUrl.file);
            }
            if (values.Images) {
                values.Images.forEach((fileObj) => {
                    formData.append('Images', fileObj.file);
                });
            }

            console.log('FormData Entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            await api.createEvent(formData);
            message.success('Thêm sự kiện thành công!');
            handleCancel();
            // Refresh business data to include new event
            const response = await api.getBusinessDetail(businessId);
            setBusiness(response.data);
        } catch (error) {
            message.error(`Thêm sự kiện thất bại: ${error.message}`);
            console.error('Error creating event:', error);
        }
    };

    const handleMainImageChange = ({ file }) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            form.setFieldsValue({ MainImageUrl: { file } });
        } else {
            setMainImagePreview(null);
            form.setFieldsValue({ MainImageUrl: null });
        }
    };

    const handleAdditionalImagesChange = ({ fileList }) => {
        const previews = [];
        const files = fileList.map((item) => {
            if (item.originFileObj) {
                const reader = new FileReader();
                reader.readAsDataURL(item.originFileObj);
                reader.onload = () => {
                    previews.push(reader.result);
                    if (previews.length === fileList.length) {
                        setAdditionalImagesPreview([...previews]);
                    }
                };
                return { file: item.originFileObj };
            }
            return item;
        });
        form.setFieldsValue({ Images: files });
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
                    <div className="flex gap-4">
                        <Button onClick={onBack} className="border-gray-300 hover:bg-gray-100">
                            Quay lại danh sách
                        </Button>
                        <Button type="primary" onClick={showModal}>
                            Thêm Sự Kiện
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
                    <Descriptions.Item label="Không khí">{business.vibe || 'Không có thông tin'}</Descriptions.Item>
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

            <Modal
                title="Thêm Sự Kiện"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                className="rounded-lg"
            >
                <Form
                    form={form}
                    onFinish={handleCreateEvent}
                    layout="vertical"
                    className="space-y-4"
                >
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="Name"
                            label="Tên Sự Kiện"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện!' }]}
                        >
                            <Input placeholder="Nhập tên sự kiện" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                        </Form.Item>
                        <Form.Item
                            name="Location"
                            label="Địa Điểm"
                            rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
                        >
                            <Input placeholder="Nhập địa điểm" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="StartDate"
                            label="Ngày Bắt Đầu"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Chọn ngày bắt đầu"
                            />
                        </Form.Item>
                        <Form.Item
                            name="DueDate"
                            label="Ngày Kết Thúc"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Chọn ngày kết thúc"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="Map"
                        label="Chọn Vị Trí Trên Bản Đồ"
                    >
                        <div className="h-64 w-full rounded-md border-2 border-gray-200 shadow-md">
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                className="rounded-md"
                                zoomControl={true}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker setPosition={setPosition} form={form} />
                                {position && <Marker position={position} />}
                            </MapContainer>
                        </div>
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="Latitude"
                            label="Vĩ Độ"
                            rules={[{ required: true, message: 'Vui lòng chọn vĩ độ trên bản đồ!' }]}
                        >
                            <Input
                                placeholder="Vĩ độ sẽ được điền tự động"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                readOnly
                            />
                        </Form.Item>
                        <Form.Item
                            name="Longitude"
                            label="Kinh Độ"
                            rules={[{ required: true, message: 'Vui lòng chọn kinh độ trên bản đồ!' }]}
                        >
                            <Input
                                placeholder="Kinh độ sẽ được điền tự động"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                readOnly
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="Description"
                        label="Mô Tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                    >
                        <Input.TextArea
                            placeholder="Nhập mô tả sự kiện"
                            rows={4}
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </Form.Item>
                    <Form.Item
                        name="MainImageUrl"
                        label="Ảnh Chính"
                        valuePropName="file"
                        rules={[{ required: true, message: 'Vui lòng tải lên ảnh chính!' }]}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            showUploadList={false}
                            onChange={handleMainImageChange}
                        >
                            <div className="flex items-center justify-center">
                                {mainImagePreview ? (
                                    <img
                                        src={mainImagePreview}
                                        alt="Main Image Preview"
                                        className="w-32 h-32 rounded-md object-cover border-2 border-gray-200 shadow-md"
                                    />
                                ) : (
                                    <Button
                                        icon={<PlusOutlined />}
                                        className="w-full flex items-center justify-center rounded-md border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
                                    >
                                        Chọn ảnh chính
                                    </Button>
                                )}
                            </div>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="Images"
                        label="Ảnh Bổ Sung"
                        valuePropName="fileList"
                    >
                        <Upload
                            beforeUpload={() => false}
                            multiple
                            showUploadList={false}
                            onChange={handleAdditionalImagesChange}
                        >
                            <div className="flex items-center justify-center">
                                <Button
                                    icon={<PlusOutlined />}
                                    className="flex items-center justify-center rounded-md border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
                                >
                                    Thêm ảnh bổ sung
                                </Button>
                            </div>
                        </Upload>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {additionalImagesPreview.map((preview, index) => (
                                <img
                                    key={index}
                                    src={preview}
                                    alt={`Additional Image ${index + 1}`}
                                    className="w-24 h-24 rounded-md object-cover border-2 border-gray-200 shadow-md"
                                />
                            ))}
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                            >
                                Thêm Sự Kiện
                            </Button>
                            <Button
                                onClick={handleCancel}
                                className="w-full border-gray-300 hover:bg-gray-100 rounded-md text-gray-600 transition-all"
                            >
                                Hủy
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BusinessOwnerDetail;
