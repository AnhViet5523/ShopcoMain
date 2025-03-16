export const API_ENDPOINTS = {
    USERS: {
        LIST: '/api/Users',
        DETAIL: (id) => `/api/Users/${id}`,
        PROFILE: '/api/Users/profile',
        REGISTER: '/api/Users/register',
        LOGIN: '/api/Users/login'
    },
    PRODUCTS: {
        LIST: '/api/Products',
        DETAIL: (id) => `/api/Products/${id}`,
        BY_CATEGORY: (categoryId) => `/api/Products/category/${categoryId}`,
        BY_BRAND: (brandName) => `/api/Products/brand/${brandName}`,
        SEARCH: '/api/Products/search'
    },
    CATEGORIES: {
        LIST: '/api/Category',
        DETAIL: (id) => `/api/Category/${id}`
    },
    QUIZ: {
        QUESTIONS: '/Quiz/questions',
        ANSWERS: '/QuizAnswers'
    },
    // Thêm các endpoint khác ở đây
}; 