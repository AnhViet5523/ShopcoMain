import axiosClient from './axiosClient';

const paymentService = {
  // Tạo URL thanh toán VNPAY
  createVnpPayment: async (orderId, amount) => {
    try {
      const currentUrl = window.location.origin; // Lấy domain hiện tại
      
      // Thêm tham số redirect vào URL để backend biết phải chuyển hướng về đâu
      const data = {
        orderId: orderId.toString(),
        amount: Math.round(amount),
        returnUrl: `${currentUrl}/api/Payments/vnpay-return?redirect=${encodeURIComponent(`${currentUrl}/payment-result`)}`
      };
      console.log('VNPAY Request Data:', data);
      
      const response = await axiosClient.post('/api/Payments/createVnpPayment', data);
      console.log('VNPAY Response:', response);
      return response;
    } catch (error) {
      console.error('VNPAY Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Xác nhận thanh toán COD
  confirmCodPayment: async (paymentData) => {
    try {
      const response = await axiosClient.post('/api/Payments/confirmCodPayment', paymentData);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Sửa lại hàm xử lý vnpay-return
  handleVnpayReturn: async (queryString) => {
    try {
      const response = await axiosClient.get(`/api/Payments/vnpay-return${queryString}`);
      
      // Kiểm tra nếu thanh toán thành công
      if (response && response.status === 'success') {
        // Lấy orderId từ localStorage
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        if (pendingOrderId) {
          // Xóa pendingOrderId khỏi localStorage
          localStorage.removeItem('pendingOrderId');
        }
      }
      
      // Sau khi nhận response, chuyển hướng về trang chính
      window.location.href = '/';
      
      return response;
    } catch (error) {
      console.error('VNPAY Return Error:', error.response?.data || error.message);
      // Trong trường hợp lỗi, vẫn chuyển về trang chính
      window.location.href = '/';
      throw error;
    }
  }
};

export default paymentService;
