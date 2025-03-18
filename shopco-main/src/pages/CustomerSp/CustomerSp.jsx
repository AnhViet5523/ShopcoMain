import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Breadcrumbs,
  Link,
  useTheme,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Home, LocalPhone, LocationOn, Email, AccessTime, Send, Image, Close, Upload, AddPhotoAlternate } from '@mui/icons-material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import Banner from '../../components/Banner';
import feedbackService from '../../apis/feedbackService';

const CustomerSupport = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [userId, setUserId] = useState(0);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkUserLogin = () => {
      try {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          if (user && user.userId) {
            setUserId(user.userId);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    checkUserLogin();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const isValidVietnamesePhone = (phone) => {
    const regex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
    return regex.test(phone);
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleImageChange = (event) => {
    setImageError('');
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Kiểm tra kiểu file
      if (!file.type.match('image.*')) {
        setImageError('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Giảm giới hạn kích thước xuống 1MB
      if (file.size > 1 * 1024 * 1024) {
        setImageError('Kích thước file không được vượt quá 1MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Vui lòng nhập tên của bạn";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email của bạn";
      isValid = false;
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = "Email không hợp lệ";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại của bạn";
      isValid = false;
    } else if (!isValidVietnamesePhone(formData.phone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10 số bắt đầu bằng 0 hoặc +84)";
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = "Vui lòng nhập nội dung thắc mắc";
      isValid = false;
    }

    if (imageError) {
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setPreviewDialogOpen(true);
  };

  const handleSendFeedback = async () => {
    setPreviewDialogOpen(false);
    setLoading(true);
    
    try {
      let imageUrlValue = "";
      
      // Chuyển đổi ảnh thành Base64 nếu có
      if (selectedImage) {
        try {
          // Nén ảnh với các tham số mạnh hơn
          const compressedImage = await compressImage(selectedImage, 500, 0.4);
          
          const reader = new FileReader();
          const base64String = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(compressedImage || selectedImage);
          });
          
          const sizeInKB = Math.round(base64String.length / 1024);
          console.log(`Image size after compression: ${sizeInKB}KB`);
          
          // Kiểm tra nếu ảnh vẫn lớn, hỏi người dùng có muốn tiếp tục không
          if (sizeInKB > 300) {
            console.warn(`Image is still large (${sizeInKB}KB)`);
            // Trong tình huống thực tế, có thể hiển thị dialog hỏi người dùng
            // Ở đây chúng ta cứ tiếp tục với ảnh đã nén
          }
          
          imageUrlValue = base64String;
        } catch (imgError) {
          console.error("Lỗi xử lý ảnh:", imgError);
          setLoading(false);
          setSnackbar({
            open: true,
            message: 'Có lỗi khi xử lý ảnh. Vui lòng thử lại với ảnh nhỏ hơn.',
            severity: 'warning'
          });
          return;
        }
      }
      
      // Chuẩn bị dữ liệu theo đúng format API yêu cầu
      const feedbackData = {
        userId: userId, 
        messageContent: formData.message.trim(),
        imageUrl: imageUrlValue, // Gửi ảnh dạng Base64
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
      };
      
      console.log("Sending feedback with image. Image provided:", !!imageUrlValue);
      
      // Thử gửi feedback mà không có ảnh nếu gặp lỗi
      try {
        await feedbackService.sendFeedback(feedbackData);
        
        // Reset form sau khi gửi thành công
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSelectedImage(null);
        setImagePreview('');
        setSnackbar({
          open: true,
          message: (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                Cảm ơn bạn!
              </Typography>
              <Typography>
                Thắc mắc của bạn đã được gửi thành công. Chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
              </Typography>
            </Box>
          ),
          severity: 'success'
        });
      } catch (sendError) {
        console.error('Lỗi khi gửi feedback với ảnh:', sendError);
        
        // Nếu có lỗi và có ảnh, thử gửi lại không có ảnh
        if (imageUrlValue) {
          try {
            console.log("Retrying without image...");
            
            const feedbackDataNoImage = {
              ...feedbackData,
              imageUrl: "" // Gửi không kèm ảnh
            };
            
            await feedbackService.sendFeedback(feedbackDataNoImage);
            
            // Reset form sau khi gửi thành công
            setFormData({ name: '', email: '', phone: '', message: '' });
            setSelectedImage(null);
            setImagePreview('');
            setSnackbar({
              open: true,
              message: (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                    Đã gửi thành công!
                  </Typography>
                  <Typography>
                    Thắc mắc của bạn đã được gửi thành công, nhưng không kèm theo ảnh do kích thước quá lớn.
                  </Typography>
                </Box>
              ),
              severity: 'warning'
            });
          } catch (retryError) {
            console.error('Lỗi khi thử lại không có ảnh:', retryError);
            throw retryError; // Tiếp tục ném lỗi để xử lý bên dưới
          }
        } else {
          throw sendError; // Ném lỗi nếu không có ảnh
        }
      }
    } catch (error) {
      console.error('Lỗi khi gửi thắc mắc:', error);
      setSnackbar({
        open: true,
        message: (
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5, color: '#fff' }}>
              Có lỗi xảy ra!
            </Typography>
            <Typography sx={{ color: '#fff' }}>
              Không thể gửi thắc mắc của bạn. Vui lòng thử lại sau hoặc liên hệ qua số điện thoại.
            </Typography>
          </Box>
        ),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm nén ảnh với nhiều tham số hơn
  const compressImage = (file, maxDimension = 600, quality = 0.5) => {
    return new Promise((resolve, reject) => {
      // Nếu ảnh nhỏ hơn 100KB, không cần nén
      if (file.size <= 100 * 1024) {
        resolve(file);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Giảm kích thước ảnh
          let width = img.width;
          let height = img.height;
          
          // Tính tỷ lệ để giảm kích thước
          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }
          
          // Đặt kích thước canvas
          canvas.width = width;
          canvas.height = height;
          
          // Vẽ ảnh lên canvas với kích thước mới
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Chuyển canvas thành blob với chất lượng được chỉ định
          canvas.toBlob((blob) => {
            if (blob) {
              // Tạo file mới từ blob đã nén
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              
              console.log(`Original size: ${Math.round(file.size/1024)}KB, Compressed: ${Math.round(blob.size/1024)}KB`);
              resolve(compressedFile);
            } else {
              resolve(file); // Nếu không nén được, trả về file gốc
            }
          }, file.type, quality); // Giảm chất lượng xuống 50%
        };
        
        img.onerror = () => reject(new Error('Không thể tải ảnh'));
        img.src = event.target.result;
      };
      
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsDataURL(file);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width: "99vw", overflowX: "hidden" }}>
      <Header />
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3, ml: 10}}>
          <Link underline="hover" color="inherit" href="/" display="flex" alignItems="center">
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Trang chủ
          </Link>
          <Typography color="text.primary">Hỗ trợ khách hàng</Typography>
        </Breadcrumbs>
      <Banner />
      <Container>
        <Grid container spacing={4} >
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3}}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ borderBottom: `2px solid ${theme.palette.primary.main}`, pb: 1, mb: 3 }}>
                THÔNG TIN LIÊN HỆ
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" component="span" fontWeight="bold">
                    Địa Chỉ:
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                    Khu công nghệ cao- quận 9
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocalPhone sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" component="span" fontWeight="bold">
                    Điện thoại:
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                    0956497123
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Email sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" component="span" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                    beautycomsmetics@gmail.vn
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <AccessTime sx={{ color: 'text.secondary', mr: 2, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" component="span" fontWeight="bold">
                    GIỜ MỞ CỬA:
                  </Typography>
                  <Typography variant="body1" component="p" sx={{ mt: 1 }}>
                    Từ 9:00 - 21:30 tất cả các ngày trong tuần (bao gồm cả các ngày lễ, ngày Tết).
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3 }}>
                Gửi thắc mắc cho chúng tôi
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Tên của bạn" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      variant="outlined"
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Email của bạn" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      variant="outlined"
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Số điện thoại của bạn" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                      variant="outlined"
                      placeholder="Nhập số điện thoại Việt Nam (VD: 0912345678 hoặc +84912345678)"
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Đính kèm hình ảnh (nếu có):
                      </Typography>
                      
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="contained-button-file"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                      
                      {!imagePreview ? (
                        <label htmlFor="contained-button-file">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<AddPhotoAlternate />}
                            sx={{ mb: 1 }}
                          >
                            Chọn ảnh
                          </Button>
                        </label>
                      ) : (
                        <Box sx={{ position: 'relative', width: 'fit-content', mt: 1 }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              display: 'block',
                              marginBottom: '8px',
                              borderRadius: '4px'
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'rgba(0, 0, 0, 0.5)',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                              }
                            }}
                            onClick={handleRemoveImage}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                      
                      {imageError && (
                        <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                          {imageError}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Hỗ trợ các định dạng: JPG, PNG, GIF. Kích thước tối đa: 1MB
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Nội dung" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      required 
                      multiline 
                      rows={4} 
                      variant="outlined"
                      error={!!formErrors.message}
                      helperText={formErrors.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      size="large" 
                      startIcon={loading ? null : <Send />} 
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi cho chúng tôi'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Dialog 
        open={previewDialogOpen} 
        onClose={handleClosePreviewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: 'green', fontWeight: 'bold' }}>
          Xác nhận thông tin liên hệ
        </DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Tên:</Typography>
            <Typography paragraph>{formData.name}</Typography>
            
            <Typography variant="subtitle1" fontWeight="bold">Email:</Typography>
            <Typography paragraph>{formData.email}</Typography>
            
            <Typography variant="subtitle1" fontWeight="bold">Số điện thoại:</Typography>
            <Typography paragraph>{formData.phone}</Typography>
            
            {imagePreview && (
              <>
                <Typography variant="subtitle1" fontWeight="bold">Hình ảnh đính kèm:</Typography>
                <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={imagePreview} 
                    alt="Hình ảnh đính kèm" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '250px',
                      borderRadius: '4px',
                      border: '1px solid #e0e0e0',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              </>
            )}
            
            <Typography variant="subtitle1" fontWeight="bold">Nội dung thắc mắc:</Typography>
            <Typography 
              paragraph
              sx={{
                p: 1.5,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
                whiteSpace: 'pre-wrap'
              }}
            >
              {formData.message}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Vui lòng kiểm tra lại thông tin trước khi gửi. Chúng tôi sẽ liên hệ với bạn qua email hoặc số điện thoại được cung cấp.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewDialog} sx={{ color: 'gray' }}>
            Chỉnh sửa
          </Button>
          <Button 
            onClick={handleSendFeedback} 
            variant="contained"
            color="primary"
            sx={{ fontWeight: 'bold' }}
          >
            Xác nhận gửi
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={8000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              fontWeight: 500,
              py: 1.5,
            },
            '& .MuiAlert-icon': {
              fontSize: '2rem',
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Footer />
    </Box>
  );
};

export default CustomerSupport;
