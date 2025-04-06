import axiosClient from './axiosClient';

const skincareService = {
    // Lấy tất cả quy trình chăm sóc da
    getAllRoutines: async () => {
        try {
            const response = await axiosClient.get('/api/SkincareRoutines');
            return response.data;
        } catch (error) {
            console.error('Error fetching skincare routines:', error);
            throw error;
        }
    },

    // Lấy quy trình chăm sóc da theo loại da
    getRoutineBySkinType: async (skinType) => {
        try {
            console.log(`Gọi API với skinType: ${skinType}`);
            console.log(`URL đầy đủ: https://localhost:7175/api/SkincareRoutines/skintype/${skinType}`);
            const response = await axiosClient.get(`/api/SkincareRoutines/skintype/${skinType}`);
            console.log('Response từ API:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching skincare routine for ${skinType}:`, error);
            console.error('Chi tiết lỗi:', error.response ? error.response.data : 'Không có response');
            throw error;
        }
    },

    // Lấy quy trình chăm sóc da theo ID
    getRoutineById: async (routineId) => {
        try {
            const response = await axiosClient.get(`/api/SkincareRoutines/${routineId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching skincare routine ID ${routineId}:`, error);
            throw error;
        }
    }
};

export default skincareService;
