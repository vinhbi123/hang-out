import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Alert, Avatar, Button, Card, Pagination, Rate, Spin } from 'antd';


function BusinessReview({ businessId }) {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [page, businessId]);

    const fetchReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching reviews for businessId:', businessId, 'page:', page, 'size:', size);
            const response = await api.getReviews({ page, size, businessId });
            console.log('API Response:', response);

            // Validate response structure
            if (!response.data || !response.data.items || typeof response.data.totalPages !== 'number' || typeof response.data.total !== 'number') {
                throw new Error('Invalid API response structure');
            }

            setReviews(response.data.items);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.total);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '48px' }}>
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
                <Button type="primary" onClick={fetchReviews}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
                Customer Reviews
            </h2>

            {reviews.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', fontSize: '16px' }}>
                    No reviews yet. Be the first to share your experience!
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((review) => (
                        <Card
                            key={review.id}
                            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            hoverable
                        >
                            <Card.Meta
                                avatar={
                                    <Avatar
                                        src={review.user.avatar}
                                        size={48}
                                        onError={() => {
                                            return { src: 'https://via.placeholder.com/48' };
                                        }}
                                    />
                                }
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600' }}>{review.user.name}</span>
                                        <Rate disabled value={review.rating} style={{ fontSize: '16px' }} />
                                    </div>
                                }
                                description={
                                    <>
                                        <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                                            {formatDate(review.createdDate)}
                                        </p>
                                        <p style={{ color: '#555', lineHeight: '1.6' }}>{review.content}</p>
                                    </>
                                }
                            />
                        </Card>
                    ))}
                </div>
            )}

            {/* Show pagination if there are items, even for a single page */}
            {totalItems > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                    <Pagination
                        current={page}
                        pageSize={size}
                        total={totalItems}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showQuickJumper={false}
                        showLessItems
                        style={{ textAlign: 'center' }}
                    />
                </div>
            )}
        </div>
    );
}

export default BusinessReview;