import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Paper
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { getProductById } from '../../data/products'; 
export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = getProductById(id);
  
  if (!product) {
    return <Typography>Không tìm thấy sản phẩm</Typography>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          href="/"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'text.primary',
            textDecoration: 'none'
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Link href="/category" color="inherit">
          Danh mục
        </Link>
        <Link href="/category/skincare" color="inherit">
          Sữa rửa mặt
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Left side - Product Images */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'relative' }}>
            <Box
              component="img"
              src={product.images[selectedImage]}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                mb: 2
              }}
            />
            <Grid container spacing={1}>
              {product.images.map((img, index) => (
                <Grid item xs={3} key={index}>
                  <Paper
                    elevation={selectedImage === index ? 3 : 1}
                    sx={{
                      p: 0.5,
                      border: selectedImage === index ? '2px solid' : '1px solid',
                      borderColor: selectedImage === index ? 'primary.main' : 'grey.300',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      sx={{ width: '100%', height: 'auto' }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>

        {/* Right side - Product Info */}
        <Grid item xs={12} md={7}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.rating} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {product.ratingCount} đánh giá
            </Typography>
            <Typography variant="body2" sx={{ ml: 2 }}>
              Đã bán {product.soldCount}
            </Typography>
          </Box>

          {/* Flash Deal */}
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'error.main', 
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              🔥 FLASH DEAL
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography 
                variant="h4" 
                component="span"
                sx={{ fontWeight: 'bold' }}
              >
                {product.salePrice.toLocaleString()}đ
              </Typography>
              <Typography 
                variant="body1" 
                component="span" 
                sx={{ textDecoration: 'line-through' }}
              >
                {product.originalPrice.toLocaleString()}đ
              </Typography>
              <Typography variant="body2">
                Tiết kiệm {(product.originalPrice - product.salePrice).toLocaleString()}đ
              </Typography>
            </Box>
          </Paper>

          {/* Quantity */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Dung tích: {product.capacity}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>Số lượng:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ mx: 2 }}>{quantity}</Typography>
                <IconButton 
                  onClick={() => setQuantity(quantity + 1)}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ flex: 1 }}
            >
              Mua Ngay
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ flex: 1 }}
            >
              Thêm vào giỏ
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
} 