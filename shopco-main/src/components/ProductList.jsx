import { useState, useEffect } from 'react';
import productService from '../apis/productService';
import { Box, Grid, Typography } from '@mui/material';
import ProductCard from './ProductCard';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products...');
            
            const response = await productService.getProducts({
                page: 1,
                limit: 10,
            });
            
            console.log('API Response:', response);
            setProducts(response);
            
            console.log('Products state updated:', response);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    console.log('Current products state:', products);
    console.log('Loading state:', loading);
    console.log('Error state:', error);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Danh sách sản phẩm
            </Typography>
            <Grid container spacing={3}>
                {products.map(product => (
                    <Grid item xs={12} sm={6} md={3} key={product.id || product._id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ProductList; 