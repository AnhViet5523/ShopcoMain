import axiosClient from "./axiosClient";
import productImageService from "./productImageService";
import { API_ENDPOINTS } from "./apiConstants";

const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async () => {
        try {
            console.log('Calling API: GET', API_ENDPOINTS.PRODUCTS.LIST);
            
            // Tách riêng các lời gọi API để dễ debug
            let productsResponse;
            let imagesResponse;
            
            try {
                productsResponse = await axiosClient.get(API_ENDPOINTS.PRODUCTS.LIST);
                console.log('Products API Response:', productsResponse);
            } catch (productError) {
                console.error('Error fetching products:', productError.message);
                console.error('Error details:', productError.response?.data || productError);
                console.log('Sử dụng dữ liệu mẫu thay thế...');
                return productService.getMockProducts();
            }
            
            try {
                imagesResponse = await productImageService.getAllProductImages();
                console.log('Images API Response:', imagesResponse);
            } catch (imageError) {
                console.error('Error fetching product images:', imageError.message);
                console.error('Error details:', imageError.response?.data || imageError);
                imagesResponse = { $values: [] };
            }

            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);
            
            let images = [];
            if (imagesResponse && imagesResponse.$values) {
                images = imagesResponse.$values;
            } else if (Array.isArray(imagesResponse)) {
                images = imagesResponse;
            }

            console.log(`Processing ${products.length} products and ${images.length} images`);

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
            console.error('Error fetching all products:', error.message);
            console.error('Error stack:', error.stack);
            console.log('Sử dụng dữ liệu mẫu thay thế...');
            return productService.getMockProducts();
        }
    },

    // Lấy sản phẩm theo ID
    getProductById: async (id) => {
        try {
            console.log(`Calling API: GET ${API_ENDPOINTS.PRODUCTS.DETAIL(id)}`);
            
            // Tách riêng các lời gọi API để dễ debug
            let productResponse;
            let imagesResponse;
            
            try {
                productResponse = await axiosClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
                console.log('Product API Response:', productResponse);
            } catch (productError) {
                console.error(`Error fetching product with id ${id}:`, productError.message);
                console.error('Error details:', productError.response?.data || productError);
                return null;
            }
            
            try {
                imagesResponse = await productImageService.getProductImages(id);
                console.log('Product Images API Response:', imagesResponse);
            } catch (imageError) {
                console.error(`Error fetching images for product ${id}:`, imageError.message);
                console.error('Error details:', imageError.response?.data || imageError);
                imagesResponse = { $values: [] };
            }

            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            return {
                ...productResponse,
                images: images,
                mainImage: productResponse.imgURL || (images.length > 0 ? images[0].imgUrl : null)
            };
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error.message);
            console.error('Error stack:', error.stack);
            return null;
        }
    },

    // Thêm phương thức mới để lấy dữ liệu sản phẩm mẫu khi API không hoạt động
    getMockProducts: () => {
        console.log('Trả về dữ liệu sản phẩm mẫu');
        
        // Tạo 20 sản phẩm mẫu
        const mockProducts = [];
        for (let i = 1; i <= 20; i++) {
            mockProducts.push({
                productId: i,
                productCode: `SP${i.toString().padStart(3, '0')}`,
                categoryId: i % 5 + 1, // 5 danh mục mẫu
                productName: `Sản phẩm mẫu ${i}`,
                quantity: i * 5,
                capacity: `${i * 10}ml`,
                price: i * 50000,
                brand: `Thương hiệu ${i % 5 + 1}`,
                origin: i % 2 === 0 ? 'Việt Nam' : 'Hàn Quốc',
                status: i % 3 === 0 ? 'OutOfStock' : 'Available',
                imgURL: '/images/default-product.jpg',
                skinType: i % 4 === 0 ? 'Da khô' : (i % 4 === 1 ? 'Da dầu' : (i % 4 === 2 ? 'Da hỗn hợp' : 'Da thường')),
                description: `Mô tả sản phẩm mẫu ${i}`,
                ingredients: `Thành phần sản phẩm mẫu ${i}`,
                usageInstructions: `Hướng dẫn sử dụng sản phẩm mẫu ${i}`,
                manufactureDate: new Date(2023, 0, i).toISOString(),
                ngayNhapKho: new Date(2023, 1, i).toISOString()
            });
        }
        
        return mockProducts;
    }
};

export default productService;
