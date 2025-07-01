import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Select, Upload, Button, message, AutoComplete } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { debounce } from 'lodash';
import axios from 'axios';
import api from '../../api/api';
import 'leaflet/dist/leaflet.css';

const { Option } = Select;
const { TextArea } = Input;

const AddBusiness = () => {
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.7769, 106.7009]); // [lat, lng]
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);

    useEffect(() => {
        // Khởi tạo bản đồ Leaflet
        try {
            map.current = L.map(mapContainer.current).setView(position, 15);

            // Thêm tile layer từ OpenStreetMap
            L.tileLayer('/api/osm/tiles/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map.current);

            // Thêm marker
            marker.current = L.marker(position, {
                draggable: true,
            })
                .addTo(map.current)
                .bindPopup(form.getFieldValue('Address') || 'Vị trí đã chọn');

            // Sự kiện click trên bản đồ
            map.current.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (lat >= 8 && lat <= 23 && lng >= 102 && lng <= 114) {
                    setPosition([lat, lng]);
                    marker.current.setLatLng([lat, lng]).bindPopup(form.getFieldValue('Address') || 'Vị trí đã chọn').openPopup();
                    form.setFieldsValue({
                        Latitude: lat.toFixed(6),
                        Longitude: lng.toFixed(6),
                    });
                } else {
                    message.error('Vị trí ngoài phạm vi Việt Nam!');
                }
            });

            // Sự kiện kéo marker
            marker.current.on('dragend', () => {
                const { lat, lng } = marker.current.getLatLng();
                if (lat >= 8 && lat <= 23 && lng >= 102 && lng <= 114) {
                    setPosition([lat, lng]);
                    form.setFieldsValue({
                        Latitude: lat.toFixed(6),
                        Longitude: lng.toFixed(6),
                    });
                } else {
                    message.error('Vị trí ngoài phạm vi Việt Nam!');
                }
            });

            setIsMapLoaded(true);

            // Lấy danh sách danh mục
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

            return () => {
                if (map.current) map.current.remove();
            };
        } catch (error) {
            message.error('Không thể tải bản đồ. Vui lòng kiểm tra kết nối.');
            console.error('Lỗi khởi tạo bản đồ:', error);
        }
    }, []);

    // Cập nhật bản đồ khi position thay đổi
    useEffect(() => {
        if (map.current && marker.current && isMapLoaded) {
            map.current.setView(position, 15);
            marker.current.setLatLng(position).bindPopup(form.getFieldValue('Address') || 'Vị trí đã chọn');
        }
    }, [position, isMapLoaded]);

    // Tìm gợi ý địa chỉ với Nominatim API
    const fetchSuggestions = debounce(async (value) => {
        if (value.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await axios.get(
                `/api/nominatim/search?format=json&q=${encodeURIComponent(value)}&countrycodes=vn&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'HangOutApp/1.0 (your-email@example.com)',
                    },
                }
            );
            setSuggestions(
                response.data.map((item) => ({
                    value: item.display_name,
                    label: item.display_name,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                }))
            );
        } catch (error) {
            message.error('Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.');
            console.error('Lỗi Autocomplete:', error);
        } finally {
            setIsSearching(false);
        }
    }, 500);

    // Xử lý khi chọn một gợi ý địa chỉ
    const handleSelectAddress = (value, option) => {
        if (option) {
            const { lat, lng } = option;
            if (lat >= 8 && lat <= 23 && lng >= 102 && lng <= 114) {
                setPosition([lat, lng]);
                form.setFieldsValue({
                    Latitude: lat.toFixed(6),
                    Longitude: lng.toFixed(6),
                    Address: value,
                });
            } else {
                message.error('Địa chỉ ngoài phạm vi Việt Nam!');
            }
        }
    };

    const handleCreateBusiness = async (values) => {
        setLoading(true);
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
            const response = await api.createBusinessOwner(formData);
            message.success('Tạo doanh nghiệp thành công!');
            form.resetFields();
            setAvatarPreview(null);
            setMainImagePreview(null);
            setAdditionalImagesPreview([]);
            setPosition([10.7769, 106.7009]);
            setSuggestions([]);
            navigate('/business');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi tạo doanh nghiệp.';
            message.error(errorMessage);
            console.error('Lỗi khi tạo doanh nghiệp:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setAvatarPreview(null);
        setMainImagePreview(null);
        setAdditionalImagesPreview([]);
        setPosition([10.7769, 106.7009]);
        setSuggestions([]);
        navigate('/business');
    };

    const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];

    const handleAvatarChange = ({ file }) => {
        if (file && allowedFormats.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
            form.setFieldsValue({ AvatarImage: { file } });
        } else {
            message.error('Chỉ chấp nhận các định dạng: .jpeg, .png, .jpg, .gif, .bmp, .webp.');
            setAvatarPreview(null);
        }
    };

    const handleMainImageChange = ({ file }) => {
        if (file && allowedFormats.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = () => setMainImagePreview(reader.result);
            reader.readAsDataURL(file);
            form.setFieldsValue({ MainImage: { file } });
        } else {
            message.error('Chỉ chấp nhận các định dạng: .jpeg, .png, .jpg, .gif, .bmp, .webp.');
            setMainImagePreview(null);
        }
    };

    const handleAdditionalImagesChange = ({ fileList }) => {
        const previews = [];
        const files = fileList
            .map((item, index) => {
                if (item.originFileObj && allowedFormats.includes(item.originFileObj.type)) {
                    const reader = new FileReader();
                    reader.readAsDataURL(item.originFileObj);
                    reader.onload = () => {
                        previews[index] = reader.result;
                        if (previews.length === fileList.length) {
                            setAdditionalImagesPreview(previews.filter((p) => p));
                        }
                    };
                    return { file: item.originFileObj };
                }
                message.error(`Hình ảnh ${index + 1} không hợp lệ.`);
                return null;
            })
            .filter((item) => item !== null);
        form.setFieldsValue({ Image: files });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center items-center p-6">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl transform transition-all duration-300 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/business')}
                        className="flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
                    >
                        Quay lại
                    </Button>
                    <h2 className="text-3xl font-bold text-center text-gray-800 flex-1">Tạo Doanh Nghiệp Mới</h2>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateBusiness}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="AvatarImage"
                            label="Ảnh đại diện"
                            valuePropName="file"
                        >
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                accept=".jpeg,.jpg,.png,.gif,.bmp,.webp"
                                onChange={handleAvatarChange}
                                showUploadList={false}
                            >
                                <div className="flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar Preview"
                                            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-md"
                                        />
                                    ) : (
                                        <Button
                                            icon={<PlusOutlined />}
                                            className="w-full flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
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
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
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
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                        <Form.Item
                            name="Password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="ConfirmPassword"
                            label="Xác nhận mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('Password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                placeholder="Xác nhận mật khẩu"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                        <Form.Item
                            name="Name"
                            label="Tên cá nhân"
                            rules={[{ required: true, message: 'Vui lòng nhập tên cá nhân!' }]}
                        >
                            <Input
                                placeholder="Nhập tên cá nhân"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="BusinessName"
                            label="Tên doanh nghiệp"
                            rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp!' }]}
                        >
                            <Input
                                placeholder="Nhập tên doanh nghiệp"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                        <Form.Item
                            name="Vibe"
                            label="Phong cách"
                        >
                            <Input
                                placeholder="Nhập phong cách (tùy chọn)"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="Address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    >
                        <AutoComplete
                            options={suggestions}
                            onSearch={fetchSuggestions}
                            onSelect={handleSelectAddress}
                            placeholder="Nhập địa chỉ (ví dụ: 123 Đường Láng, Hà Nội)"
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            loading={isSearching}
                        />
                    </Form.Item>

                    <Form.Item
                        name="Map"
                        label="Chọn vị trí trên bản đồ"
                    >
                        <div
                            ref={mapContainer}
                            className="h-64 w-full rounded-md border-2 border-gray-200 shadow-md"
                        />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="Latitude"
                            label="Vĩ độ"
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
                            label="Kinh độ"
                            rules={[{ required: true, message: 'Vui lòng chọn kinh độ trên bản đồ!' }]}
                        >
                            <Input
                                placeholder="Kinh độ sẽ được điền tự động"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                readOnly
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="Province"
                            label="Tỉnh/Thành phố"
                            rules={[{ required: true, message: 'Vui lòng nhập tỉnh/thành phố!' }]}
                        >
                            <Input
                                placeholder="Nhập tỉnh/thành phố"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                        <Form.Item
                            name="OpenningHours"
                            label="Giờ mở cửa"
                            rules={[{ required: true, message: 'Vui lòng nhập giờ mở cửa!' }]}
                        >
                            <Input
                                placeholder="Nhập giờ mở cửa (ví dụ: 10:00 - 22:00)"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="Description"
                        label="Mô tả"
                    >
                        <TextArea
                            placeholder="Nhập mô tả (tùy chọn)"
                            rows={4}
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="MainImage"
                            label="Ảnh chính"
                            valuePropName="file"
                        >
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                accept=".jpeg,.jpg,.png,.gif,.bmp,.webp"
                                onChange={handleMainImageChange}
                                showUploadList={false}
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
                            name="Image"
                            label="Hình ảnh bổ sung"
                            valuePropName="fileList"
                        >
                            <Upload
                                beforeUpload={() => false}
                                multiple
                                accept=".jpeg,.jpg,.png,.gif,.bmp,.webp"
                                showUploadList={false}
                                onChange={handleAdditionalImagesChange}
                            >
                                <div className="flex items-center justify-center">
                                    <Button
                                        icon={<PlusOutlined />}
                                        className="flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
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
                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-md"
                                    />
                                ))}
                            </div>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item
                            name="CategoryId"
                            label="Danh mục"
                        >
                            <Select
                                placeholder="Chọn danh mục"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                {categories.map((category) => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="StartDay"
                            label="Ngày bắt đầu"
                        >
                            <Select
                                placeholder="Chọn ngày bắt đầu"
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
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
                        name="EndDay"
                        label="Ngày kết thúc"
                    >
                        <Select
                            placeholder="Chọn ngày kết thúc"
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <Option value="Sunday">Chủ nhật</Option>
                            <Option value="Monday">Thứ hai</Option>
                            <Option value="Tuesday">Thứ ba</Option>
                            <Option value="Wednesday">Thứ tư</Option>
                            <Option value="Thursday">Thứ năm</Option>
                            <Option value="Friday">Thứ sáu</Option>
                            <Option value="Saturday">Thứ bảy</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <div className="flex gap-4">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md py-2 hover:from-blue-700 hover:to-blue-800 transition-all"
                            >
                                Tạo doanh nghiệp
                            </Button>
                            <Button
                                onClick={handleCancel}
                                className="w-full border-gray-300 hover:bg-gray-100 rounded-md py-2 text-gray-600 transition-all"
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