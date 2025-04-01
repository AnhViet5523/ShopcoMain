import axios from "axios";

// Tạo một đối tượng để lưu trữ các request có thể hủy
const cancelTokens = {};

const axiosClient = axios.create({
    baseURL: 'https://localhost:7175',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Tăng timeout lên 30 giây
});

// Danh sách các endpoint không nên bị hủy khi trùng lặp (các API nào có thể được gọi nhiều lần)
const excludeFromCancellation = [
    '/api/Users/profile',
    '/api/Users/',
    '/api/Orders/current/',
    '/api/Orders/', // Thêm Orders vào danh sách loại trừ
    '/api/Voucher',
    '/api/Products',
    '/api/Photos/product',
    '/api/Payments/', // Thêm Payments vào danh sách loại trừ
    '/api/feedbacks/', // Thêm feedbacks vào danh sách loại trừ để tránh hủy requests
    '/api/Quiz/', // Thêm Quiz vào danh sách loại trừ để tránh hủy requests quiz
    '/api/QuizAnswers' // Thêm QuizAnswers vào danh sách loại trừ
];

// Hàm kiểm tra xem một endpoint có nên được loại trừ khỏi cơ chế hủy không
const shouldExcludeFromCancellation = (endpoint, method) => {
    // Bổ sung thêm kiểm tra cho /api/Orders/id
    if (endpoint.match(/\/api\/Orders\/\d+/)) {
        return true;
    }
    
    // Không áp dụng hủy cho các method GET hoặc các endpoint trong danh sách loại trừ
    if (method.toLowerCase() === 'get') {
        return excludeFromCancellation.some(prefix => endpoint.startsWith(prefix));
    }
    
    return false;
};

// Hàm trợ giúp để hủy request trước đó trên cùng một endpoint
const cancelPreviousRequest = (endpoint, method, requestId) => {
    const key = `${method}:${endpoint}`;
    
    if (shouldExcludeFromCancellation(endpoint, method)) {
        return `${key}:${requestId}`;
    }
    
    if (cancelTokens[key]) {
        cancelTokens[key].cancel('Request cancelled due to duplicate request');
        delete cancelTokens[key];
    }
    
    return key;
};

axiosClient.interceptors.request.use(
    (config) => {
        console.log('Requesting:', config.url, config.method);
        
        // Tạo một requestId ngẫu nhiên
        const requestId = Math.random().toString(36).substring(2, 15);
        
        // Tạo cancel token cho request này
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        
        // Lưu cancel token cho endpoint này với method
        const endpoint = config.url;
        const method = config.method || 'get';
        
        if (endpoint) {
            // Hủy request trước đó nếu có và lấy key
            const key = cancelPreviousRequest(endpoint, method, requestId);
            cancelTokens[key] = source;
            
            // Thêm requestId vào headers để debugging
            config.headers['X-Request-Id'] = requestId;
        }
        
        // Chỉ áp dụng cho các phương thức GET
        if (method.toLowerCase() === 'get') {
            // Thêm timestamp ngẫu nhiên để tránh cache
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }
        
        // Thêm thông tin xác thực từ localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.userId) {
                    config.headers['User-Id'] = user.userId;
                    // Thêm UserId vào claims
                    config.headers['X-UserId'] = user.userId;
                }
                if (user && user.role) {
                    // Đảm bảo role được chuẩn hóa đúng cách - bảo toàn chữ hoa/thường
                    const normalizedRole = String(user.role).trim();
                    
                    // Thử gửi role theo nhiều cách khác nhau để đảm bảo backend nhận được
                    config.headers['User-Role'] = normalizedRole;
                    config.headers['X-User-Role'] = normalizedRole;
                    config.headers['Role'] = normalizedRole;  // Thêm header này để phù hợp với Claim.Type = "Role"
                    
                    console.log('User role in request:', normalizedRole);
                    
                    // In thêm thông tin debug - Cho phép Staff thêm sản phẩm
                    if (normalizedRole !== 'Manager' && normalizedRole !== 'Admin' && normalizedRole !== 'Staff') {
                        console.warn('Role không phải Manager, Admin hoặc Staff:', normalizedRole);
                    }
                }
                
                // Thêm token Bearer nếu có
                if (user && user.token) {
                    config.headers['Authorization'] = `Bearer ${user.token}`;
                }
                
                // Thêm token từ localStorage nếu có
                const token = localStorage.getItem('token');
                if (token && !config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        // Xóa cancel token sau khi request thành công
        const endpoint = response.config.url;
        const method = response.config.method || 'get';
        
        // Tìm và xóa cancel token dựa trên prefix của key
        const keyPrefix = `${method}:${endpoint}`;
        Object.keys(cancelTokens).forEach(key => {
            if (key.startsWith(keyPrefix)) {
                delete cancelTokens[key];
            }
        });
        
        // Kiểm tra xem response có tồn tại không
        if (!response) {
            console.error('API response is undefined');
            return Promise.reject(new Error('API response is undefined'));
        }
        
        // Với các phương thức PUT, DELETE hoặc PATCH, có thể không có dữ liệu trả về
        // (thường chỉ trả về status code 200/204)
        const methodsWithoutData = ['put', 'delete', 'patch'];
        if (!response.data && methodsWithoutData.includes(method.toLowerCase())) {
            console.log(`${method.toUpperCase()} thành công cho ${endpoint}`, response.status);
            return { success: true, status: response.status };
        }
        
        // Kiểm tra xem response.data có tồn tại không cho các phương thức khác
        if (!response.data) {
            console.warn('API response.data is undefined, returning empty object');
            return {};
        }
        
        console.log('API Response:', response.data);
        return response.data;
    },
    (error) => {
        // Xóa cancel token khi request thất bại
        if (error.config && error.config.url) {
            const endpoint = error.config.url;
            const method = error.config.method || 'get';
            
            // Tìm và xóa cancel token dựa trên prefix của key
            const keyPrefix = `${method}:${endpoint}`;
            Object.keys(cancelTokens).forEach(key => {
                if (key.startsWith(keyPrefix)) {
                    delete cancelTokens[key];
                }
            });
        }
        
        // Xử lý lỗi hủy request
        if (axios.isCancel(error)) {
            console.log('Request cancelled:', error.message);
            return Promise.reject(new Error('Request was cancelled'));
        }
        
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            
            // Chỉ xóa localStorage khi nhận lỗi 401 và KHÔNG phải từ API đăng nhập
            if (error.response.status === 401 && error.config && error.config.url 
                && !error.config.url.includes('/api/Users/login')) {
                console.log('Xóa thông tin người dùng do lỗi xác thực với API:', error.config.url);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
            
            // Xử lý lỗi timeout
            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout, please check your network connection');
            }
        } else {
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

// Cải thiện hàm hủy tất cả các request, loại trừ các request quan trọng
axiosClient.cancelAllRequests = (excludeImportant = true) => {
    Object.keys(cancelTokens).forEach(key => {
        // Nếu excludeImportant=true, không hủy các request đến Orders/
        if (excludeImportant && key.includes('/api/Orders/')) {
            return;
        }
        
        cancelTokens[key].cancel('Navigation cancelled all requests');
        delete cancelTokens[key];
    });
};

export default axiosClient;