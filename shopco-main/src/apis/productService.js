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
    }
};

export default productService;