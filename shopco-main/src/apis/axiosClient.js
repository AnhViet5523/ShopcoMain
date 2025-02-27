import axios from "axios";

const axiosClient = axios.create({
    baseURL: 'https://localhost:7203',
    headers: {
        'Content-Type': 'application/json',
    },
});


axiosClient.interceptors.request.use(
    (config) => {
        console.log('Requesting:', config.url);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;