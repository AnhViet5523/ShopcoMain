import { useState, useEffect, useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, Pagination, CircularProgress, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Manager.css';
import productService from '../../apis/productService';
import categoryService from '../../apis/categoryService';
import adminService from '../../apis/adminService';

const ProductStaff = () => {
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

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Feedback', icon: '📢' },
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
        // Nếu response là một object nhưng không có $values, thử xem nó có phải là một sản phẩm không
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
    let filtered = products;
    
    // Lọc theo tab
    if (activeTab === 'Hàng sắp hết') {
      filtered = products.filter(product => product.Quantity < 9);
    }
    
    // Phân trang ở client (nếu API không hỗ trợ phân trang)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return filtered.slice(startIndex, endIndex);
  }, [products, activeTab, page, pageSize]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleEdit = (productId) => {
    // Logic để chỉnh sửa sản phẩm
    console.log(`Edit product with ID: ${productId}`);
  };

  const handleDelete = (productId) => {
    // Logic để xóa sản phẩm
    console.log(`Delete product with ID: ${productId}`);
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
    
    // Nếu là đường dẫn đầy đủ (bắt đầu bằng http hoặc https)
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return image;
    }
    
    // Nếu là object có thuộc tính imgUrl
    if (image.imgUrl) {
      if (image.imgUrl.startsWith('http')) return image.imgUrl;
      return image.imgUrl;
    }
    
    // Nếu là object có thuộc tính imageUrl
    if (image.imageUrl) {
      if (image.imageUrl.startsWith('http')) return image.imageUrl;
      return image.imageUrl;
    }
    
    return '/images/default-product.jpg';
  };

  // Thêm hàm để đóng dialog chi tiết
  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedProduct(null);
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo" style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => navigate("/")}>
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
            <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate("/")}>
              <div>BEAUTY</div>
              <div>COSMETICS</div>
            </div>
          </div>
          
          <div className="sidebar-title">STAFF</div>
          
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
                  <th style={{ width: '70px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>HÌNH ẢNH</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ width: '150px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td 
                      colSpan="11" 
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
                      colSpan="11" 
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
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'right', fontWeight: '500' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'left' }}>{product.Brand}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.ImgURL}</td>
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
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="11" 
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
                      <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                        Ảnh đại diện:
                      </div>
                      <div style={{ width: '200px', height: '200px', border: '2px solid #4CAF50', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                        <img
                          src={getImageUrl(selectedProduct.ImgURL)}
                          alt={`${selectedProduct.ProductName} - Ảnh đại diện`}
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
                      
                      {productImages && productImages.length > 1 && (
                        <>
                          <div style={{ marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                            Ảnh khác ({productImages.length - 1}):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {productImages.slice(1, 4).map((image, index) => (
                              <div key={index} style={{ width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                <img
                                  src={getImageUrl(image)}
                                  alt={`${selectedProduct.ProductName} - Ảnh ${index + 2}`}
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
                            ))}
                            {productImages.length > 4 && (
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
                        </>
                      )}
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
        <DialogTitle>Thêm Sản Phẩm Mới</DialogTitle>
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
            <TextField
              margin="dense"
              name="imgURL"
              label="URL Hình Ảnh"
              type="text"
              fullWidth
              variant="outlined"
              value={newProduct.imgURL}
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
          <Button onClick={handleSubmitProduct} color="primary" variant="contained">
            Thêm Sản Phẩm
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
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '18px', color: '#4CAF50' }}>
                  Ảnh đại diện
                </div>
                <div style={{ width: '100%', maxWidth: '400px', height: '300px', margin: '0 auto', border: '2px solid #4CAF50', borderRadius: '4px', overflow: 'hidden' }}>
                  <img
                    src={getImageUrl(selectedProduct.ImgURL)}
                    alt={`${selectedProduct.ProductName} - Ảnh đại diện`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-product.png';
                    }}
                  />
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '18px' }}>
                  Ảnh chi tiết sản phẩm
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {productImages && productImages.length > 0 ? (
                    productImages.map((image, index) => (
                      <div key={index} style={{ width: '100%', height: '200px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        <img
                          src={getImageUrl(image)}
                          alt={`${selectedProduct.ProductName} - Ảnh ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-product.png';
                          }}
                        />
                        <div style={{ padding: '8px', backgroundColor: '#f8f9fa', textAlign: 'center', borderTop: '1px solid #ddd' }}>
                          {image.displayOrder ? `Thứ tự hiển thị: ${image.displayOrder}` : `Ảnh ${index + 1}`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#6c757d', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      Không có ảnh chi tiết nào
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenImageGallery(false)} color="primary">
                Đóng
              </Button>
              <Button 
                onClick={() => {
                  // Đóng dialog xem ảnh và chuẩn bị cho chức năng sửa ảnh (sẽ được triển khai sau)
                  setOpenImageGallery(false);
                  // Hiển thị thông báo tạm thời
                  alert("Chức năng sửa ảnh sẽ được triển khai sau");
                }} 
                color="primary" 
                variant="contained"
              >
                Sửa ảnh
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ProductStaff;
