import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Container } from '@mui/material';
import ProductCard from './ProductCard';
import productService from '../apis/productService';
import orderService from '../apis/orderService';
import Header from './Header';
import Footer from './Footer/Footer';
import { styled } from '@mui/material/styles';

const BestSellersTitle = styled(Typography)(({ theme }) => ({
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
}));

const BestSellers = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBestSellingProducts = async () => {
            try {
                setLoading(true);
                const allProducts = await productService.getAllProducts();
                const soldPromises = allProducts.map(async (product) => {
                    try {
                        const totalSold = await orderService.countBoughtProducts(product.productId);
                        return {
                            ...product,
                            soldCount: totalSold?.totalSold || 0
                        };
                    } catch (error) {
                        console.error(`Error fetching sold count for product ${product.productId}:`, error);
                        return {
                            ...product,
                            soldCount: 0
                        };
                    }
                });
                const productsWithSoldCount = await Promise.all(soldPromises);
                const sortedProducts = productsWithSoldCount.sort((a, b) => b.soldCount - a.soldCount);
                const topProducts = sortedProducts.slice(0, 12);
                setProducts(topProducts);
                if (topProducts.length === 0) {
                    setError('Không tìm thấy sản phẩm bán chạy');
                } else {
                    setError(null);
                }
            } catch (error) {
                console.error('Error fetching best selling products:', error);
                setError('Đã xảy ra lỗi khi tải sản phẩm bán chạy');
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellingProducts();
    }, []);

    if (loading) {
        return (
          <Box sx={{ bgcolor: "#c2d3a0 ", minHeight: "100vh", width:'99vw' }}>
                <Header />
                <Container>
                    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography variant="h5">Đang tải sản phẩm bán chạy...</Typography>
                    </Box>
                </Container>
                <Footer />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "#c2d3a0 ", minHeight: "100vh", width:'99vw' }}>
            <Header />
            <Container>
                <Box sx={{ my: 4, width: "100%", overflowX: "hidden" }}>
                    <BestSellersTitle variant="h4">
                        Sản Phẩm Bán Chạy
                    </BestSellersTitle>
                    
                    {error ? (
                        <Box sx={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography variant="h6" color="error">{error}</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {products.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
                                    <ProductCard 
                                        product={product} 
                                        showSoldCount={true} // Optional prop to show sold count on card
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Container>
            <Footer />
        </Box>
    );
};

export default BestSellers;