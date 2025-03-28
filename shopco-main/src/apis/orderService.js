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
            const response = await axiosClient.get(`/api/Orders/current/${userId}`);
            return response;
        } catch (error) {
            console.error('Error:', error);
            throw error;
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
            // Gọi API để thêm vào giỏ hàng
            const response = await axiosClient.post('/api/Orders/addtocart', {
                userId,
                productId,
                quantity
            });
            
            try {
                // Sau khi thêm vào giỏ hàng thành công, lấy lại giỏ hàng mới nhất
                const updatedCart = await orderService.getCurrentCart(userId);
                
                // Cập nhật localStorage với dữ liệu giỏ hàng mới nếu API trả về thành công
                if (updatedCart && updatedCart.items && updatedCart.items.$values) {
                    const cartItems = updatedCart.items.$values.map(item => ({
                        id: item.orderItemId,
                        productId: item.productId,
                        name: item.product ? item.product.productName : 'Sản phẩm không xác định',
                        price: item.price,
                        quantity: item.quantity,
                        imgUrl: item.product && item.product.imgUrl ? item.product.imgUrl : '',
                    }));
                    
                    localStorage.setItem('cart', JSON.stringify(cartItems));
                }
            } catch (localStorageError) {
                console.error('Error updating localStorage after adding to cart:', localStorageError);
            }
            
            return response; 
        } catch (error) {
            console.error('Error adding to cart:', error);
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
    },
    markOrderAsPaid: async (orderId) => {
        try {
            console.log(`Marking order ${orderId} as paid for COD payment`);
            
            try {
                // Gọi API để đánh dấu đơn hàng đã thanh toán
                const response = await axiosClient.post('/api/Orders/mark-as-paid', { orderId });
                console.log('Mark order as paid response:', response);
                return response;
            } catch (apiError) {
                console.warn('API mark-as-paid không tồn tại:', apiError);
                // Nếu API không tồn tại, có thể thực hiện các bước thay thế hoặc bỏ qua
                return { success: false, message: 'API không tồn tại, đơn hàng sẽ được đánh dấu thủ công' };
            }
        } catch (error) {
            console.error('Error marking order as paid:', error);
            console.error('Error details:', error.response?.data || error);
            throw error;
        }
    },
    clearCartAfterPayment: async (userId) => {
        try {
            console.log(`Clearing cart for user ${userId} after successful payment`);
            
            // Đảm bảo localStorage đã được cập nhật
            localStorage.setItem('cart', JSON.stringify([]));
            
            try {
                // Gọi API để xóa giỏ hàng hiện tại
                const response = await axiosClient.post('/api/Orders/clear-cart', { userId });
                console.log('Clear cart response:', response);
                
                // Kích hoạt sự kiện để cập nhật lại giỏ hàng trên Header
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                
                return response;
            } catch (apiError) {
                console.warn('API clear-cart không tồn tại, sử dụng giải pháp thay thế:', apiError);
                
                // Nếu API không tồn tại, sử dụng giải pháp thay thế:
                // 1. Lấy giỏ hàng hiện tại
                const currentCart = await orderService.getCurrentCart(userId);
                
                // 2. Xóa từng sản phẩm trong giỏ hàng
                if (currentCart && currentCart.items && currentCart.items.$values) {
                    const items = currentCart.items.$values;
                    for (const item of items) {
                        await orderService.removefromcart(item.orderItemId);
                    }
                }
                
                // 3. Kích hoạt sự kiện để cập nhật lại giỏ hàng
                window.dispatchEvent(new CustomEvent('cartUpdated'));
                
                return { success: true, message: 'Đã xóa giỏ hàng bằng giải pháp thay thế' };
            }
        } catch (error) {
            console.error('Error clearing cart after payment:', error);
            console.error('Error details:', error.response?.data || error);
            // Đảm bảo localStorage vẫn được cập nhật ngay cả khi có lỗi
            localStorage.setItem('cart', JSON.stringify([]));
            // Kích hoạt sự kiện cập nhật giỏ hàng ngay cả khi gặp lỗi
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            throw error;
        }
    }
};

export default orderService; 