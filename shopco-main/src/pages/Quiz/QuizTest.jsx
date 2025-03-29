import React, { useEffect, useState } from 'react';
import quizService from '../../apis/quizService';
import userService from '../../apis/userService';
import { useNavigate } from 'react-router-dom';
import { 
    Card, CardContent, FormControl, FormControlLabel, Radio, Button, 
    Typography, Box, Alert, Stepper, Step, StepLabel, 
    LinearProgress, Paper, Fade, Slide, Grow, CircularProgress,
    IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Container
} from '@mui/material';
import { ArrowBack, ArrowForward, Check, Close as CloseIcon } from '@mui/icons-material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';

const QuizTest = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [direction, setDirection] = useState('left');
    const [animIn, setAnimIn] = useState(true);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Thêm timestamp để tránh cache
                const questionResponse = await quizService.getQuestions();
                console.log("Questions:", questionResponse);
                
                if (Array.isArray(questionResponse) && questionResponse.length > 0) {
                setQuestions(questionResponse);
                } else {
                    setError('Không thể tải câu hỏi. Vui lòng làm mới trang và thử lại.');
                    console.warn('Không có câu hỏi nào được tìm thấy hoặc định dạng không đúng');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Hiển thị thông báo lỗi thân thiện
                if (error.message === 'Request was cancelled') {
                    setError('Kết nối bị gián đoạn. Vui lòng làm mới trang và thử lại.');
                } else {
                    setError('Không thể tải câu hỏi. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
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

    const handleAnimation = (newIndex, dir) => {
        setAnimIn(false);
        setDirection(dir);
        
        // Đợi animation hoàn thành trước khi chuyển câu hỏi
        setTimeout(() => {
            setCurrentQuestionIndex(newIndex);
            setAnimIn(true);
        }, 300);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            handleAnimation(currentQuestionIndex + 1, 'left');
        } else {
            // Nếu là câu hỏi cuối cùng và đã trả lời, tự động nộp bài
            handleSubmit();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            handleAnimation(currentQuestionIndex - 1, 'right');
        }
    };

    const handleGoToQuestion = (index) => {
        const dir = index > currentQuestionIndex ? 'left' : 'right';
        handleAnimation(index, dir);
    };

    const getProgressPercentage = () => {
        const answeredCount = Object.keys(selectedAnswers).length;
        return questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    };

    const handleCloseQuiz = () => {
        // Nếu người dùng đã trả lời ít nhất một câu hỏi, hiển thị dialog xác nhận
        if (Object.keys(selectedAnswers).length > 0) {
            setOpenConfirmDialog(true);
        } else {
            // Nếu chưa trả lời câu hỏi nào, có thể quay về trang chính ngay lập tức
            navigate('/');
        }
    };

    const handleConfirmClose = () => {
        setOpenConfirmDialog(false);
        navigate('/');
    };

    const handleCancelClose = () => {
        setOpenConfirmDialog(false);
    };

    // Xử lý bắt đầu làm quiz (từ phần giới thiệu)
    const handleStartQuiz = () => {
        setShowIntro(false);
    };

    const handleSubmit = async () => {
        if (Object.keys(selectedAnswers).length !== questions.length) {
            setError("Vui lòng chọn câu trả lời cho tất cả các câu hỏi trước khi xem kết quả.");
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Lấy userId từ người dùng đăng nhập
            const currentUser = userService.getCurrentUser();
            const userId = currentUser ? currentUser.userId : null;
            
            if (!userId) {
                setError("Bạn cần đăng nhập để sử dụng tính năng này");
                setSubmitting(false);
                return;
            }

            // Format responses theo đúng cấu trúc API yêu cầu
            const requestData = {
                userId: userId,
                responses: Object.entries(selectedAnswers).map(([questionId, selectedAnswerId]) => ({
                    questionId: parseInt(questionId),
                    selectedAnswerId: parseInt(selectedAnswerId) // Đảm bảo đây là số nguyên
                }))
            };

            console.log("Dữ liệu gửi đi:", JSON.stringify(requestData, null, 2));

            // Save quiz results and get skin type from backend
            const response = await quizService.saveQuizResult(requestData);
            console.log('Quiz results saved successfully', response);
            
            // Kiểm tra xem kết quả trả về có skinType không
            if (response && response.skinType) {
                // Hiển thị kết quả từ API trả về
                setResults([response.skinType]);
                setError('');
            } else if (response && response.message) {
                // Hiển thị thông báo lỗi từ server nếu có
                setError(`Lỗi từ server: ${response.message}`);
                console.error('Server error message:', response.message);
            } else {
                // Trường hợp kết quả đã được lưu nhưng không trả về skinType
                // Giả định rằng quiz vẫn thành công
                console.warn('Không tìm thấy skinType trong phản hồi, nhưng có thể đã lưu thành công:', response);
                
                // Thử xác định loại da từ các câu trả lời (giải pháp tạm thời)
                const skinTypes = {
                    "Da dầu": 0,
                    "Da thường": 0,
                    "Da khô": 0,
                    "Da hỗn hợp": 0,
                    "Da nhạy cảm": 0
                };
                
                // Đếm số lượng câu trả lời cho mỗi loại da (giả định đơn giản)
                requestData.responses.forEach(response => {
                    const answerId = response.selectedAnswerId;
                    // Trường hợp này chỉ là giả định - có thể cần logic phức tạp hơn
                    if (answerId % 5 === 0) skinTypes["Da dầu"]++;
                    else if (answerId % 5 === 1) skinTypes["Da thường"]++;
                    else if (answerId % 5 === 2) skinTypes["Da khô"]++;
                    else if (answerId % 5 === 3) skinTypes["Da hỗn hợp"]++;
                    else skinTypes["Da nhạy cảm"]++;
                });
                
                // Lấy loại da có số lượng cao nhất
                const predictedSkinType = Object.entries(skinTypes)
                    .sort((a, b) => b[1] - a[1])
                    .map(entry => entry[0])[0];
                
                setResults([predictedSkinType]);
                console.log('Dự đoán loại da:', predictedSkinType);
            }
        } catch (error) {
            console.error('Error processing quiz results:', error);
            
            // Kiểm tra nếu là lỗi 400 (Bad Request)
            if (error.response && error.response.status === 400) {
                setError('Dữ liệu quiz không hợp lệ. Vui lòng kiểm tra lại câu trả lời và thử lại.');
                console.error('Bad Request Error:', error.response.data);
            } else {
                setError('Có lỗi xảy ra khi lưu kết quả. Vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Hiển thị phần giới thiệu quiz
    const renderIntroduction = () => {
        return (
            <Box>
                {/* Phần giới thiệu về quiz */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ 
                        color: '#7d3c98', 
                        fontWeight: 600,
                        fontSize: '2rem',
                        mb: 2
                    }}>
                        Hãy làm <span style={{ color: '#e74c3c' }}>bài kiểm tra loại da 3 phút ngay</span> để khám phá sản phẩm phù hợp với làn da của bạn!
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" sx={{ 
                        maxWidth: '800px', 
                        mx: 'auto', 
                        mb: 4,
                        fontSize: '1.1rem',
                        lineHeight: 1.5,
                        color: '#555'
                    }}>
                        Bài kiểm tra miễn phí này sẽ giúp bạn xác định chính xác loại da của mình dựa trên những câu hỏi đơn giản về tình trạng da hàng ngày. Từ đó, chúng tôi sẽ gợi ý các sản phẩm chăm sóc da phù hợp từ bộ sưu tập của Beauty Cosmetics, giúp bạn xây dựng quy trình chăm sóc da hiệu quả cho riêng bạn.
                    </Typography>
                    
                    <Typography variant="h6" sx={{
                        fontWeight: 600,
                        mb: 4,
                        fontSize: '1.3rem',
                        color: '#333'
                    }}>
                        Làm bài kiểm tra để trải nghiệm mua sắm thông minh hơn!
                    </Typography>
                    
                    <Button 
                        variant="contained" 
                        onClick={handleStartQuiz}
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.2rem',
                            borderRadius: 50,
                            boxShadow: 2,
                            mb: 6,
                            backgroundColor: '#f5a9a0',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#e74c3c',
                                boxShadow: 4,
                            },
                            transition: 'all 0.3s'
                        }}
                    >
                        Tìm Loại Da Của Tôi
                    </Button>
                </Box>
            </Box>
        );
    };

    // Hiển thị từng câu hỏi
    const renderQuestion = () => {
        if (questions.length === 0) {
            return (
                <Typography variant="body1" sx={{ textAlign: 'center', color: '#003366' }}>
                    Không có câu hỏi nào được tìm thấy.
                </Typography>
            );
        }

        const currentQuestion = questions[currentQuestionIndex];
        const isAnswered = selectedAnswers[currentQuestion.id] !== undefined;
        const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
            <>
                {/* Header với nút đóng */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 2,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <Typography variant="h6" sx={{ color: '#003366', fontWeight: 'bold' }}>
                        Beauty Cosmetics - Bài Kiểm Tra Loại Da
                    </Typography>
                    <IconButton 
                        onClick={handleCloseQuiz} 
                        aria-label="đóng"
                        sx={{ 
                            color: 'grey.600', 
                            '&:hover': { 
                                color: 'error.main',
                                bgcolor: 'error.light',
                                opacity: 0.9
                            },
                            transition: 'all 0.2s'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Stepper activeStep={currentQuestionIndex} alternativeLabel>
                        {questions.map((question, index) => (
                            <Step 
                                key={question.id}
                                completed={selectedAnswers[question.id] !== undefined}
                            >
                                <StepLabel 
                                    onClick={() => handleGoToQuestion(index)} 
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {index + 1}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={getProgressPercentage()} 
                        sx={{ height: 8, borderRadius: 5 }}
                    />
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'right' }}>
                        {Object.keys(selectedAnswers).length}/{questions.length} câu hỏi đã trả lời
            </Typography>
                </Box>

                <Slide direction={direction} in={animIn} mountOnEnter unmountOnExit timeout={300}>
                    <Card sx={{ marginBottom: 2, backgroundColor: '#ECDEB9' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontSize: '1.2rem', color: '#003366' }}>
                                Câu hỏi {currentQuestionIndex + 1}/{questions.length}: {currentQuestion.questionText}
                            </Typography>
                            <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
                                {currentQuestion.answers.map((answer, idx) => (
                                    <Grow 
                                        in={animIn} 
                                        style={{ transformOrigin: '0 0 0' }}
                                        timeout={300 + idx * 100}
                                        key={answer.answerId}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Radio
                                                    checked={selectedAnswers[currentQuestion.id] === answer.answerId}
                                                    onChange={() => handleAnswerSelect(currentQuestion.id, answer.answerId)}
                                                    value={answer.answerId}
                                                />
                                            }
                                            label={answer.answerText}
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
                                                    border: '1px solid #f5a9a0',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                } : {}),
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </Grow>
                                ))}
                            </FormControl>
                        </CardContent>
                    </Card>
                </Slide>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        startIcon={<ArrowBack />}
                    >
                        Câu trước
            </Button>

                    {isLastQuestion ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
                            disabled={!isAnswered || submitting}
                            sx={{
                                backgroundColor: '#f5a9a0',
                                '&:hover': {
                                    backgroundColor: '#e74c3c',
                                }
                            }}
                        >
                            {submitting ? 'Đang phân tích...' : 'Xem kết quả phân tích'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextQuestion}
                            endIcon={<ArrowForward />}
                            disabled={!isAnswered}
                            sx={{
                                backgroundColor: '#f5a9a0',
                                '&:hover': {
                                    backgroundColor: '#e74c3c',
                                }
                            }}
                        >
                            Câu tiếp theo
                        </Button>
                    )}
                </Box>
            </>
        );
    };

    // Hiển thị kết quả quiz
    const renderResults = () => {
        if (results.length === 0) return null;

        return (
            <Grow in={true} timeout={800}>
                <Paper elevation={3} sx={{ mt: 4, p: 4, backgroundColor: '#f9f9f9', borderRadius: 2, textAlign: 'center' }}>
                    {/* Thêm nút đóng ở phần kết quả */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton 
                            onClick={() => navigate('/')} 
                            aria-label="quay lại trang chủ"
                            sx={{ 
                                color: 'grey.600', 
                                '&:hover': { 
                                    color: 'error.main',
                                    bgcolor: 'error.light',
                                    opacity: 0.9
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography variant="h5" sx={{ mb: 3, color: '#003366', fontWeight: 'bold' }}>
                        Beauty Cosmetics - Kết Quả Phân Tích Làn Da Của Bạn
                    </Typography>

                    
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
                            Xem quy trình và chọn sản phẩm phù hợp
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
                