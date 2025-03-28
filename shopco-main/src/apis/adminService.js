import axiosClient from './axiosClient';

const adminService = {
    getAllOrders: async () => {
        try {
            const response = await axiosClient.get('/api/Admin/all');
            return response; // Trả về dữ liệu từ API
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error; 
        }
    },
    
    // Thêm phương thức mới để thêm sản phẩm
    addProduct: async (productData) => {
        try {
            const response = await axiosClient.post('/api/Admin/Product', productData);
            return response;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    },

    // Thêm phương thức để nhập kho thêm số lượng sản phẩm
    importProductStock: async (productId, quantity) => {
        if (!productId) {
            throw new Error('ProductId is required');
        }
        try {
            console.log('Sending import request:', { productId, quantity });
            const response = await axiosClient.post(`/api/Products/${productId}/import`, quantity);
            console.log('Raw response:', response);
            
            // Trả về response.data để xử lý ở component
            return response.data;
        } catch (error) {
            console.error('Error importing product stock:', error);
            throw error;
        }
    },

    // Thêm phương thức để thay đổi trạng thái sản phẩm
    toggleProductStatus: async (productId) => {
        try {
            const response = await axiosClient.patch(`/api/Admin/${productId}/toggle-status`);
            return response;
        } catch (error) {
            console.error('Error toggling product status:', error);
            throw error;
        }
    },

    // Thêm phương thức để cập nhật sản phẩm
    updateProduct: async (productId, productData) => {
        try {
            const response = await axiosClient.put(`/api/Admin/${productId}/product`, productData);
            return response;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    markOrderAsDelivered: async (orderId) => {
        try {
            const response = await axiosClient.post(`/api/Orders/mark-delivered`, { orderId });
            console.log('Mark as delivered response:', response);
            return response;
        } catch (error) {
            console.error('Error marking order as delivered:', error);
            throw error;
        }
    },

    getCancelledOrders: async () => {
        try {
            const response = await axiosClient.get('/api/CancelRequests');
            return response; // Trả về dữ liệu từ API
        } catch (error) {
            console.error('Error fetching cancelled orders:', error);
            throw error;
        }
    },

    approveCancellation: async (cancelRequestId) => {
        try {
            const response = await axiosClient.put(`/api/Admin/${cancelRequestId}/cancelrequest/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving cancellation:', error);
            throw error;
        }
    },

    rejectCancellation: async (cancelRequestId) => {
        try {
            const response = await axiosClient.put(`/api/Admin/${cancelRequestId}/cancelrequest/reject`);
            return response;
        } catch (error) {
            console.error('Error rejecting cancellation:', error);
            throw error;
        }
    },

    addStaff: async (staffData) => {
        try {
            const response = await axiosClient.post('/api/Users/add-staff', staffData);
            return response;
        } catch (error) {
            console.error('Error adding staff:', error);
            throw error;
        }
    },

    updateStaff: async (userId, staffData) => {
        try {
            const response = await axiosClient.put(`/api/Users/update/${userId}`, staffData);
            return response;
        } catch (error) {
            console.error('Error updating staff:', error);
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await axiosClient.put(`/api/Users/update/${userId}`, userData);
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            // Chuẩn hóa role trước khi gửi
            let normalizedRole = role;
            if (typeof role === 'string') {
                if (role.toLowerCase() === 'manager') {
                    normalizedRole = 'Manager';
                } else if (role.toLowerCase() === 'admin') {
                    normalizedRole = 'Admin';
                } else if (role.toLowerCase() === 'staff') {
                    normalizedRole = 'Staff';
                } else if (role.toLowerCase() === 'customer') {
                    normalizedRole = 'Customer';
                }
            }
            
            // Kiểm tra và chuẩn hóa role người dùng hiện tại trong localStorage
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.role) {
                        const currentRole = user.role;
                        let correctedRole = currentRole;
                        
                        // Chuẩn hóa vai trò
                        if (currentRole.toLowerCase() === 'manager') {
                            correctedRole = 'Manager';
                        } else if (currentRole.toLowerCase() === 'admin') {
                            correctedRole = 'Admin';
                        } else if (currentRole.toLowerCase() === 'staff') {
                            correctedRole = 'Staff';
                        } else if (currentRole.toLowerCase() === 'customer') {
                            correctedRole = 'Customer';
                        }
                        
                        // Cập nhật lại localStorage nếu cần
                        if (correctedRole !== currentRole) {
                            console.log(`Đang sửa vai trò từ "${currentRole}" thành "${correctedRole}"`);
                            user.role = correctedRole;
                            localStorage.setItem('user', JSON.stringify(user));
                            localStorage.setItem('user_role', correctedRole);
                        }
                    }
                }
            } catch (error) {
                console.error('Lỗi khi sửa vai trò người dùng:', error);
            }
            
            console.log(`Gửi yêu cầu thay đổi vai trò: userId=${userId}, role=${normalizedRole}`);
            
            // Lấy thông tin người dùng hiện tại để gửi kèm trong headers
            const userStr = localStorage.getItem('user');
            let currentUserRole = null;
            
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user && user.role) {
                        currentUserRole = user.role;
                    }
                } catch (e) {
                    console.error('Lỗi khi đọc thông tin người dùng:', e);
                }
            }
            
            // Tạo headers tùy chỉnh cho request này
            const headers = {};
            if (currentUserRole) {
                headers['User-Role'] = currentUserRole;
                headers['X-User-Role'] = currentUserRole;
                headers['Role'] = currentUserRole;
                console.log('Gửi vai trò trong headers:', currentUserRole);
            }
            
            // Log chi tiết thông tin trước khi gửi request 
            console.log('Chi tiết request cập nhật vai trò:', {
                userId,
                normalizedRole,
                currentUserRole,
                headers,
                method: 'PUT',
                url: `/api/Users/update-role/${userId}`,
                data: { role: normalizedRole }
            });
            
            try {
                const response = await axiosClient.put(`/api/Users/update-role/${userId}`, 
                    { role: normalizedRole },
                    { headers }
                );
                
                console.log('Role update response:', response);
                return response;
            } catch (apiError) {
                // Xử lý lỗi chi tiết từ API
                console.error('Lỗi khi gọi API cập nhật vai trò:', apiError);
                
                // Log toàn bộ thông tin lỗi để dễ debug
                if (apiError.response) {
                    console.error('Status:', apiError.response.status);
                    console.error('Data:', apiError.response.data);
                    console.error('Headers:', apiError.response.headers);
                    
                    // Kiểm tra nếu có inner exception
                    if (apiError.response.data && apiError.response.data.includes('inner exception')) {
                        console.error('Lỗi database:', apiError.response.data);
                    }
                    
                    if (apiError.response.status === 500) {
                        // Có thể đây là lỗi ràng buộc trong database
                        console.error('Có thể là lỗi ràng buộc database - CHK_UserRole');
                    }
                } else if (apiError.request) {
                    console.error('Không nhận được phản hồi:', apiError.request);
                } else {
                    console.error('Lỗi cấu hình request:', apiError.message);
                }
                
                throw apiError;
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },

    getAllPosts: async () => {
        try {
            // Thêm tham số ngẫu nhiên để tránh cache và request trùng lặp
            const timestamp = new Date().getTime();
            const response = await axiosClient.get(`/api/Post?_t=${timestamp}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            console.log('Raw Response in Service:', response);
            
            // Xử lý nhiều định dạng response
            if (response && response["$values"]) {
                return response["$values"];
            }
            
            return response;
        } catch (error) {
            console.error('Detailed Error fetching posts:', error);
            // Trả về một mảng rỗng để dễ xử lý hơn
            if (error.message === 'Request was cancelled') {
                return [];
            }
            throw error; 
        }
    },

    // ... các phương thức khác nếu có ...
};

export default adminService;
