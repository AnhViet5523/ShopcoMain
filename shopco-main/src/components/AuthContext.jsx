import { createContext, useState, useContext, useEffect } from 'react';
import userService from '../apis/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Kiểm tra nếu người dùng đã đăng nhập khi tải trang
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = userService.isAuthenticated();
        
        if (isAuth) {
          // Lấy thông tin người dùng từ localStorage
          const userData = userService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        // Xóa thông tin người dùng nếu có lỗi
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Lắng nghe sự kiện thay đổi localStorage
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Hàm đăng nhập
  const login = async (userData) => {
    try {
      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      
      // Tạo event để thông báo cho các tab khác biết người dùng đã đăng nhập
      window.dispatchEvent(new Event('storage'));
      
      return {success: true, role: userData.role};
    } catch (error) {
      console.error('Login error:', error);
      return {success: false, error};
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // Tạo event để thông báo cho các tab khác biết người dùng đã đăng xuất
    window.dispatchEvent(new Event('storage'));
  };

  // Kiểm tra xem người dùng có vai trò cụ thể hay không
  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};