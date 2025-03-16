import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import Header from '../components/Header';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const success = location.state?.success || false;
  const error = location.state?.error || '';

  return (
    <Box sx={{ bgcolor: "#fff176", minHeight: "100vh", width: '100vw' }}>
      <Header />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        {success ? (
          <>
            <Typography variant="h4" sx={{ mb: 3, color: 'darkgreen' }}>Thanh toán thành công!</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn sẽ sớm được xử lý.</Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ mb: 3, color: 'red' }}>Thanh toán không thành công!</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>{error}</Typography>
          </>
        )}
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ 
            backgroundColor: 'darkgreen', 
            color: 'white', 
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#005000',
            }
          }}
        >
          Tiếp tục mua sắm
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentResult;