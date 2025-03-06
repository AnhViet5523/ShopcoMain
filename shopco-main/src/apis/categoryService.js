import axiosClient from "./axiosClient"

const categoryService = {
    // Lấy tất cả categories
    getCategories: async () => {
        try {
            const response = await axiosClient.get('/api/Category');
            console.log('Categories fetched:', response);
            return response;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },

    // Lấy category theo id
    getCategoryById: async (id) => {
        try {
            return await axiosClient.get(`/api/Category/${id}`);
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }
};

export default categoryService; 