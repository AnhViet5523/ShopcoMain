import { 
  AccountCircle, ShoppingCart, Search, Edit, Phone, 
  Person, ShoppingBag, HeadsetMic, ExitToApp 
} from "@mui/icons-material";
import {
  AppBar, IconButton, InputBase, Toolbar, Typography, 
  Box, Badge, Avatar, Button, Container, Paper, Divider, 
  Menu, MenuItem
} from "@mui/material";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  
  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    console.log("Searching:", searchValue);
    
    // Chuyển hướng đến trang tìm kiếm với từ khóa
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

  return (
    <>
      {/* Announcement Bar */}
      <Box sx={{ bgcolor: "black", color: "white", py: 1 }}>
        <Container>
          <Typography variant="body2" align="center">
            Miễn phí vận chuyển cho đơn hàng trên 500K
          </Typography>
        </Container>
      </Box>

      <AppBar position="static" sx={{ bgcolor: "white", color: "black", boxShadow: "none" }}>
        <Container maxWidth="xl">
          {/* Main Toolbar */}
          <Toolbar sx={{ py: 2, gap: 2 }}>
            {/* Logo */}
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

            {/* Search Bar */}
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

            {/* Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {/* Quiz Button */}
              <Button
                startIcon={<Edit />}
                sx={{
                  color: "text.primary",
                  "&:hover": { bgcolor: "action.hover" }
                }}
                onClick={handleClickOpen}
              >
                Quiz
              </Button>

              {/* Support */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton color="inherit" onClick={() => navigate("/customer-support")}>
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

              {/* Cart */}
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* Account */}
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
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        handleAccountMenuClose();
                        navigate(item.path);
                      }
                    }}
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

          {/* Navigation component */}
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
