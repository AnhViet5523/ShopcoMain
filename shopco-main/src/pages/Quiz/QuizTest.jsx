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

    const handleSubmit = async () => {
        if (Object.keys(selectedAnswers).length !== questions.length) {
            alert("Vui lòng chọn câu trả lời cho tất cả các câu hỏi trước khi xem kết quả.");
            return;
        }

        try {
            // Lấy userId từ người dùng đăng nhập
            const currentUser = userService.getCurrentUser();
            const userId = currentUser ? currentUser.userId : null;
            
            if (!userId) {
                alert("Bạn cần đăng nhập để sử dụng tính năng này");
                return;
            }

            // Format responses theo đúng cấu trúc API yêu cầu
            const requestData = {
                userId: userId,
                responses: Object.entries(selectedAnswers).map(([questionId, selectedAnswerId]) => ({
                    questionId: parseInt(questionId),
                    selectedAnswerId: selectedAnswerId
                }))
            };

            // Save quiz results and get skin type from backend
            const response = await quizService.saveQuizResult(requestData);
            console.log('Quiz results saved successfully', response);
            
            // Kiểm tra xem kết quả trả về có skinType không
            if (response && response.skinType) {
                // Thêm bước này: Lưu loại da vào dữ liệu người dùng
                try {
                    await userService.saveSkinType(userId, response.skinType);
                    console.log('SkinType saved to user profile:', response.skinType);
                } catch (skinTypeError) {
                    console.error('Error saving skin type to user profile:', skinTypeError);
                    // Vẫn tiếp tục hiển thị kết quả ngay cả khi không lưu được vào profile
                }
                
                // Set results from backend response
                setResults([response.skinType]);
            } else {
                console.error('Invalid response format, skinType not found:', response);
                alert('Có lỗi xảy ra khi phân tích kết quả. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error processing quiz results:', error);
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

                                            sx={{ 
                                                py: 1,
                                                px: 2, 
                                                my: 0.5, 
                                                width: '100%',
                                                borderRadius: 1,
                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                                ...(selectedAnswers[currentQuestion.id] === answer.answerId ? {
                                                    bgcolor: 'rgba(245, 169, 160, 0.2)',
                                                    color: '#e74c3c',
                                                    fontWeight: 'bold',
                                                } : {}),
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </Grow>

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

                    
                    <Box sx={{ 
                        p: 3, 
                        mb: 3, 
                        backgroundColor: '#f0f7ff', 
                        borderRadius: 2, 
                        border: '1px solid #d0e1fd'
                    }}>
                        <Typography sx={{ fontSize: '1.4rem', mb: 2 }}>
                            <span style={{ color: '#003366' }}>Loại da của bạn là: </span>
                            <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{results.join(' hoặc ')}</span>
                        </Typography>
                        
                        <Typography sx={{ color: '#003366' }}>
                            Dựa trên câu trả lời của bạn, Beauty Cosmetics đã phân tích và xác định được loại da của bạn. Chúng tôi sẽ gợi ý những sản phẩm phù hợp nhất giúp bạn chăm sóc làn da tối ưu.
                        </Typography>
                    </Box>
                    
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2, color: '#003366' }}>
                            Gợi ý cho loại da của bạn
                        </Typography>
                        <Typography sx={{ mb: 3, color: '#003366' }}>
                            Dưới đây là một số lời khuyên chăm sóc da dành riêng cho loại da của bạn:
                        </Typography>
                        
                        {/* Phần gợi ý cho từng loại da cụ thể */}
                        {results[0] === "Da dầu" && (
                            <Box sx={{ textAlign: 'left', mb: 3 }}>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Sử dụng sữa rửa mặt dạng gel nhẹ nhàng, không chứa dầu
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Sử dụng toner chứa axit salicylic để kiểm soát dầu
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Dùng kem dưỡng ẩm không dầu, dạng gel
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Đắp mặt nạ đất sét 1-2 lần/tuần để hút dầu thừa
                                </Typography>
                            </Box>
                        )}
                        
                        {results[0] === "Da khô" && (
                            <Box sx={{ textAlign: 'left', mb: 3 }}>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Sử dụng sữa rửa mặt dạng kem không chứa xà phòng
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Thoa kem dưỡng ẩm giàu dưỡng chất cả ngày và đêm
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Bổ sung serum chứa hyaluronic acid và ceramide
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Đắp mặt nạ dưỡng ẩm 2-3 lần/tuần
                                </Typography>
                            </Box>
                        )}
                        
                        {results[0] === "Da hỗn hợp" && (
                            <Box sx={{ textAlign: 'left', mb: 3 }}>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Sử dụng sữa rửa mặt cân bằng pH cho da
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Áp dụng kem dưỡng ẩm nhẹ cho toàn mặt, và kem đặc hơn cho vùng da khô
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Dùng toner không cồn cho vùng chữ T
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Kết hợp đa dạng các sản phẩm phù hợp cho từng vùng da khác nhau
                                </Typography>
                            </Box>
                        )}
                        
                        {results[0] === "Da thường" && (
                            <Box sx={{ textAlign: 'left', mb: 3 }}>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Duy trì sử dụng sữa rửa mặt dịu nhẹ
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Ưu tiên các sản phẩm bảo vệ da khỏi môi trường
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Dùng kem dưỡng ẩm phù hợp với mùa
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Bổ sung các sản phẩm chống lão hóa sớm để duy trì làn da khỏe mạnh
                                </Typography>
                            </Box>
                        )}
                        
                        {results[0] === "Da nhạy cảm" && (
                            <Box sx={{ textAlign: 'left', mb: 3 }}>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Chọn sản phẩm không chứa hương liệu và cồn
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Sử dụng kem dưỡng ẩm có thành phần dịu nhẹ như ceramide
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Tránh các sản phẩm có tính tẩy tế bào chết mạnh
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Luôn kiểm tra sản phẩm mới trên một vùng da nhỏ trước khi sử dụng
                                </Typography>
                            </Box>
                        )}
                        
                        {/* Trường hợp mặc định nếu không khớp với loại da cụ thể */}
                        {!["Da dầu", "Da khô", "Da hỗn hợp", "Da thường", "Da nhạy cảm"].includes(results[0]) && (
                            <Box sx={{ textAlign: 'left', mb: 3 }}>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Sử dụng sản phẩm làm sạch phù hợp với loại da {results.join(' hoặc ')}
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Thoa kem chống nắng mỗi ngày để bảo vệ da
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Chọn các sản phẩm không chứa chất gây kích ứng
                                </Typography>
                                <Typography component="li" sx={{ mb: 1 }}>
                                    Tham khảo ý kiến chuyên gia để có hướng dẫn cụ thể hơn
                                </Typography>
                            </Box>
                        )}
                        
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                // Điều hướng tùy thuộc vào loại da
                                let targetPath = '/category';
                                if (results && results.length > 0) {
                                    switch(results[0]) {
                                        case "Da dầu":
                                            targetPath = '/da-dau';
                                            break;
                                        case "Da hỗn hợp":
                                            targetPath = '/da-hon-hop';
                                            break;
                                        case "Da khô":
                                            targetPath = '/da-kho';
                                            break;
                                        case "Da nhạy cảm":
                                            targetPath = '/da-nhay-cam';
                                            break;
                                        case "Da thường":
                                            targetPath = '/da-thuong';
                                            break;
                                        default:
                                            targetPath = '/category';
                                            break;
                                    }
                                }
                                navigate(targetPath);
                            }}
                            sx={{
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                backgroundColor: '#f5a9a0',
                                '&:hover': {
                                    backgroundColor: '#e74c3c',
                                }
                            }}
                        >
                            Xem quy trình và chọn các sản phẩm phù hợp
                        </Button>
                    </Box>
                </Paper>
            </Grow>
        );
    };

    return (
        <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
            <Header />
            
            <Container maxWidth="lg" sx={{ my: 4, px: 2 }}>
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 2 }}
                        action={
                            <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => {
                                    setLoading(true);
                                    setError('');
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 500);
                                }}
                            >
                                Làm mới
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}
                
                {loading ? (
                    <Fade in={true} timeout={500}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress color="primary" size={50} thickness={4} />
                            <Typography variant="h6" sx={{ ml: 2, textAlign: 'center', color: '#003366' }}>
                                Đang tải câu hỏi...
                            </Typography>
                        </Box>
                    </Fade>
                ) : (
                    <>
                        {results.length > 0 ? (
                            renderResults()
                        ) : (
                            showIntro ? renderIntroduction() : renderQuestion()
                        )}
                    </>
                )}

                {/* Dialog xác nhận khi đóng quiz */}
                <Dialog
                    open={openConfirmDialog}
                    onClose={handleCancelClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Bạn có chắc chắn muốn thoát?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Bạn đã trả lời {Object.keys(selectedAnswers).length} câu hỏi. Nếu thoát bây giờ, tiến trình trả lời của bạn sẽ bị mất.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelClose} color="primary">
                            Hủy
                        </Button>
                        <Button onClick={handleConfirmClose} color="error" autoFocus>
                            Thoát
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            
            <Footer />
        </Box>

    );
};

export default QuizTest;
                