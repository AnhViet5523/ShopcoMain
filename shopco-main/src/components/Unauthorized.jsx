import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <Box 
      sx={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2e6', // Màu nền xanh nhạt như trong hình
        padding: 2
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          padding: 4, 
          borderRadius: 2,
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 70, color: '#d32f2f' }} />
          
          <Typography variant="h4" fontWeight="bold" color="error">
            Không có quyền truy cập
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản có quyền phù hợp hoặc liên hệ với quản trị viên để được hỗ trợ.
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              backgroundColor: '#4caf50', // Màu xanh lá
              '&:hover': { backgroundColor: '#388e3c' },
              padding: '10px 20px',
              borderRadius: '8px'
            }}
          >
            Quay về trang chủ
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;