import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Upload, Button, message } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/api';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const { Option } = Select;
const { TextArea } = Input;

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

const AddBusiness = () => {
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.7769, 106.7009]); // Default: Ho Chi Minh City

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories({ page: 1, size: 1000 });
                setCategories(response.data.items || []);
            } catch (error) {
                message.error('Không thể tải danh sách danh mục. Vui lòng thử lại.');
                console.error('Lỗi khi tải danh mục:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleCreateBusiness = async (values) => {
        const formData = new FormData();
        formData.append('Phone', values.Phone);
        formData.append('Email', values.Email);
        formData.append('Password', values.Password);
        formData.append('ConfirmPassword', values.ConfirmPassword);
        formData.append('Name', values.Name);
        formData.append('BusinessName', values.BusinessName);
        formData.append('Vibe', values.Vibe || '');
        formData.append('Latitude', values.Latitude);
        formData.append('Longitude', values.Longitude);
        formData.append('Address', values.Address);
        formData.append('Province', values.Province);
        formData.append('Description', values.Description || '');
        formData.append('OpenningHours', values.OpenningHours);
        formData.append('StartDay', values.StartDay || '');
        formData.append('EndDay', values.EndDay || '');
        formData.append('CategoryId', values.CategoryId || '');

        if (values.AvatarImage) formData.append('AvatarImage', values.AvatarImage.file);
        if (values.MainImage) formData.append('MainImage', values.MainImage.file);
        if (values.Image) {
            values.Image.forEach((file) => formData.append('Image', file.file));
        }

        try {
            await api.createBusinessOwner(formData);
            message.success('Tạo doanh nghiệp thành công!');
            form.resetFields();
            setAvatarPreview(null);
            setMainImagePreview(null);
            setAdditionalImagesPreview([]);
            setPosition([10.7769, 106.7009]);
            navigate('/business');
        } catch (error) {
            message.error('Không thể tạo doanh nghiệp. Vui lòng thử lại.');
            console.error('Lỗi khi tạo doanh nghiệp:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setAvatarPreview(null);
        setMainImagePreview(null);
        setAdditionalImagesPreview([]);
        setPosition([10.7769, 106.7009]);
        navigate('/business');
    };

    const handleAvatarChange = ({ file }) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            form.setFieldsValue({ AvatarImage: { file } });
        } else {
            setAvatarPreview(null);
        }
    };

    const handleMainImageChange = ({ file }) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            form.setFieldsValue({ MainImage: { file } });
        } else {
            setMainImagePreview(null);
        }
    };

    const handleAdditionalImagesChange = ({ fileList }) => {
        const previews = [];
        const files = fileList.map((item, index) => {
            if (item.originFileObj) {
                const reader = new FileReader();
                reader.readAsDataURL(item.originFileObj);
                reader.onload = () => {
                    previews[index] = reader.result;
                    if (previews.length === fileList.length) {
                        setAdditionalImagesPreview(previews);
                    }
                };
                return { file: item.originFileObj };
            }
            return item;
        });
        form.setFieldsValue({ Image: files });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <div className="flex items-center mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/business')}
                        className="flex items-center justify-center rounded-md border-gray-300 hover:bg-gray-50"
                    >
                        Quay lại
                    </Button>
                    <h2 className="text-3xl font-bold text-center text-gray-800 flex-1">Tạo Doanh Nghiệp Mới</h2>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateBusiness}
                    className="space-y-4"
                >
                    {/* Avatar Image Field */}
                    <Form.Item
                        name="AvatarImage"
                        label="Ảnh đại diện"
                        valuePropName="file"
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            className="w-full"
                            onChange={handleAvatarChange}
                            showUploadList={false}
                        >
                            <div className="flex items-center justify-center">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                    />
                                ) : (
                                    <Button
                                        icon={<PlusOutlined />}
                                        className="w-full flex items-center justify-center rounded-md border-gray-300 hover:bg-gray-50"
                                    >
                                        Chọn ảnh đại diện
                                    </Button>
                                )}
                            </div>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        name="Phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input
                            placeholder="Nhập số điện thoại"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' },
                        ]}
                    >
                        <Input
                            placeholder="Nhập email"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            placeholder="Nhập mật khẩu"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="ConfirmPassword"
                        label="Xác nhận mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' }]}
                    >
                        <Input.Password
                            placeholder="Xác nhận mật khẩu"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Name"
                        label="Tên cá nhân"
                        rules={[{ required: true, message: 'Vui lòng nhập tên cá nhân!' }]}
                    >
                        <Input
                            placeholder="Nhập tên cá nhân"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="BusinessName"
                        label="Tên doanh nghiệp"
                        rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp!' }]}
                    >
                        <Input
                            placeholder="Nhập tên doanh nghiệp"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Vibe"
                        label="Phong cách"
                    >
                        <Input
                            placeholder="Nhập phong cách (tùy chọn)"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Map"
                        label="Chọn vị trí trên bản đồ"
                    >
                        <div className="h-64 w-full rounded-md border-2 border-gray-300">
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                className="rounded-md"
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker setPosition={setPosition} form={form} />
                                {position && <Marker position={position} />}
                            </MapContainer>
                        </div>
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="Latitude"
                            label="Vĩ độ"
                            rules={[{ required: true, message: 'Vui lòng chọn vĩ độ trên bản đồ!' }]}
                        >
                            <Input
                                placeholder="Vĩ độ sẽ được điền tự động"
                                className="rounded-md border-gray-300"
                                readOnly
                            />
                        </Form.Item>
                        <Form.Item
                            name="Longitude"
                            label="Kinh độ"
                            rules={[{ required: true, message: 'Vui lòng chọn kinh độ trên bản đồ!' }]}
                        >
                            <Input
                                placeholder="Kinh độ sẽ được điền tự động"
                                className="rounded-md border-gray-300"
                                readOnly
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="Address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <Input
                            placeholder="Nhập địa chỉ"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Province"
                        label="Tỉnh/Thành phố"
                        rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố!' }]}
                    >
                        <Input
                            placeholder="Nhập tỉnh/thành phố"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="Description"
                        label="Mô tả"
                    >
                        <TextArea
                            placeholder="Nhập mô tả (tùy chọn)"
                            rows={4}
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <Form.Item
                        name="OpenningHours"
                        label="Giờ mở cửa"
                        rules={[{ required: true, message: 'Vui lòng nhập giờ mở cửa!' }]}
                    >
                        <Input
                            placeholder="Nhập giờ mở cửa (ví dụ: 10:00 - 22:00)"
                            className="rounded-md border-gray-300"
                        />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="StartDay"
                            label="Ngày bắt đầu"
                        >
                            <Select placeholder="Chọn ngày bắt đầu" className="rounded-md">
                                <Option value="Sunday">Chủ nhật</Option>
                                <Option value="Monday">Thứ hai</Option>
                                <Option value="Tuesday">Thứ ba</Option>
                                <Option value="Wednesday">Thứ tư</Option>
                                <Option value="Thursday">Thứ năm</Option>
                                <Option value="Friday">Thứ sáu</Option>
                                <Option value="Saturday">Thứ bảy</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="EndDay"
                            label="Ngày kết thúc"
                        >
                            <Select placeholder="Chọn ngày kết thúc" className="rounded-md">
                                <Option value="Sunday">Chủ nhật</Option>
                                <Option value="Monday">Thứ hai</Option>
                                <Option value="Tuesday">Thứ ba</Option>
                                <Option value="Wednesday">Thứ tư</Option>
                                <Option value="Thursday">Thứ năm</Option>
                                <Option value="Friday">Thứ sáu</Option>
                                <Option value="Saturday">Thứ bảy</Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="MainImage"
                        label="Ảnh chính"
                        valuePropName="file"
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            className="w-full"
                            onChange={handleMainImageChange}
                            showUploadList={false}
                        >
                            <div className="flex items-center justify-center">
                                {mainImagePreview ? (
                                    <img
                                        src={mainImagePreview}
                                        alt="Main Image Preview"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                    />
                                ) : (
                                    <Button
                                        icon={<PlusOutlined />}
                                        className="w-full flex items-center justify-center rounded-md border-gray-300 hover:bg-gray-50"
                                    >
                                        Chọn ảnh chính
                                    </Button>
                                )}
                            </div>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="Image"
                        label="Hình ảnh bổ sung"
                        valuePropName="fileList"
                    >
                        <Upload
                            beforeUpload={() => false}
                            multiple
                            showUploadList={false}
                            onChange={handleAdditionalImagesChange}
                            className="w-full"
                        >
                            <div className="flex items-center justify-center">
                                <Button
                                    icon={<PlusOutlined />}
                                    className="flex items-center justify-center rounded-md border-gray-300 hover:bg-gray-50"
                                >
                                    Thêm ảnh
                                </Button>
                            </div>
                        </Upload>
                        <div className="flex flex-wrap gap-4 mt-2">
                            {additionalImagesPreview.map((preview, index) => (
                                <img
                                    key={index}
                                    src={preview}
                                    alt={`Additional Image ${index + 1}`}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                />
                            ))}
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="CategoryId"
                        label="Danh mục"
                    >
                        <Select placeholder="Chọn danh mục" className="rounded-md">
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>
                                    {category.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2"
                            >
                                Tạo doanh nghiệp
                            </Button>
                            <Button
                                onClick={handleCancel}
                                className="w-full border-gray-300 hover:bg-gray-50 rounded-md py-2"
                            >
                                Hủy
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default AddBusiness;