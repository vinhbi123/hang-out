import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Upload, message, Steps, Button, AutoComplete } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { debounce } from 'lodash';
import axios from 'axios';
import authApi from '../../api/authApi';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const { Option } = Select;
const { TextArea } = Input;

const LocationMarker = ({ setPosition, form }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            if (lat >= 8 && lat <= 23 && lng >= 102 && lng <= 114) {
                setPosition([lat, lng]);
                form.setFieldsValue({
                    Latitude: lat.toFixed(6),
                    Longitude: lng.toFixed(6),
                });
                console.log('Map clicked - Latitude:', lat.toFixed(6), 'Longitude:', lng.toFixed(6));
            } else {
                message.error('Vị trí ngoài phạm vi Việt Nam!');
            }
        },
    });
    return null;
};

const RegisterBusinessForm = ({ onCancel, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.7769, 106.7009]);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [step1Data, setStep1Data] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await authApi.getCategories({ page: 1, size: 1000 });
                setCategories(response.data.items || []);
                console.log('Categories:', response.data.items);
            } catch (error) {
                message.error('Không thể tải danh sách danh mục. Vui lòng thử lại.');
                console.error('Lỗi khi tải danh mục:', error);
            }
        };
        fetchCategories();
    }, []);

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
                    label: `${item.display_name} (${item.address?.city || item.address?.state || ''})`,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                }))
            );
            console.log('Nominatim suggestions:', response.data);
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
                console.log('Address selected - Latitude:', lat.toFixed(6), 'Longitude:', lng.toFixed(6), 'Address:', value);
            } else {
                message.error('Địa chỉ ngoài phạm vi Việt Nam!');
            }
        }
    };

    const handleRequestOtp = async () => {
        try {
            await form.validateFields(['Email', 'Phone']);
            const values = form.getFieldsValue(['Email', 'Phone']);
            setOtpLoading(true);
            const otpData = {
                email: values.Email || '',
                phone: values.Phone || '',
                otpType: 'Register',
            };
            console.log('Requesting OTP with:', otpData);
            await authApi.requestOtp(otpData);
            message.success('OTP đã được gửi! Vui lòng kiểm tra email hoặc số điện thoại.');
        } catch (error) {
            message.error(error.message || 'Không thể gửi OTP. Vui lòng thử lại.');
            console.error('Lỗi khi yêu cầu OTP:', error);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleRegisterBusiness = async () => {
        try {
            setLoading(true);
            await form.validateFields();
            const step2Values = form.getFieldsValue();
            const values = { ...step1Data, ...step2Values };
            console.log('Form values before submit:', values);

            const formData = new FormData();
            formData.append('Phone', values.Phone || '');
            formData.append('Email', values.Email || '');
            formData.append('Password', values.Password || '');
            formData.append('ConfirmPassword', values.ConfirmPassword || '');
            formData.append('Name', values.Name || '');
            formData.append('Otp', values.Otp || '');
            formData.append('BusinessName', values.BusinessName || '');
            formData.append('Vibe', values.Vibe || '');
            formData.append('Latidue', values.Latitude || '');
            formData.append('Lontitude', values.Longitude || '');
            formData.append('Address', values.Address || '');
            formData.append('Province', values.Province || '');
            formData.append('Description', values.Description || '');
            formData.append('OpenningHours', values.OpenningHours || '');
            formData.append('StartDay', values.StartDay || '');
            formData.append('EndDay', values.EndDay || '');
            formData.append('CategoryId', values.CategoryId || '');

            if (values.AvatarImage && values.AvatarImage.file) {
                console.log('AvatarImage:', values.AvatarImage.file.name);
                formData.append('AvatarImage', values.AvatarImage.file);
            }
            if (values.MainImage && values.MainImage.file) {
                console.log('MainImage:', values.MainImage.file.name);
                formData.append('MainImage', values.MainImage.file);
            }
            if (values.Image) {
                values.Image.forEach((file, index) => {
                    if (file.file) {
                        console.log(`Image[${index}]:`, file.file.name);
                        formData.append('Image', file.file);
                    }
                });
            }

            // Log FormData values
            const formDataValues = {};
            for (let [key, value] of formData.entries()) {
                formDataValues[key] = value instanceof File ? value.name : value;
            }
            console.log('FormData before submit:', formDataValues);

            const response = await authApi.registerBusiness(formData);
            console.log('API response:', response.data);
            message.success('Đăng ký doanh nghiệp thành công!');
            form.resetFields();
            setStep1Data({});
            setAvatarPreview(null);
            setMainImagePreview(null);
            setAdditionalImagesPreview([]);
            setPosition([10.7769, 106.7009]);
            setSuggestions([]);
            setCurrentStep(0);
            onSuccess();
        } catch (error) {
            message.error(error.message || 'Đăng ký doanh nghiệp thất bại. Vui lòng kiểm tra dữ liệu và thử lại.');
            console.error('Lỗi khi đăng ký doanh nghiệp:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Bạn có chắc muốn hủy? Dữ liệu sẽ không được lưu.')) {
            form.resetFields();
            setStep1Data({});
            setAvatarPreview(null);
            setMainImagePreview(null);
            setAdditionalImagesPreview([]);
            setPosition([10.7769, 106.7009]);
            setSuggestions([]);
            setCurrentStep(0);
            onCancel();
        }
    };

    const handleAvatarChange = ({ file }) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            form.setFieldsValue({ AvatarImage: { file } });
            console.log('Selected AvatarImage:', file.name);
        } else {
            setAvatarPreview(null);
            form.setFieldsValue({ AvatarImage: null });
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
            console.log('Selected MainImage:', file.name);
        } else {
            setMainImagePreview(null);
            form.setFieldsValue({ MainImage: null });
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
                console.log('Selected Image:', item.originFileObj.name);
                return { file: item.originFileObj };
            }
            return item;
        });
        form.setFieldsValue({ Image: files });
        console.log('Additional Images:', files.map(f => f.file?.name));
    };

    const handleNextStep = () => {
        form
            .validateFields(['Phone', 'Email', 'Otp', 'Password', 'ConfirmPassword', 'Name'])
            .then(() => {
                const step1Values = form.getFieldsValue();
                console.log('Step 1 values:', step1Values);
                setStep1Data(step1Values);
                setCurrentStep(1);
                setTimeout(() => {
                    console.log('Form values after switching to Step 2:', form.getFieldsValue());
                }, 0);
            })
            .catch(() => {
                message.error('Vui lòng điền đầy đủ thông tin tài khoản!');
            });
    };

    const handlePreviousStep = () => {
        console.log('Form values before switching back to Step 1:', form.getFieldsValue());
        setCurrentStep(0);
    };

    const steps = [
        {
            title: 'Thông tin tài khoản',
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="Phone"
                            label="Số điện thoại"
                            rules={[{ required: true, message: 'Nhập số điện thoại!' }]}
                        >
                            <Input
                                placeholder="Số điện thoại"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                        <Form.Item
                            name="Email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input
                                placeholder="Email"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="Otp"
                            label="Mã OTP"
                            rules={[{ required: true, message: 'Nhập mã OTP!' }]}
                        >
                            <Input
                                placeholder="Nhập mã OTP"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                        <Form.Item label=" ">
                            <button
                                onClick={handleRequestOtp}
                                disabled={otpLoading}
                                className="h-10 w-full rounded-lg bg-[#E0BA94] text-white text-base font-semibold hover:bg-[#faddc2] disabled:bg-gray-300"
                            >
                                {otpLoading ? 'Đang gửi...' : 'Lấy OTP'}
                            </button>
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="Password"
                            label="Mật khẩu"
                            rules={[{ required: true, message: 'Nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                placeholder="Mật khẩu"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                        <Form.Item
                            name="ConfirmPassword"
                            label="Xác nhận mật khẩu"
                            rules={[
                                { required: true, message: 'Xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('Password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                placeholder="Xác nhận mật khẩu"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="Name"
                        label="Tên cá nhân"
                        rules={[{ required: true, message: 'Nhập tên cá nhân!' }]}
                    >
                        <Input
                            placeholder="Tên cá nhân"
                            size="large"
                            className="text-lg p-3 h-10 rounded-lg border-gray-200"
                        />
                    </Form.Item>
                </div>
            ),
        },
        {
            title: 'Thông tin doanh nghiệp',
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="BusinessName"
                            label="Tên doanh nghiệp"
                            rules={[{ required: true, message: 'Nhập tên doanh nghiệp!' }]}
                        >
                            <Input
                                placeholder="Tên doanh nghiệp"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                        <Form.Item
                            name="CategoryId"
                            label="Danh mục"
                            rules={[{ required: true, message: 'Chọn danh mục!' }]}
                        >
                            <Select placeholder="Chọn danh mục" size="large" className="rounded-lg">
                                {categories.map((category) => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Form.Item
                            name="Address"
                            label="Địa chỉ"
                            rules={[{ required: true, message: 'Nhập địa chỉ!' }]}
                        >
                            <AutoComplete
                                options={suggestions}
                                onSearch={fetchSuggestions}
                                onSelect={handleSelectAddress}
                                placeholder="Nhập địa chỉ (ví dụ: 123 Đường Láng, Hà Nội)"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200 w-full"
                                loading={isSearching}
                            />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Form.Item
                            name="Province"
                            label="Tỉnh/Thành phố"
                            rules={[{ required: true, message: 'Nhập tỉnh/thành phố!' }]}
                        >
                            <Input
                                placeholder="Tỉnh/Thành phố"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200 w-full"
                            />
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="OpenningHours"
                            label="Giờ mở cửa"
                            rules={[{ required: true, message: 'Nhập giờ mở cửa!' }]}
                        >
                            <Input
                                placeholder="Giờ mở cửa (ví dụ: 10:00 - 22:00)"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                        <Form.Item
                            name="Vibe"
                            label="Phong cách"
                        >
                            <Input
                                placeholder="Phong cách (tùy chọn)"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="Map"
                        label="Chọn vị trí trên bản đồ"
                    >
                        <div className="h-40 w-full rounded-lg border-2 border-gray-200">
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                className="rounded-lg"
                            >
                                <TileLayer
                                    url="/api/osm/tiles/{z}/{x}/{y}.png"
                                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                            rules={[{ required: true, message: 'Chọn vĩ độ!' }]}
                        >
                            <Input
                                placeholder="Vĩ độ tự động"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                                readOnly
                            />
                        </Form.Item>
                        <Form.Item
                            name="Longitude"
                            label="Kinh độ"
                            rules={[{ required: true, message: 'Chọn kinh độ!' }]}
                        >
                            <Input
                                placeholder="Kinh độ tự động"
                                size="large"
                                className="text-lg p-3 h-10 rounded-lg border-gray-200"
                                readOnly
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="Description"
                        label="Mô tả"
                    >
                        <TextArea
                            placeholder="Mô tả (tùy chọn)"
                            rows={2}
                            className="text-lg p-3 rounded-lg border-gray-200"
                        />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="StartDay"
                            label="Ngày bắt đầu"
                        >
                            <Select placeholder="Chọn ngày" size="large" className="rounded-lg">
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
                            <Select placeholder="Chọn ngày" size="large" className="rounded-lg">
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
                                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        className="w-full h-10 rounded-lg border-gray-200 py-2 text-sm font-medium hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <PlusOutlined className="mr-2" /> Chọn ảnh
                                    </button>
                                )}
                            </div>
                        </Upload>
                    </Form.Item>
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
                                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        className="w-full h-10 rounded-lg border-gray-200 py-2 text-sm font-medium hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        <PlusOutlined className="mr-2" /> Chọn ảnh
                                    </button>
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
                            <button
                                type="button"
                                className="w-full h-10 rounded-lg border-gray-200 py-2 text-sm font-medium hover:bg-gray-100 flex items-center justify-center"
                            >
                                <PlusOutlined className="mr-2" /> Thêm ảnh
                            </button>
                        </Upload>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {additionalImagesPreview.map((preview, index) => (
                                <img
                                    key={index}
                                    src={preview}
                                    alt={`Additional Image ${index + 1}`}
                                    className="w-12 h-12 rounded-lg border-2 border-gray-200"
                                />
                            ))}
                        </div>
                    </Form.Item>
                </div>
            ),
        },
    ];

    return (
        <div>
            <Steps current={currentStep} className="mb-6">
                {steps.map((item) => (
                    <Steps.Step key={item.title} title={item.title} />
                ))}
            </Steps>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleRegisterBusiness}
                className="space-y-4"
            >
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    {steps[0].content}
                </div>
                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    {steps[1].content}
                </div>
                <Form.Item>
                    <div className="flex gap-4">
                        {currentStep === 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full bg-[#E0BA94] text-white py-4 px-4 text-xl font-semibold rounded-lg hover:bg-[#faddc2] disabled:bg-gray-300"
                                    disabled={loading || otpLoading}
                                >
                                    TIẾP TỤC
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-full border-gray-300 hover:bg-gray-50 py-4 px-4 text-xl font-semibold rounded-lg"
                                >
                                    HỦY
                                </button>
                            </>
                        )}
                        {currentStep === 1 && (
                            <>
                                <button
                                    type="submit"
                                    className="w-full bg-[#E0BA94] text-white py-4 px-4 text-xl font-semibold rounded-lg hover:bg-[#faddc2] disabled:bg-gray-300"
                                    disabled={loading}
                                >
                                    {loading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePreviousStep}
                                    className="w-full border-gray-300 hover:bg-gray-50 py-4 px-4 text-xl font-semibold rounded-lg"
                                >
                                    QUAY LẠI
                                </button>
                            </>
                        )}
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterBusinessForm;