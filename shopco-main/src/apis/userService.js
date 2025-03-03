import axiosClient from './axiosClient';

const userService = {
    // Đăng ký người dùng
    register: async (username, email, password) => {
        try {
            const response = await axiosClient.post('/api/Users/register', {
                username,
                email,
                password
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    // Đăng nhập người dùng
    login: async (username, password) => {
        try {
            const response = await axiosClient.post('/api/Users/login', {
                username,
                password
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    // Lưu SkinType
    saveSkinType: async (userId, skinType) => {
        try {
            const response = await axiosClient.post('/api/UserSkinTypeResults', {
                userId,
                skinType
            });
            return response;
        } catch (error) {
            console.error('Error saving skin type:', error);
            throw error;
        }
    },
    // Lấy thông tin người dùng theo UserID
    getUserById: async (userId) => {
        try {
            const response = await axiosClient.get(`/api/Users/${userId}`);
            return response; 
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; 
        }
    }
};

export default userService; 