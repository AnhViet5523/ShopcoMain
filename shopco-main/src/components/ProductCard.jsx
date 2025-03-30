import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, Rating } from '@mui/material';
import orderService from '../apis/orderService';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [soldCount, setSoldCount] = useState(product.soldCount || 0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchSoldCount = async () => {
      try {
        // Get product ID based on available properties
        const productId = product.id || product.productId;
        if (productId) {
          const result = await orderService.countBoughtProducts(productId);
          if (result && result.totalSold !== undefined) {
            setSoldCount(result.totalSold);
          }
        }
      } catch (error) {
        console.error('Error fetching sold count:', error);
      }
    };

    // Only fetch if soldCount is not already provided in the product prop
    if (!product.soldCount) {
      fetchSoldCount();
    }
  }, [product]);

  const handleClick = () => {
    if(product.id){
      navigate(`/product/${product.id}`);
      return;
    }
    navigate(`/product/${product.productId}`);
  };

  // Xử lý lỗi khi hình ảnh không tải được
  const handleImageError = () => {
    setImageError(true);
  };

  // Chọn nguồn hình ảnh phù hợp
  const getImageSource = () => {
    if (imageError) {
      return '/images/default-product.jpg'; // Ảnh mặc định khi có lỗi
    }
    
    // Ưu tiên theo thứ tự: imgUrl, image, imgURL
    return product.imgUrl || product.image || product.imgURL || '/images/default-product.jpg';
  };

  // Thêm hàm tính giá giảm 15%
  const calculateDiscountedPrice = (price) => {
    return Math.round(price * 0.85);
  };

  // Lấy giá gốc từ sản phẩm
  const originalPrice = product.price || 0;

  // Tính giá sau khi giảm 15%
  const discountedPrice = calculateDiscountedPrice(originalPrice);

  return (
    <Card 
      onClick={handleClick}
      sx={{ 
        cursor: 'pointer',
        '&:hover': { 
          boxShadow: 3,
          transform: 'translateY(-4px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={getImageSource()}
        alt={product.name || product.productName || "Sản phẩm"}
        onError={handleImageError}
        sx={{ objectFit: 'contain', padding: '10px' }}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.productName || product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" color="error" fontWeight="bold">
            {discountedPrice.toLocaleString()}đ
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'line-through' }}
          >
            {originalPrice.toLocaleString()}đ
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating 
            value={product.rating || 0} 
            precision={0.5} 
            readOnly 
            size="small" 
          />
          <Typography variant="body2" color="text.secondary">
            {product.ratingCount ? `(${product.ratingCount})` : ""}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đã bán {soldCount}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
//!
  