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
        
        if (isMounted) {
          if (isAuth) {
            // Đơn giản hóa logic xác thực để tránh lỗi
            setIsAuthenticated(true);
            
            // Lấy thông tin role của người dùng từ localStorage hoặc từ service
            const userData = userService.getCurrentUser();
            console.log("User data from ProtectedRoute:", userData);
            
            if (userData && userData.role) {
              // Chuyển đổi role thành chuỗi và chuẩn hóa để so sánh nhất quán
              setUserRole(String(userData.role).trim());
            }
          } else {
            setIsAuthenticated(false);
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Authentication check failed:', error);
          setIsAuthenticated(false);
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
  console.log("Role match comparison:", userRole === requiredRole);
  
  // Kiểm tra role nếu có yêu cầu - cải thiện so sánh để không phân biệt chữ hoa/thường
  if (requiredRole && String(userRole).toLowerCase() !== String(requiredRole).toLowerCase()) {
    console.log(`Quyền truy cập bị từ chối: Cần ${requiredRole}, nhưng người dùng có ${userRole}`);
    // Nếu không đủ quyền, chuyển hướng đến trang không có quyền truy cập
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu đã xác thực và có đủ quyền (hoặc không yêu cầu quyền), hiển thị nội dung của route
  return children;
};

export default ProtectedRoute;