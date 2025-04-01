import axiosClient from './axiosClient';
import axios from 'axios';

const adminService = {
    getAllOrders: async () => {
        try {
            const response = await axiosClient.get('/api/Admin/all');
            return response; // Trả về dữ liệu từ API
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error; 
        }
    },
    
    // Thêm phương thức mới để thêm sản phẩm
    addProduct: async (productData) => {
        try {
            console.log('Gọi API thêm sản phẩm với dữ liệu:', JSON.stringify(productData, null, 2));
            
            // Kiểm tra lại dữ liệu trước khi gửi
            if (!productData.productName) {
                throw new Error('Thiếu tên sản phẩm');
            }
            
            if (!productData.categoryId || isNaN(productData.categoryId)) {
                throw new Error('Danh mục sản phẩm không hợp lệ');
            }
            
            if (!productData.quantity || isNaN(productData.quantity)) {
                throw new Error('Số lượng sản phẩm không hợp lệ');
            }
            
            if (!productData.price || isNaN(productData.price)) {
                throw new Error('Giá sản phẩm không hợp lệ');
            }
            
            // Đảm bảo các trường bắt buộc có giá trị mặc định hợp lệ
            const dataToSend = {
                ...productData,
                categoryId: parseInt(productData.categoryId),
                quantity: parseInt(productData.quantity),
                price: parseFloat(productData.price),
                status: productData.status || 'Available',
                capacity: productData.capacity || '100ml',
                brand: productData.brand || 'Unknown',
                origin: productData.origin || 'Unknown',
                imgUrl: productData.imgUrl || '',
                skinType: productData.skinType || 'All',
                description: productData.description || '',
                ingredients: productData.ingredients || '',
                usageInstructions: productData.usageInstructions || '',
                manufactureDate: productData.manufactureDate || new Date().toISOString()
            };
            
            console.log('Dữ liệu đã được chuẩn hóa:', JSON.stringify(dataToSend, null, 2));
            
            const response = await axiosClient.post('/api/Admin/Product', dataToSend);
            console.log('Phản hồi từ API thêm sản phẩm:', response);
            
            if (!response) {
                throw new Error('Không nhận được phản hồi từ server');
            }
            
            return response;
        } catch (error) {
            console.error('Lỗi chi tiết khi thêm sản phẩm:', error);
            
            if (error.response) {
                // Server trả về lỗi với status code
                console.error('Server Error Status:', error.response.status);
                console.error('Server Error Data:', error.response.data);
                
                // Chi tiết lỗi từ server
                const serverError = error.response.data?.error || error.response.data?.message || 'Lỗi không xác định từ server';
                throw new Error(`Lỗi từ server: ${serverError} (Status: ${error.response.status})`);
            } else if (error.request) {
                // Request đã được gửi nhưng không nhận được response
                console.error('Request sent but no response:', error.request);
                throw new Error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                // Lỗi xảy ra trong quá trình thiết lập request
                console.error('Error setting up request:', error.message);
                throw error;
            }
        }
    },

    // Thêm phương thức để nhập kho thêm số lượng sản phẩm
    importProductStock: async (productId, quantity) => {
        if (!productId) {
            throw new Error('ProductId is required');
        }
        try {
            console.log('Sending import request:', { productId, quantity });
            const response = await axiosClient.post(`/api/Products/${productId}/import`, quantity);
            console.log('Raw response:', response);
            
            // Trả về response.data để xử lý ở component
            return response.data;
        } catch (error) {
            console.error('Error importing product stock:', error);
            throw error;
        }
    },

    // Thêm phương thức để thay đổi trạng thái sản phẩm
    toggleProductStatus: async (productId) => {
        try {
            const response = await axiosClient.patch(`/api/Admin/${productId}/toggle-status`);
            return response;
        } catch (error) {
            console.error('Error toggling product status:', error);
            throw error;
        }
    },

    // Thêm phương thức để cập nhật sản phẩm
    updateProduct: async (productId, productData) => {
        try {
            // Ghi log thông tin sản phẩm trước khi cập nhật
            console.log('Thông tin sản phẩm ID cập nhật:', productId);
            console.log('CategoryId được gửi:', productData.categoryId);
            
            // Biến đổi tên trường để khớp CHÍNH XÁC với model ProductUpdateDTO trong AdminController.cs
            const dataToSend = {
                // Đảm bảo tất cả các trường bắt buộc có trong DTO
                ProductName: productData.productName || "",
                CategoryId: productData.categoryId ? parseInt(productData.categoryId) : 0, // Không thể null cho int
                Quantity: parseInt(productData.quantity) || 0,
                Capacity: productData.capacity || "50g",
                Price: parseFloat(productData.price) || 0,
                Brand: productData.brand || "",
                Origin: productData.origin || "",
                Status: productData.status || "Available",
                ImgUrl: productData.imgUrl || "",
                SkinType: productData.skinType || "",
                Description: productData.description || "",
                Ingredients: productData.ingredients || "",
                UsageInstructions: productData.usageInstructions || "",
                ManufactureDate: new Date().toISOString() // Luôn cung cấp một giá trị hợp lệ
            };
            
            // Kiểm tra tính hợp lệ của CategoryId
            if (dataToSend.CategoryId <= 0) {
                console.error('CẢNH BÁO: CategoryId không hợp lệ:', dataToSend.CategoryId);
                // Sử dụng giá trị mặc định an toàn
                dataToSend.CategoryId = 1; // Sử dụng danh mục mặc định (1)
            }
            
            // Lấy vai trò từ localStorage
            let userRole = 'Customer'; // Giá trị mặc định
            
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.role) {
                        userRole = user.role;
                        // Đảm bảo chữ cái đầu viết hoa
                        if (userRole.toLowerCase() === 'admin') userRole = 'Admin';
                        if (userRole.toLowerCase() === 'manager') userRole = 'Manager';
                        if (userRole.toLowerCase() === 'staff') userRole = 'Staff';
                    }
                }
            } catch (e) {
                console.error('Lỗi khi đọc thông tin người dùng:', e);
            }
            
            // Tạo headers với thông tin quyền truy cập
            const headers = {
                'User-Role': userRole,
                'X-User-Role': userRole,
                'Role': userRole,
                'Content-Type': 'application/json'
            };
            
            console.log(`Đang gửi dữ liệu cập nhật sản phẩm đến Admin/${productId}/product:`, JSON.stringify(dataToSend, null, 2));
            console.log('Headers:', headers);
            
            // Trực tiếp gọi axios thay vì axiosClient để có nhiều tùy chọn hơn
            const response = await axiosClient.put(`/api/Admin/${productId}/product`, dataToSend, { 
                headers,
                timeout: 10000 // Tăng timeout lên 10 giây
            });
            
            console.log('Phản hồi từ API cập nhật sản phẩm:', response);
            return response;
        } catch (error) {
            console.error('Error updating product:', error);
            
            // Chi tiết hóa thông tin lỗi 500
            if (error.response && error.response.status === 500) {
                console.error('Lỗi 500 từ server. Chi tiết:', error.response.data);
                
                // Hiển thị stack trace nếu có
                if (error.response.data && error.response.data.details) {
                    console.error('Chi tiết lỗi server:', error.response.data.details);
                    
                    // Kiểm tra các lỗi đặc biệt
                    const errorDetails = error.response.data.details.toLowerCase();
                    if (errorDetails.includes('foreign key') || errorDetails.includes('reference constraint')) {
                        console.error('Lỗi ràng buộc khóa ngoại - CategoryId không hợp lệ');
                        alert('Lỗi: Danh mục sản phẩm không hợp lệ. Vui lòng chọn danh mục khác.');
                        return Promise.reject(new Error('Danh mục không hợp lệ'));
                    }
                    
                    if (errorDetails.includes('null')) {
                        console.error('Lỗi giá trị null không hợp lệ - kiểm tra các trường bắt buộc');
                    }
                }
            }
            
            // Chi tiết hóa thông tin lỗi
            if (error.response) {
                console.error('Status code:', error.response.status);
                console.error('Response headers:', error.response.headers);
                console.error('Response data:', error.response.data);
                
                // Thử in ra chi tiết lỗi từ ModelState nếu có
                if (error.response.data && error.response.data.errors) {
                    console.error('Validation errors:', error.response.data.errors);
                }
                
                // Thử trích xuất thông báo lỗi
                const errorMessage = 
                    (error.response.data && error.response.data.error) || 
                    (error.response.data && error.response.data.message) ||
                    (error.response.data && typeof error.response.data === 'string' ? error.response.data : 'Unknown error');
                
                console.error('Error message:', errorMessage);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            
            throw error;
        }
    },

    markOrderAsDelivered: async (orderId) => {
        try {
            const response = await axiosClient.post(`/api/Orders/mark-delivered`, { orderId });
            console.log('Mark as delivered response:', response);
            return response;
        } catch (error) {
            console.error('Error marking order as delivered:', error);
            throw error;
        }
    },

    getCancelledOrders: async () => {
        try {
            const response = await axiosClient.get('/api/CancelRequests');
            return response; // Trả về dữ liệu từ API
        } catch (error) {
            console.error('Error fetching cancelled orders:', error);
            throw error;
        }
    },

    approveCancellation: async (cancelRequestId) => {
        try {
            const response = await axiosClient.put(`/api/Admin/${cancelRequestId}/cancelrequest/approve`);
            return response.data;
        } catch (error) {
            console.error('Error approving cancellation:', error);
            throw error;
        }
    },

    rejectCancellation: async (cancelRequestId) => {
        try {
            const response = await axiosClient.put(`/api/Admin/${cancelRequestId}/cancelrequest/reject`);
            return response;
        } catch (error) {
            console.error('Error rejecting cancellation:', error);
            throw error;
        }
    },

    addStaff: async (staffData) => {
        try {
            const response = await axiosClient.post('/api/Users/add-staff', staffData);
            return response;
        } catch (error) {
            console.error('Error adding staff:', error);
            throw error;
        }
    },

    updateStaff: async (userId, staffData) => {
        try {
            const response = await axiosClient.put(`/api/Users/update/${userId}`, staffData);
            return response;
        } catch (error) {
            console.error('Error updating staff:', error);
            throw error;
        }
    },

    updateUser: async (userId, userData) => {
        try {
            const response = await axiosClient.put(`/api/Users/update/${userId}`, userData);
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            // Chuẩn hóa role trước khi gửi
            let normalizedRole = role;
            if (typeof role === 'string') {
                if (role.toLowerCase() === 'manager') {
                    normalizedRole = 'Manager';
                } else if (role.toLowerCase() === 'admin') {
                    normalizedRole = 'Admin';
                } else if (role.toLowerCase() === 'staff') {
                    normalizedRole = 'Staff';
                } else if (role.toLowerCase() === 'customer') {
                    normalizedRole = 'Customer';
                }
            }
            
            // Kiểm tra và chuẩn hóa role người dùng hiện tại trong localStorage
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user && user.role) {
                        const currentRole = user.role;
                        let correctedRole = currentRole;
                        
                        // Chuẩn hóa vai trò
                        if (currentRole.toLowerCase() === 'manager') {
                            correctedRole = 'Manager';
                        } else if (currentRole.toLowerCase() === 'admin') {
                            correctedRole = 'Admin';
                        } else if (currentRole.toLowerCase() === 'staff') {
                            correctedRole = 'Staff';
                        } else if (currentRole.toLowerCase() === 'customer') {
                            correctedRole = 'Customer';
                        }
                        
                        // Cập nhật lại localStorage nếu cần
                        if (correctedRole !== currentRole) {
                            console.log(`Đang sửa vai trò từ "${currentRole}" thành "${correctedRole}"`);
                            user.role = correctedRole;
                            localStorage.setItem('user', JSON.stringify(user));
                            localStorage.setItem('user_role', correctedRole);
                        }
                    }
                }
            } catch (error) {
                console.error('Lỗi khi sửa vai trò người dùng:', error);
            }
            
            console.log(`Gửi yêu cầu thay đổi vai trò: userId=${userId}, role=${normalizedRole}`);
            
            // Lấy thông tin người dùng hiện tại để gửi kèm trong headers
            const userStr = localStorage.getItem('user');
            let currentUserRole = null;
            
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user && user.role) {
                        currentUserRole = user.role;
                    }
                } catch (e) {
                    console.error('Lỗi khi đọc thông tin người dùng:', e);
                }
            }
            
            // Tạo headers tùy chỉnh cho request này
            const headers = {};
            if (currentUserRole) {
                headers['User-Role'] = currentUserRole;
                headers['X-User-Role'] = currentUserRole;
                headers['Role'] = currentUserRole;
                console.log('Gửi vai trò trong headers:', currentUserRole);
            }
            
            // Log chi tiết thông tin trước khi gửi request 
            console.log('Chi tiết request cập nhật vai trò:', {
                userId,
                normalizedRole,
                currentUserRole,
                headers,
                method: 'PUT',
                url: `/api/Users/update-role/${userId}`,
                data: { role: normalizedRole }
            });
            
            try {
                const response = await axiosClient.put(`/api/Users/update-role/${userId}`, 
                    { role: normalizedRole },
                    { headers }
                );
                
                console.log('Role update response:', response);
                return response;
            } catch (apiError) {
                // Xử lý lỗi chi tiết từ API
                console.error('Lỗi khi gọi API cập nhật vai trò:', apiError);
                
                // Log toàn bộ thông tin lỗi để dễ debug
                if (apiError.response) {
                    console.error('Status:', apiError.response.status);
                    console.error('Data:', apiError.response.data);
                    console.error('Headers:', apiError.response.headers);
                    
                    // Kiểm tra nếu có inner exception
                    if (apiError.response.data && apiError.response.data.includes('inner exception')) {
                        console.error('Lỗi database:', apiError.response.data);
                    }
                    
                    if (apiError.response.status === 500) {
                        // Có thể đây là lỗi ràng buộc trong database
                        console.error('Có thể là lỗi ràng buộc database - CHK_UserRole');
                    }
                } else if (apiError.request) {
                    console.error('Không nhận được phản hồi:', apiError.request);
                } else {
                    console.error('Lỗi cấu hình request:', apiError.message);
                }
                
                throw apiError;
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },

    getAllPosts: async () => {
        try {
            console.log('Đang tải danh sách tất cả bài viết...');
            
            // Thêm timestamp để tránh cache
            const timestamp = new Date().getTime();
            
            // Tạo CancelToken để có thể hủy request khi cần thiết
            const source = axios.CancelToken.source();
            
            // Thiết lập timeout dài hơn (30 giây)
            const timeout = setTimeout(() => {
                source.cancel('Thời gian phản hồi quá lâu');
            }, 30000);
            
            try {
                const response = await axiosClient.get(`/api/Post?_t=${timestamp}`, {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    },
                    cancelToken: source.token,
                    // Tăng timeout lên 30 giây
                    timeout: 30000
                });
                
                // Xóa timeout khi request thành công
                clearTimeout(timeout);
                
                console.log('Raw Response in Service:', response);
                
                // Xử lý nhiều định dạng response
                if (response && response["$values"]) {
                    return response["$values"];
                }
                
                return response;
            } catch (requestError) {
                clearTimeout(timeout);
                throw requestError;
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách bài viết:', error);
            
            // Xử lý trường hợp request bị hủy một cách thân thiện hơn
            if (axios.isCancel(error)) {
                console.log('Request bị hủy:', error.message);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            }
            
            // Các lỗi khác
            if (error.response) {
                console.error('Chi tiết lỗi từ server:', error.response.data);
                console.error('Mã lỗi:', error.response.status);
                
                if (error.response.status >= 500) {
                    throw new Error('Máy chủ đang gặp sự cố, vui lòng thử lại sau');
                }
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                console.error('Không nhận được phản hồi từ server:', error.request);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            throw error;
        }
    },

    getTotalRevenue: async () => {
        try {
            // Lấy tất cả thanh toán
            const payments = await axiosClient.get('/api/Payments');
            
            // Tính tổng doanh thu từ các thanh toán thành công
            const totalRevenue = payments.data
                .filter(payment => payment.paymentStatus === "Success")
                .reduce((total, payment) => total + payment.amount, 0);
                
            return totalRevenue;
        } catch (error) {
            console.error('Lỗi khi lấy tổng doanh thu:', error);
            throw error;
        }
    },

    getMonthlyRevenue: async (year) => {
        try {
            // Lấy tất cả thanh toán
            const payments = await axiosClient.get('/api/Payments');
            
            // Khởi tạo mảng 12 tháng với doanh thu 0
            const monthlyRevenue = Array(12).fill(0);
            
            // Lọc và tính tổng doanh thu theo tháng cho năm được chọn
            payments.data.forEach(payment => {
                if (payment.paymentStatus === "Success") {
                    const paymentDate = new Date(payment.paymentDate);
                    if (paymentDate.getFullYear() === year) {
                        const month = paymentDate.getMonth();
                        monthlyRevenue[month] += payment.amount;
                    }
                }
            });
            
            // Chuyển đổi dữ liệu sang định dạng mong muốn
            return monthlyRevenue.map((revenue, index) => ({
                month: index + 1,
                revenue: revenue
            }));
        } catch (error) {
            console.error('Lỗi khi lấy doanh thu theo tháng:', error);
            throw error;
        }
    },

    // Thêm phương thức mới để lấy dữ liệu từ API summary
    getPaymentSummary: async () => {
        try {
            const response = await axiosClient.get('/api/Admin/summary');
            // Kiểm tra và xử lý dữ liệu trả về
            if (response && response.data && response.data.$values) {
                return response.data.$values;
            } else if (Array.isArray(response)) {
                return response;
            } else if (response && Array.isArray(response.$values)) {
                return response.$values;
            }
            return [];
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu tổng quan thanh toán:', error);
            throw error;
        }
    },

    // ... các phương thức khác nếu có ...
};

export default adminService;
