import axiosClient from './axiosClient';

const blogService = {   

    getPostById: async (id) => {
        try {
            if (!id && id !== 0) {
                throw new Error('Blog ID là bắt buộc');
            }
            
            console.log('Fetching blog post with ID:', id);
            
            // Đảm bảo id là một số
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                throw new Error('Blog ID phải là số');
            }
            
            // Thêm timestamp để tránh cache
            const timestamp = new Date().getTime();
            const response = await axiosClient.get(`/api/Post/${numericId}?_t=${timestamp}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            console.log('Raw response from API:', response);
            
            // Kiểm tra response
            if (!response) {
                throw new Error('Không nhận được dữ liệu từ server');
            }
            
            return response;
        } catch (error) {
            console.error(`Error fetching post with ID ${id}:`, error);
            throw error;
        }
    },

    getAllPosts: async () => {
        try {
            const timestamp = new Date().getTime();
            const response = await axiosClient.get(`/api/Post?_t=${timestamp}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            console.log('All posts response:', response);
            // Chuyển đổi dữ liệu nếu cần
            if (Array.isArray(response) && response.length > 0) {
                // Đảm bảo mỗi bài viết có id
                return response.map(post => ({
                    ...post,
                    id: post.postId || post.id // Đảm bảo có trường id để frontend sử dụng
                }));
            }
            return response;
        } catch (error) {
            console.error('Error fetching all posts:', error);
            throw error;
        }
    },

    createPost: async (postData) => {
        try {
            // Tạo đối tượng FormData để gửi cả dữ liệu văn bản và tệp
            const formData = new FormData();
            formData.append('Title', postData.title);
            formData.append('Content', postData.content);
            formData.append('UserId', postData.userId || 1);
            
            // Nếu postData.image là File, thêm vào FormData
            if (postData.image && postData.image instanceof File) {
                formData.append('Image', postData.image);
            } 
            // Nếu chỉ có URL ảnh, thêm vào FormData
            else if (postData.imageUrl) {
                formData.append('ImageUrl', postData.imageUrl);
            }
            
            const response = await axiosClient.post('/api/Post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    updatePost: async (id, postData) => {
        try {
            // Tạo đối tượng FormData để gửi cả dữ liệu văn bản và tệp
            const formData = new FormData();
            formData.append('PostId', id);
            formData.append('Title', postData.title);
            formData.append('Content', postData.content);
            
            // Nếu postData.image là File, thêm vào FormData
            if (postData.image && postData.image instanceof File) {
                formData.append('Image', postData.image);
            } 
            // Nếu chỉ có URL ảnh, thêm vào FormData
            else if (postData.imageUrl) {
                formData.append('ImageUrl', postData.imageUrl);
            }
            
            const response = await axiosClient.put(`/api/Post/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error(`Error updating post with ID ${id}:`, error);
            throw error;
        }
    },

    deletePost: async (id) => {
        try {
            const response = await axiosClient.delete(`/api/Post/${id}`);
            return response;
        } catch (error) {
            console.error(`Error deleting post with ID ${id}:`, error);
            throw error;
        }
    }
};

export default blogService;
