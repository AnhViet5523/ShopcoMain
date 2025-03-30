import axiosClient from './axiosClient';

const orderService = {
    getOrders: async (userId) => {

        try {
            const response = await axiosClient.get('/api/Orders');
            const values = response['$values'];
            const orderByUser = values.filter(order => order.userId === userId);
            return orderByUser;
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    getOrderById: async (orderId) => {
        try {
            const response = await axiosClient.get(`/api/Orders/${orderId}`);
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },
    getCurrentCart: async (userId) => {
        try {
            console.log(`Đang lấy giỏ hàng hiện tại cho người dùng ID: ${userId}`);
            const response = await axiosClient.get(`/api/Orders/current/${userId}`);
            console.log('Phản hồi giỏ hàng hiện tại:', response);
            
            // Kiểm tra cấu trúc phản hồi
            if (!response) {
                console.warn('Không nhận được phản hồi từ API giỏ hàng');
                return { items: { $values: [] } };
            }
            
            // Chuẩn hóa dữ liệu
            if (!response.items) {
                console.warn('Phản hồi không có trường items');
                response.items = { $values: [] };
            } else if (!response.items.$values) {
                console.warn('Phản hồi có trường items nhưng không có $values');
                response.items.$values = [];
            }
            
            return response;
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng hiện tại:', error);
            console.error('Chi tiết lỗi:', error.response?.data || error.message);
            // Trả về đối tượng giỏ hàng trống để tránh lỗi
            return { items: { $values: [] } };
        }
    },
    countBoughtProducts: async (productId) => {
        try {
            const response = await axiosClient.get(`/api/Orders/sold-count/${productId}`);
            return response;
        } catch (error) {
            console.error('Error:', error);
        }
    },
    addtocard: async (userId, productId, quantity) => {

        try {
            const response = await axiosClient.post('/api/Orders/addtocart', {
                userId,
                productId,
                quantity
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            return error;
            throw error; 
        }
    },
    updatecartitem: async (orderItemId, quantity) => {
        try {
            const response = await axiosClient.put('/api/Orders/updatecartitem', {
                orderItemId,
                quantity
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    },
    removefromcart: async (orderItemId) => {
        try {
            const response = await axiosClient.delete(`/api/Orders/removefromcart/${orderItemId}`);
            return response;
        } catch (error) {
            console.error('Error saving skin type:', error);
            throw error;
        }
    },
    applyvoucher: async (orderId,voucherId) => {
        try {
            const response = await axiosClient.post(`/api/Orders/applyvoucher`,{
                orderId,
                voucherId
            });
            return response; 
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error; 
        }
    },
    buyNow: async (userId, productId, quantity) => {
        try {
            // Ghi log thông tin trước khi gọi API
            console.log(`Đang gọi API mua ngay với: userId=${userId}, productId=${productId}, quantity=${quantity}`);
            
            // Gửi request với cấu trúc JSON theo yêu cầu
            const response = await axiosClient.post('/api/Orders/buy-now', {
                userId,
                productId,
                quantity
            });
            
            // Ghi log kết quả nhận được
            console.log("Phản hồi từ API mua ngay:", response);
            
            // Kiểm tra phản hồi
            if (!response) {
                throw new Error("Không nhận được phản hồi từ server");
            }
            
            // Trả về orderId trong cấu trúc chuẩn, dù phản hồi có cấu trúc thế nào
            if (typeof response === 'number') {
                return { orderId: response };
            } else if (typeof response === 'object') {
                // Kiểm tra cấu trúc phản hồi mới (orderId trong order)
                if (response.order && response.order.orderId) {
                    return { orderId: response.order.orderId };
                }
                
                // Kiểm tra các cấu trúc khác
                const orderId = response.orderId || response.OrderId || 
                              (response.data && response.data.orderId) || 
                              (response.data && response.data.OrderId);
                              
                if (orderId) {
                    return { orderId: orderId };
                }
            }
            
            // Nếu không tìm thấy orderId, trả về toàn bộ response để xử lý ở UI
            return response;
        } catch (error) {
            console.error('Lỗi khi thực hiện mua ngay:', error);
            throw error;
        }
    },
    confirmpayment: async (paymentData) => {
        const response = await axiosClient.post('/api/Orders/confirm-payment', paymentData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },
    getOrderItems: async (orderId) => {
        try {
            const response = await axiosClient.get(`/api/OrderItems/${orderId}`);
            return response;
        } catch (error) {
            console.error('Error fetching order items:', error);
            throw error;
        }
    },
    getOrderHistory: async (userId) => {
        try {
            console.log(`Fetching order history for user: ${userId}`);
            const response = await axiosClient.get(`/api/Orders/history?userId=${userId}`);
            console.log('Order history response:', response);
            
            // Xử lý dữ liệu trả về
            let orders = [];
            if (response && response.$values) {
                orders = response.$values;
            } else if (Array.isArray(response)) {
                orders = response;
            }
            
            return orders;
        } catch (error) {
            console.error('Error fetching order history:', error);
            console.error('Error details:', error.response?.data || error);
            return [];
        }
    },
    removeItemFromCheckout: async (orderId, orderItemId) => {
        try {
            console.log(`Removing item ${orderItemId} from checkout order ${orderId} without removing from cart`);
            
            // Gọi API để xóa sản phẩm khỏi đơn hàng đang thanh toán
            const response = await axiosClient.post('/api/Orders/remove-from-checkout', {
                orderId,
                orderItemId
            });
            
            console.log('Remove from checkout response:', response);
            return response;
        } catch (error) {
            console.error('Error removing item from checkout:', error);
            console.error('Error details:', error.response?.data || error);
            throw error;
        }
    }
};

export default orderService; 