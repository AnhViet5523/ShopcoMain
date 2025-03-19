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
