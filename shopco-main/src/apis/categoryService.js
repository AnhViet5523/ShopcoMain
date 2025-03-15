import axiosClient from "./axiosClient"

const categoryService = {
    // Lấy tất cả categories
    getCategories: async () => {
        try {
            console.log('Calling category API...');
            const response = await axiosClient.get('/api/Category');
            console.log('Category API response:', response);
            
            // Kiểm tra cấu trúc response
            if (!response || (Array.isArray(response) && response.length === 0)) {
                console.error('API trả về dữ liệu rỗng');
                console.log('Sử dụng dữ liệu danh mục mẫu...');
                return categoryService.getMockCategories();
            }
            
            return response;
        } catch (error) {
            console.error('Error fetching categories:', error);
            console.log('Sử dụng dữ liệu danh mục mẫu do lỗi API...');
            return categoryService.getMockCategories();
        }
    },

    // Lấy category theo id
    getCategoryById: async (id) => {
        try {
            return await axiosClient.get(`/api/Category/${id}`);
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },

    // Thêm phương thức mới để lấy dữ liệu danh mục mẫu khi API không hoạt động
    getMockCategories: () => {
        console.log('Trả về dữ liệu danh mục mẫu');
        
        // Tạo 5 danh mục mẫu
        return [
            {
                categoryId: 1,
                categoryType: "Làm Sạch",
                categoryName: "Sữa Rửa Mặt",
                parentCategoryId: null
            },
            {
                categoryId: 2,
                categoryType: "Làm Sạch",
                categoryName: "Tẩy Trang",
                parentCategoryId: null
            },
            {
                categoryId: 3,
                categoryType: "Dưỡng Da",
                categoryName: "Kem Dưỡng",
                parentCategoryId: null
            },
            {
                categoryId: 4,
                categoryType: "Đặc Trị",
                categoryName: "Serum / Tinh Chất",
                parentCategoryId: null
            },
            {
                categoryId: 5,
                categoryType: "Chống Nắng",
                categoryName: "Kem Chống Nắng",
                parentCategoryId: null
            }
        ];
    }
};

export default categoryService; 