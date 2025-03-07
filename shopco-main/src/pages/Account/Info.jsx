import Header from '../../components/Header';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Dialog,
  Link,
  Breadcrumbs,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import {
  Home,
  Person,
  Phone,
  Email,
  Facebook,
  Google,
  LocationOn,
  Edit,
  ExitToApp
} from '@mui/icons-material';
import Banner from '../../components/Banner';
import Footer from '../../components/Footer/Footer';
import userService from '../../apis/userService';

const Info = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    email: '',
    password: '********',
    confirmPassword: '',
    address: '',
  });

  const [open, setOpen] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState(userInfo);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = userService.getCurrentUser();
        if (!currentUser || !currentUser.userId) {
          navigate('/login');
          return;
        }

        console.log('Fetching profile for userId:', currentUser.userId);
        const response = await userService.getUserProfile(currentUser.userId);
        console.log('API response:', response.data);
        
        setUserInfo({
          name: response.data.name || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          password: '********',
          confirmPassword: '',
          address: response.data.address || '',
        });
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    userService.logout();
    window.location.href = "/";
  };

  const handleOpenDialog = () => {
    setUpdatedInfo(userInfo);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSave = () => {
    setUserInfo(updatedInfo);
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const menuItems = [
    { text: 'Thông tin tài khoản', icon: <Person />, active: true, action: () => navigate('/account') },
    { text: 'Đơn hàng của tôi', icon: <Phone />, active: false, action: () => navigate('/orders') },
    { text: 'Hỏi đáp', icon: <Email /> },
    { text: 'Đăng xuất', icon: <ExitToApp />, action: handleLogout },
  ];

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <Header />
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, ml: 10}}>
        <Link underline="hover" color="inherit" href="/" display="flex" alignItems="center">
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Typography color="text.primary">Tài khoản</Typography>
      </Breadcrumbs>
      <Banner />
      
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#f5f5f5", textAlign: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                <Avatar src="/path-to-avatar.jpg" sx={{ width: 50, height: 50, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">Chào bạn!</Typography>
              </Box>
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    key={item.text}
                    button
                    onClick={item.action ? item.action : null}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: item.active ? '#e3f2fd' : 'transparent',
                      '&:hover': { bgcolor: '#e3f2fd' },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper elevation={0} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                THÔNG TIN TÀI KHOẢN
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Thông tin cá nhân
                  </Typography>
                  <TextField 
                    fullWidth 
                    label="Họ và tên" 
                    name="name" 
                    value={updatedInfo.name} 
                    onChange={handleChange} 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    fullWidth 
                    label="Số điện thoại" 
                    name="phone" 
                    value={updatedInfo.phone} 
                    onChange={handleChange} 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    fullWidth 
                    label="Email" 
                    name="email" 
                    value={updatedInfo.email} 
                    onChange={handleChange} 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Đổi mật khẩu
                  </Typography>
                  <TextField 
                    fullWidth 
                    label="Mật khẩu mới" 
                    name="password" 
                    type="password" 
                    value={updatedInfo.password} 
                    onChange={handleChange} 
                    margin="dense" 
                    sx={{ mb: 2 }}
                  />
                  <TextField 
                    fullWidth 
                    label="Xác nhận mật khẩu mới" 
                    name="confirmPassword" 
                    type="password" 
                    value={updatedInfo.confirmPassword} 
                    onChange={handleChange} 
                    margin="dense" 
                    sx={{ mb: 2 }}
                    error={updatedInfo.password !== updatedInfo.confirmPassword && updatedInfo.confirmPassword !== ''}
                    helperText={updatedInfo.password !== updatedInfo.confirmPassword && updatedInfo.confirmPassword !== '' ? "Mật khẩu xác nhận không khớp" : ""}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Địa chỉ
                  </Typography>
                  <TextField 
                    fullWidth 
                    label="Địa chỉ" 
                    name="address" 
                    value={updatedInfo.address} 
                    onChange={handleChange} 
                    margin="dense" 
                    multiline
                    rows={3}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Liên kết mạng xã hội
                  </Typography>
                  <Button startIcon={<Facebook />} variant="outlined" sx={{ mr: 2, mb: 2 }}>
                    Facebook
                  </Button>
                  <Button startIcon={<Google />} variant="outlined" sx={{ mb: 2 }}>
                    Google
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenDialog}
                    startIcon={<Edit />}
                    sx={{ mb: 3 }}
                  >
                    Cập nhật thông tin
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Xác nhận cập nhật</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn cập nhật thông tin không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Hủy</Button>
          <Button onClick={handleSave} color="primary" variant="contained">Xác nhận</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Info;
