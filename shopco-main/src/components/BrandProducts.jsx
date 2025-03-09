import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, CircularProgress, Grid } from '@mui/material';
import ProductCard from './ProductCard';
import productService from '../apis/productService';
import Header from './Header';
import Footer from './Footer/Footer';
import { styled } from '@mui/material/styles';

const BrandTitle = styled(Typography)(({ theme }) => ({
  backgroundColor: '#f0f0f0',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px'
}));

const BrandProducts = () => {
  const { brandName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsByBrand = async () => {
      try {
        setLoading(true);
        console.log('Fetching products for brand:', brandName);
        
        // Gọi API để lấy sản phẩm theo thương hiệu
        const response = await productService.getProductsByBrand(brandName);
        console.log('API response:', response);
        
        // Xử lý dữ liệu trả về với nhiều trường hợp khác nhau
        let productData = [];
        if (response && Array.isArray(response)) {
          productData = response;
        } else if (response && response.$values && Array.isArray(response.$values)) {
          productData = response.$values;
        } else if (response && typeof response === 'object') {
          productData = [response];
        }
        
        console.log('Processed products data:', productData);
        setProducts(productData);
        
        if (productData.length === 0) {
          setError('Không tìm thấy sản phẩm');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (brandName) {
      fetchProductsByBrand();
    }
  }, [brandName]);

  return (
    <>
      <Header />
      <Box sx={{ width: "99vw", overflowX: "hidden" }}>
        <BrandTitle 
          variant="h4" 
          align="center" 
          gutterBottom
        >
          {error ? error : `Kết quả tìm kiếm cho: ${brandName}`}
        </BrandTitle>

        <Grid container spacing={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
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
    </>
  );
};

export default BrandProducts;