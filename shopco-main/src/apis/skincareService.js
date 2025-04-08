import axios from 'axios'; // Giữ lại để dùng axios.isCancel
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

    // Cập nhật nội dung quy trình chăm sóc da
    updateRoutineContent: async (skinType, content) => {
        try {
            console.log(`[Frontend Log - PUT] Gửi yêu cầu cập nhật nội dung cho skinType: ${skinType}`);
            console.log('[Frontend Log - PUT] Dữ liệu gửi đi:', content);
            
            const response = await axiosClient.put(`/api/SkincareRoutines/skintype/${encodeURIComponent(skinType)}/content`, content);
            console.log('[Frontend Log - PUT] Kết quả cập nhật nội dung:', response);
            return response.data;
        } catch (error) {
            console.error('[Frontend Error - PUT] Lỗi khi cập nhật nội dung cho loại da', skinType, ':', error);
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

    // Tải lên ảnh cho quy trình chăm sóc da
    uploadRoutineImage: async (skinType, file) => {
        try {
            console.log(`[Frontend Log - POST] Gửi yêu cầu tải lên ảnh cho skinType: ${skinType}`);
            
            // Tạo FormData để gửi file
            const formData = new FormData();
            formData.append('file', file);
            
            // Cấu hình header để gửi FormData
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };
            
            console.log('[Frontend Log - POST] Gửi request tải lên ảnh...');
            const response = await axiosClient.post(
                `/api/SkincareRoutines/skintype/${encodeURIComponent(skinType)}/upload-image`, 
                formData,
                config
            );
            
            console.log('[Frontend Log - POST] Kết quả tải lên ảnh (response):', response);
            console.log('[Frontend Log - POST] Kết quả tải lên ảnh (response.data):', response.data);
            
            // Kiểm tra dữ liệu trả về chi tiết
            if (response && response.data) {
                // Kiểm tra cấu trúc dữ liệu trả về
                if (typeof response.data === 'object') {
                    // Log tất cả thuộc tính để debug
                    console.log('[Frontend Log - POST] Chi tiết dữ liệu trả về:');
                    for (const key in response.data) {
                        console.log(`[Frontend Log - POST] - ${key}:`, response.data[key]);
                    }
                    
                    // Kiểm tra imageUrl
                    if (response.data.imageUrl) {
                        console.log('[Frontend Log - POST] Tìm thấy imageUrl:', response.data.imageUrl);
                        return {
                            imageUrl: response.data.imageUrl,
                            message: response.data.message || 'Tải lên ảnh thành công',
                            success: response.data.success || true,
                            routineId: response.data.routineId
                        };
                    } else {
                        console.warn('[Frontend Warning - POST] Không tìm thấy imageUrl trong dữ liệu trả về');
                    }
                    
                    // Trả về dữ liệu nguyên bản từ API
                    return response.data;
                } else {
                    console.warn('[Frontend Warning - POST] Dữ liệu trả về không phải là object:', response.data);
                    return {
                        error: true,
                        message: 'Dữ liệu trả về không đúng định dạng',
                        rawData: response.data
                    };
                }
            }
            
            // Trường hợp không nhận được dữ liệu hợp lệ
            console.error('[Frontend Error - POST] Không nhận được dữ liệu hợp lệ từ API');
            return { 
                error: true, 
                message: 'Không nhận được dữ liệu hợp lệ từ API',
                response: response
            };
        } catch (error) {
            console.error('[Frontend Error - POST] Lỗi khi tải lên ảnh cho loại da', skinType, ':', error);
            return {
                error: true,
                message: error.response?.data?.message || error.message || 'Lỗi khi tải lên ảnh',
                errorDetails: error
            };
        }
    }
};

export default skincareService;
