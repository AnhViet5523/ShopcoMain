import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import Header from '../components/Header';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import orderService from '../apis/orderService';

function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orderStatus, setOrderStatus] = useState(null);
    const [error, setError] = useState(null);

    // Lấy orderId từ localStorage hoặc từ URL params
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    const searchParams = new URLSearchParams(location.search);
    const vnp_OrderInfo = searchParams.get('vnp_OrderInfo');
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    
    // Trích xuất orderId từ vnp_OrderInfo nếu có
    const orderIdFromVnpay = vnp_OrderInfo && vnp_OrderInfo.includes('_') 
        ? vnp_OrderInfo.split('_')[1] 
        : null;
        
    const orderId = pendingOrderId || orderIdFromVnpay;

    useEffect(() => {
        async function checkOrderStatus() {
            try {
                // Nếu có orderId, kiểm tra trạng thái từ database
                if (orderId) {
                    const orderData = await orderService.getOrderById(orderId);
                    console.log("Trạng thái đơn hàng từ database:", orderData);
                    
                    if (orderData && orderData.orderStatus === 'Paid') {
                        setOrderStatus('success');
                        // Xóa giỏ hàng và pendingOrderId
                        localStorage.setItem('cart', JSON.stringify([]));
                        localStorage.removeItem('pendingOrderId');
                    } else {
                        setOrderStatus('error');
                    }
                } else {
                    // Nếu không có orderId, dựa vào vnp_ResponseCode
                    setOrderStatus(vnp_ResponseCode === '00' ? 'success' : 'error');
                }
            } catch (err) {
                console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", err);
                // Nếu không gọi được API, dựa vào vnp_ResponseCode
                setOrderStatus(vnp_ResponseCode === '00' ? 'success' : 'error');
                setError("Không thể kết nối đến server. Vui lòng kiểm tra lại đơn hàng của bạn.");
            } finally {
                setLoading(false);
            }
        }
        
        // Chờ một chút để UX tốt hơn
        const timer = setTimeout(() => {
            checkOrderStatus();
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [orderId, vnp_ResponseCode]);

    const handleContinueShopping = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: '100vw' }}>
                <Header />
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '70vh' 
                }}>
                    <CircularProgress sx={{ mb: 2 }} />
                    <Typography>Đang xử lý kết quả thanh toán...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: '100vw' }}>
            <Header />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '70vh',
                padding: '0 20px'
            }}> 
                {orderStatus === 'success' ? (
                    <CheckCircleOutlineIcon 
                        sx={{ 
                            fontSize: 80, 
                            color: 'darkgreen',
                            mb: 2
                        }}
                    />
                ) : (
                    <ErrorOutlineIcon 
                        sx={{ 
                            fontSize: 80, 
                            color: 'red',
                            mb: 2
                        }}
                    />
                )}
                
                <Typography 
                    variant="h4" 
                    sx={{ 
                        mb: 3, 
                        color: orderStatus === 'success' ? 'darkgreen' : 'red',
                        textAlign: 'center'
                    }}
                >
                    {orderStatus === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}
                </Typography>
                
                {error && (
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: 3,
                            textAlign: 'center',
                            maxWidth: '600px',
                            color: 'orange'
                        }}
                    >
                        {error}
                    </Typography>
                )}
                
                {orderStatus !== 'success' && (
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            mb: 3,
                            textAlign: 'center',
                            maxWidth: '600px'
                        }}
                    >
                        Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                    </Typography>
                )}
                
                <Button 
                    variant="contained" 
                    onClick={handleContinueShopping}
                    sx={{ 
                        backgroundColor: 'darkgreen', 
                        color: 'white', 
                        fontWeight: 'bold',
                        padding: '10px 24px',
                        fontSize: '16px',
                        '&:hover': {
                            backgroundColor: '#005000',
                        }
                    }}
                >
                    {orderStatus === 'success' ? 'Tiếp tục mua sắm' : 'Quay lại trang chủ'}
                </Button>
            </Box>
        </Box>
    );
}

export default PaymentResult;