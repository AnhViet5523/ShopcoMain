import axiosClient from '../apis/axiosClient';

const skincareService = {
  // Lấy tất cả quy trình chăm sóc da
  getAllRoutines: async () => {
    try {
      const response = await axiosClient.get('/api/SkincareRoutines');
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy tất cả quy trình:', error);
      throw error;
    }
  },

  // Lấy quy trình chăm sóc da theo ID
  getRoutineById: async (routineId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/${routineId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy quy trình ID ${routineId}:`, error);
      throw error;
    }
  },

  // Lấy quy trình chăm sóc da theo loại da
  getRoutineBySkinType: async (skinType, signal) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/skintype/${skinType}`, { signal });
      return response;
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error(`Lỗi khi lấy quy trình cho loại da ${skinType}:`, error);
      }
      throw error;
    }
  },

  // Lấy danh sách sản phẩm trong quy trình chăm sóc da
  getRoutineProducts: async (skinType) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/skintype/${skinType}/products`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm cho loại da ${skinType}:`, error);
      throw error;
    }
  },

  // Lấy nội dung quy trình chăm sóc da
  getRoutineContent: async (skinType) => {
    try {
      // Sử dụng endpoint getRoutineBySkinType vì không có endpoint riêng cho nội dung
      const response = await axiosClient.get(`/api/SkincareRoutines/skintype/${skinType}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy nội dung cho loại da ${skinType}:`, error);
      throw error;
    }
  },

  // Cập nhật nội dung quy trình chăm sóc da - Chưa có endpoint này
  updateRoutineContent: async (skinType, content) => {
    try {
      // Chưa có endpoint này, cần thêm vào controller
      console.warn('Endpoint updateRoutineContent chưa được triển khai trong backend');
      // Tạm thời trả về dữ liệu giả để UI hoạt động
      return { success: true, data: content };
    } catch (error) {
      console.error(`Lỗi khi cập nhật nội dung cho loại da ${skinType}:`, error);
      throw error;
    }
  },

  // Cập nhật danh sách sản phẩm trong quy trình chăm sóc da - Chưa có endpoint này
  updateRoutineProducts: async (skinType, products) => {
    try {
      // Chưa có endpoint này, cần thêm vào controller
      console.warn('Endpoint updateRoutineProducts chưa được triển khai trong backend');
      // Tạm thời trả về dữ liệu giả để UI hoạt động
      return { success: true, data: products };
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm cho loại da ${skinType}:`, error);
      throw error;
    }
  }
};

export default skincareService; 