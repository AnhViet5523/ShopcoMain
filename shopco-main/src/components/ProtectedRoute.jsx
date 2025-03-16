import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import userService from '../apis/userService';
import { Box, CircularProgress, Typography } from '@mui/material';

// Thêm prop requiredRole để xác định quyền cần thiết cho route
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Use a flag to prevent state updates if the component unmounts
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        const isAuth = userService.isAuthenticated();
        console.log('Is authenticated:', isAuth);
        
        if (isMounted) {
          if (isAuth) {
            // Đơn giản hóa logic xác thực để tránh lỗi
            setIsAuthenticated(true);
            
            // Lấy vai trò người dùng bằng hàm mới
            const role = userService.getUserRole();
            console.log("User role from userService.getUserRole():", role);
            
            // Lấy thông tin người dùng trực tiếp từ localStorage để debug
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const userData = JSON.parse(userStr);
                console.log('User data from localStorage:', userData);
                if (userData.role) {
                  console.log('Role from localStorage:', userData.role);
                }
              } catch (e) {
                console.error('Error parsing user data:', e);
              }
            }
            
            // Lấy role từ localStorage riêng để debug
            const debugRole = localStorage.getItem('user_role');
            console.log('Debug role from localStorage:', debugRole);
            
            setUserRole(role);
          } else {
            setIsAuthenticated(false);
            setUserRole(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Authentication check failed:', error);
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
        }
      }
    };

    checkAuth();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    // Hiển thị loading spinner cải tiến
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <CircularProgress color="primary" size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Đang xác thực...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Chuyển hướng về trang đăng nhập và lưu lại đường dẫn hiện tại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Debug logs để xác định vấn đề
  console.log("Required role:", requiredRole);
  console.log("User role:", userRole);
  
  // Sử dụng hàm hasRole để kiểm tra vai trò
  const hasRequiredRole = requiredRole ? userService.hasRole(requiredRole) : true;
  console.log("Has required role:", hasRequiredRole);
  
  // Kiểm tra role nếu có yêu cầu
  if (requiredRole && !hasRequiredRole) {
    console.log(`Quyền truy cập bị từ chối: Cần ${requiredRole}, nhưng người dùng có ${userRole}`);
    // Nếu không đủ quyền, chuyển hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu đã xác thực và có đủ quyền (hoặc không yêu cầu quyền), hiển thị nội dung của route
  return children;
};

export default ProtectedRoute;