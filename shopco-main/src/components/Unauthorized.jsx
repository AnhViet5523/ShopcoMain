import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import userService from '../apis/userService';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Lấy thông tin vai trò người dùng để hiển thị
    const role = userService.getUserRole();
    setUserRole(role);
    
    // Log thông tin debug
    console.log("User role in Unauthorized page:", role);
    console.log("Location state:", location.state);
  }, [location]);
  
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
          
          <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
            Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập với tài khoản có quyền phù hợp hoặc liên hệ với quản trị viên để được hỗ trợ.
          </Typography>
          
          {userRole && (
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Vai trò hiện tại của bạn: <strong>{userRole}</strong>
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
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
            
            <Button 
              variant="outlined"
              onClick={() => {
                userService.logout();
                navigate('/login');
              }}
              sx={{ 
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': { borderColor: '#d32f2f', color: '#d32f2f' },
                padding: '10px 20px',
                borderRadius: '8px'
              }}
            >
              Đăng xuất
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;