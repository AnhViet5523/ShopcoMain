import axiosClient from './axiosClient';

/**
 * Service xử lý các API liên quan đến quy trình chăm sóc da
 */
const skincareRoutineService = {
  /**
   * Lấy danh sách tất cả quy trình chăm sóc da
   */
  getRoutines: async () => {
    try {
      const response = await axiosClient.get('/api/SkincareRoutines');
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quy trình chăm sóc da:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết quy trình chăm sóc da theo ID
   * @param {number} routineId - ID của quy trình
   */
  getRoutineById: async (routineId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/${routineId}`);
      return skincareRoutineService.formatRoutineContent(response);
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết quy trình chăm sóc da ID=${routineId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết quy trình chăm sóc da cùng với các sản phẩm theo ID
   * @param {number} routineId - ID của quy trình
   */
  getRoutineWithProducts: async (routineId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/WithProducts/${routineId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy quy trình chăm sóc da và sản phẩm ID=${routineId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách quy trình chăm sóc da theo loại da
   * @param {string} skinType - Loại da (Da khô, Da dầu, Da thường, v.v.)
   */
  getRoutinesBySkinType: async (skinType) => {
    try {
      // Thử cách 1: Sử dụng trực tiếp loại da được truyền vào nhưng mã hóa URL
      try {
        const encodedSkinType = encodeURIComponent(skinType);
        console.log(`Gọi API với loại da đã mã hóa: ${encodedSkinType}`);
        const response = await axiosClient.get(`/api/SkincareRoutines/skintype/${encodedSkinType}`);
        
        // Xử lý cấu trúc đặc biệt với $values nếu có
        if (response && response.$values) {
          console.log('Trích xuất giá trị từ $values trong getRoutinesBySkinType');
          // Định dạng từng routine trong mảng
          const formattedRoutines = response.$values.map(routine => 
            skincareRoutineService.formatRoutineContent(routine)
          );
          return formattedRoutines;
        }
        
        // Nếu response là một object, định dạng và trả về
        if (typeof response === 'object' && !Array.isArray(response)) {
          return skincareRoutineService.formatRoutineContent(response);
        }
        
        // Nếu response là một mảng, định dạng từng phần tử
        if (Array.isArray(response)) {
          return response.map(routine => skincareRoutineService.formatRoutineContent(routine));
        }
        
        return response;
      } catch (error) {
        // Nếu gặp lỗi 404, thử các biến thể khác của loại da
        if (error.response && error.response.status === 404) {
          // Thử với phiên bản dấu gạch ngang của tên loại da
          if (skinType.includes(' ')) {
            const dashFormat = skinType.toLowerCase().replace(/\s+/g, '-');
            try {
              console.log(`Thử lại với format dấu gạch: ${dashFormat}`);
              const retryResponse = await axiosClient.get(`/api/SkincareRoutines/skintype/${dashFormat}`);
              
              // Xử lý cấu trúc đặc biệt với $values
              if (retryResponse && retryResponse.$values) {
                // Định dạng từng routine trong mảng
                const formattedRoutines = retryResponse.$values.map(routine => 
                  skincareRoutineService.formatRoutineContent(routine)
                );
                return formattedRoutines;
              }
              
              return retryResponse;
            } catch (dashError) {
              console.log(`Không tìm thấy với format dấu gạch: ${dashFormat}`);
            }
          }
          
          // Chuyển đổi loại da sang dạng không dấu để thử lại
          const normalized = skinType
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
          
          if (normalized !== skinType) {
            try {
              const encodedNormalized = encodeURIComponent(normalized);
              console.log(`Thử lại với loại da không dấu: ${encodedNormalized}`);
              const retryResponse = await axiosClient.get(`/api/SkincareRoutines/skintype/${encodedNormalized}`);
              
              // Xử lý cấu trúc đặc biệt với $values
              if (retryResponse && retryResponse.$values) {
                // Định dạng từng routine trong mảng
                const formattedRoutines = retryResponse.$values.map(routine => 
                  skincareRoutineService.formatRoutineContent(routine)
                );
                return formattedRoutines;
              }
              
              return retryResponse;
            } catch (retryError) {
              // Nếu vẫn không thành công với dạng không dấu, thử dạng không dấu + gạch ngang
              if (normalized.includes(' ')) {
                const normalizedDash = normalized.toLowerCase().replace(/\s+/g, '-');
                try {
                  console.log(`Thử lại với loại da không dấu + gạch ngang: ${normalizedDash}`);
                  const normalizedDashResponse = await axiosClient.get(`/api/SkincareRoutines/skintype/${normalizedDash}`);
                  
                  // Xử lý cấu trúc đặc biệt với $values
                  if (normalizedDashResponse && normalizedDashResponse.$values) {
                    // Định dạng từng routine trong mảng
                    const formattedRoutines = normalizedDashResponse.$values.map(routine => 
                      skincareRoutineService.formatRoutineContent(routine)
                    );
                    return formattedRoutines;
                  }
                  
                  return normalizedDashResponse;
                } catch (normalizedDashError) {
                  console.log(`Không tìm thấy với loại da không dấu + gạch ngang: ${normalizedDash}`);
                }
              }
              
              console.log(`Không tìm thấy với loại da không dấu: ${normalized}`);
            }
          }
        }
        
        // Ném lỗi ban đầu nếu các cách thử đều không thành công
        console.error(`Lỗi khi lấy quy trình chăm sóc da theo loại da ${skinType}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Lỗi khi lấy quy trình chăm sóc da theo loại da ${skinType}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách quy trình chăm sóc da của người dùng
   * @param {number} userId - ID của người dùng
   */
  getRoutinesByUser: async (userId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/ByUser/${userId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy quy trình chăm sóc da của người dùng ID=${userId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới quy trình chăm sóc da
   * @param {object} routineData - Dữ liệu quy trình
   */
  createRoutine: async (routineData) => {
    try {
      const response = await axiosClient.post('/api/SkincareRoutines', routineData);
      return response;
    } catch (error) {
      console.error('Lỗi khi tạo quy trình chăm sóc da:', error);
      throw error;
    }
  },

  /**
   * Tạo mới quy trình chăm sóc da kèm các sản phẩm
   * @param {object} routineData - Dữ liệu quy trình và sản phẩm
   */
  createRoutineWithProducts: async (routineData) => {
    try {
      const response = await axiosClient.post('/api/SkincareRoutines/WithProducts', routineData);
      return response;
    } catch (error) {
      console.error('Lỗi khi tạo quy trình chăm sóc da kèm sản phẩm:', error);
      throw error;
    }
  },

  /**
   * Cập nhật quy trình chăm sóc da
   * @param {number} routineId - ID của quy trình
   * @param {object} routineData - Dữ liệu cập nhật
   */
  updateRoutine: async (routineId, routineData) => {
    try {
      const response = await axiosClient.put(`/api/SkincareRoutines/${routineId}`, routineData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật quy trình chăm sóc da ID=${routineId}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật quy trình chăm sóc da kèm các sản phẩm
   * @param {number} routineId - ID của quy trình
   * @param {object} routineData - Dữ liệu quy trình và sản phẩm
   */
  updateRoutineWithProducts: async (routineId, routineData) => {
    try {
      const response = await axiosClient.put(`/api/SkincareRoutines/WithProducts/${routineId}`, routineData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật quy trình chăm sóc da kèm sản phẩm ID=${routineId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa quy trình chăm sóc da
   * @param {number} routineId - ID của quy trình
   */
  deleteRoutine: async (routineId) => {
    try {
      const response = await axiosClient.delete(`/api/SkincareRoutines/${routineId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa quy trình chăm sóc da ID=${routineId}:`, error);
      throw error;
    }
  },

  // API cho SkincareRoutineProducts

  /**
   * Lấy danh sách tất cả sản phẩm trong quy trình chăm sóc da
   */
  getRoutineProducts: async () => {
    try {
      const response = await axiosClient.get('/api/SkincareRoutineProducts');
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm trong quy trình:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết sản phẩm trong quy trình theo ID
   * @param {number} routineProductId - ID của bản ghi sản phẩm trong quy trình
   */
  getRoutineProductById: async (routineProductId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutineProducts/${routineProductId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết sản phẩm trong quy trình ID=${routineProductId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy tất cả sản phẩm thuộc một quy trình chăm sóc da
   * @param {number} routineId - ID của quy trình
   */
  getProductsByRoutine: async (routineId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutineProducts/ByRoutine/${routineId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm thuộc quy trình ID=${routineId}:`, error);
      throw error;
    }
  },

  /**
   * Thêm sản phẩm vào quy trình chăm sóc da
   * @param {object} routineProductData - Dữ liệu sản phẩm trong quy trình
   */
  addProductToRoutine: async (routineProductData) => {
    try {
      const response = await axiosClient.post('/api/SkincareRoutineProducts', routineProductData);
      return response;
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào quy trình:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin sản phẩm trong quy trình
   * @param {number} routineProductId - ID của bản ghi sản phẩm trong quy trình
   * @param {object} routineProductData - Dữ liệu cập nhật
   */
  updateRoutineProduct: async (routineProductId, routineProductData) => {
    try {
      const response = await axiosClient.put(`/api/SkincareRoutineProducts/${routineProductId}`, routineProductData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật sản phẩm trong quy trình ID=${routineProductId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa sản phẩm khỏi quy trình chăm sóc da
   * @param {number} routineProductId - ID của bản ghi sản phẩm trong quy trình
   */
  removeProductFromRoutine: async (routineProductId) => {
    try {
      const response = await axiosClient.delete(`/api/SkincareRoutineProducts/${routineProductId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm khỏi quy trình ID=${routineProductId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa tất cả sản phẩm thuộc một quy trình chăm sóc da
   * @param {number} routineId - ID của quy trình
   */
  removeAllProductsFromRoutine: async (routineId) => {
    try {
      const response = await axiosClient.delete(`/api/SkincareRoutineProducts/ByRoutine/${routineId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa tất cả sản phẩm thuộc quy trình ID=${routineId}:`, error);
      throw error;
    }
  },

  /**
   * Sắp xếp lại thứ tự các sản phẩm trong quy trình
   * @param {Array} reorderItems - Danh sách các item cần sắp xếp lại
   */
  reorderProducts: async (reorderItems) => {
    try {
      const response = await axiosClient.put('/api/SkincareRoutineProducts/ReorderProducts', reorderItems);
      return response;
    } catch (error) {
      console.error('Lỗi khi sắp xếp lại thứ tự sản phẩm:', error);
      throw error;
    }
  },

  // API cho SkincareRoutineCategories

  /**
   * Lấy danh sách tất cả danh mục quy trình chăm sóc da
   */
  getAllRoutineCategories: async () => {
    try {
      const response = await axiosClient.get('/api/SkincareRoutines/categories');
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục quy trình chăm sóc da:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách danh mục quy trình chăm sóc da theo loại da
   * @param {string} skinType - Loại da (Da khô, Da dầu, Da thường, v.v.)
   */
  getRoutineCategoriesBySkinType: async (skinType) => {
    try {
      // Thử cách 1: Sử dụng trực tiếp loại da được truyền vào nhưng mã hóa URL
      try {
        const encodedSkinType = encodeURIComponent(skinType);
        console.log(`[Categories] Gọi API với loại da đã mã hóa: ${encodedSkinType}`);
        const response = await axiosClient.get(`/api/SkincareRoutines/categories/skintype/${encodedSkinType}`);
        
        // Xử lý cấu trúc đặc biệt với $values
        if (response && response.$values) {
          console.log('[Categories] Trích xuất giá trị từ $values');
          return response.$values;
        }
        
        return response;
      } catch (error) {
        // Nếu gặp lỗi 404, thử các biến thể khác của loại da
        if (error.response && error.response.status === 404) {
          // Thử với phiên bản dấu gạch ngang của tên loại da
          if (skinType.includes(' ')) {
            const dashFormat = skinType.toLowerCase().replace(/\s+/g, '-');
            try {
              console.log(`[Categories] Thử lại với format dấu gạch: ${dashFormat}`);
              const retryResponse = await axiosClient.get(`/api/SkincareRoutines/categories/skintype/${dashFormat}`);
              
              // Xử lý cấu trúc đặc biệt với $values
              if (retryResponse && retryResponse.$values) {
                return retryResponse.$values;
              }
              
              return retryResponse;
            } catch (dashError) {
              console.log(`[Categories] Không tìm thấy với format dấu gạch: ${dashFormat}`);
            }
          }
          
          // Chuyển đổi loại da sang dạng không dấu để thử lại
          const normalized = skinType
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
          
          if (normalized !== skinType) {
            try {
              const encodedNormalized = encodeURIComponent(normalized);
              console.log(`[Categories] Thử lại với loại da không dấu: ${encodedNormalized}`);
              const retryResponse = await axiosClient.get(`/api/SkincareRoutines/categories/skintype/${encodedNormalized}`);
              
              // Xử lý cấu trúc đặc biệt với $values
              if (retryResponse && retryResponse.$values) {
                return retryResponse.$values;
              }
              
              return retryResponse;
            } catch (retryError) {
              // Nếu vẫn không thành công với dạng không dấu, thử dạng không dấu + gạch ngang
              if (normalized.includes(' ')) {
                const normalizedDash = normalized.toLowerCase().replace(/\s+/g, '-');
                try {
                  console.log(`[Categories] Thử lại với loại da không dấu + gạch ngang: ${normalizedDash}`);
                  const normalizedDashResponse = await axiosClient.get(`/api/SkincareRoutines/categories/skintype/${normalizedDash}`);
                  
                  // Xử lý cấu trúc đặc biệt với $values
                  if (normalizedDashResponse && normalizedDashResponse.$values) {
                    return normalizedDashResponse.$values;
                  }
                  
                  return normalizedDashResponse;
                } catch (normalizedDashError) {
                  console.log(`[Categories] Không tìm thấy với loại da không dấu + gạch ngang: ${normalizedDash}`);
                }
              }
              
              console.log(`[Categories] Không tìm thấy với loại da không dấu: ${normalized}`);
            }
          }
        }
        
        // Ném lỗi ban đầu nếu các cách thử đều không thành công
        console.error(`[Categories] Lỗi khi lấy danh mục quy trình chăm sóc da theo loại da ${skinType}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`[Categories] Lỗi khi lấy danh mục quy trình chăm sóc da theo loại da ${skinType}:`, error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết danh mục quy trình chăm sóc da theo ID
   * @param {number} categoryId - ID của danh mục
   */
  getRoutineCategoryById: async (categoryId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/categories/${categoryId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết danh mục quy trình chăm sóc da ID=${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh mục quy trình chăm sóc da theo ID sản phẩm
   * @param {number} productId - ID của sản phẩm
   */
  getRoutineCategoriesByProductId: async (productId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutines/categories/product/${productId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy danh mục quy trình chăm sóc da theo sản phẩm ID=${productId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới danh mục quy trình chăm sóc da
   * @param {object} categoryData - Dữ liệu danh mục
   */
  createRoutineCategory: async (categoryData) => {
    try {
      const response = await axiosClient.post('/api/SkincareRoutines/categories', categoryData);
      return response;
    } catch (error) {
      console.error('Lỗi khi tạo danh mục quy trình chăm sóc da:', error);
      throw error;
    }
  },

  /**
   * Cập nhật danh mục quy trình chăm sóc da
   * @param {number} categoryId - ID của danh mục
   * @param {object} categoryData - Dữ liệu cập nhật
   */
  updateRoutineCategory: async (categoryId, categoryData) => {
    try {
      const response = await axiosClient.put(`/api/SkincareRoutines/categories/${categoryId}`, categoryData);
      return response;
    } catch (error) {
      console.error(`Lỗi khi cập nhật danh mục quy trình chăm sóc da ID=${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Xóa danh mục quy trình chăm sóc da
   * @param {number} categoryId - ID của danh mục
   */
  deleteRoutineCategory: async (categoryId) => {
    try {
      const response = await axiosClient.delete(`/api/SkincareRoutines/categories/${categoryId}`);
      return response;
    } catch (error) {
      console.error(`Lỗi khi xóa danh mục quy trình chăm sóc da ID=${categoryId}:`, error);
      throw error;
    }
  },

  /**
   * Chuyển đổi nội dung quy trình chăm sóc da sang định dạng chuẩn
   * @param {object} routine - Dữ liệu quy trình từ API
   * @returns {object} Dữ liệu quy trình đã được định dạng
   */
  formatRoutineContent: (routine) => {
    if (!routine || !routine.content) return routine;

    try {
      // Kiểm tra xem nội dung đã là JSON hay chưa
      let content = routine.content;
      const isJSON = typeof content === 'string' && 
                   (content.startsWith('{') || content.startsWith('['));
      
      if (isJSON) {
        try {
          // Thử phân tích JSON
          const parsedContent = JSON.parse(content);
          routine.content = parsedContent;
          return routine;
        } catch (e) {
          console.error('Lỗi khi phân tích JSON:', e);
          // Nếu không phải JSON hợp lệ, tiếp tục với định dạng text
        }
      }
      
      // Nếu là text, thử phân tích cấu trúc
      // Giả sử nội dung có cấu trúc: Đặc điểm, Buổi sáng, Buổi tối
      const features = [];
      const morningSteps = [];
      const eveningSteps = [];
      let morningTitle = 'Tươi tắn, không bóng dầu';
      let eveningTitle = 'Làm sạch sâu, phục hồi da';
      
      // Phân tích nội dung thành các dòng
      const lines = content.split('\n');
      let currentSection = 'none';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Xác định section dựa vào từ khóa
        if (trimmedLine.toLowerCase().includes('đặc điểm') || 
            trimmedLine.toLowerCase().includes('đặc tính') ||
            trimmedLine.toLowerCase().includes('dac diem') ||
            trimmedLine.toLowerCase().includes('đặc trưng')) {
          currentSection = 'features';
          continue;
        } else if (trimmedLine.toLowerCase().includes('buổi sáng') || 
                  trimmedLine.toLowerCase().includes('buoi sang') ||
                  trimmedLine.toLowerCase().includes('quy trình sáng') ||
                  trimmedLine.toLowerCase().includes('sáng:')) {
          currentSection = 'morning';
          
          // Trích xuất tiêu đề buổi sáng nếu có
          const titleMatch = trimmedLine.match(/[:,\-–—]\s*(.+)$/);
          if (titleMatch && titleMatch[1]) {
            morningTitle = titleMatch[1].trim();
          }
          
          continue;
        } else if (trimmedLine.toLowerCase().includes('buổi tối') || 
                  trimmedLine.toLowerCase().includes('buoi toi') || 
                  trimmedLine.toLowerCase().includes('quy trình tối') ||
                  trimmedLine.toLowerCase().includes('tối:')) {
          currentSection = 'evening';
          
          // Trích xuất tiêu đề buổi tối nếu có
          const titleMatch = trimmedLine.match(/[:,\-–—]\s*(.+)$/);
          if (titleMatch && titleMatch[1]) {
            eveningTitle = titleMatch[1].trim();
          }
          
          continue;
        }
        
        // Thêm nội dung vào section tương ứng (hỗ trợ nhiều định dạng danh sách)
        if (currentSection === 'features' && (
            trimmedLine.startsWith('-') || 
            trimmedLine.startsWith('•') || 
            trimmedLine.startsWith('*') ||
            /^\d+[\.)]/.test(trimmedLine) || // Số + dấu chấm hoặc dấu đóng ngoặc
            /^[a-z][\)\.)]/.test(trimmedLine) // Chữ cái + dấu chấm hoặc dấu đóng ngoặc
        )) {
          // Loại bỏ dấu đầu dòng
          const cleanLine = trimmedLine.replace(/^[-•*\d]+[\.)]|^[a-z][\).)]/, '').trim();
          features.push(cleanLine);
        } else if (currentSection === 'morning' && (
            trimmedLine.startsWith('-') || 
            trimmedLine.startsWith('•') || 
            trimmedLine.startsWith('*') ||
            /^\d+[\.)]/.test(trimmedLine) ||
            /^[a-z][\)\.)]/.test(trimmedLine)
        )) {
          const cleanLine = trimmedLine.replace(/^[-•*\d]+[\.)]|^[a-z][\).)]/, '').trim();
          morningSteps.push(cleanLine);
        } else if (currentSection === 'evening' && (
            trimmedLine.startsWith('-') || 
            trimmedLine.startsWith('•') || 
            trimmedLine.startsWith('*') ||
            /^\d+[\.)]/.test(trimmedLine) ||
            /^[a-z][\)\.)]/.test(trimmedLine)
        )) {
          const cleanLine = trimmedLine.replace(/^[-•*\d]+[\.)]|^[a-z][\).)]/, '').trim();
          eveningSteps.push(cleanLine);
        } else if (currentSection !== 'none') {
          // Nếu dòng không bắt đầu bằng ký hiệu danh sách nhưng trong một phần,
          // thêm vào mục cuối cùng của phần đó (nếu có)
          if (currentSection === 'features' && features.length > 0) {
            features[features.length - 1] += ' ' + trimmedLine;
          } else if (currentSection === 'morning' && morningSteps.length > 0) {
            morningSteps[morningSteps.length - 1] += ' ' + trimmedLine;
          } else if (currentSection === 'evening' && eveningSteps.length > 0) {
            eveningSteps[eveningSteps.length - 1] += ' ' + trimmedLine;
          }
        }
      }
      
      // Trường hợp đặc biệt: nếu không có phần đặc điểm nhưng là da dầu, thêm mặc định
      if (features.length === 0 && routine.skinType && 
          (routine.skinType.toLowerCase().includes('dầu') || 
           routine.skinType.toLowerCase().includes('dau'))) {
        features.push('Lỗ chân lông to, da bóng nhờn, dễ nổi mụn');
        features.push('Dễ bám bụi bẩn và bít tắc lỗ chân lông');
        features.push('Da đổ dầu nhiều nhất ở vùng chữ T (trán, mũi, cằm)');
      }
      
      // Trích xuất bước theo sản phẩm nếu không có cấu trúc rõ ràng
      if (morningSteps.length === 0 && eveningSteps.length === 0) {
        // Tìm các sản phẩm chăm sóc da trong nội dung
        const skinCareProducts = [
          'sữa rửa mặt', 'tẩy trang', 'toner', 'nước hoa hồng', 
          'serum', 'kem dưỡng', 'kem mắt', 'kem chống nắng', 'đặc trị',
          'tẩy tế bào chết', 'mặt nạ', 'gel', 'lotion', 'essence'
        ];
        
        skinCareProducts.forEach(product => {
          const regex = new RegExp(`.*${product}.*`, 'i');
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (regex.test(trimmedLine)) {
              // Phân loại buổi sáng/tối dựa trên từ khóa
              if (trimmedLine.toLowerCase().includes('sáng') || 
                  trimmedLine.toLowerCase().includes('ban ngày') ||
                  trimmedLine.toLowerCase().includes('chống nắng')) {
                morningSteps.push(trimmedLine);
              } else if (trimmedLine.toLowerCase().includes('tối') || 
                        trimmedLine.toLowerCase().includes('đêm') ||
                        trimmedLine.toLowerCase().includes('ngủ') ||
                        trimmedLine.toLowerCase().includes('tẩy trang')) {
                eveningSteps.push(trimmedLine);
              } else {
                // Nếu không rõ thì thêm vào cả hai
                morningSteps.push(trimmedLine);
                eveningSteps.push(trimmedLine);
              }
            }
          });
        });
        
        // Loại bỏ trùng lặp
        morningSteps = [...new Set(morningSteps)];
        eveningSteps = [...new Set(eveningSteps)];
      }
      
      // Tạo nội dung có cấu trúc
      if (features.length > 0 || morningSteps.length > 0 || eveningSteps.length > 0) {
        const formattedContent = {
          features: features.length > 0 ? features : null,
          morning: morningSteps.length > 0 ? {
            title: morningTitle,
            steps: morningSteps
          } : null,
          evening: eveningSteps.length > 0 ? {
            title: eveningTitle,
            steps: eveningSteps
          } : null
        };
        
        routine.content = formattedContent;
      } else {
        // Sử dụng nội dung mặc định theo loại da
        if (routine.skinType) {
          const skinType = routine.skinType.toLowerCase();
          
          if (skinType.includes('dầu') || skinType.includes('dau')) {
            routine.content = {
              features: [
                'Lỗ chân lông to, da bóng nhờn, dễ nổi mụn.',
                'Dễ bám bụi bẩn và bít tắc lỗ chân lông.',
                'Da đổ dầu nhiều nhất ở vùng chữ T (trán, mũi, cằm).'
              ],
              morning: {
                title: 'Tươi tắn, không bóng dầu',
                steps: [
                  'Sữa rửa mặt - Kiềm soát dầu thừa, làm sạch sâu.',
                  'Toner - Giúp se khít lỗ chân lông, cân bằng độ pH.',
                  'Đặc trị - BHA/Niacinamide giảm dầu, ngăn mụn.',
                  'Serum - Cấp nước nhẹ nhàng, giữ da căng mịn.',
                  'Kem dưỡng ẩm - Dạng gel, thẩm thấm nhanh, không gây bí.',
                  'Kem chống nắng - Kiềm dầu, lâu trôi.'
                ]
              },
              evening: {
                title: 'Làm sạch sâu, phục hồi da',
                steps: [
                  'Tẩy trang - Loại bỏ bã nhờn, bụi bẩn.',
                  'Sữa rửa mặt - Sạch sâu nhưng dịu nhẹ.',
                  'Toner - Hỗ trợ hấp thụ dưỡng chất tốt hơn.',
                  'Tẩy tế bào chết (BHA, AHA) - Giúp thông thoáng lỗ chân lông (2-3 lần/tuần).',
                  'Đặc trị - Hỗ trợ trị mụn, giảm dầu.',
                  'Serum - Cấp ẩm, phục hồi da.',
                  'Kem dưỡng ẩm - Kiềm dầu nhưng vẫn đủ ẩm.'
                ]
              }
            };
          } else if (skinType.includes('khô') || skinType.includes('kho')) {
            routine.content = {
              features: [
                'Da thường xuyên cảm thấy căng, thiếu ẩm.',
                'Dễ xuất hiện các vảy khô, bong tróc.',
                'Lỗ chân lông nhỏ, ít mụn nhưng dễ có vết nhăn sớm.'
              ],
              morning: {
                title: 'Cấp ẩm sâu, bảo vệ làn da',
                steps: [
                  'Sữa rửa mặt - Dạng kem, dịu nhẹ, không gây khô căng.',
                  'Toner - Không cồn, cấp ẩm tức thì.',
                  'Serum - Chứa Hyaluronic Acid, Ceramide để cấp ẩm sâu.',
                  'Kem dưỡng - Giàu dưỡng chất, kết cấu đặc, khóa ẩm.',
                  'Kem chống nắng - Dạng kem, có thêm dưỡng chất.'
                ]
              },
              evening: {
                title: 'Phục hồi và nuôi dưỡng',
                steps: [
                  'Dầu tẩy trang - Không chứa cồn, giàu dưỡng chất.',
                  'Sữa rửa mặt - Dạng kem dịu nhẹ.',
                  'Toner - Cấp ẩm, không chứa cồn.',
                  'Serum - Phục hồi với Peptide, Niacinamide.',
                  'Kem dưỡng đêm - Giàu dưỡng chất, cấp ẩm suốt đêm.',
                  'Dầu dưỡng (tùy chọn) - Thêm lớp khóa ẩm với dầu tự nhiên.'
                ]
              }
            };
          } else if (skinType.includes('hỗn hợp') || skinType.includes('hon hop')) {
            routine.content = {
              features: [
                'Vùng chữ T (trán, mũi, cằm) thường dầu nhờn.',
                'Hai má và các vùng khác có thể khô hoặc bình thường.',
                'Lỗ chân lông to ở vùng chữ T, nhỏ ở vùng khác.',
                'Dễ nổi mụn ở vùng chữ T.'
              ],
              morning: {
                title: 'Cân bằng dầu và ẩm',
                steps: [
                  'Sữa rửa mặt - Dạng gel nhẹ nhàng.',
                  'Toner - Cân bằng pH, không chứa cồn.',
                  'Serum - Niacinamide để kiểm soát dầu và cấp ẩm đồng thời.',
                  'Kem dưỡng - Dạng gel-cream, nhẹ, cấp ẩm không gây nhờn.',
                  'Kem chống nắng - Dạng gel, không gây bóng nhờn.'
                ]
              },
              evening: {
                title: 'Dưỡng ẩm có chọn lọc',
                steps: [
                  'Tẩy trang - Dạng dầu hoặc micellar water.',
                  'Sữa rửa mặt - Dạng gel nhẹ nhàng.',
                  'Toner - Cân bằng và làm sạch sâu.',
                  'Đắp mặt nạ (2-3 lần/tuần) - Mặt nạ đất sét cho vùng chữ T, mặt nạ cấp ẩm cho vùng má.',
                  'Serum - Đa công dụng hoặc dùng hai loại khác nhau cho từng vùng.',
                  'Kem dưỡng - Dưỡng ẩm nhẹ cho vùng chữ T, đậm đặc hơn cho vùng má.'
                ]
              }
            };
          } else if (skinType.includes('nhạy cảm') || skinType.includes('nhay cam')) {
            routine.content = {
              features: [
                'Dễ bị kích ứng, đỏ rát khi tiếp xúc với một số thành phần.',
                'Có thể cảm thấy châm chích, ngứa khi dùng sản phẩm mới.',
                'Da mỏng, dễ thấy các mao mạch li ti.',
                'Dễ bị tổn thương bởi tác nhân môi trường.'
              ],
              morning: {
                title: 'Dịu nhẹ và bảo vệ',
                steps: [
                  'Nước làm sạch - Không xà phòng, dịu nhẹ.',
                  'Toner - Không cồn, dịu nhẹ với chiết xuất thực vật làm dịu.',
                  'Serum - Chứa thành phần làm dịu như Centella Asiatica, Aloe Vera.',
                  'Kem dưỡng - Đơn giản, ít thành phần, có chức năng phục hồi hàng rào bảo vệ da.',
                  'Kem chống nắng - Vật lý (zinc oxide, titanium dioxide), không hương liệu.'
                ]
              },
              evening: {
                title: 'Làm dịu và phục hồi',
                steps: [
                  'Tẩy trang - Dạng dầu nhẹ hoặc nước, không mùi.',
                  'Nước làm sạch - Không xà phòng, dịu nhẹ.',
                  'Toner - Làm dịu, giảm viêm, không cồn.',
                  'Serum - Phục hồi với Ceramide, Peptide, tránh Retinol và AHA/BHA mạnh.',
                  'Kem dưỡng - Phục hồi hàng rào bảo vệ da, dưỡng ẩm sâu.'
                ]
              }
            };
          } else if (skinType.includes('thường') || skinType.includes('thuong')) {
            routine.content = {
              features: [
                'Không quá khô hay quá nhờn, cảm giác thoải mái.',
                'Lỗ chân lông nhỏ, ít nhìn thấy.',
                'Ít gặp vấn đề về mụn hay kích ứng.',
                'Màu da đều, kết cấu mịn màng.'
              ],
              morning: {
                title: 'Duy trì sự cân bằng',
                steps: [
                  'Sữa rửa mặt - Dạng gel hoặc foam nhẹ nhàng.',
                  'Toner - Cân bằng pH, cấp ẩm nhẹ.',
                  'Serum (tùy chọn) - Vitamin C để làm sáng da và chống oxy hóa.',
                  'Kem dưỡng - Kết cấu nhẹ, cân bằng.',
                  'Kem chống nắng - SPF 30-50, dạng thích hợp với cảm nhận cá nhân.'
                ]
              },
              evening: {
                title: 'Dưỡng ẩm và tái tạo',
                steps: [
                  'Tẩy trang - Dạng dầu, sữa hoặc nước tùy thích.',
                  'Sữa rửa mặt - Làm sạch nhẹ nhàng.',
                  'Toner - Cấp ẩm, làm sáng da.',
                  'Serum - Chống lão hóa nhẹ nhàng với Peptide, Niacinamide.',
                  'Kem dưỡng - Dưỡng ẩm vừa đủ cho qua đêm.',
                  'Mặt nạ (1-2 lần/tuần) - Tùy theo nhu cầu: dưỡng ẩm, làm sáng.'
                ]
              }
            };
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi định dạng nội dung quy trình:', error);
    }
    
    return routine;
  }
};

export default skincareRoutineService; 