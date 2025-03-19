import axiosClient from './axiosClient';

const blogService = {
    

    getPostById: async (id) => {
        try {
            const response = await axiosClient.get(`/api/Post/${id}`);
            return response;
        } catch (error) {
            console.error(`Error fetching post with ID ${id}:`, error);
            throw error;
        }
    },

    createPost: async (postData) => {
        try {
            const response = await axiosClient.post('/api/Post', postData);
            return response;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    updatePost: async (id, postData) => {
        try {
            const response = await axiosClient.put(`/api/Post/${id}`, postData);
            return response;
        } catch (error) {
            console.error(`Error updating post with ID ${id}:`, error);
            throw error;
        }
    },

    deletePost: async (id) => {
        try {
            const response = await axiosClient.delete(`/api/Post/${id}`);
            return response;
        } catch (error) {
            console.error(`Error deleting post with ID ${id}:`, error);
            throw error;
        }
    }
};

export default blogService;
