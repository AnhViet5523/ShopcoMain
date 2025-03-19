import axiosClient from './axiosClient';

const feedbackService = {
    // Gửi feedback mới
    sendFeedback: async (feedbackData) => {
        try {
            // Kiểm tra nếu có ảnh dưới dạng File (không phải base64)
            if (feedbackData.imageFile && !feedbackData.imageUrl) {
                try {
                    // Tạo FormData để upload ảnh riêng
                    const formData = new FormData();
                    formData.append('image', feedbackData.imageFile);
                    
                    console.log("Đang upload ảnh riêng...");
                    // uploadImage đã được cải tiến để trả về URL ảnh trực tiếp
                    feedbackData.imageUrl = await feedbackService.uploadImage(formData);
                    console.log("URL ảnh đã được lấy:", feedbackData.imageUrl);
                } catch (uploadError) {
                    console.error('Lỗi khi upload ảnh:', uploadError);
                    // Nếu lỗi upload, tiếp tục gửi feedback không có ảnh
                    feedbackData.imageUrl = "";
                }
            }
            
            // Kiểm tra kích thước của imageUrl nếu là base64
            if (feedbackData.imageUrl && typeof feedbackData.imageUrl === 'string' && 
                feedbackData.imageUrl.startsWith('data:') && 
                feedbackData.imageUrl.length > 5 * 1024 * 1024) {
                console.warn("Image size is too large. Size:", 
                    (feedbackData.imageUrl.length / (1024 * 1024)).toFixed(2), "MB");
                
                // Có thể xử lý thêm ở đây, như chia nhỏ request hoặc nén tiếp
            }
            
            // Đảm bảo không gửi imageFile lên server
            const { imageFile, ...payloadData } = feedbackData;
            
            // Đảm bảo URL ảnh được đưa vào payload
            const payload = {
                userId: payloadData.userId || 0,
                messageContent: payloadData.messageContent || "",
                imageUrl: payloadData.imageUrl || "", // Có thể là URL từ server hoặc base64
                email: payloadData.email || "",
                phoneNumber: payloadData.phoneNumber || ""
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

    // Lấy các feedback đã được trả lời cho một người dùng cụ thể
    getRepliedFeedbacksByUser: async (userId) => {
        try {
            const response = await axiosClient.get(`/api/feedbacks/replied/${userId}`);
            return response;
        } catch (error) {
            console.error('Error getting replied feedbacks for user:', error);
            throw error;
        }
    },

    // Thêm hàm upload ảnh chuyên dụng
    uploadImage: async (formData) => {
        try {
            // Đảm bảo gửi với Content-Type là multipart/form-data 
            console.log("Uploading image for feedback...");
            
            // Kiểm tra nếu formData không chứa file ảnh
            if (!formData.get('image')) {
                console.error('Không tìm thấy file ảnh trong formData');
                throw new Error('Không tìm thấy file ảnh');
            }
            
            // Kiểm tra kích thước ảnh
            const imageFile = formData.get('image');
            if (imageFile.size > 5 * 1024 * 1024) {
                console.error('Kích thước ảnh quá lớn (> 5MB)');
                throw new Error('Kích thước ảnh không được vượt quá 5MB');
            }
            
            // Gọi API upload ảnh thực tế
            const response = await axiosClient.post('/api/feedbacks/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000 // 30 giây cho upload ảnh
            });
            console.log("Upload image API response:", response);
            
            // Xử lý response để lấy đúng URL ảnh
            if (response) {
                if (typeof response === 'string') {
                    return response;
                } else if (response.data && typeof response.data === 'string') {
                    return response.data;
                } else if (response.data && response.data.imageUrl) {
                    return response.data.imageUrl;
                } else {
                    console.error("Cấu trúc response không đúng:", response);
                    throw new Error("Không thể lấy URL ảnh từ response");
                }
            }
            
            throw new Error('Không nhận được URL ảnh từ server');
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    // Thêm hàm để gửi phản hồi
    replyFeedback: async (replyData) => {
        try {
            const response = await axiosClient.post('/api/feedbacks/reply', replyData);
            return response;
        } catch (error) {
            console.error('Error replying to feedback:', error);
            throw error;
        }
    },

    // Helper function để xây dựng URL ảnh đầy đủ
    getImageUrl: (imageUrl) => {
        if (!imageUrl) return null;
        
        // Nếu là URL đầy đủ hoặc base64, trả về nguyên gốc
        if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
            return imageUrl;
        }
        
        // Ảnh từ Cloudinary đã là URL đầy đủ, nhưng đôi khi có thể nhận được dưới dạng path tương đối
        // Trong trường hợp đó, chuyển đổi thành URL đầy đủ
        return `${axiosClient.defaults.baseURL}${imageUrl}`;
    },
    
    // Phương thức mới: Gửi feedback kèm ảnh trong một request duy nhất
    sendFeedbackWithImage: async (feedbackData) => {
        try {
            // Tạo FormData để gửi cả ảnh và dữ liệu
            const formData = new FormData();
            
            // Thêm thông tin người dùng
            formData.append('userId', feedbackData.userId || 0);
            formData.append('messageContent', feedbackData.messageContent || "");
            formData.append('email', feedbackData.email || "");
            formData.append('phoneNumber', feedbackData.phoneNumber || "");
            
            // Thêm ảnh nếu có
            if (feedbackData.imageFile) {
                formData.append('image', feedbackData.imageFile);
            }
            
            console.log("Sending feedback with image in a single request. Image included:", !!feedbackData.imageFile);
            
            // Gọi API mới đã tạo
            const response = await axiosClient.post('/api/feedbacks/send-with-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000, // 60s cho upload ảnh và xử lý
            });
            
            return response;
        } catch (error) {
            console.error('Error sending feedback with image:', error);
            throw error;
        }
    },
    
    // Phương thức mới: Admin trả lời feedback kèm ảnh trong một request duy nhất
    replyFeedbackWithImage: async (replyData) => {
        try {
            // Tạo FormData để gửi cả ảnh và dữ liệu
            const formData = new FormData();
            
            // Thêm thông tin phản hồi
            formData.append('conversationId', replyData.conversationId);
            formData.append('userId', replyData.userId);
            formData.append('messageContent', replyData.messageContent || "");
            
            // Thêm ảnh nếu có
            if (replyData.imageFile) {
                formData.append('image', replyData.imageFile);
            }
            
            console.log("Replying to feedback with image in a single request. Image included:", !!replyData.imageFile);
            
            // Gọi API mới đã tạo
            const response = await axiosClient.post('/api/feedbacks/reply-with-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 60000, // 60s cho upload ảnh và xử lý
            });
            
            return response;
        } catch (error) {
            console.error('Error replying to feedback with image:', error);
            throw error;
        }
    }
};

export default feedbackService;
