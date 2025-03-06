import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Button } from '@mui/material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  // Dữ liệu mẫu cho giỏ hàng
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Sữa Rửa Mặt Cho Da Dầu Mụn SVR Sebiaclear Gel Moussant',
      price: 150000,
      originalPrice: 175000,
      quantity: 1,
      imgUrl: '/images/product1.png',
    },
    {
      id: 2,
      name: 'Kem Dưỡng Obagi Retinol 1.0%',
      price: 1538000,
      originalPrice: 1810000,
      quantity: 1,
      imgUrl: '/images/product2.png',
    },
  ]);

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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
    <Box sx={{ backgroundColor: '#e0f7fa', minHeight: '100vh', overflow: 'hidden', width:'99vw' }}>
      <Header />
      <Container sx={{ py: 5, maxWidth: 'lg', overflow: 'hidden' }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom sx={{ color: 'black' }}>
          Giỏ Hàng Của Bạn
        </Typography>
        <Grid container spacing={3}>
          {cartItems.map(item => (
            <Grid item xs={12} key={item.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ccc', borderRadius: '8px', padding: '16px', backgroundColor: '#f9f9f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img src={item.imgUrl} alt={item.name} style={{ width: '100px', borderRadius: '8px', marginRight: '16px' }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: 'black' }}>{item.name}</Typography>
                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'red' }}>
                      {item.originalPrice.toLocaleString()}đ
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'black' }}>{item.price.toLocaleString()}đ</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                      <Button onClick={() => decreaseQuantity(item.id)}>-</Button>
                      <Typography sx={{ margin: '0 8px', color: 'black' }}>{item.quantity}</Typography>
                      <Button onClick={() => increaseQuantity(item.id)}>+</Button>
                      <Button onClick={() => removeItem(item.id)} sx={{ marginLeft: '16px', color: 'red' }}>
                        Xóa
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
          <Typography variant="h5" sx={{ color: 'black' }}>Tạm tính: {totalAmount.toLocaleString()}đ</Typography>
          <Typography variant="h5" sx={{ color: 'black' }}>Giảm giá: 0đ</Typography>
          <Typography variant="h5" sx={{ color: 'black' }}>Tổng cộng: {totalAmount.toLocaleString()}đ (Đã bao gồm VAT)</Typography>
          <Button variant="contained" color="primary" sx={{ marginTop: '20px' }}>
            Tiến hành đặt hàng
          </Button>
        </Box>
        <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ marginTop: '20px' }}>
            Tiếp tục mua hàng
          </Button>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Cart;
