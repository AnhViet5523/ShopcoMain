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
    }
};

export default quizService; 



