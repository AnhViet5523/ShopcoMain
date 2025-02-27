export const API_ENDPOINTS = {
    PRODUCTS: {
        LIST: '/Products',
        DETAIL: (id) => `/Products/${id}`,
        BY_CATEGORY: (categoryId) => `/Products/category/${categoryId}`,
        SEARCH: '/Products/search'
    },
    CATEGORIES: {
        LIST: '/Categories',
        DETAIL: (id) => `/Categories/${id}`
    },
    QUIZ: {
        QUESTIONS: '/Quiz/questions',
        ANSWERS: '/QuizAnswers'
    },
    // Thêm các endpoint khác ở đây
}; 