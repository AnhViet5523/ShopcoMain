import { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, TextField, Paper } from '@mui/material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Cart = () => {
  const navigate = useNavigate();
  // Initialize cart items from localStorage
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length > 0) {
      setCartItems(savedCart);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    // Dispatch custom event to notify other components (like Header) that cart has been updated
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }, [cartItems]);

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Giảm giá (hardcoded for now, could be calculated based on business logic)
  const discount = 45000;
  
  // Tổng cộng sau khi giảm giá
  const finalAmount = totalAmount - discount;

  // Hàm tăng số lượng
  const increaseQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  // Hàm giảm số lượng
  const decreaseQuantity = (id) => {
    setCartItems(cartItems.map(item => 
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  // Hàm xóa sản phẩm
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh',width: "99vw" }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Left side - Cart items */}
          <Box sx={{ flex: '1 1 auto', width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              Giỏ hàng: <Typography component="span" sx={{ ml: 1, fontWeight: 'normal' }}>{cartItems.length} sản phẩm</Typography>
            </Typography>
            
            <Paper elevation={0} sx={{ p: 0, mb: 2, width: '100%' }}>
              {cartItems.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ 
                    display: 'flex', 
                    p: 2, 
                    borderBottom: index < cartItems.length - 1 ? '1px solid #eee' : 'none',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ width: 42, height: 42, mr: 2, display: 'flex', alignItems: 'center' }}>
                      <img 
                        src={item.imgUrl} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                        {item.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          {item.price.toLocaleString()}đ
                        </Typography>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          {item.originalPrice.toLocaleString()}đ
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                      <Button 
                        onClick={() => decreaseQuantity(item.id)}
                        sx={{ 
                          minWidth: 30, 
                          width: 30, 
                          height: 30, 
                          p: 0, 
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        -
                      </Button>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <Button 
                        onClick={() => increaseQuantity(item.id)}
                        sx={{ 
                          minWidth: 30, 
                          width: 30, 
                          height: 30, 
                          p: 0, 
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        +
                      </Button>
                    </Box>
                    
                    <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {(item.price * item.quantity).toLocaleString()}đ
                      </Typography>
                    </Box>
                    
                    <Button 
                      onClick={() => removeItem(item.id)}
                      sx={{ 
                        color: 'text.secondary', 
                        textTransform: 'none', 
                        p: 0,
                        ml: 2,
                        minWidth: 'auto'
                      }}
                    >
                      Xóa
                    </Button>
                  </Box>
                  
                  {/* Promotion text for the second item */}
                  {item.id === 2 && (
                    <Box sx={{ p: 2, bgcolor: '#f9f9f9', fontSize: '0.875rem', color: 'text.secondary' }}>
                      Tặng ngay phần quà khi mua tại cửa hàng còn quà
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>
            
            <Box sx={{ textAlign: 'left', mt: 3 }}>
              <Button 
                variant="text" 
                onClick={() => navigate('/')} 
                sx={{ 
                  color: 'primary.main',
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  pl: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ← Tiếp tục mua hàng
              </Button>
            </Box>
          </Box>
          
          {/* Right side - Order summary */}
          <Box sx={{ width: { xs: '100%', md: '380px' }, flexShrink: 0 }}>
            <Paper elevation={0} sx={{ bgcolor: '#212121', color: 'white', p: 3, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 3 }} color='white'>
                Thông tin đơn hàng
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color='white'>Tạm tính:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }} color='white'>
                  {totalAmount.toLocaleString()}đ
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color='white'>Giá giảm:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }} color='white'>
                  {discount.toLocaleString()}đ
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography color='white'>Tổng cộng:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }} color='white'>
                  {finalAmount.toLocaleString()}đ
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ color: '#ff6b6b', mr: 1 }} />
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2 }} color='white'>
                Ghi chú đơn hàng
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Ghi chú"
                variant="outlined"
                sx={{ 
                  mb: 3,
                  bgcolor: '#333',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#444' },
                    '&:hover fieldset': { borderColor: '#666' },
                    '&.Mui-focused fieldset': { borderColor: '#888' },
                  },
                  '& .MuiInputBase-input': { color: 'white' }
                }}
              />
              
              <Typography variant="h6" sx={{ mb: 2 }} color='white'>
                Thông tin xuất hoá đơn
              </Typography>
              
              <Button 
                fullWidth 
                variant="contained" 
                sx={{ 
                  bgcolor: '#ff6b6b', 
                  color: 'white', 
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#ff5252' }
                }}
              >
                THANH TOÁN NGAY
              </Button>
            </Paper>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Cart;
