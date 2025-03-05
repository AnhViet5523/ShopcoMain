import { useState, useEffect, memo } from 'react';
import { useParams } from 'react-router-dom';
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
  Badge
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon, LocalShipping } from '@mui/icons-material';
import productService from '../../apis/productService';

// Create a separate memoized component for the timer
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

// Add display name and prop types
FlashDealTimer.displayName = 'FlashDealTimer';
FlashDealTimer.propTypes = {
  initialHours: PropTypes.number,
  initialMinutes: PropTypes.number,
  initialSeconds: PropTypes.number
};

export default function ProductDetail() {
  const { id } = useParams();
  console.log("Product ID: ", id);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      try {
        const fetchedProduct = await productService.getProductById(id);
        const _fetchedProduct = {
          ...fetchedProduct,
          discountedPrice: fetchedProduct.price - (fetchedProduct.price * 15 / 100),
          reviews: [
            {
              id: 1,
              userName: "Kristin Watson",
              date: "March 14, 2021",
              rating: 5,
              content: "bị lỗi"
            },
            {
              id: 2,
              userName: "Jenny Wilson",
              date: "January 28, 2021",
              rating: 5,
              content: "ok!"
            },
            {
              id: 3,
              userName: "Bessie Cooper",
              date: "January 11, 2021",
              rating: 4,
              content: "Dùng ổn"
            }
          ],
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
          ]
          
        }
        setProduct(_fetchedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <Typography>Không tìm thấy sản phẩm</Typography>;
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Helper function to check if image exists
  const getImageUrl = (imgUrl) => {
    if (!imgUrl) return null;
    return `/images/products/${imgUrl}.jpg`;
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
                          Loading...22
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  // Actual thumbnails or placeholders
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
                      {getImageUrl(product.imgUrl) ? (
                        <img
                          src={getImageUrl(product.imgUrl)}
                          alt={`Thumbnail ${index + 1}`}
                          style={{ width: '100%', cursor: 'pointer' }}
                
                        />
                      ) : (
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
                      )}
                    </Box>
                  ))
                )}
              </Box>
              
              {/* Main image */}
              <Box sx={{ width: '80%',background:'gray' }}>
                {loading ? (
                  <Box 
                    sx={{ 
                      bgcolor: 'red', 
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
                  getImageUrl(product.imgUrl) ? (
                    <img
                      src={getImageUrl(product.imgUrl)}
                      alt={product.productName}
                      style={{ width: '100%', cursor: 'pointer' }}
      
                    />
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
                    157 đánh giá
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                    Đã bán 200
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
                    Dung tích: 50g
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
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Mua Ngay
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="success" 
                    sx={{ 
                      flex: 1,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Thêm vào giỏ
                  </Button>
                </Box>
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
                  <Typography variant="body1">{product?.description}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>{product?.ingredients}</Typography>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ p: 2 }}>
                  {product?.reviews?.map((review, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box 
                          component="img" 
                          src="/images/avatar-placeholder.jpg" 
                          alt={review.userName}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%',
                            mr: 2
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/avatar-placeholder.jpg';
                          }}
                        />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {review.userName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {review.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {review.content}
                      </Typography>
                    </Paper>
                  ))}
                  {product?.reviews?.length === 0 && (
                    <Typography>Chưa có đánh giá nào</Typography>
                  )}
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1">{product?.usageInstructions}</Typography>
                </Box>
              )}
            </>
          )}
        </Box>
        
      </Container>
    </>
  );
} 