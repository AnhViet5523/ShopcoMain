import axiosClient from './axiosClient';

const quizService = {
    getQuestions: async () => {
        try {
            // Thêm timestamp để tránh cache
            const timestamp = Date.now();
            const response = await axiosClient.get(`/api/Quiz/Questions?_t=${timestamp}`);
            console.log("Fetched Quiz Data:", response);

            // Kiểm tra nếu API trả về object có "$values"
            if (response && response.$values && Array.isArray(response.$values)) {
                return response.$values.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    answers: q.answers?.$values || [] // Lấy danh sách câu trả lời nếu có
                }));
            }
            
            // Kiểm tra trường hợp response là mảng
            if (Array.isArray(response)) {
                return response.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    answers: q.answers || []
                }));
            }
            
            console.warn("Không tìm thấy dữ liệu câu hỏi phù hợp:", response);
            return [];
        } catch (error) {
            console.error("Error fetching quiz data:", error);
            
            // Nếu là lỗi hủy request nhưng vẫn muốn thử lại
            if (error.name === 'CanceledError' || error.message === 'Request was cancelled') {
                console.log('Thử lại request sau khi bị hủy');
                
                try {
                    // Tạo timestamp mới để đảm bảo không trùng
                    const retryTimestamp = Date.now() + 100;
                    const retryResponse = await axiosClient.get(`/api/Quiz/Questions?_retry=true&_t=${retryTimestamp}`);
                    
                    if (retryResponse && retryResponse.$values && Array.isArray(retryResponse.$values)) {
                        return retryResponse.$values.map(q => ({
                            id: q.id,
                            questionText: q.questionText,
                            answers: q.answers?.$values || []
                        }));
                    }
                    
                    if (Array.isArray(retryResponse)) {
                        return retryResponse.map(q => ({
                            id: q.id,
                            questionText: q.questionText,
                            answers: q.answers || []
                        }));
                    }
                    
                    return [];
                } catch (retryError) {
                    console.error('Lỗi khi thử lại request:', retryError);
                    throw retryError; // Ném lỗi để component xử lý
                }
            }
            
            throw error; // Ném lỗi để component xử lý
        }
    },

    getAnswers: async () => {
        try {
            const response = await axiosClient.get('/api/QuizAnswers');
            return response;
        } catch (error) {
            console.error('Error fetching answers:', error);
            return [];
        }
    },

    saveQuizResult: async (requestData) => {
        try {
            console.log('Gửi dữ liệu quiz:', JSON.stringify(requestData, null, 2));
            
            // Đảm bảo dữ liệu responses có đúng định dạng
            const formattedData = {
                userId: requestData.userId,
                responses: requestData.responses.map(response => ({
                    questionId: Number(response.questionId),
                    selectedAnswerId: Number(response.selectedAnswerId)
                }))
            };
            
            // Gọi API /api/Quiz/submit với dữ liệu đã định dạng
            const response = await axiosClient.post('/api/Quiz/submit', formattedData);
            console.log('Kết quả từ API Quiz/submit:', response);
            return response;
        } catch (error) {
            console.error('Error saving quiz result:', error);
            throw error;
        }
    }
};

export default quizService; 



