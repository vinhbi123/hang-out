import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, DatePicker, Upload, Button, message, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/api';
import dayjs from 'dayjs'; // Thay moment bằng dayjs
import 'dayjs/locale/vi'; // Locale tiếng Việt cho dayjs
import { useParams, useNavigate } from 'react-router-dom';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

dayjs.locale('vi'); // Thiết lập locale tiếng Việt cho dayjs

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

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.0452396, 105.724084]); // Default: Cần Thơ
    const [initialData, setInitialData] = useState(null);

    // Define disabledDate functions using useCallback to memoize and access form
    const disabledStartDate = useCallback((current) => {
        return current && current < dayjs().startOf('day');
    }, []);

    const disabledDueDate = useCallback((current) => {
        const startDate = form.getFieldValue('StartDate');
        return current && (current < dayjs().startOf('day') || (startDate && current < startDate));
    }, [form]);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                const response = await api.getEvent(eventId);
                const { data } = response;
                setInitialData(data);
                setPosition([
                    parseFloat(data.latitude) || 10.0452396,
                    parseFloat(data.longitude) || 105.724084,
                ]);
                setMainImagePreview(data.mainImageUrl || null);
                setAdditionalImagesPreview(data.images.map(img => img.imageUrl) || []);

                form.setFieldsValue({
                    Name: data.name || '',
                    StartDate: data.startDate ? dayjs(data.startDate) : null, // Sử dụng dayjs thay vì moment
                    DueDate: data.dueDate ? dayjs(data.dueDate) : null, // Sử dụng dayjs thay vì moment
                    Location: data.location || '',
                    Description: data.description || '',
                    Latitude: data.latitude || '',
                    Longitude: data.longitude || '',
                });
            } catch (error) {
                message.error('Không thể tải chi tiết sự kiện. Vui lòng thử lại.');
                console.error('Error fetching event:', error);
                navigate('/business-dashboard/events');
            }
        };

        if (eventId) {
            fetchEventDetail();
        }
    }, [eventId, form, navigate]);

    const handleEditEvent = async (values) => {
        try {
            const formData = new FormData();
            formData.append('Name', values.Name || '');

            // Chuyển đổi StartDate và DueDate sang chuỗi ISO với offset +07
            const startDateISO = values.StartDate
                ? values.StartDate.format('YYYY-MM-DDTHH:mm:ss+07:00')
                : '';
            const dueDateISO = values.DueDate
                ? values.DueDate.format('YYYY-MM-DDTHH:mm:ss+07:00')
                : '';
            formData.append('StartDate', startDateISO);
            formData.append('DueDate', dueDateISO);

            formData.append('Location', values.Location || '');
            formData.append('Description', values.Description || '');
            formData.append('Latitude', values.Latitude || '');
            formData.append('Longitude', values.Longitude || '');

            if (values.MainImageUrl && values.MainImageUrl.file) {
                formData.append('MainImageUrl', values.MainImageUrl.file);
            } else if (initialData?.mainImageUrl) {
                formData.append('MainImageUrl', initialData.mainImageUrl);
            } else {
                formData.append('MainImageUrl', '');
            }

            if (values.Images && values.Images.length > 0) {
                values.Images.forEach((fileObj) => {
                    if (fileObj.file) {
                        formData.append('Images', fileObj.file);
                    }
                });
            } else if (initialData?.images && initialData.images.length > 0) {
                initialData.images.forEach(img => formData.append('Images', img.imageUrl));
            } else {
                formData.append('Images', '');
            }

            console.log('FormData Entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            await api.editEvent(eventId, formData);
            message.success('Cập nhật sự kiện thành công!');
            navigate('/business-dashboard/events');
        } catch (error) {
            message.error(`Cập nhật sự kiện thất bại: ${error.message}`);
            console.error('Error editing event:', error);
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
            setMainImagePreview(initialData?.mainImageUrl || null);
            form.setFieldsValue({ MainImageUrl: null });
        }
    };

    const handleAdditionalImagesChange = ({ fileList }) => {
        const previews = [];
        const files = fileList.map((item) => {
            if (item.originshalFileObj) {
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

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Card
                title={<h2 className="text-2xl font-semibold text-center">Chỉnh Sửa Sự Kiện</h2>}
                bordered={false}
                className="shadow-lg"
            >
                <Form
                    form={form}
                    onFinish={handleEditEvent}
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
                                format="DD/MM/YYYY HH:mm" // Thêm giờ phút
                                showTime // Hiển thị chọn giờ
                                style={{ width: '100%' }}
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Chọn ngày bắt đầu"
                                disabledDate={disabledStartDate}
                            />
                        </Form.Item>
                        <Form.Item
                            name="DueDate"
                            label="Ngày Kết Thúc"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('StartDate') || value >= getFieldValue('StartDate')) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY HH:mm" // Thêm giờ phút
                                showTime // Hiển thị chọn giờ
                                style={{ width: '100%' }}
                                className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Chọn ngày kết thúc"
                                disabledDate={disabledDueDate}
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
                        getValueFromEvent={(e) => (e && e.file ? e.file : null)}
                        rules={[{ required: false }]}
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
                        getValueFromEvent={(e) => e.fileList}
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
                                Cập Nhật Sự Kiện
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

export default EditEvent;