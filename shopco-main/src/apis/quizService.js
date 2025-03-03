import axiosClient from './axiosClient';

const quizService = {
    getQuestions: async () => {
        const response = await axiosClient.get('/api/Quiz/questions');
        return response.map(({ id, questionText, answers }) => ({
            id,
            questionText,
            answers
        }));
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



