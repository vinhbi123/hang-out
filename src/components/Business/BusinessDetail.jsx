import React, { useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, DatePicker, Upload, message } from 'antd';
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

const BusinessOwnerDetail = ({ business, onBack }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.0452396, 105.724084]); // Default: Cần Thơ from business data

    if (!business) {
        return <div>Không có thông tin doanh nghiệp.</div>;
    }

    console.log('Business ID:', business.id); // Debug Business ID

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setMainImagePreview(null);
        setAdditionalImagesPreview([]);
        setPosition([10.0452396, 105.724084]); // Reset to default
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

            // Log FormData for debugging
            console.log('FormData Entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            await api.createEvent(formData);
            message.success('Thêm sự kiện thành công!');
            handleCancel();
        } catch (error) {
            message.error(`Thêm sự kiện thất bại: ${error.message}`);
            console.error('Error creating event:', error);
        }
    };

    const handleMainImageChange = ({ file }) => {
        console.log('MainImageUrl File:', {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            fileObject: file,
        }); // Debug selected file
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
                console.log('Images File:', {
                    name: item.originFileObj.name,
                    type: item.originFileObj.type,
                    size: item.originFileObj.size,
                    lastModified: item.originFileObj.lastModified,
                    fileObject: item.originFileObj,
                }); // Debug selected file
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

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Button
                    onClick={onBack}
                    className="flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-all text-gray-600"
                >
                    Quay lại danh sách
                </Button>
                <h2 className="text-2xl font-bold text-gray-800 flex-1 text-center">
                    {business.businessName}
                </h2>
            </div>
            <div className="mb-4">
                <Button type="primary" onClick={showModal}>
                    Thêm Sự Kiện
                </Button>
            </div>
            <Descriptions bordered column={1} className="bg-gray-50">
                <Descriptions.Item label="Tên Doanh Nghiệp">{business.businessName}</Descriptions.Item>
                <Descriptions.Item label="Ảnh Chính">
                    <img
                        src={business.mainImage}
                        alt={business.businessName}
                        className="w-32 h-32 object-cover rounded-md shadow-sm"
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Giờ Mở Cửa">{business.openingHours}</Descriptions.Item>
                <Descriptions.Item label="Địa Chỉ">{business.address}</Descriptions.Item>
                <Descriptions.Item label="Tỉnh/Thành Phố">{business.province}</Descriptions.Item>
                <Descriptions.Item label="Danh Mục">{business.categoryName}</Descriptions.Item>
                <Descriptions.Item label="Ngày Hoạt Động">{`${business.startDay} - ${business.endDay}`}</Descriptions.Item>
                <Descriptions.Item label="Tọa Độ">
                    {`Vĩ độ: ${business.latitude}, Kinh độ: ${business.longitude}`}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Lượt Thích">{business.totalLike}</Descriptions.Item>
                {business.eventsOfBusiness && business.eventsOfBusiness.length > 0 && (
                    <>
                        <Descriptions.Item label="Sự Kiện Hiện Tại">
                            {business.eventsOfBusiness.map((event, index) => (
                                <div key={event.eventId} className="mb-2">
                                    <p><strong>ID Sự Kiện:</strong> {event.eventId}</p>
                                    <p><strong>Tên Sự Kiện:</strong> {event.name}</p>
                                    <img
                                        src={event.mainImage}
                                        alt={event.name}
                                        className="w-32 h-32 object-cover rounded-md shadow-sm mt-2"
                                    />
                                </div>
                            ))}
                        </Descriptions.Item>
                    </>
                )}
            </Descriptions>
            <Modal
                title="Thêm Sự Kiện"
                visible={isModalVisible}
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
                                zoomControl={true} // Enable zoom controls
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
                                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-md"
                                    />
                                ) : (
                                    <Button
                                        icon={<PlusOutlined />}
                                        className="w-full flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
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
                                    className="flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
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
                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-md"
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