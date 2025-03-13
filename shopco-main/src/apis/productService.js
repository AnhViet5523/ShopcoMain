import axiosClient from "./axiosClient"
import productImageService from "./productImageService";

const productService = {
    // Lấy tất cả sản phẩm
    getAllProducts: async () => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get('/api/Products'),
                productImageService.getAllProductImages()
            ]);

            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                           (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Tạo map từ productId đến danh sách ảnh
            const productImagesMap = {};
            images.forEach(image => {
                // Đảm bảo sử dụng đúng tên trường (có thể là productID hoặc productId)
                const productId = image.productID || image.productId;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });

            // Đảm bảo productsResponse là một mảng
            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);

            // Gán ảnh cho từng sản phẩm
            return products.map(product => {
                const productId = product.productId || product.productID;
                return {
                    ...product,
                    images: productImagesMap[productId] || [],
                    mainImage: product.imgURL || (productImagesMap[productId] && productImagesMap[productId][0]?.imgUrl) || null
                };
            });
        } catch (error) {
            console.error('Error fetching all products:', error);
            throw error;
        }
    },

    // Lấy sản phẩm theo ID
    getProductById: async (id) => {
        try {
            const [productResponse, imagesResponse] = await Promise.all([
                axiosClient.get(`/api/Products/${id}`),
                productImageService.getProductImages(id)
            ]);

            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Đảm bảo luôn có mảng images và mainImage
            return {
                ...productResponse,
                images: images,
                mainImage: productResponse.imgURL || (images.length > 0 ? images[0].imgUrl : null)
            };
        } catch (error) {
            console.error(`Error fetching product with id ${id}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo category
    getProductsByCategory: async (categoryId) => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get(`/api/Products/category/${categoryId}`),
                productImageService.getAllProductImages()
            ]);

            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Tạo map từ productId đến danh sách ảnh
            const productImagesMap = {};
            images.forEach(image => {
                const productId = image.productID || image.productId;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });

            // Đảm bảo productsResponse là một mảng
            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);

            // Gán ảnh cho từng sản phẩm
            return products.map(product => {
                const productId = product.productId || product.productID;
                return {
                    ...product,
                    images: productImagesMap[productId] || [],
                    mainImage: product.imgURL || (productImagesMap[productId] && productImagesMap[productId][0]?.imgUrl) || null
                };
            });
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw error;
        }
    },

    // Tìm kiếm sản phẩm
    searchProducts: async (searchTerm) => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get('/api/Products/search', { 
                    params: { 
                        name: searchTerm
                    } 
                }),
                productImageService.getAllProductImages()
            ]);

            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Tạo map từ productId đến danh sách ảnh
            const productImagesMap = {};
            images.forEach(image => {
                const productId = image.productID || image.productId;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });

            // Đảm bảo productsResponse là một mảng
            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);

            // Gán ảnh cho từng sản phẩm
            return products.map(product => {
                const productId = product.productId || product.productID;
                return {
                    ...product,
                    images: productImagesMap[productId] || [],
                    mainImage: product.imgURL || (productImagesMap[productId] && productImagesMap[productId][0]?.imgUrl) || null
                };
            });
        } catch (error) {
            console.error(`Error searching products:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo brand
    getProductsByBrand: async (brandName) => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get('/api/Products'),
                productImageService.getAllProductImages()
            ]);
            
            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Tạo map từ productId đến danh sách ảnh
            const productImagesMap = {};
            images.forEach(image => {
                const productId = image.productID || image.productId;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });
            
            // Nếu response có dạng array hoặc object với $values
            let allProducts = [];
            if (productsResponse && productsResponse.$values) {
                allProducts = productsResponse.$values;
            } else if (Array.isArray(productsResponse)) {
                allProducts = productsResponse;
            }
            
            // Lọc sản phẩm theo brand và gán ảnh
            const filteredProducts = allProducts
                .filter(product => product.brand && product.brand.toLowerCase() === brandName.toLowerCase())
                .map(product => {
                    const productId = product.productId || product.productID;
                    return {
                        ...product,
                        images: productImagesMap[productId] || [],
                        mainImage: product.imgURL || (productImagesMap[productId] && productImagesMap[productId][0]?.imgUrl) || null
                    };
                });
            
            console.log(`Found ${filteredProducts.length} products for brand ${brandName}`);
            return filteredProducts;
        } catch (error) {
            console.error('Error fetching products by brand:', error);
            return [];
        }
    },

    // Lấy sản phẩm theo skin type
    getProductsBySkinType: async (skinType) => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get(`/api/Products/skintype/${skinType}`),
                productImageService.getAllProductImages()
            ]);

            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Tạo map từ productId đến danh sách ảnh
            const productImagesMap = {};
            images.forEach(image => {
                const productId = image.productID || image.productId;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });

            // Đảm bảo productsResponse là một mảng
            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);

            // Gán ảnh cho từng sản phẩm
            return products.map(product => {
                const productId = product.productId || product.productID;
                return {
                    ...product,
                    images: productImagesMap[productId] || [],
                    mainImage: product.imgURL || (productImagesMap[productId] && productImagesMap[productId][0]?.imgUrl) || null
                };
            });
        } catch (error) {
            console.error(`Error fetching products for skin type ${skinType}:`, error);
            throw error;
        }
    },

    // Lấy sản phẩm theo khoảng giá
    getProductsByPrice: async (minPrice, maxPrice) => {
        try {
            const [productsResponse, imagesResponse] = await Promise.all([
                axiosClient.get('/api/Products/price', {
                    params: {
                        min: minPrice,
                        max: maxPrice
                    }
                }),
                productImageService.getAllProductImages()
            ]);

            // Đảm bảo imagesResponse là một mảng
            const images = Array.isArray(imagesResponse) ? imagesResponse : 
                          (imagesResponse && imagesResponse.$values ? imagesResponse.$values : []);

            // Tạo map từ productId đến danh sách ảnh
            const productImagesMap = {};
            images.forEach(image => {
                const productId = image.productID || image.productId;
                if (productId) {
                    if (!productImagesMap[productId]) {
                        productImagesMap[productId] = [];
                    }
                    productImagesMap[productId].push(image);
                }
            });

            // Đảm bảo productsResponse là một mảng
            const products = Array.isArray(productsResponse) ? productsResponse : 
                            (productsResponse && productsResponse.$values ? productsResponse.$values : []);

            // Gán ảnh cho từng sản phẩm
            return products.map(product => {
                const productId = product.productId || product.productID;
                return {
                    ...product,
                    images: productImagesMap[productId] || [],
                    mainImage: product.imgURL || (productImagesMap[productId] && productImagesMap[productId][0]?.imgUrl) || null
                };
            });
        } catch (error) {
            console.error(`Error fetching products by price range:`, error);
            throw error;
        }
    },
};

export default productService;
