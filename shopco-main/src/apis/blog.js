import axiosClient from './axiosClient';
import axios from 'axios';

const blogService = {   

    getPostById: async (id) => {
        try {
            if (!id && id !== 0) {
                throw new Error('Blog ID là bắt buộc');
            }
            
            console.log('Đang tải bài viết với ID:', id);
            
            // Đảm bảo id là một số
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                throw new Error('Blog ID phải là số');
            }
            
            // Thêm timestamp để tránh cache
            const timestamp = new Date().getTime();
            
            // Tạo CancelToken để có thể hủy request khi cần thiết
            const source = axios.CancelToken.source();
            
            // Thiết lập timeout dài hơn (30 giây)
            const timeout = setTimeout(() => {
                source.cancel('Thời gian phản hồi quá lâu');
            }, 30000);
            
            try {
                const response = await axiosClient.get(`/api/Post/${numericId}?_t=${timestamp}`, {
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
                
                console.log('Nhận dữ liệu thành công từ API:', response);
                
                // Kiểm tra response
                if (!response) {
                    throw new Error('Không nhận được dữ liệu từ server');
                }
                
                return response;
            } catch (requestError) {
                clearTimeout(timeout);
                throw requestError;
            }
        } catch (error) {
            console.error(`Lỗi khi tải bài viết ID ${id}:`, error);
            
            // Xử lý trường hợp request bị hủy một cách thân thiện hơn
            if (axios.isCancel(error)) {
                console.log('Request bị hủy:', error.message);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            }
            
            // Các lỗi khác
            if (error.response) {
                console.error('Chi tiết lỗi từ server:', error.response.data);
                console.error('Mã lỗi:', error.response.status);
                
                if (error.response.status === 404) {
                    throw new Error('Không tìm thấy bài viết với ID này');
                } else if (error.response.status >= 500) {
                    throw new Error('Máy chủ đang gặp sự cố, vui lòng thử lại sau');
                } else if (error.response.status === 400) {
                    // Kiểm tra xem dữ liệu lỗi có phải là object không
                    if (typeof error.response.data === 'object' && error.response.data !== null) {
                        let errorMessage = 'Lỗi dữ liệu: ';
                        
                        // Trích xuất thông điệp lỗi từ đối tượng
                        if (error.response.data.errors) {
                            // Lỗi validation từ ModelState
                            const errors = [];
                            for (const key in error.response.data.errors) {
                                if (Array.isArray(error.response.data.errors[key])) {
                                    errors.push(...error.response.data.errors[key]);
                                }
                            }
                            errorMessage += errors.join(', ');
                        } else if (error.response.data.message) {
                            // Lỗi có trường message
                            errorMessage += error.response.data.message;
                        } else {
                            // Cố gắng chuyển đối tượng thành chuỗi JSON
                            try {
                                errorMessage += JSON.stringify(error.response.data);
                            } catch (e) {
                                errorMessage += 'Đã xảy ra lỗi dữ liệu không xác định';
                            }
                        }
                        throw new Error(errorMessage);
                    }
                    
                    throw new Error(`Lỗi dữ liệu: ${error.response.data}`);
                }
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                console.error('Không nhận được phản hồi từ server:', error.request);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
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
                
                console.log('Nhận danh sách bài viết thành công:', response);
                
                // Chuyển đổi dữ liệu nếu cần
                if (Array.isArray(response) && response.length > 0) {
                    // Đảm bảo mỗi bài viết có id
                    return response.map(post => ({
                        ...post,
                        id: post.postId || post.id // Đảm bảo có trường id để frontend sử dụng
                    }));
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
                } else if (error.response.status === 404) {
                    throw new Error('Không tìm thấy danh sách bài viết');
                } else if (error.response.status === 400) {
                    // Kiểm tra xem dữ liệu lỗi có phải là object không
                    if (typeof error.response.data === 'object' && error.response.data !== null) {
                        let errorMessage = 'Lỗi dữ liệu: ';
                        
                        // Trích xuất thông điệp lỗi từ đối tượng
                        if (error.response.data.errors) {
                            // Lỗi validation từ ModelState
                            const errors = [];
                            for (const key in error.response.data.errors) {
                                if (Array.isArray(error.response.data.errors[key])) {
                                    errors.push(...error.response.data.errors[key]);
                                }
                            }
                            errorMessage += errors.join(', ');
                        } else if (error.response.data.message) {
                            // Lỗi có trường message
                            errorMessage += error.response.data.message;
                        } else {
                            // Cố gắng chuyển đối tượng thành chuỗi JSON
                            try {
                                errorMessage += JSON.stringify(error.response.data);
                            } catch (e) {
                                errorMessage += 'Đã xảy ra lỗi dữ liệu không xác định';
                            }
                        }
                        throw new Error(errorMessage);
                    }
                    
                    throw new Error(`Lỗi dữ liệu: ${error.response.data}`);
                }
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                console.error('Không nhận được phản hồi từ server:', error.request);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            throw error;
        }
    },

    createPost: async (postData) => {
        try {
            console.log('Đang tạo bài viết mới với dữ liệu:', postData);
            
            // Tạo CancelToken để có thể hủy request khi cần thiết
            const source = axios.CancelToken.source();
            
            // Thiết lập timeout dài hơn (30 giây)
            const timeout = setTimeout(() => {
                source.cancel('Thời gian phản hồi quá lâu');
            }, 30000);
            
            // Tạo đối tượng FormData để gửi cả dữ liệu văn bản và tệp
            const formData = new FormData();
            
            // Xử lý tiêu đề và nội dung, đảm bảo không gửi null
            formData.append('Title', postData.title || '');
            formData.append('Content', postData.content || '');
            formData.append('UserId', postData.userId || 1);
            
            // Xử lý ảnh: có thể có hoặc không có ảnh cho bài viết mới
            if (postData.image && postData.image instanceof File) {
                console.log('Đang tải lên file ảnh cho bài viết mới:', postData.image.name);
                formData.append('Image', postData.image);
                console.log('Đã thêm ảnh vào request');
            } 
            else if (postData.imageUrl) {
                // Lưu ý: Backend có thể không hỗ trợ việc thêm ảnh thông qua URL
                // Nhưng vẫn giữ code này để tương thích với mã cũ (nếu backend có hỗ trợ)
                console.log('Đang sử dụng URL ảnh:', postData.imageUrl);
                formData.append('ImageUrl', postData.imageUrl);
                
                // Tạo một file ảnh trống để thỏa mãn yêu cầu Image field
                const emptyBlob = new Blob([''], { type: 'image/png' });
                const emptyFile = new File([emptyBlob], 'empty.png', { type: 'image/png' });
                formData.append('Image', emptyFile);
                console.log('Đã thêm ảnh trống vào request do backend vẫn yêu cầu trường Image');
            }
            else {
                // Không có ảnh, nhưng backend vẫn yêu cầu trường Image 
                // Tạo một file ảnh trống để thỏa mãn yêu cầu này
                const emptyBlob = new Blob([''], { type: 'image/png' });
                const emptyFile = new File([emptyBlob], 'empty.png', { type: 'image/png' });
                formData.append('Image', emptyFile);
                console.log('Đã thêm ảnh trống vào request do backend vẫn yêu cầu trường Image');
            }
            
            // In ra FormData để kiểm tra (chỉ dùng khi debug)
            console.log('Dữ liệu FormData được gửi:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File ${pair[1].name} (${pair[1].size} bytes)` : pair[1]));
            }
            
            try {
                // Gửi request POST để tạo bài viết mới
                const response = await axiosClient.post('/api/Post', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    cancelToken: source.token,
                    timeout: 30000
                });
                
                // Xóa timeout khi request thành công
                clearTimeout(timeout);
                
                console.log('Tạo blog thành công:', response);
                return response;
            } catch (requestError) {
                clearTimeout(timeout);
                throw requestError;
            }
        } catch (error) {
            console.error('Lỗi khi tạo bài viết:', error);
            
            // Xử lý trường hợp request bị hủy
            if (axios.isCancel(error)) {
                console.log('Request bị hủy:', error.message);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            }
            
            if (error.response) {
                console.error('Chi tiết lỗi từ server:', error.response.data);
                console.error('Mã lỗi:', error.response.status);
                
                if (error.response.status >= 500) {
                    throw new Error('Máy chủ đang gặp sự cố, vui lòng thử lại sau');
                } else if (error.response.status === 400) {
                    // Kiểm tra xem dữ liệu lỗi có phải là object không
                    if (typeof error.response.data === 'object' && error.response.data !== null) {
                        let errorMessage = 'Lỗi dữ liệu: ';
                        
                        // Trích xuất thông điệp lỗi từ đối tượng
                        if (error.response.data.errors) {
                            // Lỗi validation từ ModelState
                            const errors = [];
                            for (const key in error.response.data.errors) {
                                if (Array.isArray(error.response.data.errors[key])) {
                                    errors.push(...error.response.data.errors[key]);
                                }
                            }
                            errorMessage += errors.join(', ');
                        } else if (error.response.data.message) {
                            // Lỗi có trường message
                            errorMessage += error.response.data.message;
                        } else {
                            // Cố gắng chuyển đối tượng thành chuỗi JSON
                            try {
                                errorMessage += JSON.stringify(error.response.data);
                            } catch (e) {
                                errorMessage += 'Đã xảy ra lỗi dữ liệu không xác định';
                            }
                        }
                        throw new Error(errorMessage);
                    }
                    
                    throw new Error(`Lỗi dữ liệu: ${error.response.data}`);
                }
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                console.error('Không nhận được phản hồi từ server:', error.request);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            throw error;
        }
    },

    updatePost: async (id, postData) => {
        try {
            console.log('Đang cập nhật bài viết với ID:', id, 'và dữ liệu:', postData);
            
            // Đảm bảo id là một số
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                throw new Error('Blog ID phải là số');
            }
            
            // Tạo CancelToken để có thể hủy request khi cần thiết
            const source = axios.CancelToken.source();
            
            // Thiết lập timeout dài hơn (30 giây)
            const timeout = setTimeout(() => {
                source.cancel('Thời gian phản hồi quá lâu');
            }, 30000);
            
            // Tạo đối tượng FormData để gửi cả dữ liệu văn bản và tệp
            const formData = new FormData();
            formData.append('PostId', numericId);
            
            // Xử lý tiêu đề và nội dung, đảm bảo không gửi null
            formData.append('Title', postData.title || '');
            formData.append('Content', postData.content || '');
            
            // Xử lý ảnh theo 3 trường hợp:
            // 1. Có ảnh mới (file): Tải lên ảnh mới
            // 2. Có imageUrl: Giữ nguyên ảnh hiện tại (backend sẽ không thay đổi)
            // 3. Không có cả hai: Không thay đổi ảnh
            
            if (postData.image && postData.image instanceof File) {
                // Trường hợp 1: Có ảnh mới - tải lên file mới
                console.log('Đang tải lên file ảnh mới:', postData.image.name);
                formData.append('Image', postData.image);
                console.log('Đã thêm ảnh vào request');
            } 
            else if (postData.removeImage === true) {
                // Trường hợp đặc biệt: Xóa ảnh hiện tại
                // Backend hiện không hỗ trợ xóa ảnh thông qua API UpdatePost
                // Nhưng chúng ta có thể ghi log để theo dõi
                console.log('Yêu cầu xóa ảnh blog - chức năng này chưa được hỗ trợ bởi backend');
                
                // Tạo một file ảnh trống để thỏa mãn yêu cầu Image field
                const emptyBlob = new Blob([''], { type: 'image/png' });
                const emptyFile = new File([emptyBlob], 'empty.png', { type: 'image/png' });
                formData.append('Image', emptyFile);
                console.log('Đã thêm ảnh trống vào request do backend vẫn yêu cầu trường Image');
            }
            else {
                // Trường hợp 2 & 3: Không có ảnh mới, giữ nguyên ảnh cũ
                console.log('Không có ảnh mới, giữ nguyên ảnh hiện tại');
                
                // Tạo một file ảnh trống để thỏa mãn yêu cầu Image field
                const emptyBlob = new Blob([''], { type: 'image/png' });
                const emptyFile = new File([emptyBlob], 'empty.png', { type: 'image/png' });
                formData.append('Image', emptyFile);
                console.log('Đã thêm ảnh trống vào request do backend vẫn yêu cầu trường Image');
            }
            
            // In ra FormData để kiểm tra (chỉ dùng khi debug)
            console.log('Dữ liệu FormData được gửi:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File ${pair[1].name} (${pair[1].size} bytes)` : pair[1]));
            }
            
            try {
                // Gửi request PUT để cập nhật bài viết
                const response = await axiosClient.put(`/api/Post/${numericId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    cancelToken: source.token,
                    timeout: 30000
                });
                
                // Xóa timeout khi request thành công
                clearTimeout(timeout);
                
                console.log('Cập nhật blog thành công:', response);
                return response;
            } catch (requestError) {
                clearTimeout(timeout);
                throw requestError;
            }
        } catch (error) {
            console.error(`Lỗi khi cập nhật bài viết với ID ${id}:`, error);
            
            // Xử lý trường hợp request bị hủy
            if (axios.isCancel(error)) {
                console.log('Request bị hủy:', error.message);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            }
            
            if (error.response) {
                console.error('Chi tiết lỗi từ server:', error.response.data);
                console.error('Mã lỗi:', error.response.status);
                
                // Xử lý các trường hợp lỗi cụ thể
                if (error.response.status === 400) {
                    if (typeof error.response.data === 'string' && error.response.data.includes('ID không trùng khớp')) {
                        throw new Error('ID blog trong URL và FormData không khớp nhau');
                    }
                    
                    // Kiểm tra xem dữ liệu lỗi có phải là object không
                    if (typeof error.response.data === 'object' && error.response.data !== null) {
                        let errorMessage = 'Lỗi dữ liệu: ';
                        
                        // Trích xuất thông điệp lỗi từ đối tượng
                        if (error.response.data.errors) {
                            // Lỗi validation từ ModelState
                            const errors = [];
                            for (const key in error.response.data.errors) {
                                if (Array.isArray(error.response.data.errors[key])) {
                                    errors.push(...error.response.data.errors[key]);
                                }
                            }
                            errorMessage += errors.join(', ');
                        } else if (error.response.data.message) {
                            // Lỗi có trường message
                            errorMessage += error.response.data.message;
                        } else {
                            // Cố gắng chuyển đối tượng thành chuỗi JSON
                            try {
                                errorMessage += JSON.stringify(error.response.data);
                            } catch (e) {
                                errorMessage += 'Đã xảy ra lỗi dữ liệu không xác định';
                            }
                        }
                        throw new Error(errorMessage);
                    }
                    
                    throw new Error(`Lỗi dữ liệu: ${error.response.data}`);
                } else if (error.response.status === 404) {
                    throw new Error('Không tìm thấy bài viết để cập nhật');
                } else if (error.response.status >= 500) {
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

    deletePost: async (id) => {
        try {
            console.log('Đang xóa bài viết với ID:', id);
            
            // Đảm bảo id là một số
            const numericId = parseInt(id);
            if (isNaN(numericId)) {
                throw new Error('Blog ID phải là số');
            }
            
            // Tạo CancelToken để có thể hủy request khi cần thiết
            const source = axios.CancelToken.source();
            
            // Thiết lập timeout dài hơn (30 giây)
            const timeout = setTimeout(() => {
                source.cancel('Thời gian phản hồi quá lâu');
            }, 30000);
            
            try {
                // Gửi request DELETE để xóa bài viết
                const response = await axiosClient.delete(`/api/Post/${numericId}`, {
                    cancelToken: source.token,
                    timeout: 30000
                });
                
                // Xóa timeout khi request thành công
                clearTimeout(timeout);
                
                console.log('Xóa blog thành công:', response);
                return response;
            } catch (requestError) {
                clearTimeout(timeout);
                throw requestError;
            }
        } catch (error) {
            console.error(`Lỗi khi xóa bài viết với ID ${id}:`, error);
            
            // Xử lý trường hợp request bị hủy
            if (axios.isCancel(error)) {
                console.log('Request bị hủy:', error.message);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng thử lại sau');
            }
            
            if (error.response) {
                console.error('Chi tiết lỗi từ server:', error.response.data);
                console.error('Mã lỗi:', error.response.status);
                
                // Xử lý các trường hợp lỗi cụ thể
                if (error.response.status === 404) {
                    throw new Error('Không tìm thấy bài viết để xóa');
                } else if (error.response.status === 400) {
                    // Kiểm tra xem dữ liệu lỗi có phải là object không
                    if (typeof error.response.data === 'object' && error.response.data !== null) {
                        let errorMessage = 'Lỗi dữ liệu: ';
                        
                        // Trích xuất thông điệp lỗi từ đối tượng
                        if (error.response.data.errors) {
                            // Lỗi validation từ ModelState
                            const errors = [];
                            for (const key in error.response.data.errors) {
                                if (Array.isArray(error.response.data.errors[key])) {
                                    errors.push(...error.response.data.errors[key]);
                                }
                            }
                            errorMessage += errors.join(', ');
                        } else if (error.response.data.message) {
                            // Lỗi có trường message
                            errorMessage += error.response.data.message;
                        } else {
                            // Cố gắng chuyển đối tượng thành chuỗi JSON
                            try {
                                errorMessage += JSON.stringify(error.response.data);
                            } catch (e) {
                                errorMessage += 'Đã xảy ra lỗi dữ liệu không xác định';
                            }
                        }
                        throw new Error(errorMessage);
                    }
                    
                    throw new Error(`Lỗi dữ liệu: ${error.response.data}`);
                } else if (error.response.status >= 500) {
                    throw new Error('Máy chủ đang gặp sự cố, vui lòng thử lại sau');
                }
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                console.error('Không nhận được phản hồi từ server:', error.request);
                throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng và thử lại');
            }
            
            throw error;
        }
    }
};

export default blogService;

/* 
 * Mẹo sử dụng API Blog:
 * 
 * 1. Lỗi 400 Bad Request có thể xảy ra khi:
 *    - ID bài viết trong URL khác với ID trong FormData
 *    - Thiếu trường bắt buộc (Title, Content, PostId, Image)
 *    - Cố gắng sử dụng ImageUrl thay vì tải lên file Image
 * 
 * 2. Khi cập nhật blog, có 3 trường hợp xử lý ảnh:
 *    a) Chỉ sửa nội dung, không sửa ảnh:
 *       - Vẫn PHẢI gửi trường Image (API yêu cầu), ứng dụng sẽ tự động gửi file rỗng
 *       - Phải gửi Title, Content, PostId
 * 
 *    b) Chỉ sửa ảnh, không sửa nội dung:
 *       - Vẫn phải gửi lại Title, Content từ blog cũ 
 *       - Gửi file ảnh mới qua trường Image
 * 
 *    c) Sửa cả nội dung và ảnh:
 *       - Gửi Title, Content mới
 *       - Gửi file ảnh mới qua trường Image
 *
 *    Lưu ý: Backend hiện không hỗ trợ xóa ảnh, chỉ có thể thay thế ảnh.
 *    Lưu ý quan trọng: Trường Image LUÔN là bắt buộc với API, nếu không có ảnh mới,
 *    ứng dụng sẽ tự động gửi file trống để đáp ứng yêu cầu.
 * 
 * 3. PostId phải được gửi dưới dạng số
 *    - Luôn chuyển đổi id thành số trước khi gửi request
 *    - Sử dụng parseInt(id) để đảm bảo dữ liệu đúng
 */
