import { 
  AccountCircle, ShoppingCart, Search, Edit, Phone, 
  Person, ShoppingBag, HeadsetMic, ExitToApp, Dashboard as DashboardIcon
} from "@mui/icons-material";
import {
  AppBar, IconButton, InputBase, Toolbar, Typography, 
  Box, Badge, Avatar, Button, Container, Paper, Divider, 
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import orderService from '../apis/orderService';


const Header = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const isMounted = useRef(true);
  const [userRole, setUserRole] = useState(null);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState('');

  // Update cart count from orderService
  useEffect(() => {
    // Mark component as mounted
    isMounted.current = true;
    
    const updateCartCount = async () => {
      try {
        console.log("Cập nhật số lượng sản phẩm trong giỏ hàng...");
        // Get user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user && user.userId) {
          console.log(`Người dùng đã đăng nhập với ID: ${user.userId}`);
          // Fetch current cart directly using getCurrentCart
          const response = await orderService.getCurrentCart(user.userId);
          console.log("Phản hồi từ API giỏ hàng:", response);
          
          if (response && response.items && response.items.$values) {
            // Calculate total quantity from order items
            const count = response.items.$values.reduce(
              (total, item) => total + item.quantity, 0
            );
            console.log(`Tổng số lượng sản phẩm trong giỏ hàng: ${count}`);
            
            if (isMounted.current) {
              setCartItemCount(count);
              // Lưu giá trị vào localStorage để tránh mất khi reload
              localStorage.setItem('cartItemCount', count.toString());
            }
          } else {
            console.log("Không tìm thấy sản phẩm trong giỏ hàng từ API");
            if (isMounted.current) {
              setCartItemCount(0);
              localStorage.setItem('cartItemCount', '0');
            }
          }
        } else {
          console.log("Người dùng chưa đăng nhập, sử dụng localStorage");
          // Fallback to localStorage for non-authenticated users
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          const count = cart.reduce((total, item) => total + item.quantity, 0);
          console.log(`Tổng số lượng sản phẩm trong localStorage: ${count}`);
          
          if (isMounted.current) {
            setCartItemCount(count);
            localStorage.setItem('cartItemCount', count.toString());
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin giỏ hàng:', error);
        // Fallback to localStorage on error
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        console.log(`Lỗi xảy ra, sử dụng localStorage với số lượng: ${count}`);
        
        if (isMounted.current) {
          setCartItemCount(count);
          localStorage.setItem('cartItemCount', count.toString());
        }
      }
    };

    // Initial count
    updateCartCount();

    // Listen for storage events to update count when cart changes
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for when cart is updated within the same window
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Cleanup function to remove event listeners
    return () => {
      isMounted.current = false;
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);

  }, []);

  // Thêm useEffect để lấy vai trò người dùng từ localStorage
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const role = localStorage.getItem('user_role');
        if (user && (role === 'manager' || role === 'staff' || role === 'Manager' || role === 'Staff')) {
          setUserRole(role.toLowerCase());
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setUserRole(null);
      }
    };

    checkUserRole();
    // Kiểm tra lại vai trò khi component được mount
    window.addEventListener('storage', checkUserRole);
    
    return () => {
      window.removeEventListener('storage', checkUserRole);
    };
  }, []);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    console.log("Searching:", searchValue);
    
    if (searchValue.trim()) {
        navigate(`/search?name=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleAccountMenuOpen = (event) => {
    if (isAuthenticated) {
      setAccountMenuAnchor(event.currentTarget);
    } else {
      showAuthRequiredDialog("tài khoản");
    }
  };

  const handleAccountMenuClose = () => setAccountMenuAnchor(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    handleAccountMenuClose();
    window.location.href = "/";
  };

  const accountMenuItems = [
    { icon: <Person fontSize="small" />, text: "Thông tin tài khoản", path: "/account" },
    { icon: <ShoppingBag fontSize="small" />, text: "Đơn hàng của tôi", path: "/orders" },
    { icon: <HeadsetMic fontSize="small" />, text: "Hỏi đáp", path: "/support" },
    { 
      icon: <ExitToApp fontSize="small" />, 
      text: "Đăng xuất", 
      onClick: handleLogout
    }
  ];

  // Hàm mới để hiển thị dialog yêu cầu đăng nhập
  const showAuthRequiredDialog = (feature) => {
    setAuthDialogMessage(`Bạn cần đăng nhập để sử dụng ${feature}`);
    setOpenAuthDialog(true);
  };

  // Đóng dialog yêu cầu đăng nhập
  const handleAuthDialogClose = () => {
    setOpenAuthDialog(false);
  };

  // Chuyển hướng đến trang đăng nhập
  const handleGoToLogin = () => {
    setOpenAuthDialog(false);
    navigate("/login");
  };

  const handleQuizClick = () => {
    if (isAuthenticated) {
      navigate("/quiz");
    } else {
      showAuthRequiredDialog("tính năng Quiz");
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate("/cart");
    } else {
      showAuthRequiredDialog("giỏ hàng");
    }
  };

  const handleSupportClick = () => {
    if (isAuthenticated) {
      navigate("/customer-support");
    } else {
      showAuthRequiredDialog("hỗ trợ khách hàng");
    }
  };

  const handleAccountMenuItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
      handleAccountMenuClose();
    }
  };

  // Thêm hàm xử lý khi bấm vào nút Dashboard
  const handleDashboardClick = () => {
    if (!userRole) {
      // Nếu không có vai trò, hiển thị dialog yêu cầu đăng nhập
      showAuthRequiredDialog('dashboard');
      return;
    }

    // Chuyển hướng dựa vào vai trò
    if (userRole === 'manager') {
      navigate('/product'); // Chuyển đến trang quản lý sản phẩm của Manager
    } else if (userRole === 'staff') {
      navigate('/productStaff'); // Chuyển đến trang quản lý sản phẩm của Staff
    }
  };

  return (
    <>
      <Box sx={{ bgcolor: "black", color: "white", py: 1 }}>
        <Container>
          <Typography variant="body2" align="center">
            Miễn phí vận chuyển cho đơn hàng trên 500K
          </Typography>
        </Container>
      </Box>

      <AppBar position="static" sx={{ bgcolor: "white", color: "black", boxShadow: "none" }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 2, gap: 2 }}>
            <Box sx={{ flexShrink: 0 }}>
              <IconButton onClick={() => navigate("/")} sx={{ p: 0 }}>
                <Avatar
                  alt="LOGO"
                  src="/images/logo.png"
                  variant="square"
                  sx={{ width: 90, height: 90, borderRadius: 100 }}
                />
              </IconButton>
            </Box>

            <Paper
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                mx: 4,
                px: 2,
                py: 0.5,
                borderRadius: 2,
                bgcolor: "#f5f5f5"
              }}
            >
              <InputBase
                placeholder="Tìm kiếm sản phẩm..."
                sx={{ flex: 1, ml: 1 }}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <IconButton type="submit" sx={{ p: "10px" }}>
                <Search />
              </IconButton>
            </Paper>

            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Thêm nút Dashboard nếu người dùng là manager hoặc staff */}
              {userRole && (
                <Button
                  startIcon={<DashboardIcon />}
                  sx={{
                    color: "text.primary",
                    "&:hover": { bgcolor: "action.hover" }
                  }}
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </Button>
              )}

              <Button
                startIcon={<Edit />}
                sx={{
                  color: "text.primary",
                  "&:hover": { bgcolor: "action.hover" }
                }}
                onClick={handleQuizClick}
              >
                Kiểm tra loại da
              </Button>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton color="inherit" onClick={handleSupportClick}>
                  <Phone />
                </IconButton>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hỗ trợ khách hàng
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    0956497123
                  </Typography>
                </Box>
              </Box>

              <IconButton color="inherit" onClick={handleCartClick}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              <Button
                startIcon={<AccountCircle />}
                sx={{ color: "text.primary", "&:hover": { bgcolor: "action.hover" } }}
                onClick={handleAccountMenuOpen}
              >
                Tài khoản
              </Button>

              <Menu
                anchorEl={accountMenuAnchor}
                open={Boolean(accountMenuAnchor)}
                onClose={handleAccountMenuClose}
                PaperProps={{
                  sx: { width: 200, mt: 1 }
                }}
              >
                {accountMenuItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    onClick={() => handleAccountMenuItemClick(item)}
                    sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}
                  >
                    {item.icon}
                    <Typography>{item.text}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>

          <Divider />

          <Navigation />
        </Container>
      </AppBar>

      {/* Dialog yêu cầu đăng nhập mới */}
      <Dialog open={openAuthDialog} onClose={handleAuthDialogClose}>
        <DialogTitle>Yêu cầu đăng nhập</DialogTitle>
        <DialogContent>
          <Typography>{authDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAuthDialogClose} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleGoToLogin} 
            color="primary" 
            variant="contained"
            autoFocus
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
