import axiosClient from "./axiosClient";
import productImageService from "./productImageService";
import { API_ENDPOINTS } from "./apiConstants";

const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async () => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get(API_ENDPOINTS.PRODUCTS.LIST),
                productImageService.getAllProductImages()
            ]);

            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);
            
            let images = [];
            if (imagesResponse && imagesResponse.$values) {
                images = imagesResponse.$values;
            } else if (Array.isArray(imagesResponse)) {
                images = imagesResponse;
            }

            const productImagesMap = {};
            images.forEach(image => {
                const productId = image.productId || image.productID;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });

            return products.map(product => {
                const productId = product.productId || product.productID;
                const productImages = productImagesMap[productId] || [];
                return {
                    ...product,
                    images: productImages,
                    imgUrl: productImages.length > 0 ? productImages[0].imgUrl : (product.imgURL || '/images/default-product.jpg')
                };
            });
        } catch (error) {
            console.error('Error fetching all products:', error);
            return { $values: [] };
        }
    },

    // Lấy sản phẩm theo ID
    getProductById: async (id) => {
        try {
            const [productResponse, imagesResponse] = await Promise.all([
                axiosClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id)),
                productImageService.getProductImages(id)
            ]);

            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            return {
                ...productResponse,
                images: images,
                mainImage: productResponse.imgURL || (images.length > 0 ? images[0].imgUrl : null)
            };
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            return null;
        }
    },
};

export default productService;
