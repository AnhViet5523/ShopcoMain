import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
    setLoading(false);
  }, []);
  
  if (loading) {
    // Có thể hiển thị loading spinner ở đây
    return <div>Đang tải...</div>;
  }
  
  if (!isAuthenticated) {
    // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute; 