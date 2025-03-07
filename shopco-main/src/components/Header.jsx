import { 
  AccountCircle, ShoppingCart, Search, Edit, Phone, 
  Person, ShoppingBag, HeadsetMic, ExitToApp 
} from "@mui/icons-material";
import {
  AppBar, IconButton, InputBase, Toolbar, Typography, 
  Box, Badge, Avatar, Button, Container, Paper, Divider, 
  Menu, MenuItem
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import QuizTest from '../pages/Quiz/QuizTest';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const Header = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [open, setOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(count);
    };

    // Initial count
    updateCartCount();

    // Listen for storage events to update count when cart changes
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for when cart is updated within the same window
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    console.log("Searching:", searchValue);
    
    if (searchValue.trim()) {
        navigate(`/search?name=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleAccountMenuOpen = (event) => setAccountMenuAnchor(event.currentTarget);
  const handleAccountMenuClose = () => setAccountMenuAnchor(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    handleAccountMenuClose();
    window.location.href = "/";
  };

  const accountMenuItems = [
    { icon: <Person fontSize="small" />, text: "Thông tin tài khoản", path: "/account" },
    { icon: <ShoppingBag fontSize="small" />, text: "Đơn hàng của tôi", path: "/orders" },
    { icon: <HeadsetMic fontSize="small" />, text: "Hỗ trợ", path: "/support" },
    { 
      icon: <ExitToApp fontSize="small" />, 
      text: "Đăng xuất", 
      onClick: handleLogout
    }
  ];

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleQuizClick = () => {
    handleClickOpen();
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleSupportClick = () => {
    navigate("/customer-support");
  };

  const handleAccountMenuItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
      handleAccountMenuClose();
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
              <Button
                startIcon={<Edit />}
                sx={{
                  color: "text.primary",
                  "&:hover": { bgcolor: "action.hover" }
                }}
                onClick={handleQuizClick}
              >
                Quiz
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

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Quiz</DialogTitle>
        <DialogContent>
          <QuizTest />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
