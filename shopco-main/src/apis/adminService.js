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
    // ... các phương thức khác nếu có ...
};

export default adminService;
