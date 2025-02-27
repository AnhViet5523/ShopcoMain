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
    }
};

export default userService; 