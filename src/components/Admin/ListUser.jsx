import React, { useState, useEffect } from 'react';
import { Card, List, message, Image, Pagination, Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const ListUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    // Hardcoded default avatar image URL
    const defaultAvatar = 'https://png.pngtree.com/png-vector/20220709/ourmid/pngtree-businessman-user-avatar-wearing-suit-with-red-tie-png-image_5809521.png';

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await api.getUsers({ page: currentPage, size: pageSize });
                setUsers(response.data.items || []);
                setTotalItems(response.data.total || 0);
            } catch (error) {
                message.error('Không thể tải danh sách người dùng. Vui lòng thử lại.');
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDelete = async (userId) => {
        try {
            await api.deleteUser(userId);
            message.success('Xóa người dùng thành công!');
            setUsers(users.filter((user) => user.userId !== userId));
            setTotalItems(totalItems - 1);
        } catch (error) {
            message.error('Không thể xóa người dùng. Vui lòng thử lại.');
            console.error('Error deleting user:', error);
        }
    };

    const renderUserCard = (user) => (
        <List.Item>
            <Card
                hoverable
                className="shadow-md rounded-xl w-64 h-96 flex flex-col" // Fixed width and height
                cover={
                    <Image
                        src={user.avatar || defaultAvatar}
                        alt={user.name}
                        height={180} // Fixed image height
                        width={256} // Fixed image width to match card
                        style={{ objectFit: 'cover' }}
                        fallback={defaultAvatar}
                        preview={true}
                    />
                }
            >
                <Card.Meta
                    title={
                        <div className="text-lg font-semibold flex justify-between items-center">
                            <span className="truncate">{user.name}</span> {/* Truncate long names */}
                            <Popconfirm
                                title="Bạn có chắc chắn muốn xóa người dùng này?"
                                onConfirm={() => handleDelete(user.userId)}
                                okText="Có"
                                cancelText="Không"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                />
                            </Popconfirm>
                        </div>
                    }
                    description={
                        <div className="text-sm text-gray-700 space-y-1 mt-2 overflow-hidden">
                            <p className="truncate"><strong>Email:</strong> {user.email}</p>
                            <p className="truncate"><strong>Phone:</strong> {user.phone}</p>
                            <p><strong>Created Date:</strong> {new Date(user.createdDate).toLocaleDateString()}</p>
                        </div>
                    }
                />
            </Card>
        </List.Item>
    );

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Danh sách người dùng</h2>
            <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={users}
                loading={loading}
                renderItem={renderUserCard}
                locale={{ emptyText: 'Không có dữ liệu người dùng' }}
            />
            {totalItems > 0 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
};

export default ListUser;