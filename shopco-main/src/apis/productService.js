import axiosClient from "./axiosClient"

const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async () => {
        try {
            const response = await axiosClient.get('/api/Products');
            return response;
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    // Lấy sản phẩm theo ID
    getProductById: async (id) => {
        try {
            const response = await axiosClient.get(`/api/Products/${id}`);
            return response;
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo category
    getProductsByCategory: async (categoryId) => {
        try {
            const response = await axiosClient.get(`/api/Products/category/${categoryId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
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
        try {
            const url = `/api/Products/skintype/${skinType}`;
            return await axiosClient.get(url);
        } catch (error) {
            console.error(`Error fetching products for skin type ${skinType}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo khoảng giá
    getProductsByPrice: async (minPrice, maxPrice) => {
        try {
            const url = '/api/Products/price';
            return await axiosClient.get(url, {
                params: {
                    min: minPrice,
                    max: maxPrice
                }
            });
        } catch (error) {
            console.error(`Error fetching products by price range:`, error);
            throw error;
        }
    }
};

export default productService;
