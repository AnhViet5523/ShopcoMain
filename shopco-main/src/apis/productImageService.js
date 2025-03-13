import axiosClient from "./axiosClient";

const productImageService = {
    // Lấy tất cả ảnh sản phẩm
    getAllProductImages: async () => {
        try {
            const response = await axiosClient.get('/api/ProductImages');
            return response;
        } catch (error) {
            console.error('Error fetching all product images:', error);
            throw error;
        }
    },

    // Lấy ảnh của một sản phẩm cụ thể
    getProductImages: async (productId) => {
        try {
            const response = await axiosClient.get(`/api/ProductImages/product/${productId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching images for product ${productId}:`, error);
            throw error;
        }
    },

    // Lấy ảnh được nhóm theo sản phẩm
    getGroupedProductImages: async () => {
        try {
            const response = await axiosClient.get('/api/ProductImages/grouped');
            return response;
        } catch (error) {
            console.error('Error fetching grouped product images:', error);
            throw error;
        }
    },

    // Thêm ảnh cho sản phẩm
    addProductImages: async (productId, files) => {
        try {
            const formData = new FormData();
            formData.append('ProductID', productId);
            
            // Thêm các file vào formData
            for (let i = 0; i < files.length; i++) {
                formData.append('Files', files[i]);
            }
            
            const response = await axiosClient.post('/api/ProductImages', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error(`Error adding images for product ${productId}:`, error);
            throw error;
        }
    },

    // Cập nhật ảnh sản phẩm
    updateProductImage: async (imageId, productId, file, displayOrder) => {
        try {
            const formData = new FormData();
            formData.append('ImageID', imageId);
            formData.append('ProductID', productId);
            formData.append('DisplayOrder', displayOrder);
            
            if (file) {
                formData.append('File', file);
            }
            
            const response = await axiosClient.put(`/api/ProductImages/${imageId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response;
        } catch (error) {
            console.error(`Error updating image ${imageId}:`, error);
            throw error;
        }
    },

    // Xóa ảnh sản phẩm
    deleteProductImage: async (imageId) => {
        try {
            const response = await axiosClient.delete(`/api/ProductImages/${imageId}`);
            return response;
        } catch (error) {
            console.error(`Error deleting image ${imageId}:`, error);
            throw error;
        }
    },

    // Xóa tất cả ảnh của sản phẩm
    deleteAllProductImages: async (productId) => {
        try {
            const response = await axiosClient.delete(`/api/ProductImages/product/${productId}`);
            return response;
        } catch (error) {
            console.error(`Error deleting all images for product ${productId}:`, error);
            throw error;
        }
    }
};

export default productImageService; 