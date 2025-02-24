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
        const url = `/Products/${id}`;
        return await axiosClient.get(url);
    },

    // Lấy sản phẩm theo category
    getProductsByCategory: async (categoryId) => {
        try {
            return await axiosClient.get(`/api/Products/${categoryId}`);
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Tìm kiếm sản phẩm
    searchProducts: async (searchTerm, params = {}) => {
        const url = '/Products/search';
        return await axiosClient.get(url, { 
            params: { 
                ...params,
                q: searchTerm 
            } 
        });
    }
};

export default productService;