import axiosClient from "./axiosClient";

const productImageService = {
    // Lấy tất cả ảnh sản phẩm
    getAllProductImages: async () => {
        try {
            console.log('Calling API: GET /api/Photos/product');
            const response = await axiosClient.get('/api/Photos/product');
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching all product images:', error);
            throw error;
        }
    },

    // Lấy ảnh của một sản phẩm cụ thể
    getProductImages: async (productId) => {
        try {
            console.log(`Calling API: GET /api/Photos/product/${productId}`);
            const response = await axiosClient.get(`/api/Photos/product/${productId}`);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error fetching images for product ${productId}:`, error);
            throw error;
        }
    },

    // Lấy ảnh được nhóm theo sản phẩm
    getGroupedProductImages: async () => {
        try {
            console.log('Calling API: GET /api/Photos/product/grouped');
            const response = await axiosClient.get('/api/Photos/product/grouped');
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching grouped product images:', error);
            throw error;
        }
    },

    // Thêm ảnh cho sản phẩm
    addProductImages: async (productId, files) => {
        try {
            console.log(`Calling API: POST /api/Photos/product with productId: ${productId}`);
            const formData = new FormData();
            formData.append('ProductID', productId);
            
            // Thêm các file vào formData
            for (let i = 0; i < files.length; i++) {
                formData.append('Files', files[i]);
            }
            
            const response = await axiosClient.post('/api/Photos/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error adding images for product ${productId}:`, error);
            throw error;
        }
    },

    // Cập nhật ảnh sản phẩm
    updateProductImage: async (imageId, productId, file, displayOrder) => {
        try {
            console.log(`Calling API: PUT /api/Photos/product/${imageId}`);
            const formData = new FormData();
            formData.append('ImageID', imageId);
            formData.append('ProductID', productId);
            formData.append('DisplayOrder', displayOrder);
            
            if (file) {
                formData.append('File', file);
            }
            
            const response = await axiosClient.put(`/api/Photos/product/${imageId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error updating image ${imageId}:`, error);
            throw error;
        }
    },

    // Xóa ảnh sản phẩm
    deleteProductImage: async (imageId) => {
        try {
            console.log(`Calling API: DELETE /api/Photos/product/${imageId}`);
            const response = await axiosClient.delete(`/api/Photos/product/${imageId}`);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error deleting image ${imageId}:`, error);
            throw error;
        }
    },

    // Xóa tất cả ảnh của sản phẩm
    deleteAllProductImages: async (productId) => {
        try {
            console.log(`Calling API: DELETE /api/Photos/product/${productId}/all`);
            const response = await axiosClient.delete(`/api/Photos/product/${productId}/all`);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error deleting all images for product ${productId}:`, error);
            throw error;
        }
    }
};

export default productImageService; 