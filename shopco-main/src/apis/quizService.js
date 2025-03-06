import axiosClient from './axiosClient';

const quizService = {
    getQuestions: async () => {
        try {
            const response = await axiosClient.get('/api/Quiz/Questions');
            
            // Truy cập vào thuộc tính $values để lấy mảng câu hỏi
            const questions = response.$values;

            // Kiểm tra xem questions có phải là mảng không
            if (!Array.isArray(questions)) {
                throw new Error('API response does not contain an array of questions');
            }

            return questions.map(({ id, questionText, answers }) => ({
                id,
                questionText,
                // Truy cập vào $values của answers để lấy mảng câu trả lời
                answers: answers.$values
            }));
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            throw error;
        }
    },
    getAnswers: async () => {
        const response = await axiosClient.get('/api/QuizAnswers');
        return response;
    },
    saveQuizResult: async (userId, responses) => {
        try {
            const promises = responses.map(({ questionId, selectedAnswerId }) => 
                axiosClient.post('/api/Quiz/submit', {
                    userId,
                    QuestionId: questionId,
                    selectedAnswerId
                })
            );
            
            const results = await Promise.all(promises);
            return results;
        } catch (error) {
            console.error('Error saving quiz result:', error);
            throw error;
        }
    }
};

export default quizService; 



