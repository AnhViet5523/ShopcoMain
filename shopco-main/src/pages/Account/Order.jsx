import { Box, Button, Container, Typography, Tabs, Tab, Grid, Paper, Avatar, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Divider, Chip, Link, Breadcrumbs, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Person, Phone, ExitToApp, ShoppingBag, Headset } from "@mui/icons-material";
import Banner from "../../components/Banner";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header";
import userService from "../../apis/userService";
import orderService from "../../apis/orderService";

const Order = () => {
  const [tabIndex, setTabIndex] = useState(0);  
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    const fetchUserName = () => {
      try {
        const currentUser = userService.getCurrentUser();
        if (currentUser && currentUser.name) {
          setUserName(currentUser.name);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const currentUser = userService.getCurrentUser();
        
        if (!currentUser || !currentUser.userId) {
          setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
          setLoading(false);
          return;
        }
        
        const userId = currentUser.userId;
        const orderHistory = await orderService.getOrderHistory(userId);
        
        setOrders(orderHistory);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    { 
      text: "Thông tin tài khoản", 
      icon: <Person />, 
      active: false,
      action: () => navigate("/account") 
    },
    { 
      text: "Đơn hàng của tôi", 
      icon: <ShoppingBag />,
      active: true,
      action: () => navigate("/orders") 
    },
    { 
      text: "Hỏi đáp", 
      icon: <Headset />, 
      active: false,
      action: () => navigate("/support")
    },
    { 
      text: "Đăng xuất", 
      icon: <ExitToApp />, 
      active: false,
      action: handleLogout 
    },
  ];

  // Hàm định dạng ngày giờ
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm định dạng số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Hàm render trạng thái đơn hàng
  const renderOrderStatus = (status) => {
    let color = '';
    switch (status) {
      case 'Pending':
        color = 'warning';
        status = 'Đang xử lý';
        break;
      case 'Paid':
        color = 'success';
        status = 'Đã thanh toán';
        break;
      case 'Completed':
        color = 'info';
        status = 'Đã giao hàng';
        break;
      case 'Cancelled':
        color = 'error';
        status = 'Đã hủy';
        break;
      case 'Cancelling':
        color = 'error';
        status = 'Đang hủy';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} size="small" />;
  };

  // Hàm lọc đơn hàng theo tab đang chọn
  const getFilteredOrders = () => {
    if (tabIndex === 0) {
      // Tab "Tất cả" - hiển thị toàn bộ đơn hàng
      return orders;
    } else if (tabIndex === 1) {
      // Tab "Đang xử lý" - chỉ hiển thị đơn hàng trạng thái Pending hoặc Cancelling
      return orders.filter(order => order.orderStatus === 'Pending' || order.orderStatus === 'Cancelling');
    } else if (tabIndex === 2) {
      // Tab "Đang vận chuyển" - hiển thị đơn hàng có trạng thái Paid
      return orders.filter(order => order.orderStatus === 'Paid');
    } else if (tabIndex === 3) {
      // Tab "Đã giao" - hiển thị đơn hàng có trạng thái Completed
      return orders.filter(order => order.orderStatus === 'Completed');
    } else if (tabIndex === 4) {
      // Tab "Đã hủy" - hiển thị đơn hàng có trạng thái Cancelled
      return orders.filter(order => order.orderStatus === 'Cancelled');
    }
    return orders;
  };

  const handleCancelOrder = async (orderId) => {
    try {
      // Gọi API hủy đơn hàng
      await userService.requestCancelOrder(orderId);
      const updatedOrders = orders.filter(order => order.orderId !== orderId);
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      setError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    }
  };

  const handleOpenDialog = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFullName('');
    setPhone('');
    setReason('');
    setCancelError(null);
  };

  const handleSubmitCancelRequest = async () => {
    try {
      setCancelError(null);
      const requestDate = new Date().toISOString();
      await userService.requestCancelOrder({
        orderId: selectedOrderId,
        fullName,
        phone,
        reason,
        requestDate
      });
      
      // Cập nhật trạng thái đơn hàng thành 'Cancelling' thay vì loại bỏ khỏi danh sách
      const updatedOrders = orders.map(order => 
        order.orderId === selectedOrderId 
          ? { ...order, orderStatus: 'Cancelling' } 
          : order
      );
      setOrders(updatedOrders);
      handleCloseDialog();
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.error || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.';
        setCancelError(errorMessage);
      } else {
        setCancelError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
      }
    }
  };

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
                      <Typography variant="subtitle1" fontWeight="bold">
                        {userName ? `Chào ${userName}!` : 'Chào bạn!'}
                      </Typography>
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
       
            <Grid item xs={12} md={9} sx={{ display: "flex", flexDirection: "column" }}>
             <Paper elevation={0} sx={{ flexGrow: 1, p: 3, bgcolor: "white" }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ĐƠN HÀNG CỦA TÔI
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mb: 3 }}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ bgcolor: "white", color: "black", borderRadius: 2 }}
                  TabIndicatorProps={{ style: { backgroundColor: "#FF6600" } }}
                >
                  <Tab label="Tất cả" sx={{ color: "black" }} />
                  <Tab label="Đang xử lý" sx={{ color: "black" }} />
                  <Tab label="Đang vận chuyển" sx={{ color: "black" }} />
                  <Tab label="Đã giao" sx={{ color: "black" }} />
                  <Tab label="Đã hủy" sx={{ color: "black" }} />
                </Tabs>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                    {error}
                  </Typography>
                  <Button variant="contained" color="success" size="large" onClick={() => navigate('/')}>
                    Tiếp tục mua sắm
                  </Button>
                </Box>
              ) : orders.length === 0 ? (
                <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography color="black" variant="h6" sx={{ mb: 2 }}>
                    Bạn chưa có đơn hàng nào
                  </Typography>
                  <Button variant="contained" color="success" size="large" onClick={() => navigate('/')}>
                    Tiếp tục mua sắm
                  </Button>
                </Box>
              ) : (
                // Hiển thị danh sách đơn hàng đã được lọc
                <Box>
                  {getFilteredOrders().length > 0 ? (
                    getFilteredOrders().map((order) => (
                      <Paper 
                        key={order.orderId} 
                        sx={{ 
                          mb: 3, 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.13)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          bgcolor: '#f8f8f8',
                          p: 2,
                          borderBottom: '1px solid #eee'
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Đơn hàng #{order.orderId}
                          </Typography>
                          {renderOrderStatus(order.orderStatus)}
                        </Box>
                        
                        <Box sx={{ p: 2.5 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  <strong>Ngày đặt:</strong> {formatDate(order.orderDate)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {order.deliveryStatus && (
                                    <><strong>Trạng thái:</strong> {order.deliveryStatus === 'Not Delivered' ? 'Chưa giao' : order.deliveryStatus === 'Delivered' ? 'Đã giao' : order.deliveryStatus}</>
                                  )}
                                </Typography>
                              </Box>
                              
                              <Divider sx={{ my: 1.5 }} />
                              
                              <Box sx={{ my: 1.5 }}>
                                {order.orderItems && order.orderItems.$values && order.orderItems.$values.length > 0 ? (
                                  order.orderItems.$values.map((item, index) => (
                                    <Box 
                                      key={index} 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        py: 1.5, 
                                        borderBottom: index < order.orderItems.$values.length - 1 ? '1px dashed #f0f0f0' : 'none',
                                        '&:hover': {
                                          bgcolor: '#fafafa'
                                        }
                                      }}
                                    >
                                      <Box 
                                        sx={{ 
                                          width: 40, 
                                          height: 40, 
                                          bgcolor: '#f5f5f5', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center',
                                          borderRadius: 1,
                                          mr: 2
                                        }}
                                      >
                                        <ShoppingBag fontSize="small" sx={{ color: '#FF6600', opacity: 0.7 }} />
                                      </Box>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          flexGrow: 1,
                                          mr: 2,
                                          fontWeight: 500,
                                          color: '#333'
                                        }}
                                      >
                                        {item.productName}
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          color: '#FF6600', 
                                          fontWeight: 500, 
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        x{item.quantity}
                                      </Typography>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                    Không có thông tin sản phẩm
                                  </Typography>
                                )}
                              </Box>
                              
                              <Divider sx={{ my: 1.5 }} />
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                                {order.voucherId && (
                                  <Typography variant="body2" sx={{ color: '#388e3c', fontWeight: 500 }}>
                                    <strong>Mã voucher:</strong> #{order.voucherId}
                                  </Typography>
                                )}
                                <Typography variant="subtitle1" sx={{ color: '#FF6600', fontWeight: 'bold', ml: 'auto' }}>
                                  {formatCurrency(order.totalAmount)}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  Trạng thái: {renderOrderStatus(order.orderStatus)}
                                  {order.orderStatus === 'Cancelling' && (
                                    <Chip 
                                      label="Đang chờ xác nhận hủy" 
                                      size="small" 
                                      color="warning" 
                                      sx={{ ml: 1, fontSize: '0.7rem' }} 
                                    />
                                  )}
                                </Typography>
                              </Box>

                              {tabIndex === 2 && ( // Chỉ hiển thị nút "Hủy" trong tab "Đang vận chuyển"
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                  <Button 
                                    variant="outlined" 
                                    color="error" 
                                    size="small" 
                                    onClick={() => handleOpenDialog(order.orderId)}
                                  >
                                    Hủy
                                  </Button>
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Typography color="text.secondary" variant="h6" sx={{ mb: 2 }}>
                        Không có đơn hàng nào trong danh mục này
                      </Typography>
                      <Button variant="contained" color="success" size="large" onClick={() => navigate('/')}>
                        Tiếp tục mua sắm
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid >
      </Container>
      <Footer />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title" sx={{ bgcolor: '#f5f5f5', color: '#333', fontWeight: 'bold' }}>
          {"Hủy đơn hàng"}
        </DialogTitle>
        <DialogContent>
          {cancelError && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: '#ffebee', 
              color: '#c62828', 
              borderRadius: 1,
              mb: 2 
            }}>
              <Typography variant="body2">{cancelError}</Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="reason"
              label="Lý do hủy"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                sx: {
                  '& fieldset': {
                    borderColor: '#ddd',
                  },
                  '&:hover fieldset': {
                    borderColor: '#ccc',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6600',
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Đóng
          </Button>
          <Button 
            onClick={handleSubmitCancelRequest} 
            variant="contained" 
            sx={{ 
              textTransform: 'none', 
              bgcolor: '#FF6600', 
              '&:hover': { bgcolor: '#e65c00' } 
            }}
          >
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Order;
