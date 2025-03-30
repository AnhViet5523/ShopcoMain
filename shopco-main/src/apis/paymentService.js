import axiosClient from './axiosClient';

const paymentService = {
  // Tạo URL thanh toán VNPAY
  createVnpPayment: async (orderId, amount) => {
    try {
      const currentUrl = window.location.origin;
      const data = {
        orderId: orderId.toString(),
        amount: Math.round(amount),
        returnUrl: `${currentUrl}/payment-result` // URL frontend để nhận kết quả
      };
      
      // Thêm log chi tiết để debug
      console.log('Sending payment data:', data);
      
      const response = await axiosClient.post('/api/Payments/createVnpPayment', data);
      console.log('VNPAY Response:', response);
      
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
      
      return response;
    } catch (error) {
      // Log chi tiết lỗi
      console.error('VNPAY Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Xác nhận thanh toán COD
  confirmCodPayment: async (paymentData) => {
    try {
      // Đảm bảo gửi đúng dữ liệu để lưu vào bảng Payments
      const response = await axiosClient.post('/api/Payments/confirmCodPayment', paymentData);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  handleVnpayReturn: async (queryString) => {
    try {
      // Loại bỏ các ký tự không hợp lệ
      const sanitizedQueryString = queryString
        .replace(/[^\x20-\x7E]/g, '') // Chỉ giữ các ký tự ASCII có thể in được
        .replace(/\+/g, '%20'); // Thay thế dấu + bằng mã hóa URL

      console.log('Sanitized Query String:', sanitizedQueryString);
      
      const fullUrl = `/api/Payments/vnpay-return?${sanitizedQueryString}`;
      console.log('Full API URL:', fullUrl);
      
      const response = await axiosClient.get(fullUrl, {
        // Thêm cấu hình để xử lý các ký tự đặc biệt
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => 
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            )
            .join('&');
        }
      });
      
      console.log('VNPAY Return Response:', response);
      
      return response;
    } catch (error) {
      console.error('Detailed VNPAY Return Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export default paymentService;
