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
            console.error('Error registering user:', error);
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
            
            // Lưu thông tin người dùng vào localStorage
            if (response) {
                localStorage.setItem('user', JSON.stringify(response));
                
                // Nếu API trả về token riêng biệt, lưu token vào localStorage
                // Trong trường hợp hiện tại, API không trả về token riêng
                // Nếu sau này API được cập nhật để trả về token, bạn có thể bỏ comment dòng dưới
                // localStorage.setItem('token', response.token);
            }
            
            return response; 
        } catch (error) {
            console.error('Error logging in:', error);
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
    // Lấy thông tin người dùng hiện tại từ localStorage
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            // Nếu có lỗi khi parse JSON, xóa dữ liệu không hợp lệ
            localStorage.removeItem('user');
            return null;
        }
    },
    // Kiểm tra người dùng đã đăng nhập hay chưa
    isAuthenticated: () => {
        try {
            const user = userService.getCurrentUser();
            return !!user; // Trả về true nếu user tồn tại, false nếu không
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },
    // Lấy thông tin người dùng hiện tại từ API
    getCurrentUserProfile: async () => {
        try {
            const response = await axiosClient.get('/api/Users/profile');
            return response;
        } catch (error) {
            console.error('Error fetching current user profile:', error);
            throw error;
        }
    },
    // Lấy thông tin người dùng theo UserID
    getUserProfile: async (userId) => {
        try {
            const response = await axiosClient.get(`/api/Users/profile/${userId}`);
            return response;
        } catch (error) {
            // Kiểm tra nếu đây là lỗi hủy request
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                console.log('Profile request cancelled:', error.message);
            } else {
                console.error('Error fetching user profile:', error);
            }
            throw error; // Tiếp tục ném lỗi để component gọi có thể xử lý
        }
    },
    // Cập nhật thông tin người dùng hiện tại
    updateCurrentUserProfile: async (userData) => {
        try {
            const response = await axiosClient.put('/api/Users/profile', userData);
            
            // Xử lý phản hồi - với PUT có thể chỉ có status code mà không có data
            const isSuccess = response && (response.success || response.status === 200 || response.status === 204);
            
            // Cập nhật thông tin người dùng trong localStorage nếu cập nhật thành công
            if (isSuccess) {
                const currentUser = userService.getCurrentUser();
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...userData };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }
            
            return { success: isSuccess, data: response };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },
    // Cập nhật thông tin người dùng theo ID (dành cho admin)
    updateUserProfile: async (userId, userData) => {
        try {
            // Sử dụng PUT /api/Users/{id} thay vì /api/Users/update/{userId}
            const response = await axiosClient.put(`/api/Users/${userId}`, userData);
            
            // Xử lý phản hồi - với PUT có thể chỉ có status code mà không có data
            const isSuccess = response && (response.success || response.status === 200 || response.status === 204);
            
            // Cập nhật thông tin người dùng trong localStorage nếu cập nhật thành công
            if (isSuccess) {
                const currentUser = userService.getCurrentUser();
                if (currentUser && currentUser.userId === userId) {
                    const updatedUser = { ...currentUser, ...userData };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }
            
            return { success: isSuccess, data: response };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },
    // Đăng xuất
    logout: () => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // Xóa token nếu có
            
            // Chuyển hướng về trang đăng nhập hoặc trang chủ
            // window.location.href = '/login';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
};

export default userService;