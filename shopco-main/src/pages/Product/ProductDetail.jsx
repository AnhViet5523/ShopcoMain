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
  Badge,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon, LocalShipping } from '@mui/icons-material';
import productService from '../../apis/productService';

const defaultProduct =  {
    "productId": 2,
    "productCode": "LSD002",
    "categoryId": 1,
    "productName": "Nước Tẩy Trang Bioderma Dành Cho Da Nhạy Cảm 500ml",
    "quantity": 10,
    "capacity": "110ml, 250ml, 500ml",
    "price": 525000,
    "discountedPrice": 325000,
    "originalPrice": 380000,
    "savings": 55000,
    "brand": "Bioderma",
    "origin": "Pháp",
    "status": "Available",
    "imgUrl": "2",
    "skinType": "Da nhạy cảm",
    "description": "Dành Cho Da Nhạy Cảm Bioderma Sensibio H2O là sản phẩm nước tẩy trang công nghệ Micellar đầu tiên trên thế giới, do thương hiệu dược mỹ phẩm Bioderma nổi tiếng của Pháp phát minh. Dung dịch giúp làm sạch sâu da và loại bỏ lớp trang điểm nhanh chóng mà không cần rửa lại bằng nước. Công thức dịu nhẹ, không kích ứng, không gây khô căng da, đặc biệt phù hợp với làn da nhạy cảm  HSD: ~3 năm (chưa mở), ~6-12 tháng (sau khi mở)",
    "ingredients": "NULL\"1. Nước Tẩy Trang Bioderma Dành Cho Da Nhạy Cảm\r\n- Thành phần chính: Công nghệ Micellar: Các hạt micelle, có thành phần được lấy cảm hứng từ lipid của da, là những hạt làm sạch vô hình siêu nhỏ. Chúng có khả năng thu giữ các tạp chất trong khi vẫn duy trì lớp màng bảo vệ tự nhiên của da.\r\n- Sáng chế D.A.F: Các tác động từ bên ngoài có thể làm cho da trở nên kích ứng và nhạy cảm. Hợp chất này giúp làm tăng khả năng dung nạp của làn da - bất kể đối với loại da nào - nhằm tăng cường sức đề kháng cho da.\r\n- Thành phần chi tiết: Aqua/Water/Eau, Peg-6 Caprylic/Capric Glycerides, Fructooligosaccharides, Mannitol, Xylitol, Rhamnose, Cucumis Sativus (Cucumber) Fruit Extract, Propylene Glycol, Cetrimonium Bromide, Disodium Edta. [Bi 446]\r\n\r\n2. Nước Tẩy Trang Bioderma Dành Cho Da Dầu & Hỗn Hợp\r\n - Thành phần chính: Công nghệ Micellar: Các hạt micelle, có thành phần được lấy cảm hứng từ lipid của da, là những hạt làm sạch vô hình siêu nhỏ. Chúng có khả năng thu giữ các tạp chất trong khi vẫn duy trì lớp màng bảo vệ tự nhiên của da.\r\n- Sáng chế D.A.F: Các tác động từ bên ngoài có thể làm cho da trở nên kích ứng và nhạy cảm. Hợp chất này giúp làm tăng khả năng dung nạp của làn da - bất kể đối với loại da nào - nhằm tăng cường sức đề kháng cho da.\r\n- Thành phần đầy đủ: Water (Aqua), Peg-6 Caprylic/Capric Glycerides, Sodium Citrate , Zinc Gluconate, Copper Sulfate, Ginkgo Biloba Extract – Chiết Xuất Lá Bạch Quả, Mannitol, Xylitol, Rhamnose, Fructooligosaccharides, Propylene Glycol, Citric Acid, Disodium Edta, Cetrimonium Bromide, Fragrance (Parfum).\"",
    "usageInstructions": "\"- Thấm nước tẩy trang lên bông tẩy trang.\n- Nhẹ nhàng làm sạch vùng mặt và mắt.\n- Không cần rửa lại với nước.\n- Sử dụng vào hằng ngày để làm sạch da.\"",
    "manufactureDate": "2024-03-26T00:00:00",
    "category": null,
    "orderItems": [],
    "promotions": [],
    "reviews": [
      {
        "id": 1,
        "userName": "Kristin Watson",
        "date": "March 14, 2021",
        "rating": 5,
        "content": "bị lỗi"
      },
      {
        "id": 2,
        "userName": "Jenny Wilson",
        "date": "January 28, 2021",
        "rating": 5,
        "content": "ok!"
      },
      {
        "id": 3,
        "userName": "Bessie Cooper",
        "date": "January 11, 2021",
        "rating": 4,
        "content": "Dùng ổn"
      }
    ],
    "relatedProducts": [
      {
        "id": 1,
        "name": "Sữa rửa mặt GGGGGGGG",
        "price": 115000,
        "originalPrice": 250000,
        "discountPercent": 47,
        "rating": 4,
        "reviewCount": 243,
        "soldCount": 657,
        "image": "/path/to/image.jpg"
      }
    ]
}

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
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [product, setProduct] = useState(defaultProduct);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      try {
        const fetchedProduct = await productService.getProductById(id);
        const _fetchedProduct = {
          ...fetchedProduct,
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
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/placeholder.jpg';
                          }}
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
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.jpg';
                      }}
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
                      {product?.originalPrice?.toLocaleString()}đ
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
        
        {/* Related Products */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            SẢN PHẨM LIÊN QUAN
          </Typography>
          <Grid container spacing={2}>
            {loading ? (
              // Gray background placeholders for related products
              Array(4).fill().map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <Box 
                      sx={{ 
                        bgcolor: '#f0f0f0', 
                        height: 200, 
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="body2" color="#bdbdbd">
                        Loading...
                      </Typography>
                    </Box>
                    <CardContent>
                      <Box sx={{ bgcolor: '#f0f0f0', height: 24, width: '100%', mb: 1 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ bgcolor: '#f0f0f0', height: 20, width: 80 }} />
                        <Box sx={{ bgcolor: '#f0f0f0', height: 20, width: 60, ml: 1 }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ bgcolor: '#f0f0f0', height: 20, width: 120 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              product?.relatedProducts?.map((related, index) => (
                <Grid item key={index} xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={related.image || "/images/placeholder.jpg"}
                      alt={related.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    <CardContent>
                      <Typography variant="body1" component="div" noWrap>
                        {related.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body1" color="error" fontWeight="bold">
                          {related.price?.toLocaleString()}đ
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textDecoration: 'line-through', 
                            color: 'text.secondary',
                            ml: 1
                          }}
                        >
                          {related.originalPrice?.toLocaleString()}đ
                        </Typography>
                        <Badge 
                          sx={{ ml: 1 }}
                          badgeContent={`${related.discountPercent}%`} 
                          color="error"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Rating value={related.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {related.reviewCount}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <LocalShipping fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {related.soldCount}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
        
        {/* Footer Info */}
        <Box sx={{ mt: 4, mb: 4, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight="bold">BEAUTY COSMETICS</Typography>
          <Typography variant="body2">Địa Chỉ: Khu công nghệ cao - quận 9</Typography>
          <Typography variant="body2">Điện thoại: 09565497</Typography>
          <Typography variant="body2">Email: beautycosmetics@gmail.vn</Typography>
        </Box>
      </Container>
    </>
  );
} 