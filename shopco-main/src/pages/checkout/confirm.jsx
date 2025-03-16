import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import Footer from '../../components/Footer/Footer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

function VnpayReturn() {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        // Lấy thông tin từ URL
        const urlParams = new URLSearchParams(location.search);
        const vnp_OrderInfo = urlParams.get('vnp_OrderInfo');
        const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
        
        // Trích xuất orderId từ vnp_OrderInfo
        const extractedOrderId = vnp_OrderInfo ? vnp_OrderInfo.split('_')[1] : null;
        setOrderId(extractedOrderId);
        
        // Kiểm tra mã trạng thái
        if (vnp_ResponseCode === '00') {
            setPaymentStatus('Giao dịch thành công!');
            localStorage.setItem('cart', JSON.stringify([]));
            localStorage.removeItem('pendingOrderId');
        } else {
            setPaymentStatus('Giao dịch không thành công. Vui lòng thử lại.');
        }
        
        setLoading(false);
    }, [location]);

    const handleRetryPayment = () => {
        // Quay lại trang checkout với orderId
        if (orderId) {
            navigate(`/checkout?orderId=${orderId}`);
        } else {
            navigate('/cart');
        }
    };

    const handleContinueShopping = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Header />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 6, 
                bgcolor: 'white', 
                borderRadius: 1,
                my: 10,
                mx: 'auto',
                maxWidth: '600px'
            }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'gray.800' }}>
                    Kết quả thanh toán
                </Typography>
                <Typography 
                    variant="h5" 
                    sx={{ 
                        color: paymentStatus === 'Giao dịch thành công!' ? 'green' : 'red',
                        mb: 2 
                    }}
                >
                    {paymentStatus}
                </Typography>
                {paymentStatus !== 'Giao dịch thành công!' && (
                    <Button 
                        onClick={handleRetryPayment}
                        variant="contained"
                        sx={{ 
                            mt: 4, 
                            mr: 2, 
                            bgcolor: 'red.500',
                            '&:hover': { bgcolor: 'red.600' }
                        }}
                    >
                        Thử lại thanh toán
                    </Button>
                )}
                <Button 
                    onClick={handleContinueShopping}
                    variant="contained"
                    sx={{ 
                        mt: paymentStatus === 'Giao dịch thành công!' ? 4 : 0, 
                        bgcolor: 'blue.500',
                        '&:hover': { bgcolor: 'blue.600' }
                    }}
                >
                    Tiếp tục mua sắm
                </Button>
            </Box>
            <Footer />
        </>
    );
}

export default VnpayReturn;