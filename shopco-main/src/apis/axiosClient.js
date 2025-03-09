import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'https://localhost:7175',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});


axiosClient.interceptors.request.use(
    (config) => {
        console.log('Requesting:', config.url);
        
        // Lấy thông tin người dùng từ localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // Thêm userId vào header để xác thực
                if (user && user.userId) {
                    config.headers['User-Id'] = user.userId;
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
        // Kiểm tra xem response có tồn tại không
        if (!response) {
            console.error('API response is undefined');
            return Promise.reject(new Error('API response is undefined'));
        }
        
        // Kiểm tra xem response.data có tồn tại không
        if (!response.data) {
            console.warn('API response.data is undefined, returning empty object');
            return {};
        }
        
        console.log('API Response:', response.data);
        return response.data;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            
            if (error.response.status === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;