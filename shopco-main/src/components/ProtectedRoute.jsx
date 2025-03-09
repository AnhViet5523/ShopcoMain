import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import userService from '../apis/userService';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        const isAuth = userService.isAuthenticated();
        
        if (isAuth) {
          // Đơn giản hóa logic xác thực để tránh lỗi
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    // Hiển thị loading spinner hoặc thông báo đang tải
    return <div>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    // Chuyển hướng về trang đăng nhập và lưu lại đường dẫn hiện tại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã xác thực, hiển thị nội dung của route
  return children;
};

export default ProtectedRoute; 