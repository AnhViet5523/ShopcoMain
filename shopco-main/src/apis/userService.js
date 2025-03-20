import axiosClient from './axiosClient';
import { API_ENDPOINTS } from './apiConstants';


const userService = {
    // Lấy danh sách tất cả users
    getAllUsers: async () => {
        try {
            const response = await axiosClient.get(API_ENDPOINTS.USERS.LIST);
            console.log('Raw users response:', response);
            
            // Thêm biến lưu trữ kết quả xử lý
            let processedUsers = [];
            
            if (response && response.data && response.data.$values) {
                processedUsers = response.data.$values;
            } else if (response && response.data) {
                processedUsers = Array.isArray(response.data) ? response.data : [response.data];
            } else if (Array.isArray(response)) {
                processedUsers = response;
            } else if (response && response.$values) {
                processedUsers = response.$values;
            } else if (response && response.$id) {
                // Trường hợp đặc biệt của .NET
                const values = response.$values || [];
                processedUsers = Array.isArray(values) ? values : [];
            } else {
                // Nếu response là object, thử chuyển thành mảng với các thuộc tính là phần tử
                if (typeof response === 'object' && response !== null) {
                    // Kiểm tra xem response có thuộc tính nào có dạng $values hoặc values không
                    const possibleArrayProps = Object.keys(response).filter(key => 
                        key.includes('values') || key.includes('Values') || Array.isArray(response[key])
                    );
                    
                    if (possibleArrayProps.length > 0) {
                        const firstArrayProp = possibleArrayProps[0];
                        processedUsers = Array.isArray(response[firstArrayProp]) ? 
                            response[firstArrayProp] : [];
                    } else {
                        // Nếu không tìm thấy mảng, thử xem response có phải là mảng bị bọc không
                        const values = Object.values(response);
                        if (values.length > 0 && Array.isArray(values[0])) {
                            processedUsers = values[0];
                        }
                    }
                }
            }
            
            console.log('Processed users data:', processedUsers);
            return processedUsers;
        } catch (error) {
            if (error.name === 'CanceledError' || error.message === 'Request was cancelled') {
                console.log('Request bị hủy do trùng lặp:', error.message);
                // Thử gọi lại API với tham số khác để tránh cache
                try {
                    console.log('Thử gọi lại API với tham số khác');
                    const retryResponse = await axiosClient.get(`${API_ENDPOINTS.USERS.LIST}?_t=${Date.now()}`);
                    if (Array.isArray(retryResponse)) {
                        return retryResponse;
                    } else if (retryResponse && retryResponse.$values) {
                        return retryResponse.$values;
                    } else {
                        return [];
                    }
                } catch (retryError) {
                    console.error('Lỗi khi thử gọi lại API:', retryError);
                    return [];
                }
            } else {
                console.error('Lỗi khi lấy danh sách người dùng:', error);
                throw error;
            }
        }
    },

    // Đăng ký người dùng
    register: async (username, email, password) => {
        try {
            const response = await axiosClient.post(API_ENDPOINTS.USERS.REGISTER, {
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
            const response = await axiosClient.post(API_ENDPOINTS.USERS.LOGIN, {
                username,
                password
            });
            
            console.log('Login API response:', response);
            
            // Lưu thông tin người dùng vào localStorage
            if (response) {
                // Đảm bảo response có đủ thông tin cần thiết
                if (!response.userId) {
                    console.warn('Warning: User ID is missing in login response');
                }
                
                if (!response.role) {
                    console.warn('Warning: User role is missing in login response');
                } else {
                    console.log('User role from login:', response.role);
                    
                    // Đảm bảo role được lưu đúng cách
                    const normalizedRole = String(response.role).trim();
                    response.role = normalizedRole;
                    console.log('Normalized role:', normalizedRole);
                }
                
                // Lưu thông tin người dùng vào localStorage
                localStorage.setItem('user', JSON.stringify(response));
                console.log('User data saved to localStorage:', response);
                
                // Lưu role riêng để dễ debug
                if (response.role) {
                    localStorage.setItem('user_role', response.role);
                }
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
    // Lấy vai trò của người dùng hiện tại
    getUserRole: () => {
        try {
            // Thử lấy role từ localStorage riêng trước
            const debugRole = localStorage.getItem('user_role');
            if (debugRole) {
                console.log('Getting role from user_role in localStorage:', debugRole);
                return debugRole.toLowerCase();
            }
            
            // Nếu không có, lấy từ user object
            const user = userService.getCurrentUser();
            if (!user) {
                console.log('No user found in localStorage');
                return null;
            }
            
            if (!user.role) {
                console.log('User exists but role is missing');
                return null;
            }
            
            const normalizedRole = String(user.role).trim().toLowerCase();
            console.log('Getting role from user object:', normalizedRole);
            return normalizedRole;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    },
    // Kiểm tra xem người dùng có vai trò cụ thể hay không
    hasRole: (requiredRole) => {
        try {
            if (!requiredRole) {
                console.log('No required role specified, allowing access');
                return true; // Nếu không yêu cầu vai trò cụ thể, trả về true
            }
            
            const userRole = userService.getUserRole();
            if (!userRole) {
                console.log('User has no role, denying access');
                return false;
            }
            
            const normalizedRequiredRole = String(requiredRole).trim().toLowerCase();
            const result = userRole === normalizedRequiredRole;
            console.log(`Checking if user role "${userRole}" matches required role "${normalizedRequiredRole}": ${result}`);
            return result;
        } catch (error) {
            console.error('Error checking user role:', error);
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
            console.error('Error fetching user profile:', error);
            throw error;
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
    },
    requestCancelOrder: async (cancelData) => {
        try {
            const response = await axiosClient.post('/api/CancelRequests/request-cancel', cancelData);
            return response;
        } catch (error) {
            console.error('Error requesting order cancellation:', error);
            throw error;
        }
    }
};

export default userService;