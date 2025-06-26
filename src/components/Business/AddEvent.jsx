import React, { useState } from 'react';
import { Form, Input, DatePicker, Upload, Button, message, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/api';
import moment from 'moment';
import 'moment/locale/vi';
import { useNavigate } from 'react-router-dom';

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

const AddEvent = () => {
    const [form] = Form.useForm();
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.0452396, 105.724084]); // Default: Cần Thơ
    const navigate = useNavigate();

    const handleCreateEvent = async () => {
        try {
            const values = form.getFieldsValue(); // Lấy giá trị từ form
            const formData = new FormData();
            formData.append('Name', values.Name);

            // Kiểm tra giá trị và kiểu dữ liệu
            console.log('Type of StartDate:', typeof values.StartDate, values.StartDate);
            console.log('Type of DueDate:', typeof values.DueDate, values.DueDate);

            // Chuyển đổi sang chuỗi ISO bằng dayjs
            const startDateISO = values.StartDate ? values.StartDate.toISOString() : '';
            const dueDateISO = values.DueDate ? values.DueDate.toISOString() : '';
            console.log('StartDate ISO:', startDateISO);
            console.log('DueDate ISO:', dueDateISO);

            formData.append('StartDate', startDateISO);
            formData.append('DueDate', dueDateISO);
            formData.append('Location', values.Location);
            formData.append('Description', values.Description || '');
            formData.append('Latitude', values.Latitude);
            formData.append('Longitude', values.Longitude);
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
            form.resetFields();
            setMainImagePreview(null);
            setAdditionalImagesPreview([]);
            setPosition([10.0452396, 105.724084]);
            navigate('/business-dashboard/events');
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

    const handleCancel = () => {
        navigate('/business-dashboard/events');
    };

    // Custom onChange handler to log and validate date-time
    const handleDateChange = (fieldName) => (date, dateString) => {
        console.log(`${fieldName} Changed:`, date, dateString);
        if (dateString) {
            const isValid = moment(dateString, 'YYYY-MM-DD HH:mm', true).isValid();
            if (!isValid) {
                message.error(`${fieldName} định dạng không đúng. Vui lòng dùng YYYY-MM-DD HH:mm!`);
            }
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Card
                title={<h2 className="text-2xl font-semibold text-center">Thêm Sự Kiện</h2>}
                bordered={false}
                className="shadow-lg"
            >
                <Form
                    form={form}
                    onFinish={handleCreateEvent} // Updated to use function reference
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
                            rules={[{ required: true, message: 'Vui lòng chọn ngày và giờ bắt đầu!' }]}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Chọn ngày và giờ bắt đầu (YYYY-MM-DD HH:mm)"
                                disabledDate={(current) => current && current < moment().subtract(1, 'day').endOf('day')}
                                disabledTime={(current) => {
                                    if (current && current.isSame(moment(), 'day')) {
                                        const now = moment();
                                        return {
                                            disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                                            disabledMinutes: () => (current.hour() === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : []),
                                        };
                                    }
                                    return {};
                                }}
                                onChange={handleDateChange('StartDate')}
                            />
                        </Form.Item>
                        <Form.Item
                            name="DueDate"
                            label="Ngày Kết Thúc"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày và giờ kết thúc!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startDate = getFieldValue('StartDate');
                                        if (!value || !startDate || value >= startDate) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày và giờ kết thúc phải sau ngày và giờ bắt đầu!'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Chọn ngày và giờ kết thúc (YYYY-MM-DD HH:mm)"
                                disabledDate={(current) => current && current < moment().subtract(1, 'day').endOf('day')}
                                disabledTime={(current) => {
                                    const startDate = form.getFieldValue('StartDate');
                                    if (current && startDate && current.isSame(startDate, 'day')) {
                                        const startMoment = moment(startDate);
                                        return {
                                            disabledHours: () => Array.from({ length: startMoment.hour() }, (_, i) => i),
                                            disabledMinutes: () => (current.hour() === startMoment.hour() ? Array.from({ length: startMoment.minute() }, (_, i) => i) : []),
                                        };
                                    }
                                    return {};
                                }}
                                onChange={handleDateChange('DueDate')}
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
            </Card>
        </div>
    );
};

export default AddEvent;