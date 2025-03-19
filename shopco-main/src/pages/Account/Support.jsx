import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Container, Typography, Tabs, Tab, Grid, Paper, Avatar, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Divider, Chip, Link, Breadcrumbs, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Home, Person, Phone, ExitToApp, ShoppingBag, Headset } from "@mui/icons-material";
import Banner from "../../components/Banner";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header";
import userService from "../../apis/userService";
import feedbackService from "../../apis/feedbackService";

const Support = () => {
  const [tabIndex, setTabIndex] = useState(0);  // Mặc định sẽ trỏ đến tab đầu tiên (Đang xử lý)
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);

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
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const currentUser = userService.getCurrentUser();
        
        if (!currentUser || !currentUser.userId) {
          setError('Vui lòng đăng nhập để xem lịch sử hỗ trợ');
          setLoading(false);
          return;
        }
        
        const userId = currentUser.userId;
        let response;
        
        if (tabIndex === 1) {
          // Sử dụng API mới để lấy các feedback đã được trả lời cho userId cụ thể
          response = await feedbackService.getRepliedFeedbacksByUser(userId);
        } else {
          // Lấy tất cả feedbacks (bao gồm cả đang chờ xử lý)
          response = await feedbackService.getUserFeedbacks(userId);
        }
        
        if (response && response.$values) {
          const formattedData = response.$values.map(request => ({
            ...request,
            messages: request.messages ? (request.messages.$values || []) : []
          }));
          setFeedbacks(formattedData);
        } else {
          setFeedbacks([]);
        }
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled:', error.message);
        } else {
          console.error('Lỗi khi lấy lịch sử hỗ trợ:', error);
          setError('Không thể tải lịch sử hỗ trợ. Vui lòng thử lại sau.');
        }
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [tabIndex]);

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
      icon: <ShoppingBag />, // Thay Phone bằng ShoppingBag
      active: false,
      action: () => navigate("/orders") 
    },
    { 
      text: "Hỏi đáp", 
      icon: <Headset />, 
      active: true,
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

  // Sửa lại hàm lọc feedback theo tab
  const getFilteredFeedbacks = () => {
    if (tabIndex === 0) {
      // Tab "Đang xử lý" - chỉ hiển thị trạng thái Pending
      return feedbacks.filter(feedback => feedback.status === "Pending");
    } else if (tabIndex === 1) {
      // Tab "Đã xử lý" - chỉ hiển thị trạng thái Replied
      return feedbacks.filter(feedback => feedback.status === "Replied");
    }
    return feedbacks;
  };

  const handleViewDetail = (feedback) => {
    setSelectedDetailRequest(feedback);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedDetailRequest(null);
  };

  // Thêm hàm sắp xếp tin nhắn theo thời gian
  const sortMessagesByTime = (messages) => {
    return [...messages].sort((a, b) => new Date(a.sendTime) - new Date(b.sendTime));
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
                HỎI ĐÁP
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2, mb: 3 }}>
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ bgcolor: "white", color: "black", borderRadius: 2 }}
                  TabIndicatorProps={{ style: { backgroundColor: "#FF6600" } }}
                >
                  <Tab label="Đang xử lý" sx={{ color: "black" }} />
                  <Tab label="Đã xử lý" sx={{ color: "black" }} />
                </Tabs>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography color="error" variant="h6">
                    {error}
                  </Typography>
                </Box>
              ) : feedbacks.length === 0 ? (
                <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography color="black" variant="h6">
                    Bạn chưa có yêu cầu hỗ trợ nào
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {getFilteredFeedbacks().length > 0 ? (
                    getFilteredFeedbacks().map((feedback) => (
                      <Paper 
                        key={feedback.conversationId} 
                        sx={{ 
                          mb: 3, 
                          borderRadius: 2, 
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
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
                            Yêu cầu hỗ trợ #{feedback.conversationId}
                          </Typography>
                          <Chip 
                            label={feedback.status === "Replied" ? "Đã xử lý" : "Đang xử lý"} 
                            color={feedback.status === "Replied" ? "success" : "warning"} 
                            size="small" 
                          />
                        </Box>
                        
                        <Box sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="medium">
                              Bạn
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(feedback.sendTime)}
                            </Typography>
                          </Box>

                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {feedback.messageContent}
                          </Typography>
                          
                          {feedback.status === "Replied" && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="primary" fontWeight="medium">
                                  Admin
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(feedback.messages.find(msg => msg.isAdmin)?.sendTime || feedback.sendTime)}
                                </Typography>
                              </Box>
                              <Typography variant="body1">
                                {feedback.messages.find(msg => msg.isAdmin)?.messageContent || ''}
                              </Typography>
                            </Box>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button variant="outlined" size="small" onClick={() => handleViewDetail(feedback)}>
                              Chi tiết
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    <Box sx={{ bgcolor: "#f5f5f5", p: 4, borderRadius: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <Typography color="text.secondary" variant="h6">
                        Không có yêu cầu hỗ trợ nào trong danh mục này
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid >
      </Container>
      <Footer />

      {/* Dialog xem chi tiết */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Chi tiết đơn hỗ trợ
        </DialogTitle>
        <DialogContent>
          {selectedDetailRequest && (
            <div>
              <div style={{ 
                marginBottom: '20px',
                backgroundColor: '#f9f9f9',
                padding: '20px',
                borderRadius: '8px'
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  borderBottom: '2px solid #2196f3', 
                  paddingBottom: '8px', 
                  display: 'inline-block'
                }}>
                  Thông tin người gửi
                </Typography>
                <p><strong>Tên:</strong> {selectedDetailRequest.userName}</p>
                <p><strong>Email:</strong> {selectedDetailRequest.email}</p>
                <p><strong>Số điện thoại:</strong> {selectedDetailRequest.phoneNumber}</p>
              </div>
              
              <Typography variant="h6" gutterBottom sx={{ 
                borderBottom: '2px solid #2196f3', 
                paddingBottom: '8px', 
                display: 'inline-block',
                marginBottom: '20px'
              }}>
                Nội dung trao đổi
              </Typography>
              
              <div>
                {/* Chỉ hiển thị tin nhắn từ messages đã được sắp xếp */}
                {sortMessagesByTime(selectedDetailRequest.messages).map((message, index) => (
                  <Box 
                    key={message.messageId || index}
                    sx={{ 
                      mb: 3, 
                      p: 2, 
                      bgcolor: message.isAdmin ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: '8px'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color={message.isAdmin ? 'primary' : 'textPrimary'}>
                        {message.isAdmin ? 'Admin' : selectedDetailRequest.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(message.sendTime)}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {message.messageContent}
                    </Typography>
                    {message.imageUrl && (
                      <Box 
                        component="img"
                        src={feedbackService.getImageUrl(message.imageUrl)}
                        alt="Attached image"
                        sx={{ 
                          maxWidth: 200,
                          maxHeight: 200,
                          borderRadius: 1,
                          mt: 2,
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(feedbackService.getImageUrl(message.imageUrl), '_blank')}
                      />
                    )}
                  </Box>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Support;
