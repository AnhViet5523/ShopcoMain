import { useState, useEffect, memo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Rating, 
  Button, 
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Tabs,
  Tab,
  Badge,
  Modal,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Drawer
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon, Close as CloseIcon } from '@mui/icons-material';
import productService from '../../apis/productService';
import orderService from '../../apis/orderService';
import reviewService from "../../apis/reviewService";
import userService from '../../apis/userService';

const FlashDealTimer = memo(({ initialHours = 0, initialMinutes = 0, initialSeconds = 45 }) => {
  const [time, setTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => {
        const newSeconds = prevTime.seconds - 1;
        
        if (newSeconds < 0) {
          const newMinutes = prevTime.minutes - 1;
          
          if (newMinutes < 0) {
            const newHours = prevTime.hours - 1;
            
            if (newHours < 0) {
              clearInterval(timer);
              return { hours: 0, minutes: 0, seconds: 0 };
            }
            
            return { hours: newHours, minutes: 59, seconds: 59 };
          }
          
          return { ...prevTime, minutes: newMinutes, seconds: 59 };
        }
        
        return { ...prevTime, seconds: newSeconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography variant="body2">
      KẾT THÚC TRONG {time.hours.toString().padStart(2, '0')} : {time.minutes.toString().padStart(2, '0')} : {time.seconds.toString().padStart(2, '0')}
    </Typography>
  );
});

FlashDealTimer.displayName = 'FlashDealTimer';
FlashDealTimer.propTypes = {
  initialHours: PropTypes.number,
  initialMinutes: PropTypes.number,
  initialSeconds: PropTypes.number
};

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsWithUsernames, setReviewsWithUsernames] = useState([]);
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const requestInProgress = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);
  const [comparedProducts, setComparedProducts] = useState([]);
  const [availableProductsToCompare, setAvailableProductsToCompare] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    if (!requestInProgress.current) {
      fetchProduct();
    }
    return () => {
      isMounted.current = false;
    };
  }, [id]);

  useEffect(() => {
    if (reviews && reviews.length > 0 && !loading) {
      fetchUsernames();
    }
  }, [reviews, loading]);

  const fetchProduct = async () => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    try {
      setLoading(true);
      console.log(`Fetching product with ID: ${id}`);
      const fetchedProduct = await productService.getProductById(id);
      console.log('Fetched product:', fetchedProduct);
      
      const fetchedReviews = await reviewService.getReviewsProductId(id);
      const totalSold = await orderService.countBoughtProducts(id);
      
      if (isMounted.current && fetchedProduct) {
        // Xử lý hình ảnh sản phẩm
        let images = [];
        if (fetchedProduct.images && fetchedProduct.images.length > 0) {
          images = fetchedProduct.images;
        } else if (fetchedProduct.imgURL) {
          images = [{ imgUrl: fetchedProduct.imgURL }];
        } else {
          images = [{ imgUrl: '/images/default-product.jpg' }];
        }
        
        setProductImages(images);
        console.log('Product images:', images);
        
        // Xác định trạng thái sản phẩm dựa trên số lượng tồn kho và trạng thái
        let productStatus = 'Available';
        // Kiểm tra trạng thái từ API
        if (fetchedProduct.status && 
            (fetchedProduct.status === 'Hết hàng' || 
             fetchedProduct.status.toLowerCase().includes('hết') ||
             fetchedProduct.status === 'Out of Stock')) {
          productStatus = 'Out of Stock';
        }
        
        // Kiểm tra số lượng tồn kho
        if (fetchedProduct.inventory === 0 || fetchedProduct.stock === 0 || fetchedProduct.quantity === 0) {
          productStatus = 'Out of Stock';
        }
        
        setProduct({
          ...fetchedProduct,
          discountedPrice: fetchedProduct.price - (fetchedProduct.price * 15 / 100),
          relatedProducts: [
            {
              id: 1,
              name: "Sữa rửa mặt GGGGGGGG",
              price: 115000,
              originalPrice: 250000,
              discountPercent: 47,
              rating: 4,
              reviewCount: 243,
              soldCount: 657,
              image: "/path/to/image.jpg"
            }
          ],
          status: productStatus,
          inventory: fetchedProduct.inventory || fetchedProduct.stock || fetchedProduct.quantity || 0
        });
        setReviews(fetchedReviews || []);
        if (totalSold) {
          setTotalSold(totalSold.totalSold);
        }
      }
      console.log("Total Sold:", totalSold);
      console.log("Product Status:", product?.status);
      
      // Log sau khi state đã được cập nhật
      setTimeout(() => {
        console.log("Product sau khi cập nhật:", product);
        console.log("Status sau khi cập nhật:", product?.status);
      }, 100);
      
    } catch (error) {
      console.error("Error fetching product or reviews:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      requestInProgress.current = false;
    }
  };

  const fetchUsernames = async () => {
    try {
      const reviewsWithNames = await Promise.all(
        reviews.map(async (review) => {
          try {
            const userProfile = await userService.getUserProfile(review.userId);
            return {
              ...review,
              userName: userProfile?.username || userProfile?.fullName || `Người dùng ${review.userId}`
            };
          } catch (error) {
            console.error(`Error fetching user profile for ID ${review.userId}:`, error);
            return { ...review, userName: `Người dùng ${review.userId}` };
          }
        })
      );
      setReviewsWithUsernames(reviewsWithNames);
    } catch (error) {
      console.error('Error fetching usernames:', error);
    }
  };

  console.log("review", reviews);
  console.log("product", product);
  console.log("productImages", productImages);

  if (loading) {
    return <Typography>Đang tải sản phẩm...</Typography>;
  }

  if (!product) {
    return <Typography>Không tìm thấy sản phẩm</Typography>;
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 0)) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = async () => {
    if (!product) return;

    // Kiểm tra số lượng và trạng thái sản phẩm
    if (totalSold === 0 && product.status === 'Out of Stock') {
        alert('Sản phẩm hiện đã hết, shop đang cập nhật.');
        return;
    }
    
    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Kiểm tra đăng nhập
      if (!user || !user.userId) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        navigate('/login', { state: { returnUrl: `/product/${id}` } });
        return;
      }
      
      const userId = user.userId;
      
      // Call the API to add item to cart
      await orderService.addtocard(userId, product.productId, quantity);
      
      // Lấy thông tin giỏ hàng mới nhất
      const currentCart = await orderService.getCurrentCart(userId);
      if (currentCart && currentCart.items && currentCart.items.$values) {
        // Cập nhật localStorage với dữ liệu giỏ hàng mới
        const cartItems = currentCart.items.$values.map(item => ({
          id: item.orderItemId,
          productId: item.productId,
          name: item.product ? item.product.productName : 'Sản phẩm không xác định',
          price: item.price,
          originalPrice: item.price * 1.2,
          quantity: item.quantity,
          imgUrl: getProductImage(item.product),
        }));
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
      
      // Dispatch custom event to notify other components (like Header) that cart has been updated
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Show success message
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
      
      // Reset quantity
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };
  
  // Hàm hỗ trợ lấy hình ảnh sản phẩm
  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/150/ffcc66/333333?text=Product';
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      return firstImage?.imgUrl || firstImage?.imageUrl;
    } else if (product.imgUrl) {
      return product.imgUrl;
    } else if (product.imgURL) {
      return product.imgURL;
    } else if (product.image) {
      return product.image;
    } else {
      return `https://via.placeholder.com/150/ffcc66/333333?text=${encodeURIComponent(product.productName ? product.productName.substring(0, 8) : 'Product')}`;
    }
  };

  const handleBuyNow = async () => {
    // Kiểm tra số lượng và trạng thái sản phẩm
    if (totalSold === 0 && product.status === 'Out of Stock') {
        alert('Sản phẩm hiện đã hết, shop đang cập nhật.');
        return;
    }
    
    try {
        setLoading(true);
        
        // Lấy thông tin user và kiểm tra đăng nhập
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.userId) {
            alert('Vui lòng đăng nhập để mua hàng');
            navigate('/login', { state: { returnUrl: `/product/${id}` } });
            return;
        }
        
        const userId = user.userId;
        
        // Gọi API buyNow
        const response = await orderService.buyNow(userId, product.productId, quantity);
        
        // Log phản hồi để debug
        console.log("Phản hồi từ API mua ngay:", response);
        
        // Xử lý phản hồi để tìm orderId
        let orderId = null;
        
        if (response) {
            // Kiểm tra cấu trúc mới - orderId nằm trong thuộc tính order
            if (response.order && response.order.orderId) {
                orderId = response.order.orderId;
                console.log("Tìm thấy orderId trong response.order:", orderId);
            }
            // Giữ lại kiểm tra cũ để tương thích ngược
            else if (typeof response === 'object') {
                orderId = response.orderId || response.OrderId || 
                         (response.data && response.data.orderId) || 
                         (response.data && response.data.OrderId);
            } else if (typeof response === 'number') {
                orderId = response;
            }
        }
        
        if (orderId) {
            console.log("Chuyển đến trang thanh toán với orderId:", orderId);
            navigate(`/checkout?orderId=${orderId}`);
        } else {
            console.error("Không tìm thấy orderId trong phản hồi:", response);
            alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
        }
    } catch (error) {
        console.error('Lỗi khi thực hiện chức năng mua ngay:', error);
        alert('Có lỗi xảy ra khi mua ngay. Vui lòng thử lại sau.');
    } finally {
        setLoading(false);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleReviewSubmit = async () => {
    if (!reviewContent || reviewRating <= 0) {
      alert('Please provide a review and rating.');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.userId || 1;
      await reviewService.postReview({
        userId,
        productId: id,
        rating: reviewRating,
        reviewComment: reviewContent
      });
      const updatedReviews = await reviewService.getReviewsProductId(id);
      setReviews(updatedReviews);
      alert('Review added successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng.');
    }
  };

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (!image) return '/images/default-product.jpg';
    
    // Nếu là đường dẫn đầy đủ (bắt đầu bằng http hoặc https)
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return image;
    }
    
    // Nếu là object có thuộc tính imgUrl
    if (image.imgUrl) {
      if (image.imgUrl.startsWith('http')) return image.imgUrl;
      return image.imgUrl;
    }
    
    return '/images/default-product.jpg';
  };

  const handleSelectImage = (index) => {
    setSelectedImageIndex(index);
  };

  const handleCompareProduct = () => {
    // Nếu sản phẩm hiện tại chưa được thêm vào danh sách so sánh
    if (!comparedProducts.some(p => p.productId === product.productId)) {
      // Thêm sản phẩm hiện tại vào danh sách so sánh
      setComparedProducts([product]);
    }
    // Hiển thị drawer
    setShowCompareDrawer(true);
  };

  const handleOpenAddProductModal = async () => {
    try {
      const categoryId = product?.categoryId;
      if (categoryId) {
        // Lấy sản phẩm cùng danh mục
        const similarProducts = await productService.getProductsByCategory(categoryId);
        
        // Loại bỏ sản phẩm đã có trong danh sách so sánh và sản phẩm hiện tại
        const filteredProducts = similarProducts.filter(
          p => !comparedProducts.some(cp => cp.productId === p.productId) && 
               p.productId !== product.productId
        );
        
        // Nếu không có sản phẩm để so sánh, hiển thị thông báo
        if (filteredProducts.length === 0) {
          alert('Không có sản phẩm khác trong cùng danh mục để so sánh');
          return;
        }
        
        setAvailableProductsToCompare(filteredProducts);
        setShowCompareDrawer(false); // Đóng drawer trước khi mở modal
        setIsCompareModalOpen(true); // Mở modal chọn sản phẩm
      } else {
        alert('Không tìm thấy danh mục sản phẩm');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      alert('Không thể tải danh sách sản phẩm để so sánh');
    }
  };

  const handleAddProductToCompare = (productToAdd) => {
    // Thêm sản phẩm được chọn vào danh sách so sánh
    setComparedProducts([...comparedProducts, productToAdd]);
    // Đóng modal
    setIsCompareModalOpen(false);
    // Mở lại drawer so sánh
    setShowCompareDrawer(true);
  };

  const handleCloseCompareModal = () => {
    setIsCompareModalOpen(false);
    // Mở lại drawer so sánh
    setShowCompareDrawer(true);
  };

  // Thêm lại hàm handleCloseCompareDrawer
  const handleCloseCompareDrawer = () => {
    setShowCompareDrawer(false);
  };

  const handleNavigateToCompare = () => {
    // Lưu các sản phẩm so sánh vào localStorage
    localStorage.setItem('comparedProducts', JSON.stringify(comparedProducts));
    
    // Chuyển đến trang so sánh
    navigate('/compare-products');
  };

  return (
    <>
      <Container>
        <Breadcrumbs aria-label="breadcrumb" sx={{ my: 2 }}>
          <Link color="inherit" href="/">
            <HomeIcon />
          </Link>
          <Link color="inherit" href="/category">
            Danh Mục
          </Link>
          {loading ? (
            <Box sx={{ bgcolor: '#f0f0f0', height: 24, width: 200 }} />
          ) : (
            <Typography color="textPrimary">{product?.productName}</Typography>
          )}
        </Breadcrumbs>
        <Grid container spacing={3}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex' }}>
              {/* Thumbnail images */}
              <Box sx={{ width: '20%', mr: 2 }}>
                {loading ? (
                  // Gray background placeholders for thumbnails while loading
                  Array(4).fill().map((_, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        mb: 1,
                        border: '1px solid #eee',
                        background:'gray',  
                        p: 1
                      }}
                    >
                      <Box 
                        sx={{ 
                          bgcolor: '#f0f0f0', 
                          height: 80, 
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="caption" color="#bdbdbd">
                          Loading...
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  // Actual thumbnails or placeholders
                  productImages.length > 0 ? 
                    productImages.map((image, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 1, 
                          border: selectedImageIndex === index ? '2px solid #1976d2' : '1px solid #eee',
                          p: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSelectImage(index)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-product.jpg';
                          }}
                        />
                      </Box>
                    )) : 
                    Array(4).fill().map((_, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 1, 
                          border: '1px solid #eee',
                          p: 1
                        }}
                      >
                        <Box 
                          sx={{ 
                            bgcolor: '#f5f5f5', 
                            height: 80, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            No Image
                          </Typography>
                        </Box>
                      </Box>
                    ))
                )}
              </Box>
              
              {/* Main image */}
              <Box sx={{ width: '80%' }}>
                {loading ? (
                  <Box 
                    sx={{ 
                      bgcolor: '#f0f0f0', 
                      height: 400, 
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #eee'
                    }}
                  >
                    <Typography variant="h6" color="#bdbdbd">
                      Loading Image...
                    </Typography>
                  </Box>
                ) : (
                  productImages.length > 0 ? (
                    <Box
                      sx={{
                        height: 400,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #eee',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={getImageUrl(productImages[selectedImageIndex])}
                        alt={product.productName}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain' 
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-product.jpg';
                        }}
                      />
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        bgcolor: '#f5f5f5', 
                        height: 400, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #eee'
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        No Image Available
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Grid>
          
          {/* Product Details */}
          <Grid item xs={12} md={6}>
            {loading ? (
              // Gray background placeholders for product details
              <>
                <Box sx={{ bgcolor: '#f0f0f0', height: 60, width: '80%', mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ bgcolor: '#f0f0f0', height: 24, width: 120 }} />
                </Box>
                <Box sx={{ bgcolor: '#f0f0f0', height: 60, width: '100%', mb: 2 }} />
                <Box sx={{ bgcolor: '#f0f0f0', height: 100, width: '100%', mb: 2 }} />
                <Box sx={{ bgcolor: '#f0f0f0', height: 30, width: '40%', mb: 3 }} />
                <Box sx={{ bgcolor: '#f0f0f0', height: 50, width: '100%', mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ bgcolor: '#f0f0f0', height: 50, width: '50%' }} />
                  <Box sx={{ bgcolor: '#f0f0f0', height: 50, width: '50%' }} />
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h5" component="h1" gutterBottom>
                  {product?.productName}
                </Typography>
                
                {/* Ratings */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={4.5} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {reviews?.length} đánh giá
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                    Đã bán {totalSold} sản phẩm
                  </Typography>
                </Box>
                
                {/* Flash Deal */}
                <Box 
                  sx={{ 
                    bgcolor: '#f57224', 
                    color: 'white', 
                    p: 1, 
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    🔥 FLASH DEAL
                  </Typography>
                  <FlashDealTimer />
                </Box>
                
                {/* Price */}
                <Box sx={{ mb: 2, bgcolor: '#f8f8f8', p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="h5" 
                      component="span" 
                      color="error" 
                      fontWeight="bold"
                    >
                      {product?.discountedPrice?.toLocaleString()}đ
                    </Typography>
                    <Typography 
                      variant="body2" 
                      component="span" 
                      sx={{ 
                        textDecoration: 'line-through', 
                        color: 'text.secondary',
                        ml: 2
                      }}
                    >
                      {product?.price?.toLocaleString()}đ
                    </Typography>
                    <Badge 
                      sx={{ ml: 2 }}
                      badgeContent={`14%`} 
                      color="error"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    *Giá đã bao gồm VAT
                  </Typography>
                </Box>
                
                {/* Product Specifications */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Dung tích:</strong> {product?.capacity || 'Chưa có thông tin'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Thương hiệu:</strong> {product?.brand || 'Chưa có thông tin'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Xuất xứ:</strong> {product?.origin || 'Chưa có thông tin'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Loại da:</strong> {product?.skinType || 'Chưa có thông tin'}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Số lượng tồn kho:</strong> {product?.inventory || product?.quantity || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Trạng thái:</strong> {product?.status === 'Available' ? 'Còn hàng' : 'Hết hàng'}
                  </Typography>
                </Box>
                
                {/* Quantity Selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    Số lượng:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ px: 2 }}>{quantity}</Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= (product?.inventory || 0)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button 
                    variant="contained" 
                    color={product?.status !== 'Out of Stock' && product?.inventory > 0 ? "success" : "default"} 
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      opacity: product?.status !== 'Out of Stock' && product?.inventory > 0 ? 1 : 0.5
                    }}
                    onClick={product?.status !== 'Out of Stock' && product?.inventory > 0 ? addToCart : undefined}
                    disabled={product?.status === 'Out of Stock' || product?.inventory <= 0}
                  >
                    Thêm vào giỏ
                  </Button>
                  <Button 
                    variant="outlined" 
                    color={product?.status !== 'Out of Stock' && product?.inventory > 0 ? "success" : "default"} 
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      opacity: product?.status !== 'Out of Stock' && product?.inventory > 0 ? 1 : 0.5
                    }}
                    onClick={product?.status !== 'Out of Stock' && product?.inventory > 0 ? handleBuyNow : undefined}
                    disabled={product?.status === 'Out of Stock' || product?.inventory <= 0}
                  >
                    Mua Ngay
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      ml: 2
                    }}
                    onClick={handleCompareProduct}
                  >
                    So sánh
                  </Button>
                </Box>
                {console.log("Điều kiện hiển thị:", product?.inventory <= 0, product?.status === 'Out of Stock')}
                {(product?.inventory <= 0 || product?.status === 'Out of Stock') && (
                  <Typography color="error" sx={{ mt: 1, fontWeight: 'bold', display: 'block', fontSize: '1rem' }}>
                    Sản phẩm hiện đã hết, shop đang cập nhật.
                  </Typography>
                )}
              </>
            )}
          </Grid>
        </Grid>
        
        {/* Product Tabs */}
        <Box sx={{ mt: 4, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          {loading ? (
            <Box sx={{ bgcolor: '#f0f0f0', height: 48, width: '100%' }} />
          ) : (
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }
              }}
            >
              <Tab label="Thành Phần" />
              <Tab label="Đánh giá" sx={{ ml: 2 }} />
              <Tab label="Cách dùng" sx={{ ml: 2 }} />
            </Tabs>
          )}
        </Box>
        
        {/* Tab Content */}
        <Box sx={{ mb: 4 }}>
          {loading ? (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: '#f0f0f0', 
                height: 200, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="body1" color="#bdbdbd">
                Loading content...
              </Typography>
            </Box>
          ) : (
            <>
              {tabValue === 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1">{product?.description || 'Chưa có thông tin mô tả sản phẩm.'}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>{product?.ingredients || 'Chưa có thông tin về thành phần sản phẩm.'}</Typography>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ p: 2 }}>
                  {reviewsWithUsernames.length > 0 ? 
                    reviewsWithUsernames.map((review, index) => (
                      <Paper key={index} sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {review.userName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.reviewDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {review?.reviewComment}
                        </Typography>
                      </Paper>
                    )) : reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2 }}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              Người dùng {review.userId || "không xác định"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            {review?.reviewComment}
                          </Typography>
                        </Paper>
                      ))
                    ) : (
                      <Typography>Chưa có đánh giá nào</Typography>
                    )}
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleOpenModal}
                    sx={{ mt: 2 }}
                  >
                    Viết đánh giá
                  </Button>
                  <Modal open={isModalOpen} onClose={handleCloseModal}>
                    <Box sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 24, maxWidth: 400, mx: 'auto', mt: 4 }}>
                     <Box>
                     <Typography variant="h6" gutterBottom>Viết đánh giá</Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        label="Nhận xét của bạn"
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" sx={{ mb: 1 }}>Đánh giá của bạn:</Typography>
                      <Rating
                        value={reviewRating}
                        onChange={(e, newValue) => setReviewRating(newValue)}
                        sx={{ mb: 2 }}
                      />
                     </Box>
                      <Button variant="contained" color="primary" onClick={handleReviewSubmit}>Xác nhận</Button>
                    </Box>
                  </Modal>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1">{product?.usageInstructions || 'Chưa có hướng dẫn sử dụng sản phẩm.'}</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
        
      </Container>
      
      {/* Thay thế Drawer component bằng phần tử div tùy chỉnh */}
      <div 
        className={`compare-products ${showCompareDrawer ? 'open' : ''}`}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>So sánh sản phẩm</Typography>
          <IconButton onClick={handleCloseCompareDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {comparedProducts.length === 0 ? (
          <Typography>Chưa có sản phẩm nào được chọn để so sánh</Typography>
        ) : (
          <>
            <Grid container spacing={1}>
              {comparedProducts.map((product, index) => (
                <Grid item xs={6} key={index}>
                  <Paper 
                    sx={{ 
                      p: 1, 
                      textAlign: 'center', 
                      position: 'relative',
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5, 
                        color: 'gray' 
                      }}
                      // Thêm hàm xóa sản phẩm khỏi danh sách so sánh
                      onClick={() => {
                        setComparedProducts(comparedProducts.filter(p => p.productId !== product.productId));
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    <img 
                      src={getImageUrl(product.images?.[0])} 
                      alt={product.productName}
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'contain' 
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 1, 
                        fontWeight: 'bold', 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '40px'
                      }}
                    >
                      {product.productName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="error" 
                      sx={{ fontWeight: 'bold' }}
                    >
                      {product.price.toLocaleString()}đ
                    </Typography>
                  </Paper>
                </Grid>
              ))}
              
              {comparedProducts.length < 2 && (
                <Grid item xs={6}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: '2px dashed #ddd',
                      textAlign: 'center'
                    }}
                    onClick={handleOpenAddProductModal}
                  >
                    <AddIcon sx={{ fontSize: 40, color: '#ddd' }} />
                    <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                      Thêm sản phẩm để so sánh
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              sx={{ 
                mt: 2, 
                textTransform: 'none',
                fontWeight: 'bold',
                py: 1.5
              }}
              onClick={handleNavigateToCompare}
            >
              So sánh ngay
            </Button>
          </>
        )}
      </div>
      
      {/* CSS cho phần tử div tùy chỉnh */}
      <style>
      {`
        .compare-products {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: #fff;
          padding: 16px;
          box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(100%);
          transition: transform 0.3s ease-in-out;
          z-index: 1000;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }
        
        .compare-products.open {
          transform: translateY(0);
        }
      `}
      </style>
      
      {/* Modal chọn sản phẩm để so sánh */}
      <Modal open={isCompareModalOpen} onClose={handleCloseCompareModal}>
        <Box sx={{ 
          p: 4, 
          bgcolor: 'background.paper', 
          borderRadius: 1, 
          boxShadow: 24, 
          maxWidth: 600, 
          maxHeight: '80vh',
          mx: 'auto', 
          mt: 4,
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">Chọn sản phẩm để so sánh</Typography>
            <IconButton onClick={handleCloseCompareModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {availableProductsToCompare.length > 0 ? (
            <Grid container spacing={2}>
              {availableProductsToCompare.map((product, index) => (
                <Grid item xs={6} key={index}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => handleAddProductToCompare(product)}
                  >
                    <img 
                      src={getImageUrl(product.images?.[0])} 
                      alt={product.productName}
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'contain',
                        marginBottom: '8px'
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        textAlign: 'center',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '40px',
                        mb: 1
                      }}
                    >
                      {product.productName}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="error" 
                      sx={{ fontWeight: 'bold' }}
                    >
                      {product.price?.toLocaleString()}đ
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '300px',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Không có sản phẩm để so sánh
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại không có sản phẩm khác trong cùng danh mục
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
}
