import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { useNavigate } from 'react-router-dom';
import './checkout.css';
import Header from '../../components/Header';

const Checkout = () => {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Thanh toán khi nhận hàng (COD)');
  const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleConfirmPaymentMethod = () => {
    // Here you would typically handle saving the payment method
    handleClose();
  };

  const handlePlaceOrder = () => {
    setThankYouDialogOpen(true);
  };

  const handleThankYouDialogClose = () => {
    setThankYouDialogOpen(false);
    // Redirect to home page
    navigate('/');
  };

  return (
    <Box sx={{ bgcolor: "#fff176", minHeight: "100vh", width: '100vw' }}>
      <Header />
      <div className="checkout-container">
        <div className="grid-container">
          <div className="left-column">
            <div className="address-section">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Địa chỉ nhận hàng
                </Typography>
                <Button 
                  variant="text" 
                  size="large" 
                  sx={{ 
                    textTransform: 'none', 
                    color: 'green', 
                    fontWeight: 'bold' 
                  }}
                >
                  Thay đổi
                </Button>
              </Box>
              <p>Nguyễn - 0386874065</p>
              <p>6 Vĩnh Khánh Phường 9 Quận 4 Hồ Chí Minh 700000, Việt Nam</p>
            </div>
            
            <div className="payment-method">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Hình thức thanh toán
                </Typography>
                <Button 
                  variant="text" 
                  size="large" 
                  sx={{ 
                    textTransform: 'none', 
                    color: 'green', 
                    fontWeight: 'bold' 
                  }}
                  onClick={handleClickOpen}
                >
                  Chọn hình thức
                </Button>
              </Box>
              <p>{paymentMethod}</p>
            </div>
            
            <div className="discount-code">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Mã giảm giá
                </Typography>
                <Button 
                  variant="text" 
                  size="large" 
                  sx={{ 
                    textTransform: 'none', 
                    color: 'green', 
                    fontWeight: 'bold' 
                  }}
                >
                  Nhập mã giảm giá
                </Button>
              </Box>
            </div>
          </div>
          
          <div className="right-column">
            <Paper elevation={0} sx={{ bgcolor: '#ffffff', color: 'black', p: 3, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Tạm tính:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  208.000 ₫
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Giảm giá:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  -15.000 ₫
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  30.000 ₫
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography>Thành tiền:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  193.000 ₫
                </Typography>
              </Box>
              
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 2, 
                  backgroundColor: 'darkgreen', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: '10px',
                  '&:hover': {
                    backgroundColor: '#005000',
                  }
                }}
                onClick={handlePlaceOrder}
              >
                Đặt hàng
              </Button>
            </Paper>
          </div>
        </div>
        
        <Paper elevation={0} sx={{ bgcolor: '#ffffff', color: 'black', p: 3, borderRadius: 1, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Thông tin kiện hàng
          </Typography>
          <Typography sx={{ mb: 2 }}>Giao trong 48 giờ</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Product Image */}
            <Box sx={{ width: '70px', height: '70px', mr: 2 }}>
              <img 
                src="https://klairscosmetics.com/wp-content/uploads/2017/04/supple-toner-1.jpg" 
                alt="Klairs Toner" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
              />
              <Box 
                sx={{ 
                  position: 'relative', 
                  top: '-65px', 
                  left: '0', 
                  backgroundColor: '#ff6b6b', 
                  color: 'white', 
                  padding: '2px 4px', 
                  borderRadius: '2px',
                  fontSize: '10px',
                  width: 'fit-content'
                }}
              >
                -52%
              </Box>
            </Box>
            
            {/* Product Info */}
            <Box sx={{ flex: 1, ml: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                Klairs
              </Typography>
              <Typography variant="body2">
                Nước Hoa Hồng Klairs Không Mùi Cho Da Nhạy Cảm 180ml
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey', fontSize: '0.8rem' }}>
                180ml
              </Typography>
            </Box>
            
            {/* Price & Quantity */}
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ml: 2 }}>
              <Typography sx={{ mr: 1 }}>1</Typography>
              <Typography sx={{ fontWeight: 'bold', mr: 1 }}>×</Typography>
              <Typography sx={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                208.000 ₫
              </Typography>
            </Box>
          </Box>
        </Paper>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: 'darkgreen', fontWeight: 'bold' }}>
          Chọn hình thức thanh toán
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="payment-method"
              name="payment-method"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <FormControlLabel 
                value="Thanh toán khi nhận hàng (COD)" 
                control={<Radio />} 
                label="Thanh toán khi nhận hàng (COD)" 
              />
              <FormControlLabel 
                value="Thanh toán ví VNPAY" 
                control={<Radio />} 
                label="Thanh toán ví VNPAY" 
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'gray' }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmPaymentMethod} sx={{ color: 'green', fontWeight: 'bold' }}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thank You Dialog */}
      <Dialog
        open={thankYouDialogOpen}
        onClose={handleThankYouDialogClose}
        aria-labelledby="thank-you-dialog-title"
        aria-describedby="thank-you-dialog-description"
      >
        <DialogTitle id="thank-you-dialog-title" sx={{ color: 'darkgreen', fontWeight: 'bold' }}>
          Cảm ơn bạn đã đặt hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="thank-you-dialog-description">
            Cảm ơn bạn đã tin tưởng và mua hàng. Chúng tôi rất hân hạnh phục vụ bạn cho những lần kế tiếp.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Checkout;
