import axiosClient from './axiosClient';

const reviewService = {
    // Lấy tất cả đánh giá
    getAllReviews: async () => {
        try {
            const response = await axiosClient.get('/api/Reviews');
            // Kiểm tra cấu trúc response
            if (response && response.$values) {
                return response.$values;
            } else if (Array.isArray(response)) {
                return response;
            }
            return [];
        } catch (error) {
            console.error('Error fetching all reviews:', error);
            return [];
        }
    },

    getReviewsProductId: async (productId) => {
        try {
            const response = await axiosClient.get(`/api/Reviews/product/${productId}`);
            const data = response?.$values || [];
            return data;
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    },

    postReview: async (review) => {

        try {
            const response = await axiosClient.post(`/api/Reviews`, review);
            return response;
        } catch (error) {
            console.error('Error posting review:', error);
            throw error;
        }
    },
    getAverageRating: async (productId) => {
        try {
            const response = await axiosClient.get(`/api/Reviews/product/${productId}/average-rating`);
            return response;
        } catch (error) {
            console.error('Error fetching average rating:', error);
            throw error;
        }
    },
    
    confirmPayment: async (orderId, deliveryAddress) => {
        try {
            const response = await axiosClient.post(`/api/Orders/confirm-payment`,{
                orderId,
                deliveryAddress
            });
            return response; 
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; 
        }
    },

    // Phương thức gửi phản hồi cho đánh giá từ staff
    postReply: async (reviewId, replyContent) => {
        try {
            // Gửi PUT request đến endpoint chính xác với cấu trúc dữ liệu phù hợp với ReviewResponseDto
            const response = await axiosClient.put(`/api/Reviews/${reviewId}/response`, {
                Response: replyContent
            });
            console.log('Đã gửi phản hồi:', replyContent);
            return response.data;
        } catch (error) {
            console.error('Error posting reply to review:', error);
            throw error;
        }
    }
};

export default reviewService; 