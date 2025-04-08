import axios from 'axios';
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
    getRoutineBySkinType: async (skinType, signal) => {
        try {
            console.log(`Gọi API với skinType: ${skinType}`);
            console.log(`URL đầy đủ: https://localhost:7175/api/SkincareRoutines/skintype/${skinType}`);
            const response = await axiosClient.get(`/api/SkincareRoutines/skintype/${skinType}`, { signal });
            console.log('Response từ API:', response);
            
            // Kiểm tra xem response có dữ liệu không
            if (response) {
                // Kiểm tra nếu response là dữ liệu trực tiếp (có routineId, skinType, title, etc.)
                if (response.routineId || response.skinType || response.title) {
                    console.log('Response chứa dữ liệu trực tiếp:', response);
                    return response; // Trả về response trực tiếp
                }
                // Kiểm tra nếu response có trường data
                else if (response.data) {
                    console.log('Response chứa dữ liệu trong trường data:', response.data);
                    return response.data; // Trả về phần data
                }
                // Trường hợp response rỗng hoặc không có dữ liệu hợp lệ
                else {
                    console.error('Response không chứa dữ liệu hợp lệ:', response);
                    throw new Error(`Không tìm thấy dữ liệu cho loại da: ${skinType}`);
                }
            } else {
                // Trường hợp response là null hoặc undefined
                console.error('Response là null hoặc undefined');
                throw new Error(`Không tìm thấy dữ liệu cho loại da: ${skinType}`);
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
                throw error; // Rethrow lỗi hủy yêu cầu
            } else if (error.response) {
                // Lỗi từ server (có response)
                console.error(`Error fetching skincare routine for ${skinType}:`, error);
                console.error('Chi tiết lỗi:', error.response.data);
                
                if (error.response.status === 404) {
                    throw new Error(`Không tìm thấy quy trình chăm sóc cho loại da: ${skinType}`);
                } else {
                    throw new Error(`Lỗi server (${error.response.status}): ${error.response.data || 'Không có thông tin chi tiết'}`);
                }
            } else if (error.request) {
                // Lỗi không nhận được response
                console.error('Không nhận được phản hồi từ server:', error.request);
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                // Lỗi khác
                console.error('Lỗi không xác định:', error.message);
                throw error;
            }
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
