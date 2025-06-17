import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SmileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import EmojiPicker from 'emoji-picker-react';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', image: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const navigate = useNavigate();

    const fetchCategories = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.getCategories({ page, size: pageSize });
            const { items, totalPages, page: current } = response.data;
            setCategories(items || []);
            setTotalPages(totalPages || 1);
            setCurrentPage(current || 1);
        } catch (err) {
            setError('Không thể tải danh mục. Vui lòng thử lại.');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories(currentPage);
    }, [currentPage]);

    const handleAddCategory = () => {
        setIsEditMode(false);
        setFormData({ id: '', name: '', image: '' });
        setError('');
        setIsModalOpen(true);
        setShowEmojiPicker(false);
    };

    const handleEditCategory = (category) => {
        setIsEditMode(true);
        setFormData({ id: category.id, name: category.name, image: category.image || '' });
        setError('');
        setIsModalOpen(true);
        setShowEmojiPicker(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onEmojiClick = (emojiObject) => {
        setFormData((prev) => ({ ...prev, image: emojiObject.emoji }));
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            setError('Tên danh mục là bắt buộc.');
            return;
        }
        setLoading(true);
        try {
            if (isEditMode) {
                await api.updateCategory({ id: formData.id, name: formData.name, image: formData.image });
            } else {
                await api.createCategory({ name: formData.name, image: formData.image });
            }
            setIsModalOpen(false);
            setError('');
            fetchCategories(currentPage);
        } catch (err) {
            setError(err.message || 'Lỗi khi lưu danh mục.');
            console.error('Error saving category:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        setLoading(true);
        try {
            await api.deleteCategory(id);
            fetchCategories(currentPage);
        } catch (err) {
            setError(err.message || 'Lỗi khi xóa danh mục.');
            console.error('Error deleting category:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const columns = [
        {
            title: 'Tên Danh Mục',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text) => (
                <span className="text-gray-800 font-medium">{text}</span>
            ),
        },
        {
            title: 'Icon',
            dataIndex: 'image',
            key: 'image',
            render: (image) => (
                <span className="text-2xl">{image || '❓'}</span>
            ),
        },
        {
            title: 'Hành Động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditCategory(record)}
                        className="bg-blue-500 text-white hover:bg-blue-600 transition-all"
                    >
                        Sửa
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCategory(record.id)}
                        className="bg-red-500 text-white hover:bg-red-600 transition-all"
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    // Thêm CSS animation vào component
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
      @keyframes flowingGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .custom-table .ant-table-thead > tr > th {
        background: #f8f9fa;
        color: #333;
        font-weight: 600;
      }
      .custom-modal .ant-modal-content {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    `;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6 p-4 rounded-lg shadow-md" style={{
                    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96c93d)',
                    animation: 'flowingGradient 6s ease infinite',
                }}>
                    <h1 className="text-3xl font-bold text-white">Quản Lý Danh Mục</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddCategory}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                        Thêm Danh Mục
                    </Button>
                </div>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow">
                        {error}
                    </div>
                )}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={categories}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            current: currentPage,
                            pageSize,
                            total: totalPages * pageSize,
                            onChange: handlePageChange,
                            showSizeChanger: false,
                            className: 'mt-4',
                        }}
                        locale={{ emptyText: <span className="text-gray-500">Không có danh mục nào.</span> }}
                        className="custom-table"
                        rowClassName="hover:bg-gray-50 transition-colors"
                    />
                </div>
            </div>
            <Modal
                title={
                    <div className="text-xl font-semibold text-orange-700">
                        {isEditMode ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
                    </div>
                }
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setShowEmojiPicker(false);
                }}
                footer={null}
                className="custom-modal"
                style={{ top: 20 }}
            >
                <form onSubmit={handleSubmit} className="space-y-6 p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên Danh Mục</label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên danh mục"
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                        <Button
                            type="default"
                            icon={<SmileOutlined />}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="w-full mb-2 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all"
                        >
                            {showEmojiPicker ? 'Ẩn Emoji' : 'Chọn Emoji'}
                        </Button>
                        {showEmojiPicker && (
                            <div className="mb-2">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    searchDisabled={false}
                                    skinTonesDisabled={true}
                                    theme="light"
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}
                        <Input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="Emoji được chọn sẽ hiển thị ở đây"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            readOnly
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</div>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button
                            onClick={() => {
                                setIsModalOpen(false);
                                setShowEmojiPicker(false);
                            }}
                            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg transition-all"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={loading}
                            className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all ${loading ? 'cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CategoryManager;