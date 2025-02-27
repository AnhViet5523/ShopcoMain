import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import productService from '../../apis/productService';
import { Grid, Typography } from '@mui/material';
// import ProductCard from '../components/ProductCard';
import ProductCard from '../../components/ProductCard';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';

const SearchResults = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search).get('name');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productService.searchProducts(query);
                setProducts(response);
            } catch (err) {
                setError('Không tìm thấy sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    if (loading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <>
            <Header />
            
            <Typography variant="h4" align="center" gutterBottom>
                Kết quả tìm kiếm cho: "{query}"
            </Typography>
            <Grid container spacing={2}>
                {products.map(product => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
            <Footer />
        </>
    );
};

export default SearchResults; 