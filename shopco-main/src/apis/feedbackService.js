import axiosClient from './axiosClient';

const feedbackService = {
    // Gửi feedback mới
    sendFeedback: async (feedbackData) => {
        try {
            // Kiểm tra kích thước của imageUrl
            if (feedbackData.imageUrl && feedbackData.imageUrl.length > 5 * 1024 * 1024) {
                console.warn("Image size is too large. Size:", 
                    (feedbackData.imageUrl.length / (1024 * 1024)).toFixed(2), "MB");
                
                // Có thể xử lý thêm ở đây, như chia nhỏ request hoặc nén tiếp
            }
            
            // Đảm bảo URL ảnh được đưa vào payload
            const payload = {
                userId: feedbackData.userId || 0,
                messageContent: feedbackData.messageContent || "",
                imageUrl: feedbackData.imageUrl || "", // Gửi chuỗi Base64
                email: feedbackData.email || "",
                phoneNumber: feedbackData.phoneNumber || ""
            };
            
            console.log("Sending feedback. Image included:", !!payload.imageUrl);
            
            // Thiết lập timeout dài hơn nếu có ảnh
            const timeout = payload.imageUrl ? 60000 : 10000; // 60s nếu có ảnh, 10s nếu không
            
            const response = await axiosClient.post('/api/feedbacks/send', payload, {
                timeout: timeout,
                maxBodyLength: 10 * 1024 * 1024, // Tăng giới hạn kích thước request body
                maxContentLength: 10 * 1024 * 1024 // Tăng giới hạn kích thước response
            });
            
            return response;
        } catch (error) {
            console.error('Error sending feedback:', error);
            throw error;
        }
    },

    // Trả lời feedback
    replyToFeedback: async (replyData) => {
        try {
            const response = await axiosClient.post('/api/feedbacks/reply', replyData);
            return response;
        } catch (error) {
            console.error('Error replying to feedback:', error);
            throw error;
        }
    },

    // Lấy feedback của một người dùng cụ thể
    getUserFeedbacks: async (userId) => {
        try {
            const response = await axiosClient.get(`/api/feedbacks/user/${userId}`);
            return response;
        } catch (error) {
            console.error('Error getting user feedbacks:', error);
            throw error;
        }
    },

    // Lấy các feedback đang chờ xử lý
    getPendingFeedbacks: async () => {
        try {
            const response = await axiosClient.get('/api/feedbacks/pending');
            return response;
        } catch (error) {
            console.error('Error getting pending feedbacks:', error);
            throw error;
        }
    },

    // Lấy tất cả feedback
    getAllFeedbacks: async () => {
        try {
            const response = await axiosClient.get('/api/feedbacks/all');
            return response;
        } catch (error) {
            console.error('Error getting all feedbacks:', error);
            throw error;
        }
    },

    // Lấy các feedback đã được trả lời
    getRepliedFeedbacks: async () => {
        try {
            const response = await axiosClient.get('/api/feedbacks/replied');
            return response;
        } catch (error) {
            console.error('Error getting replied feedbacks:', error);
            throw error;
        }
    },

    // Thêm hàm upload ảnh chuyên dụng
    uploadImage: async (formData) => {
        try {
            // Đảm bảo gửi với Content-Type là multipart/form-data 
            const response = await axiosClient.post('/api/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Upload response:", response);
            return response;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
};

export default feedbackService;
