import axiosClient from "./axiosClient"

const productService = {
    // Lấy danh sách tất cả sản phẩm
    getProducts: async () => {
        try {
            return await axiosClient.get('/api/Products');
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Lấy chi tiết một sản phẩm
    getProductById: async (id) => {
        const url = `/api/Products/${id}`;
        return await axiosClient.get(url);
    },

    // Lấy sản phẩm theo category
    getProductsByCategory: async (categoryName) => {
        const url = `/api/Products/category/${categoryName}`;
        return await axiosClient.get(url);
    },

    // Tìm kiếm sản phẩm
    searchProducts: async (searchTerm) => {
        const url = '/api/Products/search';
        return await axiosClient.get(url, { 
            params: { 
                name: searchTerm
            } 
        });
    },

    // Lấy sản phẩm theo brand
    getProductsByBrand: async (brandName) => {
        try {
            console.log('Fetching products by brand:', brandName);
            const response = await axiosClient.get('/api/Products');
            
            // Nếu response có dạng array hoặc object với $values
            let allProducts = [];
            if (response && response.$values) {
                allProducts = response.$values;
            } else if (Array.isArray(response)) {
                allProducts = response;
            }
            
            // Lọc sản phẩm theo brand
            const filteredProducts = allProducts.filter(product => 
                product.brand && product.brand.toLowerCase() === brandName.toLowerCase()
            );
            
            console.log(`Found ${filteredProducts.length} products for brand ${brandName}`);
            return filteredProducts;
        } catch (error) {
            console.error('Error fetching products by brand:', error);
            return [];
        }
    },

    // Lấy sản phẩm theo skin type
    getProductsBySkinType: async (skinType) => {
        const url = `/api/Products/skinType/${skinType}`;
        return await axiosClient.get(url);
    },

    // Lấy tất cả skin types
    getSkinTypes: async () => {
        const url = '/api/Products/skinTypes'; // Giả sử API này tồn tại
        return await axiosClient.get(url);
    },
    
};

export default productService;