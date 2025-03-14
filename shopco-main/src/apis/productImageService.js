import axiosClient from "./axiosClient";

const productImageService = {
    // Lấy tất cả ảnh sản phẩm
    getAllProductImages: async () => {
        try {
<<<<<<< Updated upstream
            const response = await axiosClient.get('/api/ProductImages');
=======
            console.log('Calling API: GET /api/Photos/product');
            const response = await axiosClient.get('/api/Photos/product');
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error('Error fetching all product images:', error);
            throw error;
        }
    },

    // Lấy ảnh của một sản phẩm cụ thể
    getProductImages: async (productId) => {
        try {
<<<<<<< Updated upstream
            const response = await axiosClient.get(`/api/ProductImages/product/${productId}`);
=======
            console.log(`Calling API: GET /api/Photos/product/${productId}`);
            const response = await axiosClient.get(`/api/Photos/product/${productId}`);
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error(`Error fetching images for product ${productId}:`, error);
            throw error;
        }
    },

    // Lấy ảnh được nhóm theo sản phẩm
    getGroupedProductImages: async () => {
        try {
<<<<<<< Updated upstream
            const response = await axiosClient.get('/api/ProductImages/grouped');
=======
            console.log('Calling API: GET /api/Photos/product/grouped');
            const response = await axiosClient.get('/api/Photos/product/grouped');
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error('Error fetching grouped product images:', error);
            throw error;
        }
    },

    // Thêm ảnh cho sản phẩm
    addProductImages: async (productId, files) => {
        try {
<<<<<<< Updated upstream
=======
            console.log(`Calling API: POST /api/Photos/product with productId: ${productId}`);
>>>>>>> Stashed changes
            const formData = new FormData();
            formData.append('ProductID', productId);
            
            // Thêm các file vào formData
            for (let i = 0; i < files.length; i++) {
                formData.append('Files', files[i]);
            }
            
<<<<<<< Updated upstream
            const response = await axiosClient.post('/api/ProductImages', formData, {
=======
            const response = await axiosClient.post('/api/Photos/product', formData, {
>>>>>>> Stashed changes
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
<<<<<<< Updated upstream
=======
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error(`Error adding images for product ${productId}:`, error);
            throw error;
        }
    },

    // Cập nhật ảnh sản phẩm
    updateProductImage: async (imageId, productId, file, displayOrder) => {
        try {
<<<<<<< Updated upstream
=======
            console.log(`Calling API: PUT /api/Photos/product/${imageId}`);
>>>>>>> Stashed changes
            const formData = new FormData();
            formData.append('ImageID', imageId);
            formData.append('ProductID', productId);
            formData.append('DisplayOrder', displayOrder);
            
            if (file) {
                formData.append('File', file);
            }
            
<<<<<<< Updated upstream
            const response = await axiosClient.put(`/api/ProductImages/${imageId}`, formData, {
=======
            const response = await axiosClient.put(`/api/Photos/product/${imageId}`, formData, {
>>>>>>> Stashed changes
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
<<<<<<< Updated upstream
=======
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error(`Error updating image ${imageId}:`, error);
            throw error;
        }
    },

    // Xóa ảnh sản phẩm
    deleteProductImage: async (imageId) => {
        try {
<<<<<<< Updated upstream
            const response = await axiosClient.delete(`/api/ProductImages/${imageId}`);
=======
            console.log(`Calling API: DELETE /api/Photos/product/${imageId}`);
            const response = await axiosClient.delete(`/api/Photos/product/${imageId}`);
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error(`Error deleting image ${imageId}:`, error);
            throw error;
        }
    },

    // Xóa tất cả ảnh của sản phẩm
    deleteAllProductImages: async (productId) => {
        try {
<<<<<<< Updated upstream
            const response = await axiosClient.delete(`/api/ProductImages/product/${productId}`);
=======
            console.log(`Calling API: DELETE /api/Photos/product/${productId}/all`);
            const response = await axiosClient.delete(`/api/Photos/product/${productId}/all`);
            console.log('API Response:', response);
>>>>>>> Stashed changes
            return response;
        } catch (error) {
            console.error(`Error deleting all images for product ${productId}:`, error);
            throw error;
        }
    }
};

export default productImageService; 