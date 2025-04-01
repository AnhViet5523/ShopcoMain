import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Grid } from '@mui/material';
import ProductCard from './ProductCard';
import productService from '../apis/productService';
import Header from './Header';
import Footer from './Footer/Footer';
import Banner from './Banner';

const BrandProducts = () => {
  const { brandName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductsByBrand();
  }, [brandName]);

  const fetchProductsByBrand = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!brandName) {
        setError('Không tìm thấy thương hiệu');
        setLoading(false);
        return;
      }
      
      console.log('Fetching products for brand:', brandName);
      const data = await productService.getProductsByBrand(brandName);
      
      console.log('Products data:', data);

      // Xử lý ảnh và lấy rating cho mỗi sản phẩm
      if (Array.isArray(data)) {
        // Xử lý ảnh cho mỗi sản phẩm
        const productsWithImages = data.map(product => {
          // Nếu sản phẩm đã có ảnh từ API
          if (product.images && product.images.length > 0) {
            let mainImage = product.images.find(img => img.isMainImage === true);
            if (!mainImage) {
              mainImage = product.images.find(img => img.displayOrder === 0);
            }
            
            if (mainImage) {
              return {
                ...product,
                mainImage: mainImage.imgUrl || mainImage.imageUrl || '/images/default-product.jpg',
                images: product.images
              };
            }
            
            return {
              ...product,
              mainImage: product.images[0]?.imgUrl || product.images[0]?.imageUrl || '/images/default-product.jpg',
              images: product.images
            };
          }
          // Nếu sản phẩm có imgURL
          else if (product.imgURL) {
            return {
              ...product,
              mainImage: product.imgURL,
              images: [{ imgUrl: product.imgURL }]
            };
          }
          // Nếu không có ảnh, sử dụng ảnh mặc định
          return {
            ...product,
            mainImage: '/images/default-product.jpg',
            images: []
          };
        });

        // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
        const productsWithRatings = await Promise.all(
          productsWithImages.map(async (product) => {
            const { averageRating, totalReviews } = await productService.getProductAverageRating(product.productId);
            return {
              ...product,
              rating: averageRating,
              ratingCount: totalReviews,
            };
          })
        );

        setProducts(productsWithRatings);
      } else {
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#c2d3a0", minHeight: "100vh", width:'99vw' }}>
      <Header />
      <Banner />
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold',
            mb: 4
          }}
        >
          Sản phẩm từ {brandName}
        </Typography>
        
        <Grid container spacing={3}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ width: '100%', textAlign: 'center', my: 4 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : products && products.length > 0 ? (
            products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product.id || product.productId || `product-${index}`}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', my: 4 }}>
              <Typography>Không tìm thấy sản phẩm nào cho thương hiệu {brandName}</Typography>
            </Box>
          )}
        </Grid>
      </Box>
      <Footer />
    </Box>
  );
};

export default BrandProducts;