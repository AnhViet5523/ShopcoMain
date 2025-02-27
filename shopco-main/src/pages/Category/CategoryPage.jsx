import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import productService from '../apis/productService';
import ProductList from '../components/ProductList';

const CategoryPage = () => {
    const location = useLocation();
    const selectedCategory = location.state?.selectedCategory; 
    const selectedSubItem = location.state?.selectedSubItem; // Lấy sub-item nếu có
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (selectedCategory) {
                    const response = await productService.getProductsByCategory(selectedCategory); // Gọi API theo danh mục
                    setProducts(response);
                } else {
                    const response = await productService.getProducts(); // Gọi API lấy tất cả sản phẩm
                    setProducts(response);
                }
            } catch (err) {
                setError('Không tìm thấy sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory]);

    if (loading) return <div>Đang tải...</div>;

    return (
        <div>
            <h2>{selectedCategory ? `Sản phẩm trong danh mục: "${selectedCategory}"` : 'Tất cả sản phẩm'}</h2>
            <ProductList products={products} />
        </div>
    );
};

export default CategoryPage;