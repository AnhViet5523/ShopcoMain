import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Container, Button, TextField, Paper, CircularProgress } from '@mui/material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import { useNavigate, Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import orderService from '../../apis/orderService';
import productImageService from '../../apis/productImageService';

const Cart = () => {
  const navigate = useNavigate();
  // Initialize cart items state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const requestInProgress = useRef(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [note, setNote] = useState('');
  // Thêm state để theo dõi items đang loading và lỗi của từng item
  const [loadingItems, setLoadingItems] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  useEffect(() => {
    // Đánh dấu component đã mount
    isMounted.current = true;
    
    // Chỉ fetch dữ liệu nếu chưa có yêu cầu đang xử lý
    if (!requestInProgress.current) {
      fetchCarts();
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchCarts = async () => {
    // Nếu đã có yêu cầu đang xử lý, không gửi yêu cầu mới
    if (requestInProgress.current) return;
    
    // Đánh dấu đang có yêu cầu đang xử lý
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (user && user.userId) {
        console.log(`Đang lấy giỏ hàng cho người dùng ID: ${user.userId}`);
        // Fetch current cart from orderService
        const response = await orderService.getCurrentCart(user.userId);
        console.log("Phản hồi từ API giỏ hàng:", response);
        
        // Store the order ID for checkout
        if (response && response.orderId) {
          setCurrentOrderId(response.orderId);
          console.log(`Đã lưu orderId: ${response.orderId} cho thanh toán`);
        } else {
          console.warn("Không có orderId trong phản hồi");
        }
        
        // Kiểm tra dữ liệu items từ API
        if (!response || !response.items || !response.items.$values) {
          console.warn("Cấu trúc phản hồi không đúng, không có dữ liệu items hoặc $values");
          setCartItems([]);
          localStorage.setItem('cart', '[]');
          
          // Thông báo cho các component khác biết giỏ hàng đã được cập nhật
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          return;
        }
        
        const cartItems = response.items.$values;
        console.log(`Tìm thấy ${cartItems.length} sản phẩm trong giỏ hàng:`, cartItems);
        
        if (cartItems.length === 0) {
          console.log("Giỏ hàng trống");
          setCartItems([]);
          localStorage.setItem('cart', '[]');
          
          // Thông báo cho các component khác biết giỏ hàng đã được cập nhật
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          return;
        }
        
        // Lấy tất cả ảnh sản phẩm trước để tối ưu hiệu suất
        let allProductImages = [];
        try {
          const imagesResponse = await productImageService.getAllProductImages();
          if (imagesResponse && imagesResponse.$values) {
            allProductImages = imagesResponse.$values;
          } else if (Array.isArray(imagesResponse)) {
            allProductImages = imagesResponse;
          }
          console.log(`Đã lấy ${allProductImages.length} ảnh sản phẩm để hiển thị`);
        } catch (err) {
          console.error("Lỗi khi lấy ảnh sản phẩm:", err);
        }
        
        // Tạo map để lưu ảnh theo productId cho truy xuất nhanh
        const productImagesMap = {};
        allProductImages.forEach(image => {
          const productId = image.productId || image.productID;
          if (productId) {
            if (!productImagesMap[productId]) {
              productImagesMap[productId] = [];
            }
            productImagesMap[productId].push(image);
          }
        });
        
        // Xử lý từng sản phẩm trong giỏ hàng
        const items = cartItems.map(item => {
          if (!item) {
            console.warn("Phát hiện item null trong giỏ hàng");
            return null;
          }
          
          console.log("Đang xử lý sản phẩm trong giỏ hàng:", item);
          
          let productImage = '';
          const productId = item.productId;
          
          if (!productId) {
            console.warn("Sản phẩm không có ID");
            return null;
          }
          
          // Nếu có thông tin sản phẩm
          if (item.product) {
            let productImages = productImagesMap[productId] || [];
            
            // Nếu có ảnh từ productImageService
            if (productImages.length > 0) {
              // Tìm ảnh đại diện (isMainImage = true)
              let mainImage = productImages.find(img => img.isMainImage === true);
              
              // Nếu không tìm thấy ảnh đại diện, tìm ảnh có displayOrder = 0
              if (!mainImage) {
                mainImage = productImages.find(img => img.displayOrder === 0);
              }
              
              // Nếu tìm thấy ảnh đại diện, sử dụng ảnh đó
              if (mainImage) {
                productImage = mainImage.imgUrl || mainImage.imageUrl;
                console.log(`Tìm thấy ảnh đại diện cho sản phẩm ID ${productId}`);
              } else {
                // Nếu không, lấy ảnh đầu tiên trong mảng
                const firstImage = productImages[0];
                productImage = firstImage?.imgUrl || firstImage?.imageUrl;
                console.log(`Sử dụng ảnh đầu tiên cho sản phẩm ID ${productId}`);
              }
            }
            // Fallback vào các cách khác nếu không có ảnh từ productImageService
            else {
              // Case 1: Nếu sản phẩm có mảng ảnh từ product
              if (item.product.images && item.product.images.length > 0) {
                const firstImage = item.product.images[0];
                productImage = firstImage?.imgUrl || firstImage?.imageUrl;
              }
              // Case 2: Nếu sản phẩm có imgUrl
              else if (item.product.imgUrl) {
                productImage = item.product.imgUrl;
              }
              // Case 3: Nếu sản phẩm có imgURL (chú ý chữ hoa)
              else if (item.product.imgURL) {
                productImage = item.product.imgURL;
              }
              // Case 4: Nếu sản phẩm có image
              else if (item.product.image) {
                productImage = item.product.image;
              }
              // Case 5: Không tìm thấy ảnh nào, sử dụng placeholder
              else {
                productImage = `https://via.placeholder.com/150/ffcc66/333333?text=${encodeURIComponent(item.product.productName ? item.product.productName.substring(0, 8) : 'Product')}`;
              }
            }
          } else {
            console.warn(`Sản phẩm ID ${productId} không có thông tin chi tiết`);
            // Không có thông tin sản phẩm, sử dụng placeholder
            productImage = `https://via.placeholder.com/150/ffcc66/333333?text=Product`;
          }
          
          if (!item.orderItemId) {
            console.warn(`Sản phẩm ID ${productId} không có orderItemId`);
          }
          
          return {
            id: item.orderItemId,
            productId: item.productId,
            name: item.product ? item.product.productName : 'Sản phẩm không xác định',
            price: item.price || 0,
            originalPrice: (item.price || 0) * 1.2, // Tính giá gốc cao hơn 20%
            quantity: item.quantity || 1,
            imgUrl: productImage,
          };
        }).filter(item => item !== null); // Lọc bỏ các item null
        
        console.log(`Đã xử lý ${items.length} sản phẩm trong giỏ hàng:`, items);
        
        if (isMounted.current) {
          setCartItems(items);
          localStorage.setItem('cart', JSON.stringify(items));
        }
        
        // Thông báo cho các component khác biết giỏ hàng đã được cập nhật
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        console.log("Người dùng chưa đăng nhập, không có giỏ hàng");
        setCartItems([]);
        localStorage.setItem('cart', '[]');
        
        // Thông báo cho các component khác biết giỏ hàng đã được cập nhật
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      if (error.response) {
        console.error('Chi tiết lỗi:', error.response.data);
      }
      // Fallback to localStorage on error
      setCartItems([]);
      localStorage.setItem('cart', '[]');
      
      // Thông báo cho các component khác biết giỏ hàng đã được cập nhật
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      // Đánh dấu không còn yêu cầu đang xử lý
      requestInProgress.current = false;
    }
  };

  // Update cart items
  const updateCartItems = async (newItems) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (user && user.userId) {
        // For authenticated users, update via API
        // This is a simplified approach - in a real app, you'd need to handle
        // the specific API calls for each update type (add, update, remove)
        
        // For now, we'll just update the local state and localStorage as a fallback
        if (isMounted.current) {
          setCartItems(newItems);
        }
        localStorage.setItem('cart', JSON.stringify(newItems));
      } else {
        // For non-authenticated users, update localStorage
        if (isMounted.current) {
          setCartItems(newItems);
        }
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      
      // Dispatch custom event to notify other components (like Header) that cart has been updated
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      if (isMounted.current) {
        console.error('Error updating cart:', error);
        setError('Failed to update cart. Please try again.');
      }
    }
  };

  // Cập nhật hàm tăng số lượng để kiểm tra số lượng trong kho
  const increaseQuantity = async (id) => {
    try {
      // Xóa lỗi cũ nếu có
      setItemErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      
      // Đánh dấu item đang thay đổi là loading
      setLoadingItems(prev => ({ ...prev, [id]: true }));
      
      const user = JSON.parse(localStorage.getItem('user'));
      const item = cartItems.find(item => item.id === id);
      
      if (user && user.userId) {
        // For authenticated users, update via API
        try {
          await orderService.updatecartitem(id, item.quantity + 1);
          
          // Update local state only if component is still mounted
          if (isMounted.current) {
            const updatedItems = cartItems.map(item => 
              item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            );
            updateCartItems(updatedItems);
          }
        } catch (error) {
          console.error('Error increasing quantity:', error);
          // Kiểm tra nếu là lỗi do số lượng vượt quá tồn kho
          if (error.response && error.response.status === 400) {
            // Hiển thị thông báo lỗi chỉ cho sản phẩm này
            setItemErrors(prev => ({ 
              ...prev, 
              [id]: 'Số lượng vượt quá số lượng trong kho. Vui lòng liên hệ chúng tôi để biết thêm thông tin.'
            }));
          } else {
            // Lỗi khác
            setItemErrors(prev => ({ 
              ...prev, 
              [id]: 'Không thể cập nhật số lượng. Vui lòng thử lại sau.'
            }));
          }
        }
      } else {
        // For non-authenticated users, just update local state
        const updatedItems = cartItems.map(item => 
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
        updateCartItems(updatedItems);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error increasing quantity:', error);
        setItemErrors(prev => ({ 
          ...prev, 
          [id]: 'Không thể cập nhật số lượng. Vui lòng thử lại sau.'
        }));
      }
    } finally {
      // Xóa trạng thái loading của item này
      setLoadingItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // Cập nhật hàm giảm số lượng tương tự
  const decreaseQuantity = async (id) => {
    try {
      // Xóa lỗi cũ nếu có
      setItemErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      
      // Đánh dấu item đang thay đổi là loading
      setLoadingItems(prev => ({ ...prev, [id]: true }));
      
      const user = JSON.parse(localStorage.getItem('user'));
      const item = cartItems.find(item => item.id === id);
      
      if (item.quantity > 1) {
        if (user && user.userId) {
          // For authenticated users, update via API
          try {
            await orderService.updatecartitem(id, item.quantity - 1);
            
            // Update local state only if component is still mounted
            if (isMounted.current) {
              const updatedItems = cartItems.map(item => 
                item.id === id ? { ...item, quantity: item.quantity - 1 } : item
              );
              updateCartItems(updatedItems);
            }
          } catch (error) {
            console.error('Error decreasing quantity:', error);
            setItemErrors(prev => ({ 
              ...prev, 
              [id]: 'Không thể cập nhật số lượng. Vui lòng thử lại sau.'
            }));
          }
        } else {
          // For non-authenticated users, just update local state
          const updatedItems = cartItems.map(item => 
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          );
          updateCartItems(updatedItems);
        }
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error decreasing quantity:', error);
        setItemErrors(prev => ({ 
          ...prev, 
          [id]: 'Không thể cập nhật số lượng. Vui lòng thử lại sau.'
        }));
      }
    } finally {
      // Xóa trạng thái loading của item này
      setLoadingItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // Hàm xóa sản phẩm
  const removeItem = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (user && user.userId) {
        // For authenticated users, remove via API
        await orderService.removefromcart(id);
      }
      
      // Update local state only if component is still mounted
      if (isMounted.current) {
        const updatedItems = cartItems.filter(item => item.id !== id);
        updateCartItems(updatedItems);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error removing item:', error);
        setError('Failed to remove item. Please try again.');
      }
    }
  };

  // Tính tổng tiền
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Giảm giá (hardcoded for now, could be calculated based on business logic)
  const discount = 0;
  
  // Tổng cộng sau khi giảm giá
  const finalAmount = totalAmount - discount;

  const handleCheckoutClick = () => {
    if (currentOrderId) {
      const user = JSON.parse(localStorage.getItem('user'));
      const queryParams = new URLSearchParams({
        orderId: currentOrderId,
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        note: note
      }).toString();
      navigate(`/checkout?${queryParams}`);
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (

//     <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh',width: "99vw" }}>
    <Box sx={{ backgroundColor: '#e0f7fa', minHeight: '100vh', overflow: 'hidden', width:'99vw' }}>
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
                    <Box component={Link} 
                      to={`/product/${item.productId}`}
                      sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      bgcolor: '#f5f5f5',
                      textDecoration: 'none',
                      '&:hover img': {
                        transform: 'scale(1.05)'
                      }
                    }}>
                      <img 
                        src={item.imgUrl} 
                        alt={item.name} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          console.log(`Lỗi khi tải ảnh: ${e.target.src}`);
                          e.target.onerror = null; // Tránh lặp vô hạn
                          // Sử dụng placeholder trực tiếp thay vì thử ảnh mặc định
                          e.target.src = `https://via.placeholder.com/80/ffcc66/333333?text=${encodeURIComponent(item.name.substring(0, 8))}`;
                        }}
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
                        disabled={item.quantity <= 1 || loadingItems[item.id]}
                        sx={{ 
                          minWidth: 30, 
                          width: 30, 
                          height: 30, 
                          p: 0, 
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        {loadingItems[item.id] ? 
                          <CircularProgress size={16} thickness={5} /> : 
                          '-'}
                      </Button>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <Button 
                        onClick={() => increaseQuantity(item.id)}
                        disabled={loadingItems[item.id]}
                        sx={{ 
                          minWidth: 30, 
                          width: 30, 
                          height: 30, 
                          p: 0, 
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      >
                        {loadingItems[item.id] ? 
                          <CircularProgress size={16} thickness={5} /> : 
                          '+'}
                      </Button>
                    </Box>
                    
                    {/* Thêm phần hiển thị lỗi */}
                    {itemErrors && itemErrors[item.id] && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'error.main', 
                          display: 'block',
                          mt: 1,
                          fontSize: '0.75rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {itemErrors[item.id]}
                      </Typography>
                    )}
                    
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
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
                onClick={handleCheckoutClick}
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

