import axiosClient from "./axiosClient"

const categoryService = {
    // Lấy tất cả categories
    getCategories: async () => {
        try {
            return await axiosClient.get('/api/Categories');
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Lấy category theo id
    getCategoryById: async (id) => {
        try {
            return await axiosClient.get(`/api/Categories/${id}`);
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
};

export default categoryService; 