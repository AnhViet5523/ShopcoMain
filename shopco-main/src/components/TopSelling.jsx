import { Container, Grid, Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import { useState, useEffect } from 'react';
import productService from '../apis/productService';
import orderService from '../apis/orderService';

export default function TopSelling() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopSellingProducts = async () => {
            try {
                setLoading(true);
                const allProducts = await productService.getAllProducts();
                
                // Xử lý ảnh cho mỗi sản phẩm
                const productsWithImages = allProducts.map(product => {
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
                    else if (product.imgURL) {
                        return {
                            ...product,
                            mainImage: product.imgURL,
                            images: [{ imgUrl: product.imgURL }]
                        };
                    }
                    return {
                        ...product,
                        mainImage: '/images/default-product.jpg',
                        images: []
                    };
                });

                // Lấy số lượng đã bán và rating cho mỗi sản phẩm
                const productsWithDetails = await Promise.all(
                    productsWithImages.map(async (product) => {
                        try {
                            const [soldData, ratingData] = await Promise.all([
                                orderService.countBoughtProducts(product.productId),
                                productService.getProductAverageRating(product.productId)
                            ]);

                            return {
                                ...product,
                                soldCount: soldData?.totalSold || 0,
                                rating: ratingData.averageRating,
                                ratingCount: ratingData.totalReviews
                            };
                        } catch (error) {
                            console.error(`Error fetching details for product ${product.productId}:`, error);
                            return {
                                ...product,
                                soldCount: 0,
                                rating: 0,
                                ratingCount: 0
                            };
                        }
                    })
                );

                // Sắp xếp theo số lượng bán và lấy 6 sản phẩm đầu tiên
                const sortedProducts = productsWithDetails
                    .sort((a, b) => b.soldCount - a.soldCount)
                    .slice(0, 6);

                setProducts(sortedProducts);
                setError(null);
            } catch (error) {
                console.error('Error fetching top selling products:', error);
                setError('Đã xảy ra lỗi khi tải sản phẩm bán chạy');
            } finally {
                setLoading(false);
            }
        };

        fetchTopSellingProducts();
    }, []);

    if (loading) {
        return (
            <Container sx={{ py: 5, maxWidth: "100%" }}>
                <Typography variant="h5" textAlign="center">Đang tải sản phẩm bán chạy...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 5, maxWidth: "100%" }}>
                <Typography variant="h6" color="error" textAlign="center">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 5, maxWidth: "100%" }}>
            <Typography variant="h2" fontWeight="bold" style={{color:"black", fontFamily:"inherit"}} textAlign="center">TOP SELLING</Typography>
            <Grid container spacing={3} sx={{ mt: 3 }}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product.productId}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}