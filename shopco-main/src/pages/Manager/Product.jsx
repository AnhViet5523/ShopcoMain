import { useState, useEffect, useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, Pagination, CircularProgress, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Manager.css';
import productService from '../../apis/productService';
import categoryService from '../../apis/categoryService';
import adminService from '../../apis/adminService';
import productImageService from '../../apis/productImageService';

const Product = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Thêm state cho dialog và form thêm sản phẩm
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productCode: '',
    productName: '',
    categoryId: '',
    quantity: '',
    capacity: '',
    price: '',
    brand: '',
    origin: '',
    status: 'Available',
    imgURL: '',
    skinType: '',
    description: '',
    ingredients: '',
    usageInstructions: '',
    manufactureDate: null,
    ngayNhapKho: null
  });

  // Thêm biến lưu trữ mapping giữa tên danh mục và ID
  const [categoryMapping, setCategoryMapping] = useState({});

  // Thêm state cho dialog chi tiết sản phẩm
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Thêm state cho dialog xem tất cả ảnh
  const [openImageGallery, setOpenImageGallery] = useState(false);

  // Thêm state cho lưu trữ ảnh sản phẩm
  const [productImages, setProductImages] = useState([]);

  // Thêm state cho việc chỉnh sửa sản phẩm
  const [editingProductId, setEditingProductId] = useState(null);

  // Thêm state cho chức năng sửa ảnh
  const [openEditImagesDialog, setOpenEditImagesDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [reorderedImages, setReorderedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Thêm state này ở cùng vị trí với các state khác
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '📢' },
  ];

  const tabs = ['Tất cả', 'Hàng mới nhập', 'Hàng sắp hết'];

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      console.log('Bắt đầu lấy danh sách danh mục...');
      const response = await categoryService.getCategories();
      console.log('Phản hồi API danh mục:', response);
      
      const map = {};
      const idMapping = {}; // Thêm mapping cho ID
      
      // Kiểm tra cấu trúc response
      if (Array.isArray(response)) {
        // Nếu response là mảng trực tiếp
        console.log(`Xử lý ${response.length} danh mục từ mảng`);
        response.forEach(category => {
          if (category && category.categoryId !== undefined) {
            map[category.categoryId] = {
              categoryType: category.categoryType || 'Unknown',
              categoryName: category.categoryName || 'Unknown'
            };
            
            // Tạo mapping ngược từ tên đến ID
            const key = `${category.categoryType || 'Unknown'} - ${category.categoryName || 'Unknown'}`;
            idMapping[key] = category.categoryId;
          }
        });
      } else if (response && response.$values && Array.isArray(response.$values)) {
        // Nếu response có cấu trúc $values
        console.log(`Xử lý ${response.$values.length} danh mục từ $values`);
        response.$values.forEach(category => {
          if (category && category.categoryId !== undefined) {
            map[category.categoryId] = {
              categoryType: category.categoryType || 'Unknown',
              categoryName: category.categoryName || 'Unknown'
            };
            
            // Tạo mapping ngược từ tên đến ID
            const key = `${category.categoryType || 'Unknown'} - ${category.categoryName || 'Unknown'}`;
            idMapping[key] = category.categoryId;
          }
        });
      } else if (response && typeof response === 'object') {
        // Nếu response là một object nhưng không có $values hoặc không phải mảng
        console.log('Xử lý danh mục từ object');
        Object.entries(response).forEach(([key, categories]) => {
          if (Array.isArray(categories)) {
            categories.forEach(category => {
              if (category && category.categoryId !== undefined) {
                map[category.categoryId] = {
                  categoryType: key,
                  categoryName: category.categoryName || 'Unknown'
                };
                
                // Tạo mapping ngược từ tên đến ID
                const mapKey = `${key} - ${category.categoryName || 'Unknown'}`;
                idMapping[mapKey] = category.categoryId;
              }
            });
          }
        });
      }
      
      if (Object.keys(map).length === 0) {
        console.warn('Không có danh mục nào được xử lý');
      } else {
        console.log(`Đã xử lý ${Object.keys(map).length} danh mục`);
      }
      
      setCategoryMapping(idMapping); // Lưu mapping vào state
      console.log('Category mapping:', map);
      console.log('ID mapping:', idMapping);
      return map;
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return {};
    }
  };

  // Xử lý sản phẩm với danh mục đã biết
  const processProducts = (productsArray, categories) => {
    console.log('Bắt đầu xử lý sản phẩm với danh mục:', { productsArray, categories });
    
    if (!productsArray || productsArray.length === 0) {
      console.warn('Không có sản phẩm để xử lý');
      return [];
    }
    
    // Kiểm tra cấu trúc của sản phẩm đầu tiên để hiểu cấu trúc dữ liệu
    const firstProduct = productsArray[0];
    console.log('Cấu trúc sản phẩm đầu tiên:', firstProduct);
    
    return productsArray.map(product => {
      // Lấy ID sản phẩm, hỗ trợ nhiều cách đặt tên
      const productId = product.productId || product.ProductID || product.productID || product.id;
      
      // Lấy ID danh mục, hỗ trợ nhiều cách đặt tên
      const categoryId = product.categoryId || product.CategoryID || product.categoryID;
      
      // Lấy thông tin danh mục từ mapping
      const categoryInfo = categories[categoryId] || { categoryType: 'Unknown', categoryName: 'Unknown' };
      
      return {
        ProductID: productId,
        ProductCode: product.productCode || product.ProductCode || '',
        categoryType: categoryInfo.categoryType,
        categoryName: categoryInfo.categoryName,
        categoryDisplay: `${categoryInfo.categoryType} - ${categoryInfo.categoryName}`,
        ProductName: product.productName || product.ProductName || product.name || '',
        Quantity: product.quantity || product.Quantity || 0,
        Capacity: product.capacity || product.Capacity || '',
        Price: product.price || product.Price || 0,
        Brand: product.brand || product.Brand || '',
        Origin: product.origin || product.Origin || '',
        Status: product.status || product.Status || 'Unknown',
        ImgURL: product.imgURL || product.ImgURL || product.imgUrl || product.image || '',
        SkinType: product.skinType || product.SkinType || '',
        Description: product.description || product.Description || '',
        Ingredients: product.ingredients || product.Ingredients || '',
        UsageInstructions: product.usageInstructions || product.UsageInstructions || '',
        ManufactureDate: product.manufactureDate || product.ManufactureDate || null,
        ngayNhapKho: product.ngayNhapKho || product.importDate || null
      };
    });
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async (categories = null) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Bắt đầu lấy danh sách sản phẩm...');
      
      // Nếu chưa có danh mục, lấy danh mục trước
      const categoryData = categories || await fetchCategories();
      console.log('Dữ liệu danh mục:', categoryData);
      
      // Lấy sản phẩm với phân trang (nếu API hỗ trợ)
      // Nếu API không hỗ trợ phân trang, lấy tất cả và xử lý phân trang ở client
      console.log('Gọi API lấy tất cả sản phẩm...');
      const response = await productService.getAllProducts();
      console.log('Phản hồi API sản phẩm:', response);
      
      // Xử lý dữ liệu sản phẩm từ nhiều định dạng có thể có
      let productsArray = [];
      if (response && response.$values) {
        productsArray = response.$values;
      } else if (Array.isArray(response)) {
        productsArray = response;
      } else if (response && typeof response === 'object') {
        // Nếu response là một object nhưng không có $values, thử xem nó có phải là một sản phẩm không
        if (response.productId || response.ProductID) {
          productsArray = [response];
        }
      }
      
      console.log(`Đã nhận được ${productsArray.length} sản phẩm từ API`);
      
      if (productsArray.length === 0) {
        console.warn('Không có sản phẩm nào được trả về từ API');
        setProducts([]);
        setOriginalProducts([]);
        setLoading(false);
        return;
      }
      
      // Xử lý sản phẩm với danh mục
      const processedProducts = processProducts(productsArray, categoryData);
      console.log('Sản phẩm đã xử lý:', processedProducts);
      
      setProducts(processedProducts);
      setOriginalProducts(processedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      setError('Đã xảy ra lỗi khi tải dữ liệu sản phẩm: ' + error.message);
      setLoading(false);
    }
  };

  // Gọi lần đầu khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts(originalProducts);
      // Reset thông báo số lượng lọc khi xóa tìm kiếm
      setFilteredCount(0);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredProducts = originalProducts.filter(product => {
      const productName = (product.ProductName || '').toLowerCase();
      const productCode = (product.ProductCode || '').toLowerCase();
      const brand = (product.Brand || '').toLowerCase();
      const categoryType = (product.categoryType || '').toLowerCase();
      const categoryName = (product.categoryName || '').toLowerCase();

      return productName.includes(searchTermLower) ||
             productCode.includes(searchTermLower) ||
             brand.includes(searchTermLower) ||
             categoryType.includes(searchTermLower) ||
             categoryName.includes(searchTermLower);
    });

    setProducts(filteredProducts);
    // Cập nhật thông báo số lượng lọc khi tìm kiếm
    setFilteredCount(filteredProducts.length !== originalProducts.length ? filteredProducts.length : 0);
  }, [searchTerm, originalProducts]);

  // Sử dụng useMemo để tính toán sản phẩm hiển thị theo tab và phân trang
  const displayedProducts = useMemo(() => {
    console.log('Tính toán sản phẩm hiển thị với:', { 
      productsLength: products.length, 
      activeTab, 
      page, 
      pageSize 
    });
    
    let filtered = products;
    
    // Lọc theo tab
    if (activeTab === 'Hàng sắp hết') {
      filtered = products.filter(product => product.Quantity < 9);
      console.log(`Lọc sản phẩm sắp hết: ${filtered.length} sản phẩm`);
    }
    
    // Phân trang ở client (nếu API không hỗ trợ phân trang)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const result = filtered.slice(startIndex, endIndex);
    console.log(`Phân trang: hiển thị ${result.length} sản phẩm từ ${startIndex} đến ${endIndex-1}`);
    
    return result;
  }, [products, activeTab, page, pageSize]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleEdit = (productId) => {
    const productToEdit = products.find(p => p.ProductID === productId);
    if (productToEdit) {
      setNewProduct({
        productCode: productToEdit.ProductCode || '',
        productName: productToEdit.ProductName || '',
        categoryId: productToEdit.categoryId || '',
        quantity: productToEdit.Quantity || '',
        capacity: productToEdit.Capacity || '',
        price: productToEdit.Price || '',
        brand: productToEdit.Brand || '',
        origin: productToEdit.Origin || '',
        status: productToEdit.Status || 'Available',
        imgURL: productToEdit.ImgURL || '',
        skinType: productToEdit.SkinType || '',
        description: productToEdit.Description || '',
        ingredients: productToEdit.Ingredients || '',
        usageInstructions: productToEdit.UsageInstructions || '',
        manufactureDate: productToEdit.ManufactureDate || null,
        ngayNhapKho: productToEdit.ngayNhapKho || null
      });
      setEditingProductId(productId);
      setOpenAddDialog(true);
    }
  };

  const handleSubmitEdit = async () => {
    // Kiểm tra các trường bắt buộc
    if (!newProduct.productName) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!newProduct.quantity || isNaN(parseInt(newProduct.quantity))) {
      alert('Vui lòng nhập số lượng sản phẩm (phải là số)');
      return;
    }
    if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
      alert('Vui lòng nhập giá sản phẩm (phải là số)');
      return;
    }
    if (!newProduct.categoryId) {
      alert('Vui lòng chọn danh mục sản phẩm');
      return;
    }

    try {
      // Chỉ gửi các trường được phép cập nhật theo cấu trúc DB
      const productData = {
        productName: newProduct.productName,
        categoryId: parseInt(newProduct.categoryId),
        quantity: parseInt(newProduct.quantity),
        capacity: newProduct.capacity || "50g",
        price: parseFloat(newProduct.price),
        brand: newProduct.brand || "Việt",
        origin: newProduct.origin || "Việt",
        status: newProduct.status || "Available",
        imgUrl: newProduct.imgURL || "15",
        skinType: newProduct.skinType || "Da nhạy cảm",
        description: newProduct.description || "",
        ingredients: newProduct.ingredients || "",
        usageInstructions: newProduct.usageInstructions || "",
        manufactureDate: newProduct.manufactureDate || new Date().toISOString()
      };

      // Không gửi các trường không được phép cập nhật
      // ProductID - tự động tăng
      // ProductCode - được tạo tự động
      // ImportDate - được cập nhật tự động

      console.log('Dữ liệu gửi đi:', JSON.stringify(productData, null, 2));
      
      await adminService.updateProduct(editingProductId, productData);
      alert('Đã cập nhật sản phẩm thành công');
      handleDialogClose();
      fetchProducts();
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      alert(`Không thể cập nhật sản phẩm: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const handleDelete = async (productId) => {
    try {
      // Hiển thị xác nhận trước khi thay đổi trạng thái
      if (window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái sản phẩm này?')) {
        // Gọi API để thay đổi trạng thái
        const response = await adminService.toggleProductStatus(productId);
        
        // Hiển thị thông báo thành công với trạng thái mới
        alert(`Đã thay đổi trạng thái sản phẩm thành công! Trạng thái mới: ${response.newStatus}`);
        
        // Tải lại danh sách sản phẩm để cập nhật UI
        fetchProducts();
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái sản phẩm:', error);
      alert(`Không thể thay đổi trạng thái sản phẩm: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const handleFilterClick = () => {
    // Reset filter selections
    setSelectedCategory('');
    setSelectedSkinType('');
    setOpenFilterDialog(true);
  };

  const handleFilterApply = () => {
    console.log('Selected Category:', selectedCategory);
    console.log('Selected SkinType:', selectedSkinType);
    
    // Nếu không có bộ lọc nào được chọn, reset về danh sách gốc
    if (!selectedCategory && !selectedSkinType) {
      setProducts(originalProducts);
      setFilteredCount(0);
      setOpenFilterDialog(false);
      return;
    }
    
    const filtered = originalProducts.filter(product => {
      // Nếu có chọn danh mục
      let categoryMatch = true;
      if (selectedCategory) {
        // Tìm thông tin danh mục đã chọn từ categoryOptions
        const selectedCategoryInfo = categoryOptions.find(cat => cat.id === selectedCategory);
        if (selectedCategoryInfo) {
          categoryMatch = product.categoryType === selectedCategoryInfo.categoryType && 
                          product.categoryName === selectedCategoryInfo.categoryName;
        }
      }
      
      // Lọc theo loại da
      const skinTypeMatch = selectedSkinType ? product.SkinType === selectedSkinType : true;
      
      return categoryMatch && skinTypeMatch;
    });

    console.log('Filtered Products:', filtered);
    // Chỉ hiển thị thông báo nếu có sản phẩm được lọc và khác với danh sách gốc
    setFilteredCount(filtered.length !== originalProducts.length ? filtered.length : 0);
    setProducts(filtered);
    setPage(1); // Reset về trang đầu tiên khi lọc
    setOpenFilterDialog(false);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSkinTypeChange = (event) => {
    setSelectedSkinType(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setProducts(originalProducts);
    // Reset thông báo số lượng lọc khi xóa tìm kiếm
    setFilteredCount(0);
  };

  // Cập nhật hàm handleAdd
  const handleAdd = () => {
    setOpenAddDialog(true);
  };
  
  // Thêm hàm để đóng dialog
  const handleDialogClose = () => {
    setOpenAddDialog(false);
    // Reset form data
    setNewProduct({
      productCode: '',
      productName: '',
      categoryId: '',
      quantity: '',
      capacity: '',
      price: '',
      brand: '',
      origin: '',
      status: 'Available',
      imgURL: '',
      skinType: '',
      description: '',
      ingredients: '',
      usageInstructions: '',
      manufactureDate: null,
      ngayNhapKho: null
    });
  };
  
  // Thêm hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'categoryId') {
      // Khi chọn category, lưu giá trị ID (dạng số)
      setNewProduct(prev => ({ ...prev, [name]: parseInt(value) || value }));
    } else {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Thêm options cho status vào component
  const statusOptions = ['Available', 'Unavailable', 'OutOfStock'];

  // Cập nhật hàm handleSubmitProduct để khắc phục lỗi
  const handleSubmitProduct = async () => {
    // Kiểm tra các trường bắt buộc
    if (!newProduct.productName) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!newProduct.quantity || isNaN(parseInt(newProduct.quantity))) {
      alert('Vui lòng nhập số lượng sản phẩm (phải là số)');
      return;
    }
    if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
      alert('Vui lòng nhập giá sản phẩm (phải là số)');
      return;
    }
    if (!newProduct.categoryId) {
      alert('Vui lòng chọn danh mục sản phẩm');
      return;
    }
    
    try {
      // Thử với cấu trúc đơn giản nhất có thể
      const productData = {
        productName: newProduct.productName,
        categoryId: 4, // Cố định ID = 4 (Đức Trị - Serum / Tinh Chất) để thử
        quantity: parseInt(newProduct.quantity),
        capacity: newProduct.capacity || "50g",
        price: parseFloat(newProduct.price),
        brand: newProduct.brand || "Việt",
        origin: newProduct.origin || "Việt",
        status: "Available", // Cố định trạng thái
        imgUrl: "15", // Cố định URL hình ảnh
        skinType: newProduct.skinType || "Da nhạy cảm",
        description: newProduct.description || "test",
        ingredients: newProduct.ingredients || "test",
        usageInstructions: newProduct.usageInstructions || "test",
        manufactureDate: "2025-01-15T10:45:23.977Z" // Cố định ngày
      };
      
      console.log("Dữ liệu gửi đi:", JSON.stringify(productData));
      
      // Sử dụng AJAX trực tiếp thay vì fetch để thử
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://localhost:7175/api/Admin/Product', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Thành công:', xhr.responseText);
          alert('Đã thêm sản phẩm thành công');
          handleDialogClose();
          fetchProducts();
        } else {
          console.error('Lỗi:', xhr.status, xhr.responseText);
          alert(`Không thể thêm sản phẩm: ${xhr.status} - ${xhr.responseText}`);
        }
      };
      
      xhr.onerror = function() {
        console.error('Lỗi kết nối');
        alert('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      };
      
      xhr.send(JSON.stringify(productData));
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      alert(`Không thể thêm sản phẩm: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  // Tạo danh sách danh mục kết hợp cho bộ lọc
  const categoryOptions = useMemo(() => {
    // Sử dụng data từ API nếu có
    if (Object.keys(categoryMapping).length > 0) {
      return Object.entries(categoryMapping).map(([display, id]) => ({
        id: id,
        display: display
      }));
    }
    
    // Fallback nếu chưa có data từ API
    const uniqueCategories = {};
    originalProducts.forEach(product => {
      const key = `${product.categoryType} - ${product.categoryName}`;
      if (!uniqueCategories[key]) {
        uniqueCategories[key] = {
          id: product.ProductID.toString(), // Sử dụng ID thực tế nếu có
          display: key
        };
      }
    });
    
    return Object.values(uniqueCategories);
  }, [categoryMapping, originalProducts]);
  
  const skinTypes = useMemo(() => {
    return [...new Set(originalProducts.map(product => product.SkinType))];
  }, [originalProducts]);

  // Thêm hàm để xóa bộ lọc
  const handleClearFilters = () => {
    setProducts(originalProducts);
    setFilteredCount(0);
    setSelectedCategory('');
    setSelectedSkinType('');
    setSearchTerm('');
  };

  // Cập nhật hàm để mở dialog chi tiết và lấy ảnh sản phẩm
  const handleViewDetail = async (product) => {
    setSelectedProduct(product);
    setOpenDetailDialog(true);
    
    try {
      // Lấy thông tin chi tiết sản phẩm từ API để có thông tin ảnh đầy đủ
      const productDetail = await productService.getProductById(product.ProductID);
      console.log('Chi tiết sản phẩm:', productDetail);
      
      // Xử lý hình ảnh sản phẩm
      let images = [];
      if (productDetail.images && productDetail.images.length > 0) {
        images = productDetail.images;
        console.log('Ảnh sản phẩm từ API:', images);
      } else if (productDetail.imgURL) {
        images = [{ imgUrl: productDetail.imgURL }];
      } else if (product.ImgURL) {
        images = [{ imgUrl: product.ImgURL }];
      } else {
        images = [{ imgUrl: '/images/default-product.jpg' }];
      }
      
      setProductImages(images);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      // Nếu có lỗi, vẫn hiển thị ảnh đại diện
      setProductImages([{ imgUrl: product.ImgURL || '/images/default-product.jpg' }]);
    }
  };

  // Hàm để lấy URL ảnh
  const getImageUrl = (image) => {
    if (!image) return '/images/default-product.jpg';
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    // Nếu là đường dẫn đầy đủ (bắt đầu bằng http hoặc https)
    if (typeof image === 'string') {
      if (image.startsWith('http')) return `${image}?t=${timestamp}`;
      return `${image}?t=${timestamp}`;
    }
    
    // Nếu là object có thuộc tính imgUrl
    if (image.imgUrl) {
      if (image.imgUrl.startsWith('http')) return `${image.imgUrl}?t=${timestamp}`;
      return `${image.imgUrl}?t=${timestamp}`;
    }
    
    // Nếu là object có thuộc tính imageUrl
    if (image.imageUrl) {
      if (image.imageUrl.startsWith('http')) return `${image.imageUrl}?t=${timestamp}`;
      return `${image.imageUrl}?t=${timestamp}`;
    }
    
    return `/images/default-product.jpg?t=${timestamp}`;
  };

  // Thêm hàm để đóng dialog chi tiết
  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedProduct(null);
  };

  // Hàm xử lý mở dialog sửa ảnh
  const handleOpenEditImages = async () => {
    try {
      setUploadingImage(true);
      console.log("Mở dialog sửa ảnh cho sản phẩm ID:", selectedProduct.ProductID);
      
      // Lấy lại danh sách ảnh mới nhất từ API
      const response = await productImageService.getProductImages(selectedProduct.ProductID);
      console.log("Phản hồi API ảnh (raw):", response);
      
      // Đảm bảo newImages là một mảng
      let newImages = [];
      if (Array.isArray(response)) {
        console.log("Phản hồi là mảng, sử dụng trực tiếp");
        newImages = response;
      } else if (response && response.$values && Array.isArray(response.$values)) {
        console.log("Phản hồi có thuộc tính $values, sử dụng response.$values");
        newImages = response.$values;
      } else if (response && typeof response === 'object') {
        // Nếu là một object đơn lẻ, đặt vào mảng
        console.log("Phản hồi là một object đơn lẻ, đặt vào mảng");
        newImages = [response];
      }
      
      if (!newImages || newImages.length === 0) {
        console.warn("Không tìm thấy ảnh nào cho sản phẩm này!");
        newImages = [];
      }
      
      console.log("Danh sách ảnh đã xử lý:", newImages);
      
      // Kiểm tra và tìm ảnh đại diện
      let foundMainImage = false;
      
      // Lấy thông tin sản phẩm để xác định ảnh đại diện
      const productDetail = await productService.getProductById(selectedProduct.ProductID);
      console.log("Chi tiết sản phẩm:", productDetail);
      
      const mainImageUrl = productDetail.imgURL || productDetail.ImgURL;
      console.log("URL ảnh đại diện:", mainImageUrl);
      
      // Xử lý từng ảnh để đánh dấu ảnh đại diện
      newImages = newImages.map(img => {
        // Lấy đường dẫn ảnh không bao gồm query string (nếu có)
        const imgUrl = img.imgUrl ? img.imgUrl.split('?')[0] : '';
        console.log(`So sánh ảnh: ${imgUrl} với ảnh đại diện: ${mainImageUrl}`);
        
        // Nếu URL ảnh trùng với URL ảnh đại diện, đánh dấu là ảnh đại diện
        const isMain = mainImageUrl && imgUrl === mainImageUrl.split('?')[0];
        
        if (isMain) {
          console.log(`Ảnh ID ${img.imageID} được xác định là ảnh đại diện`);
          foundMainImage = true;
        }
        
        return { ...img, isMainImage: isMain };
      });
      
      // Nếu không tìm thấy ảnh đại diện và có ít nhất một ảnh, đặt ảnh đầu tiên làm ảnh đại diện
      if (!foundMainImage && newImages.length > 0) {
        console.log(`Không tìm thấy ảnh đại diện, đặt ảnh đầu tiên (ID: ${newImages[0].imageID}) làm ảnh đại diện`);
        newImages[0].isMainImage = true;
      }
      
      console.log("Danh sách ảnh cuối cùng:", newImages);
      
      // Cập nhật state
      setReorderedImages(newImages);
      setSelectedImage(null);
      setOpenEditImagesDialog(true);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh sản phẩm:', error);
      alert(`Không thể lấy danh sách ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý khi chọn file ảnh mới
  const handleImageFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setNewImageFile(event.target.files[0]);
    }
  };

  // Hàm xử lý cập nhật ảnh
  const handleUpdateImage = async (imageId) => {
    if (!newImageFile) {
      alert('Vui lòng chọn file ảnh');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Kiểm tra xem reorderedImages có phải là mảng không
      if (!reorderedImages || !Array.isArray(reorderedImages)) {
        console.error("reorderedImages không phải là mảng:", reorderedImages);
        alert("Không thể cập nhật ảnh do dữ liệu không hợp lệ");
        return;
      }
      
      const image = reorderedImages.find(img => img.imageID === imageId);
      if (!image) {
        console.error("Không tìm thấy ảnh với ID:", imageId);
        alert("Không tìm thấy ảnh cần cập nhật");
        return;
      }
      
      await productImageService.updateProductImage(imageId, newImageFile, image.displayOrder || 0);
      alert('Cập nhật ảnh thành công');
      
      // Đóng dialog chỉnh sửa ảnh
      setOpenEditImagesDialog(false);
      
      // Cập nhật lại thông tin sản phẩm
      const productDetail = await productService.getProductById(selectedProduct.ProductID);
      setSelectedProduct({
        ...selectedProduct,
        ImgURL: productDetail.imgURL || productDetail.ImgURL,
        images: productDetail.images || []
      });

      setNewImageFile(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh:', error);
      alert(`Không thể cập nhật ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý sắp xếp lại thứ tự hiển thị của các ảnh và cập nhật ảnh mới
  const handleReorderImages = async () => {
    try {
      // Kiểm tra xem reorderedImages có phải là mảng không
      if (!reorderedImages || !Array.isArray(reorderedImages) || reorderedImages.length === 0) {
        console.error("reorderedImages không phải là mảng hoặc rỗng:", reorderedImages);
        alert("Không thể sắp xếp lại ảnh do dữ liệu không hợp lệ");
        return;
      }
      
      setUploadingImage(true);
      
      // Nếu có ảnh được chọn để cập nhật
      if (selectedImage && newImageFile) {
        const image = reorderedImages.find(img => img.imageID === selectedImage);
        if (image) {
          await productImageService.updateProductImage(selectedImage, newImageFile, image.displayOrder || 0);
          console.log("Đã cập nhật ảnh:", selectedImage);
        }
      }
      
      // Đảm bảo reorderedImages có displayOrder từ 0 đến length-1
      const sortedImages = [...reorderedImages].sort((a, b) => 
        (a.displayOrder === undefined ? 0 : a.displayOrder) - 
        (b.displayOrder === undefined ? 0 : b.displayOrder)
      );
      
      const updatedImages = sortedImages.map((img, index) => ({
        ...img,
        displayOrder: index
      }));

      // Tìm ảnh đại diện đã chọn
      const mainImage = reorderedImages.find(img => img.isMainImage);
      if (mainImage) {
        try {
          // Cập nhật ảnh đại diện cho sản phẩm
          // Đổi từ productService.updateMainImage sang productImageService.setMainImage
          console.log(`Cập nhật ảnh đại diện, sản phẩm ID: ${selectedProduct.ProductID}, ảnh ID: ${mainImage.imageID}`);
          await productImageService.setMainImage(selectedProduct.ProductID, mainImage.imageID);
          console.log("Đã đặt ảnh đại diện:", mainImage.imageID);
        } catch (error) {
          console.error('Lỗi khi đặt ảnh đại diện:', error);
          // Tiếp tục xử lý các phần khác, không dừng lại
        }
      }

      await productImageService.reorderProductImages(updatedImages);
      alert('Cập nhật thành công');
      
      // Đóng dialog chỉnh sửa ảnh
      setOpenEditImagesDialog(false);
      setOpenImageGallery(false);
      
      // Đợi một chút để đảm bảo server đã xử lý xong
      setTimeout(async () => {
        try {
          // Cập nhật lại thông tin sản phẩm
          const productDetail = await productService.getProductById(selectedProduct.ProductID);
          
          // Xử lý hình ảnh sản phẩm
          let images = [];
          if (productDetail.images && productDetail.images.length > 0) {
            images = productDetail.images;
          } else if (productDetail.imgURL) {
            images = [{ imgUrl: productDetail.imgURL }];
          } else if (selectedProduct.ImgURL) {
            images = [{ imgUrl: selectedProduct.ImgURL }];
          } else {
            images = [{ imgUrl: '/images/default-product.jpg' }];
          }
          
          // Cập nhật state
          setProductImages(images);
          setSelectedProduct({
            ...selectedProduct,
            ImgURL: productDetail.imgURL || productDetail.ImgURL,
            images: images
          });
          
          // Reset các state
          setNewImageFile(null);
          setSelectedImage(null);
        } catch (error) {
          console.error('Lỗi khi tải lại thông tin sản phẩm:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh:', error);
      alert(`Không thể cập nhật ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý xóa ảnh
  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      try {
        setUploadingImage(true);
        await productImageService.deleteProductImage(imageId);
        alert('Xóa ảnh thành công');
        
        // Đóng dialog chỉnh sửa ảnh
        setOpenEditImagesDialog(false);
        setOpenImageGallery(false);
        
        // Đợi một chút để đảm bảo server đã xử lý xong
        setTimeout(async () => {
          try {
            // Cập nhật lại thông tin sản phẩm
            const productDetail = await productService.getProductById(selectedProduct.ProductID);
            
            // Xử lý hình ảnh sản phẩm
            let images = [];
            if (productDetail.images && productDetail.images.length > 0) {
              images = productDetail.images;
            } else if (productDetail.imgURL) {
              images = [{ imgUrl: productDetail.imgURL }];
            } else if (selectedProduct.ImgURL) {
              images = [{ imgUrl: selectedProduct.ImgURL }];
            } else {
              images = [{ imgUrl: '/images/default-product.jpg' }];
            }
            
            // Cập nhật state
            setProductImages(images);
            setSelectedProduct({
              ...selectedProduct,
              ImgURL: productDetail.imgURL || productDetail.ImgURL,
              images: images
            });
          } catch (error) {
            console.error('Lỗi khi tải lại thông tin sản phẩm:', error);
          }
        }, 1000);
      } catch (error) {
        console.error('Lỗi khi xóa ảnh:', error);
        alert(`Không thể xóa ảnh: ${error.message || 'Lỗi không xác định'}`);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // Hàm xử lý thêm ảnh mới
  const handleAddNewImage = async () => {
    if (!newImageFile) {
      alert('Vui lòng chọn file ảnh');
      return;
    }
    
    try {
      setUploadingImage(true);
      await productImageService.addProductImage(selectedProduct.ProductID, newImageFile);
      alert('Thêm ảnh thành công');
      
      // Đóng dialog chỉnh sửa ảnh
      setOpenEditImagesDialog(false);
      setOpenImageGallery(false);
      
      // Đợi một chút để đảm bảo server đã xử lý xong
      setTimeout(async () => {
        try {
          // Cập nhật lại thông tin sản phẩm
          const productDetail = await productService.getProductById(selectedProduct.ProductID);
          
          // Xử lý hình ảnh sản phẩm
          let images = [];
          if (productDetail.images && productDetail.images.length > 0) {
            images = productDetail.images;
          } else if (productDetail.imgURL) {
            images = [{ imgUrl: productDetail.imgURL }];
          } else if (selectedProduct.ImgURL) {
            images = [{ imgUrl: selectedProduct.ImgURL }];
          } else {
            images = [{ imgUrl: '/images/default-product.jpg' }];
          }
          
          // Cập nhật state
          setProductImages(images);
          setSelectedProduct({
            ...selectedProduct,
            ImgURL: productDetail.imgURL || productDetail.ImgURL,
            images: images
          });
          
          setNewImageFile(null);
        } catch (error) {
          console.error('Lỗi khi tải lại thông tin sản phẩm:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi thêm ảnh:', error);
      alert(`Không thể thêm ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý khi đặt ảnh làm ảnh đại diện
  const handleSetAsMainImage = async (imageId) => {
    if (!reorderedImages || !Array.isArray(reorderedImages) || reorderedImages.length === 0) {
      console.error("reorderedImages không phải là mảng hoặc rỗng:", reorderedImages);
      return;
    }

    console.log(`Đặt ảnh ID ${imageId} làm ảnh đại diện`);

    try {
      // Gọi API để cập nhật ảnh đại diện
      await productImageService.setMainImage(selectedProduct.ProductID, imageId);
      console.log(`Đã cập nhật ảnh đại diện ID ${imageId} trên server`);

      // Cập nhật state reorderedImages để đảm bảo chỉ có một ảnh là ảnh đại diện
      const updatedImages = reorderedImages.map(img => {
        const isMainImage = img.imageID === imageId;
        // Ghi log để debug
        if (isMainImage) {
          console.log(`Ảnh ID ${img.imageID} được đặt làm ảnh đại diện`);
        } else if (img.isMainImage) {
          console.log(`Ảnh ID ${img.imageID} không còn là ảnh đại diện`);
        }
        // Cập nhật cả isMainImage và displayOrder
        return {
          ...img,
          isMainImage: isMainImage,
          displayOrder: isMainImage ? 0 : (img.displayOrder === 0 ? 1 : img.displayOrder)
        };
      });

      console.log("Danh sách ảnh sau khi cập nhật ảnh đại diện:", updatedImages);
      setReorderedImages(updatedImages);
      alert('Đã đặt ảnh đại diện thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh đại diện:', error);
      alert(`Không thể cập nhật ảnh đại diện: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo" style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <img 
                src="/images/logo.png" 
                alt="Beauty Cosmetics"
                style={{
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div>BEAUTY</div>
              <div>COSMETICS</div>
            </div>
          </div>
          
          <div className="sidebar-title">MANAGER</div>
          
          <div className="sidebar-menu">
            {sidebarItems.map((item) => (
              <div key={item.id} className="sidebar-item" onClick={() => navigate(`/${item.id}`)}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
          
          <div className="logout-button" onClick={() => navigate('/')}>
            <span className="logout-icon">🚪</span>
            <span>Đăng Xuất</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="dashboard-header">
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm, mã sản phẩm, thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Sản Phẩm</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {searchTerm && products.length > 0 && (
                <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                  Tìm thấy: {products.length} sản phẩm
                </div>
              )}
               <button className="btn-filter" onClick={handleFilterClick}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FaFilter /> 
                  <span>Lọc</span>
                  {filteredCount > 0 && <span className="notification">{filteredCount}</span>}
                </div>
              </button>
              {filteredCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
              <button
                onClick={handleAdd}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                + Thêm sản phẩm
              </button>
             
            </div>
          </div>
          
          {/* Tabs */}
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <div 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          
          {/* Table */}
          <div className="dashboard-table" style={{ overflowX: 'auto' }}>
            <table style={{ 
              tableLayout: 'fixed', 
              width: '100%', 
              borderCollapse: 'separate', 
              borderSpacing: '0',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', height: '50px' }}>
                  <th style={{ width: '50px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>MÃ SP</th>
                  <th style={{ width: '100px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>PHÂN LOẠI</th>
                  <th style={{ width: '120px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TÊN SP</th>
                  <th style={{ width: '60px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>SL</th>
                  <th style={{ width: '70px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>DUNG TÍCH</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>GIÁ</th>
                  <th style={{ width: '90px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THƯƠNG HIỆU</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ width: '150px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td 
                      colSpan="10" 
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#6c757d', 
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <CircularProgress size={24} />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td 
                      colSpan="10" 
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#dc3545', 
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      {error}
                    </td>
                  </tr>
                ) : displayedProducts.length > 0 ? (
                  displayedProducts.map((product, index) => (
                    <tr 
                      key={product.ProductID} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'all 0.2s',
                        ':hover': { backgroundColor: '#f1f3f5' }
                      }}
                    >
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.ProductID}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.ProductCode}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'left' }}>{product.categoryDisplay}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'left', fontWeight: '500' }}>{product.ProductName}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Quantity}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Capacity}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Brand}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Status}</td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewDetail(product)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '4px',
                            fontSize: '12px',
                            transition: 'background-color 0.2s',
                            ':hover': { backgroundColor: '#138496' }
                          }}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleDelete(product.ProductID)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'background-color 0.2s',
                            ':hover': { backgroundColor: '#c82333' }
                          }}
                        >
                          Đổi trạng thái
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="10" 
                      className="empty-data-message"
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#6c757d', 
                        fontSize: '16px',
                        fontStyle: 'italic',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Phân trang */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <Pagination
                count={Math.ceil(products.length / pageSize)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialog lọc sản phẩm */}
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)}>
        <DialogTitle>Lọc sản phẩm</DialogTitle>
        <DialogContent>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            displayEmpty
            fullWidth
            style={{ marginBottom: '10px', marginTop: '10px' }}
          >
            <MenuItem value=""><em>Danh mục sản phẩm</em></MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.display}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSkinType}
            onChange={handleSkinTypeChange}
            displayEmpty
            fullWidth
            style={{ marginTop: '10px' }}
          >
            <MenuItem value=""><em>Loại da</em></MenuItem>
            {skinTypes.map((skinType, index) => (
              <MenuItem key={index} value={skinType}>{skinType}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)}>Hủy</Button>
          <Button onClick={handleFilterApply} color="primary">Áp dụng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết sản phẩm */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              Chi tiết sản phẩm: {selectedProduct.ProductName}
            </DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong>ID:</strong> {selectedProduct.ProductID}
                  </div>
                  <div>
                    <strong>Mã sản phẩm:</strong> {selectedProduct.ProductCode}
                  </div>
                  <div>
                    <strong>Tên sản phẩm:</strong> {selectedProduct.ProductName}
                  </div>
                  <div>
                    <strong>Danh mục:</strong> {selectedProduct.categoryDisplay}
                  </div>
                  <div>
                    <strong>Số lượng:</strong> {selectedProduct.Quantity}
                  </div>
                  <div>
                    <strong>Dung tích:</strong> {selectedProduct.Capacity}
                  </div>
                  <div>
                    <strong>Giá:</strong> {selectedProduct.Price ? `${selectedProduct.Price.toLocaleString()}đ` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong>Thương hiệu:</strong> {selectedProduct.Brand}
                  </div>
                  <div>
                    <strong>Xuất xứ:</strong> {selectedProduct.Origin}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong> {selectedProduct.Status}
                  </div>
                  <div>
                    <strong>Hình ảnh:</strong>
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {productImages && productImages.length > 0 ? (
                          productImages.slice(0, 4).map((image, index) => (
                            <div key={index} style={{ width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                              <img
                                src={getImageUrl(image)}
                                alt={`${selectedProduct.ProductName} - Ảnh ${index + 1}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/default-product.png';
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '10px', color: '#6c757d', fontStyle: 'italic' }}>
                            Không có ảnh
                          </div>
                        )}
                        {productImages && productImages.length > 4 && (
                          <div style={{ 
                            width: '60px', 
                            height: '60px', 
                            border: '1px solid #ddd', 
                            borderRadius: '4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            +{productImages.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <strong>Loại da:</strong> {selectedProduct.SkinType}
                  </div>
                  <div>
                    <strong>Ngày sản xuất:</strong> {selectedProduct.ManufactureDate}
                  </div>
                  <div>
                    <strong>Ngày nhập kho:</strong> {selectedProduct.ngayNhapKho}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Mô tả sản phẩm:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginTop: '4px',
                    minHeight: '60px'
                  }}>
                    {selectedProduct.Description || 'Không có mô tả'}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Thành phần:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginTop: '4px',
                    minHeight: '60px'
                  }}>
                    {selectedProduct.Ingredients || 'Không có thông tin thành phần'}
                  </div>
                </div>
                <div>
                  <strong>Hướng dẫn sử dụng:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginTop: '4px',
                    minHeight: '60px'
                  }}>
                    {selectedProduct.UsageInstructions || 'Không có hướng dẫn sử dụng'}
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail} color="primary">
                Đóng
              </Button>
              <Button 
                onClick={() => {
                  // Mở dialog xem tất cả ảnh
                  setOpenImageGallery(true);
                }}
                color="info"
                style={{ marginRight: '8px' }}
              >
                Xem tất cả ảnh
              </Button>
              <Button 
                onClick={() => {
                  handleCloseDetail();
                  handleEdit(selectedProduct.ProductID);
                }} 
                color="primary" 
                variant="contained"
              >
                Chỉnh sửa
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog thêm sản phẩm */}
      <Dialog open={openAddDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingProductId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
        <DialogContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
            <TextField
              margin="dense"
              name="productName"
              label="Tên Sản Phẩm *"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.productName}
              onChange={handleInputChange}
              required
              error={!newProduct.productName}
              helperText={!newProduct.productName ? "Tên sản phẩm là bắt buộc" : ""}
            />
            <TextField
              margin="dense"
              name="productCode"
              label="Mã Sản Phẩm"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.productCode}
              onChange={handleInputChange}
              disabled={!!editingProductId}
              helperText={editingProductId ? "Mã sản phẩm không thể thay đổi" : ""}
            />
            <Select
              name="categoryId"
              displayEmpty
              fullWidth
              value={newProduct.categoryId}
              onChange={handleInputChange}
              label="Danh Mục *"
            >
              <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
              {categoryOptions.map((category) => (
                <MenuItem key={category.display} value={category.id}>
                  {category.display}
                </MenuItem>
              ))}
            </Select>
            <TextField
              margin="dense"
              name="quantity"
              label="Số Lượng *"
              type="number"
              fullWidth
              variant="outlined"
              value={newProduct.quantity}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="price"
              label="Giá Tiền *"
              type="number"
              fullWidth
              variant="outlined"
              value={newProduct.price}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="capacity"
              label="Dung Tích"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.capacity}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="brand"
              label="Thương Hiệu"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.brand}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="origin"
              label="Xuất Xứ"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.origin}
              onChange={handleInputChange}
            />
            <Select
              name="skinType"
              displayEmpty
              fullWidth
              value={newProduct.skinType}
              onChange={handleInputChange}
              label="Loại Da"
            >
              <MenuItem value=""><em>Chọn loại da</em></MenuItem>
              {skinTypes.map((skinType, index) => (
                <MenuItem key={index} value={skinType}>{skinType}</MenuItem>
              ))}
            </Select>
            <Select
              name="status"
              displayEmpty
              fullWidth
              value={newProduct.status || 'Available'}
              onChange={handleInputChange}
              label="Trạng Thái *"
              style={{ marginTop: '16px' }}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Unavailable">Unavailable</MenuItem>
              <MenuItem value="OutOfStock">Out of Stock</MenuItem>
            </Select>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <TextField
              margin="dense"
              name="description"
              label="Mô Tả Sản Phẩm"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={newProduct.description}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="ingredients"
              label="Thành Phần"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={newProduct.ingredients}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="usageInstructions"
              label="Hướng Dẫn Sử Dụng"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              value={newProduct.usageInstructions}
              onChange={handleInputChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={editingProductId ? handleSubmitEdit : handleSubmitProduct} 
            color="primary" 
            variant="contained"
          >
            {editingProductId ? 'Cập nhật' : 'Thêm Sản Phẩm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem tất cả ảnh */}
      <Dialog open={openImageGallery} onClose={() => setOpenImageGallery(false)} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              Thư viện ảnh: {selectedProduct.ProductName}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex' }}>
                {/* Thumbnail images */}
                <Box sx={{ width: '20%', mr: 2 }}>
                  {productImages && productImages.length > 0 ? (
                    productImages.map((image, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          mb: 1, 
                          border: selectedImageIndex === index ? '2px solid #1976d2' : '1px solid #eee',
                          p: 1,
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-product.png';
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Box 
                      sx={{ 
                        mb: 1, 
                        border: '1px solid #eee',
                        p: 1
                      }}
                    >
                      <Box 
                        sx={{ 
                          bgcolor: '#f5f5f5', 
                          height: 80, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Không có ảnh
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Main image */}
                <Box sx={{ width: '80%' }}>
                  {productImages && productImages.length > 0 ? (
                    <Box
                      sx={{
                        height: 400,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #eee',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {productImages[selectedImageIndex] && 
                        productImages[selectedImageIndex].imgUrl === (selectedProduct.ImgURL || selectedProduct.imgURL) && (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          padding: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '0 0 0 4px',
                          zIndex: 1
                        }}>
                          Ảnh đại diện
                        </div>
                      )}
                      <img
                        src={getImageUrl(productImages[selectedImageIndex])}
                        alt={selectedProduct.ProductName}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '100%', 
                          objectFit: 'contain' 
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-product.png';
                        }}
                      />
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        bgcolor: '#f5f5f5', 
                        height: 400, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: '1px solid #eee'
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        Không có ảnh
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Image info */}
                  {productImages && productImages.length > 0 && productImages[selectedImageIndex] && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: '#f8f8f8' }}>
                      <Typography variant="body2">
                        <strong>Thứ tự hiển thị:</strong> {productImages[selectedImageIndex].displayOrder !== undefined ? 
                          productImages[selectedImageIndex].displayOrder : 'Chưa đặt thứ tự'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>ID ảnh:</strong> {productImages[selectedImageIndex].imageID || 'Không có thông tin'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenImageGallery(false)} color="primary">
                Đóng
              </Button>
              <Button 
                onClick={handleOpenEditImages} 
                color="primary" 
                variant="contained"
              >
                Sửa ảnh
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog sửa ảnh */}
      <Dialog open={openEditImagesDialog} onClose={() => setOpenEditImagesDialog(false)} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              Chỉnh sửa ảnh: {selectedProduct.ProductName}
            </DialogTitle>
            <DialogContent>
              {uploadingImage ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                  <CircularProgress />
                  <span style={{ marginLeft: '10px' }}>Đang xử lý...</span>
                </div>
              ) : (
                <>
                  {/* Phần thêm ảnh mới */}
                  <div style={{ 
                    marginBottom: '20px', 
                    padding: '16px', 
                    border: '1px dashed #ccc', 
                    borderRadius: '4px',
                    opacity: reorderedImages.length >= 5 ? 0.6 : 1
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                      Thêm ảnh mới {reorderedImages.length >= 5 && "(Đã đạt giới hạn 5 ảnh)"}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        disabled={reorderedImages.length >= 5}
                      >
                        Chọn ảnh
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageFileChange}
                          onClick={() => setSelectedImage(null)}
                          disabled={reorderedImages.length >= 5}
                        />
                      </Button>
                      <span style={{ flex: 1 }}>
                        {newImageFile ? newImageFile.name : 'Chưa chọn file nào'}
                      </span>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddNewImage}
                        disabled={!newImageFile || selectedImage !== null || reorderedImages.length >= 5}
                      >
                        Thêm ảnh
                      </Button>
                    </div>
                  </div>

                  {/* Hiển thị danh sách ảnh để sửa - Bố cục mới */}
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Danh sách ảnh ({reorderedImages.length}/5)</div>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Phần thumbnails */}
                    <Box sx={{ width: '25%' }}>
                      {reorderedImages && reorderedImages.length > 0 ? (
                        reorderedImages.map((image, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              mb: 1, 
                              border: selectedImage === image.imageID ? '2px solid #1976d2' : image.isMainImage ? '2px solid #4CAF50' : '1px solid #ddd',
                              p: 1,
                              cursor: 'pointer',
                              position: 'relative',
                              borderRadius: '4px'
                            }}
                            onClick={() => setSelectedImage(image.imageID)}
                          >
                            {image.isMainImage && (
                              <div style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '2px 6px',
                                fontSize: '10px',
                                borderRadius: '0 0 0 4px',
                                zIndex: 1
                              }}>
                                Ảnh đại diện
                              </div>
                            )}
                            <img
                              src={getImageUrl(image)}
                              alt={`Thumbnail ${index + 1}`}
                              style={{ 
                                width: '100%', 
                                height: '80px', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/default-product.png';
                              }}
                            />
                            <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'center' }}>
                              Thứ tự: {image.displayOrder !== undefined ? image.displayOrder : index}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box 
                          sx={{ 
                            p: 2, 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Không có ảnh
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Phần hiển thị ảnh đang chọn và các tùy chỉnh */}
                    <Box sx={{ width: '75%' }}>
                      {reorderedImages && reorderedImages.length > 0 ? (
                        <>
                          {selectedImage ? (
                            // Hiển thị ảnh đang được chọn
                            <>
                              {(() => {
                                const selectedImageObj = reorderedImages.find(img => img.imageID === selectedImage);
                                return selectedImageObj ? (
                                  <Box>
                                    <Box 
                                      sx={{ 
                                        height: '250px', 
                                        border: selectedImageObj.isMainImage ? '2px solid #4CAF50' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        mb: 2,
                                        p: 1
                                      }}
                                    >
                                      {selectedImageObj.isMainImage && (
                                        <div style={{
                                          position: 'absolute',
                                          top: '0',
                                          right: '0',
                                          backgroundColor: '#4CAF50',
                                          color: 'white',
                                          padding: '4px 8px',
                                          fontSize: '12px',
                                          borderRadius: '0 0 0 4px',
                                          zIndex: 1
                                        }}>
                                          Ảnh đại diện
                                        </div>
                                      )}
                                      <img
                                        src={getImageUrl(selectedImageObj)}
                                        alt="Ảnh đang chỉnh sửa"
                                        style={{ 
                                          maxWidth: '100%', 
                                          maxHeight: '100%', 
                                          objectFit: 'contain' 
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/images/default-product.png';
                                        }}
                                      />
                                    </Box>

                                    {/* Các tùy chỉnh cho ảnh đã chọn */}
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '4px' }}>
                                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                                        Thông tin ảnh
                                      </Typography>
                                      
                                      <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                          <strong>ID ảnh:</strong> {selectedImageObj.imageID}
                                        </Typography>
                                        <TextField
                                          type="number"
                                          label="Thứ tự hiển thị"
                                          value={selectedImageObj.displayOrder || reorderedImages.indexOf(selectedImageObj)}
                                          onChange={(e) => {
                                            const newDisplayOrder = parseInt(e.target.value);
                                            const newImages = [...reorderedImages];
                                            const imageIndex = newImages.findIndex(img => img.imageID === selectedImage);
                                            
                                            if (imageIndex !== -1) {
                                              // Kiểm tra xem đã có ảnh nào có thứ tự hiển thị này chưa
                                              const existingImageWithOrder = newImages.find(
                                                (img, idx) => idx !== imageIndex && img.displayOrder === newDisplayOrder
                                              );

                                              if (existingImageWithOrder) {
                                                // Nếu có, hoán đổi thứ tự hiển thị giữa hai ảnh
                                                existingImageWithOrder.displayOrder = newImages[imageIndex].displayOrder;
                                              }
                                              
                                              // Cập nhật thứ tự hiển thị cho ảnh hiện tại
                                              newImages[imageIndex].displayOrder = newDisplayOrder;
                                              setReorderedImages(newImages);
                                            }
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="normal"
                                          InputProps={{ inputProps: { min: 0, max: 4 } }}
                                        />
                                      </Box>
                                      
                                      <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                          Thay đổi ảnh:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Button
                                            variant="outlined"
                                            component="label"
                                            size="small"
                                          >
                                            Chọn ảnh mới
                                            <input
                                              type="file"
                                              hidden
                                              accept="image/*"
                                              onChange={handleImageFileChange}
                                            />
                                          </Button>
                                          <Typography variant="caption" sx={{ flex: 1, ml: 1 }}>
                                            {newImageFile ? newImageFile.name : 'Chưa chọn file nào'}
                                          </Typography>
                                        </Box>
                                        {newImageFile && (
                                          <Box 
                                            sx={{ 
                                              mt: 1, 
                                              p: 1, 
                                              bgcolor: '#e8f5e9', 
                                              borderRadius: '4px',
                                              fontSize: '12px'
                                            }}
                                          >
                                            <Typography variant="caption">
                                              Đã chọn: {newImageFile.name}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          color="success"
                                          onClick={() => handleSetAsMainImage(selectedImage)}
                                          disabled={selectedImageObj.isMainImage}
                                          fullWidth
                                        >
                                          {selectedImageObj.isMainImage ? 'Ảnh đại diện' : 'Đặt làm ảnh đại diện'}
                                        </Button>
                                        <Button
                                          variant="contained"
                                          color="error"
                                          size="small"
                                          onClick={() => handleDeleteImage(selectedImage)}
                                          fullWidth
                                        >
                                          Xóa ảnh này
                                        </Button>
                                      </Box>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box 
                                    sx={{ 
                                      height: '250px', 
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Typography variant="body1" color="text.secondary">
                                      Không tìm thấy ảnh đã chọn
                                    </Typography>
                                  </Box>
                                );
                              })()}
                            </>
                          ) : (
                            // Hiển thị thông báo chọn ảnh
                            <Box 
                              sx={{ 
                                height: '250px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                mb: 2
                              }}
                            >
                              <Typography variant="body1" gutterBottom>
                                Hãy chọn một ảnh từ danh sách bên trái để chỉnh sửa
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Hoặc thêm ảnh mới bằng form phía trên
                              </Typography>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Box 
                          sx={{ 
                            height: '250px', 
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            Không có ảnh nào để hiển thị
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditImagesDialog(false)} color="primary">
                Đóng
              </Button>
              <Button 
                onClick={handleReorderImages} 
                color="primary" 
                variant="contained"
                disabled={uploadingImage}
              >
                Cập nhật
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Product;
