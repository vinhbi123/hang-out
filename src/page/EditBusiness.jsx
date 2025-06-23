import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Spin, Select, Upload } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/api';

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

const EditBusiness = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [imageUrl, setImageUrl] = useState(null);
    const [position, setPosition] = useState([10.7769, 106.7009]); // Default position (Ho Chi Minh City)

    // Fetch business details and categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch business details
                const businessResponse = await api.getBusinessDetail(businessId);
                const businessData = businessResponse.data;
                console.log('Business data:', businessData); // Debug full business data

                // Fetch categories
                const categoriesResponse = await api.getCategories({ page: 1, size: 1000 });
                const categoriesData = Array.isArray(categoriesResponse.data.items)
                    ? categoriesResponse.data.items
                    : Array.isArray(categoriesResponse.data)
                        ? categoriesResponse.data
                        : [];
                console.log('Categories:', categoriesData); // Debug categories
                setCategories(categoriesData);

                // Try to find categoryId based on category name if categoryId is missing
                let businessCategoryId = businessData.categoryId || '';
                if (!businessCategoryId && businessData.category) {
                    const matchingCategory = categoriesData.find(
                        (category) => category.name.toLowerCase() === businessData.category.toLowerCase()
                    );
                    if (matchingCategory) {
                        businessCategoryId = matchingCategory.id;
                        console.log('Matched categoryId from name:', businessCategoryId);
                    }
                }

                form.setFieldsValue({
                    Name: businessData.name || '',
                    Vibe: businessData.vibe || '',
                    Latitude: businessData.latitude ? businessData.latitude.toString() : '',
                    Longitude: businessData.longitude ? businessData.longitude.toString() : '',
                    Address: businessData.address || '',
                    Province: businessData.province || '',
                    Description: businessData.description || '',
                    OpeningHours: businessData.openingHours || '',
                    StartDay: businessData.startDay || '',
                    EndDay: businessData.endDay || '',
                    CategoryId: businessCategoryId, // Set categoryId
                });
                setImageUrl(businessData.mainImageUrl || null);
                if (businessData.latitude && businessData.longitude) {
                    setPosition([parseFloat(businessData.latitude), parseFloat(businessData.longitude)]);
                }

                // Warn if categoryId is not in categories list
                if (businessCategoryId && !categoriesData.some(category => category.id === businessCategoryId)) {
                    console.warn(`CategoryId ${businessCategoryId} not found in categories list`);
                    message.warning('Danh mục hiện tại của doanh nghiệp không có trong danh sách danh mục. Vui lòng chọn lại.');
                }
            } catch (error) {
                message.error('Không thể tải dữ liệu doanh nghiệp hoặc danh mục. Vui lòng thử lại.');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [businessId, form]);

    // Handle file upload
    const handleUploadChange = ({ fileList }) => {
        const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];
        const validFiles = fileList.filter(file => allowedFormats.includes(file.type));
        if (validFiles.length < fileList.length) {
            message.error('Chỉ chấp nhận các định dạng: .jpeg, .png, .jpg, .gif, .bmp, .webp.');
        }
        setFileList(validFiles.slice(-1)); // Keep only the latest valid file
        if (validFiles.length > 0) {
            const reader = new FileReader();
            reader.onload = () => setImageUrl(reader.result);
            reader.readAsDataURL(validFiles[0].originFileObj);
        } else {
            setImageUrl(null);
        }
    };

    // Handle form submission
    const onFinish = async (values) => {
        setLoading(true);
        const formData = new FormData();

        // Append form fields to FormData
        Object.keys(values).forEach((key) => {
            formData.append(key, values[key] || '');
        });

        // Append file if exists
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('MainImage', fileList[0].originFileObj);
        } else {
            formData.append('MainImage', '');
        }

        try {
            const response = await api.editBusiness(businessId, formData);
            message.success('Cập nhật doanh nghiệp thành công!');
            if (response.data && response.data.mainImageUrl) {
                setImageUrl(response.data.mainImageUrl);
            }
            navigate(`/business-dashboard/businessOwnerList`);
        } catch (error) {
            message.error('Cập nhật doanh nghiệp thất bại. Vui lòng thử lại.');
            console.error('Error updating business:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin tip="Đang tải..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br flex justify-center items-center p-6">
            <Card
                title={<h2 className="text-3xl font-bold text-center text-gray-800">Chỉnh sửa doanh nghiệp</h2>}
                bordered={false}
                className="shadow-xl p-8 w-full max-w-4xl transform transition-all duration-300 hover:shadow-2xl"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    className="space-y-6"
                >
                    <div className="flex items-center mb-6">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(`/business-dashboard/businessOwnerList`)}
                            className="flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
                        >
                            Quay lại
                        </Button>
                    </div>

                    <Form.Item label="Tên doanh nghiệp" name="Name">
                        <Input placeholder="Nhập tên doanh nghiệp" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </Form.Item>

                    <Form.Item label="Không khí" name="Vibe">
                        <Input placeholder="Nhập không khí (ví dụ: Thoải mái, Sang trọng)" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </Form.Item>

                    <Form.Item label="Chọn vị trí trên bản đồ" name="Map">
                        <div className="h-64 w-full rounded-md border-2 border-gray-200 shadow-md">
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                className="rounded-md"
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
                        <Form.Item label="Vĩ độ" name="Latitude">
                            <Input placeholder="Vĩ độ sẽ được điền tự động" readOnly className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                        </Form.Item>
                        <Form.Item label="Kinh độ" name="Longitude">
                            <Input placeholder="Kinh độ sẽ được điền tự động" readOnly className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item label="Địa chỉ" name="Address">
                            <Input placeholder="Nhập địa chỉ" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                        </Form.Item>
                        <Form.Item label="Tỉnh/Thành phố" name="Province">
                            <Input placeholder="Nhập tỉnh/thành phố" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                        </Form.Item>
                    </div>

                    <Form.Item label="Mô tả" name="Description">
                        <TextArea rows={4} placeholder="Nhập mô tả doanh nghiệp" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </Form.Item>

                    <Form.Item label="Hình ảnh chính" name="MainImage">
                        <Upload
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}
                            listType="picture"
                            maxCount={1}
                            accept=".jpeg,.jpg,.png,.gif,.bmp,.webp"
                            className="w-full"
                        >
                            <Button
                                icon={<UploadOutlined />}
                                className="flex items-center justify-center rounded-full border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
                            >
                                Chọn ảnh chính
                            </Button>
                        </Upload>
                        {imageUrl && (
                            <div className="mt-2">
                                <img
                                    src={imageUrl}
                                    alt="Main Image"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item label="Giờ mở cửa" name="OpeningHours">
                        <Input placeholder="Nhập giờ mở cửa (ví dụ: 10:00 - 22:00)" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item label="Ngày bắt đầu" name="StartDay">
                            <Select placeholder="Chọn ngày bắt đầu" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <Option value="Sunday">Chủ nhật</Option>
                                <Option value="Monday">Thứ hai</Option>
                                <Option value="Tuesday">Thứ ba</Option>
                                <Option value="Wednesday">Thứ tư</Option>
                                <Option value="Thursday">Thứ năm</Option>
                                <Option value="Friday">Thứ sáu</Option>
                                <Option value="Saturday">Thứ bảy</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Ngày kết thúc" name="EndDay">
                            <Select placeholder="Chọn ngày kết thúc" className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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

                    <Form.Item label="Danh mục" name="CategoryId">
                        <Select
                            placeholder="Chọn danh mục"
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                ))
                            ) : (
                                <Option value="" disabled>
                                    Không có danh mục nào
                                </Option>
                            )}
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
                                Lưu thay đổi
                            </Button>
                            <Button
                                onClick={() => navigate(`/business-dashboard/businessOwnerList`)}
                                className="w-full border-gray-300 hover:bg-gray-100 rounded-md py-2 text-gray-600 transition-all"
                            >
                                Hủy
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditBusiness;