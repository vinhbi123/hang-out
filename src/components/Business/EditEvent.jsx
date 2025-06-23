import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Upload, Button, message, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/api';
import moment from 'moment';
import 'moment/locale/vi';
import { useParams, useNavigate } from 'react-router-dom';

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

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [mainImagePreview, setMainImagePreview] = useState(null);
    const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]);
    const [position, setPosition] = useState([10.0452396, 105.724084]); // Default: Cần Thơ
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                const response = await api.getEvent(eventId);
                const { data } = response;
                setInitialData(data);
                setPosition([parseFloat(data.latitude) || 10.0452396, parseFloat(data.longitude) || 105.724084]);
                // Không tự động set mainImagePreview, để trống khi mở form
                setAdditionalImagesPreview(data.images.map(img => img.imageUrl) || []);

                form.setFieldsValue({
                    Name: data.name,
                    StartDate: data.startDate ? moment(data.startDate) : null,
                    DueDate: data.dueDate ? moment(data.dueDate) : null,
                    Location: data.location,
                    Description: data.description,
                    Latitude: data.latitude,
                    Longitude: data.longitude,
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
            formData.append('Name', values.Name);
            formData.append('StartDate', moment(values.StartDate).startOf('day').toISOString());
            formData.append('DueDate', moment(values.DueDate).startOf('day').toISOString());
            formData.append('Location', values.Location);
            formData.append('Description', values.Description || '');
            formData.append('Latitude', values.Latitude);
            formData.append('Longitude', values.Longitude);

            // Chỉ append MainImageUrl nếu có file mới, nếu không để trống
            if (values.MainImageUrl && values.MainImageUrl.file) {
                formData.append('MainImageUrl', values.MainImageUrl.file);
            } else {
                formData.append('MainImageUrl', ''); // Gửi rỗng để xóa ảnh hiện tại
            }

            if (values.Images) {
                values.Images.forEach((fileObj) => {
                    if (fileObj.file) {
                        formData.append('Images', fileObj.file);
                    }
                });
            }

            console.log('FormData Entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            await api.editEvent(eventId, formData); // Giả định api.editEvent là hàm PATCH
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
            setMainImagePreview(null); // Xóa preview khi bỏ chọn
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
                    initialValues={{
                        Name: initialData?.name,
                        StartDate: initialData?.startDate ? moment(initialData.startDate) : null,
                        DueDate: initialData?.dueDate ? moment(initialData.dueDate) : null,
                        Location: initialData?.location,
                        Description: initialData?.description,
                        Latitude: initialData?.latitude,
                        Longitude: initialData?.longitude,
                    }}
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
                        rules={[{ required: false, message: 'Vui lòng tải lên ảnh chính!' }]}
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