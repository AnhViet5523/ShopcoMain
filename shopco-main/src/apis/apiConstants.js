export const API_ENDPOINTS = {
    USERS: {
        LIST: '/api/Users',
        DETAIL: (id) => `/api/Users/${id}`,
        PROFILE: '/api/Users/profile',
        REGISTER: '/api/Users/register',
        LOGIN: '/api/Users/login'
    },
    PRODUCTS: {
        LIST: '/Products',
        DETAIL: (id) => `/Products/${id}`,
        BY_CATEGORY: (categoryId) => `/Products/category/${categoryId}`,
        SEARCH: '/Products/search'
    },
    CATEGORIES: {
        LIST: '/Category',
        DETAIL: (id) => `/Category/${id}`
    },
    QUIZ: {
        QUESTIONS: '/Quiz/questions',
        ANSWERS: '/QuizAnswers'
    },
    // Thêm các endpoint khác ở đây
}; 