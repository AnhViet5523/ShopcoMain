import React, { useEffect, useState } from 'react';
import quizService from '../../apis/quizService';
import userService from '../../apis/userService';
import { Card, CardContent, FormControl, FormControlLabel, Radio, Button, Typography } from '@mui/material';

const QuizTest = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const questionResponse = await quizService.getQuestions();
                console.log("Questions:", questionResponse);
                setQuestions(questionResponse);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleAnswerSelect = (questionId, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const handleQuizCompletion = async (userId, skinType) => {
        try {
            // Lưu SkinType vào database
            await userService.saveSkinType(userId, skinType);
            console.log('SkinType saved successfully');
        } catch (error) {
            console.error('Failed to save SkinType:', error);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(selectedAnswers).length !== questions.length) {
            alert("Vui lòng chọn câu trả lời cho tất cả các câu hỏi trước khi xem kết quả.");
            return;
        }

        try {
            // Format responses for API
            const responses = Object.entries(selectedAnswers).map(([questionId, selectedAnswerId]) => ({
                questionId: parseInt(questionId),
                selectedAnswerId: selectedAnswerId
            }));

            // Get user ID from localStorage (assuming it's stored there after login)
            const user = JSON.parse(localStorage.getItem('user'));
            const userId = user?.id || 6; // Fallback to 6 if no user ID found

            // Save quiz results
            await quizService.saveQuizResult(userId, responses);
            console.log('Quiz results saved successfully');

            // Calculate skin type from responses
            const skinTypeCount = {};
            questions.forEach((question) => {
                const selectedAnswerId = selectedAnswers[question.id];
                const selectedAnswer = question.answers.find(answer => answer.answerId === selectedAnswerId);
                if (selectedAnswer) {
                    const skinType = selectedAnswer.skinType;
                    skinTypeCount[skinType] = (skinTypeCount[skinType] || 0) + 1;
                }
            });

            const maxCount = Math.max(...Object.values(skinTypeCount));
            const maxSkinTypes = Object.keys(skinTypeCount).filter(skinType => skinTypeCount[skinType] === maxCount);
            setResults(maxSkinTypes);

            // Save skin type result
            if (maxSkinTypes.length > 0) {
                await handleQuizCompletion(userId, maxSkinTypes[0]);
            }
        } catch (error) {
            console.error('Error saving quiz results:', error);
            alert('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.');
        }
    };

    return (
        <div style={{ backgroundColor: '#f5e1d0', padding: '20px', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontSize: '2rem', color: '#003366' }}>
                Da Của Bạn Là...?
            </Typography>
            {questions.length > 0 ? (
                questions.map((question) => (
                    <Card key={question.id} sx={{ marginBottom: 2, backgroundColor: '#ECDEB9' }}> 
                        <CardContent>
                            <Typography variant="h6" sx={{ fontSize: '1.5rem', color: '#003366' }}>
                                {question.questionText}
                            </Typography>
                            <FormControl component="fieldset">
                                {question.answers.map((answer) => (
                                    <FormControlLabel
                                        key={answer.answerId}
                                        control={
                                            <Radio
                                                checked={selectedAnswers[question.id] === answer.answerId}
                                                onChange={() => handleAnswerSelect(question.id, answer.answerId)}
                                                value={answer.answerId}
                                            />
                                        }
                                        label={answer.answerText}
                                    />
                                ))}
                            </FormControl>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography variant="h6" sx={{ textAlign: 'center', color: '#003366' }}>
                    Đang tải câu hỏi...
                </Typography>
            )}
            <Button variant="contained" color="primary" onClick={handleSubmit}>
                Xem Kết Quả
            </Button>

            {results.length > 0 && (
                <div>
                    <Typography sx={{ fontSize: '1.2rem' }}>
                        <span style={{ color: '#003366' }}>Da của bạn là: </span>
                        <span style={{ color: '#d32f2f' }}>{results.join(' hoặc ')}</span>
                        <span style={{ color: '#003366' }}>, hãy xem quy trình chăm sóc da và chọn sản phẩm phù hợp nhé!</span>
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default QuizTest;
                