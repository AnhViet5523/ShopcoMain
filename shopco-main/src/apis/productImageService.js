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

    // Thêm ảnh mới cho sản phẩm
    addProductImage: async (productId, file) => {
        try {
            console.log(`Calling API: POST /api/Photos/upload/product/${productId}`);
            const formData = new FormData();
            formData.append('File', file);
            
            const response = await axiosClient.post(`/api/Photos/upload/product/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error adding image for product ${productId}:`, error);
            throw error;
        }
    },

    // Cập nhật ảnh sản phẩm
    updateProductImage: async (imageId, file, displayOrder) => {
        try {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Kích thước file không được vượt quá 5MB');
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Định dạng file không được hỗ trợ. Vui lòng sử dụng jpg, jpeg, png, gif hoặc webp');
            }

            // Validate display order
            if (displayOrder < 0 || displayOrder > 4) {
                throw new Error('Thứ tự hiển thị phải từ 0 đến 4');
            }

            console.log(`Calling API: PUT /api/Photos/${imageId}`);
            const formData = new FormData();
            formData.append('File', file);
            formData.append('DisplayOrder', displayOrder);
            
            const response = await axiosClient.put(`/api/Photos/${imageId}`, formData, {
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
            console.log(`Calling API: DELETE /api/Photos/${imageId}`);
            const response = await axiosClient.delete(`/api/Photos/${imageId}`);
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
            console.log(`Calling API: DELETE /api/Photos/product/${productId}`);
            const response = await axiosClient.delete(`/api/Photos/product/${productId}`);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error(`Error deleting all images for product ${productId}:`, error);
            throw error;
        }
    },

    // Sắp xếp lại thứ tự hiển thị của các ảnh
    reorderProductImages: async (photoDtos) => {
        try {
            console.log('Calling API: PUT /api/Photos/reorder');
            const response = await axiosClient.put('/api/Photos/reorder', photoDtos);
            console.log('API Response:', response);
            return response;
        } catch (error) {
            console.error('Error reordering product images:', error);
            throw error;
        }
    },

    // Đặt ảnh làm ảnh đại diện của sản phẩm
    setMainImage: async (productId, imageId) => {
        try {
            console.log(`Setting image ${imageId} as main image for product ${productId}`);
            
            // Lấy tất cả ảnh của sản phẩm
            const imagesResponse = await productImageService.getProductImages(productId);
            console.log("API Response for images:", imagesResponse);
            
            // Xử lý response để đảm bảo có được mảng ảnh
            let allImages = [];
            if (Array.isArray(imagesResponse)) {
                allImages = imagesResponse;
            } else if (imagesResponse && imagesResponse.$values && Array.isArray(imagesResponse.$values)) {
                allImages = imagesResponse.$values;
            } else if (imagesResponse && typeof imagesResponse === 'object') {
                // Nếu là một object đơn lẻ, đặt vào mảng
                allImages = [imagesResponse];
            }
            
            console.log("Processed images array:", allImages);
            
            if (!allImages || allImages.length === 0) {
                throw new Error('Không tìm thấy ảnh cho sản phẩm này');
            }
            
            // Sắp xếp lại thứ tự hiển thị: ảnh được chọn sẽ có displayOrder = 0 và isMainImage = true
            const reorderedImages = allImages.map(img => {
                const isMain = img.imageID === imageId;
                const newDisplayOrder = isMain ? 0 : 
                    (img.displayOrder === 0 ? 1 : img.displayOrder >= 1 ? img.displayOrder + 1 : img.displayOrder);
                
                // Đảm bảo displayOrder không vượt quá 4
                const finalDisplayOrder = Math.min(newDisplayOrder, 4);
                
                return {
                    ...img,
                    displayOrder: finalDisplayOrder,
                    isMainImage: isMain // Đặt thuộc tính isMainImage
                };
            });
            
            // Đảm bảo không có displayOrder trùng nhau
            const usedOrders = new Set();
            const finalImages = reorderedImages.map(img => {
                // Nếu đây là ảnh đại diện, luôn đặt displayOrder = 0
                if (img.imageID === imageId) {
                    usedOrders.add(0);
                    return { 
                        ...img, 
                        displayOrder: 0,
                        isMainImage: true // Đảm bảo thuộc tính isMainImage
                    };
                }
                
                // Nếu displayOrder đã được sử dụng, tìm một displayOrder mới
                let order = img.displayOrder;
                while (usedOrders.has(order) && order <= 4) {
                    order++;
                }
                
                // Nếu đã hết displayOrder, sử dụng displayOrder cao nhất có thể
                if (order > 4) {
                    for (let i = 1; i <= 4; i++) {
                        if (!usedOrders.has(i)) {
                            order = i;
                            break;
                        }
                    }
                }
                
                usedOrders.add(order);
                return { 
                    ...img, 
                    displayOrder: order,
                    isMainImage: false // Đảm bảo không còn ảnh nào khác là ảnh đại diện
                };
            });
            
            console.log('Reordered images with new main image:', finalImages);
            
            // Gọi API để sắp xếp lại
            const reorderResponse = await productImageService.reorderProductImages(finalImages);
            return reorderResponse;
        } catch (error) {
            console.error(`Error setting main image for product ${productId}:`, error);
            throw error;
        }
    }
};

export default productImageService; 