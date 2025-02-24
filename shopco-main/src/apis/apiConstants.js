export const API_ENDPOINTS = {
    PRODUCTS: {
        LIST: '/Products',
        DETAIL: (id) => `/Products/${id}`,
        BY_CATEGORY: (categoryId) => `/Products/category/${categoryId}`,
        SEARCH: '/Products/search'
    },
    // Thêm các endpoint khác ở đây
}; 