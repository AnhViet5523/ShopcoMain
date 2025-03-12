import { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Manager.css';
import productService from '../../apis/productService';
import categoryService from '../../apis/categoryService';

const Product = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedCategoryType, setSelectedCategoryType] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [originalProducts, setOriginalProducts] = useState([]);

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

  const fetchCategoryDetails = async (categoryId) => {
    try {
      const category = await categoryService.getCategoryById(categoryId);
      console.log('Category details:', category);
      return `${category.categoryType || 'Unknown'} - ${category.categoryName || 'Unknown'}`;
    } catch (error) {
      console.error('Error fetching category details:', error);
      return 'Unknown Category';
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        console.log('API Response:', response);
        const data = await Promise.all(response.$values.map(async product => {
          const categoryDetails = await fetchCategoryDetails(product.categoryId);
          const [categoryType] = categoryDetails.split(' - ');
          return {
            ProductID: product.productId,
            ProductCode: product.productCode,
            CategoryID: categoryDetails,
            categoryType: categoryType,
            ProductName: product.productName,
            Quantity: product.quantity,
            Capacity: product.capacity,
            Price: product.price,
            Brand: product.brand,
            Origin: product.origin,
            Status: product.status,
            ImgURL: product.imgURL,
            SkinType: product.skinType,
            Description: product.description,
            Ingredients: product.ingredients,
            UsageInstructions: product.usageInstructions,
            ManufactureDate: product.manufactureDate,
            ngayNhapKho: product.ngayNhapKho
          };
        }));
        console.log('Processed Products:', data);
        setProducts(data);
        setOriginalProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts(originalProducts);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredProducts = originalProducts.filter(product => {
      const productName = (product.ProductName || '').toLowerCase();
      const productCode = (product.ProductCode || '').toLowerCase();
      const brand = (product.Brand || '').toLowerCase();
      const categoryId = (product.CategoryID || '').toLowerCase();

      return productName.includes(searchTermLower) ||
             productCode.includes(searchTermLower) ||
             brand.includes(searchTermLower) ||
             categoryId.includes(searchTermLower);
    });

    setProducts(filteredProducts);
  }, [searchTerm, originalProducts]);

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
    setSelectedCategoryType('');
    setSelectedSkinType('');
    // Fetch original product data
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        const data = await Promise.all(response.$values.map(async product => {
          const categoryDetails = await fetchCategoryDetails(product.categoryId);
          const [categoryType] = categoryDetails.split(' - ');
          return {
            ProductID: product.productId,
            ProductCode: product.productCode,
            CategoryID: categoryDetails,
            categoryType: categoryType,
            ProductName: product.productName,
            Quantity: product.quantity,
            Capacity: product.capacity,
            Price: product.price,
            Brand: product.brand,
            Origin: product.origin,
            Status: product.status,
            ImgURL: product.imgURL,
            SkinType: product.skinType,
            Description: product.description,
            Ingredients: product.ingredients,
            UsageInstructions: product.usageInstructions,
            ManufactureDate: product.manufactureDate,
            ngayNhapKho: product.ngayNhapKho
          };
        }));
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
    setOpenFilterDialog(true);
  };

  const handleFilterApply = () => {
    console.log('Selected CategoryType:', selectedCategoryType);
    console.log('Selected SkinType:', selectedSkinType);
    const filtered = products.filter(product => {
      console.log('Product categoryType:', product.categoryType);
      console.log('Product SkinType:', product.SkinType);
      const [productCategoryType, productCategoryName] = product.CategoryID.split(' - ');
      return (selectedCategoryType ? (productCategoryType === selectedCategoryType || productCategoryName === selectedCategoryType) : true) &&
             (selectedSkinType ? product.SkinType === selectedSkinType : true);
    });

    console.log('Filtered Products:', filtered);
    setFilteredCount(filtered.length);
    setProducts(filtered);
    setOpenFilterDialog(false);
  };

  const handleCategoryTypeChange = (event) => {
    setSelectedCategoryType(event.target.value);
  };

  const handleSkinTypeChange = (event) => {
    setSelectedSkinType(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setProducts(originalProducts);
  };

  const handleAdd = () => {
    console.log('Thêm sản phẩm mới');
    // TODO: Implement add logic
  };

  const filteredProducts = activeTab === 'Hàng sắp hết'
    ? products.filter(product => product.Quantity < 9)
    : products;

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo">
              <img src="/images/logo.png" alt="Beauty Cosmetics" />
            </div>
            <div className="brand">
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
          <div className="dashboard-table">
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
                  <th style={{ width: '60px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ProductCode</th>
                  <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Phân Loại</th>
                  <th style={{ width: '150px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Tên Sản Phẩm</th>
                  <th style={{ width: '80px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Số lượng</th>
                  {activeTab === 'Hàng sắp hết' && (
                    <>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Dung Tích</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Giá Tiền</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Thương Hiệu</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Thao Tác</th>
                    </>
                  )}
                  {activeTab !== 'Hàng sắp hết' && (
                    <>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Dung Tích</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Giá Tiền</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Thương Hiệu</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Xuất Xứ</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Trạng Thái</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Hình Ảnh</th>
                      <th style={{ width: '100px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Loại Da</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Thông Tin</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Thành Phần</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Cách dùng</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Ngày Sản Xuất</th>
                      <th style={{ width: '110px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Ngày Nhập Kho</th>
                      <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>Thao Tác</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <tr 
                      key={product.ProductID} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'all 0.2s',
                        ':hover': { backgroundColor: '#f1f3f5' }
                      }}
                    >
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ProductID}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ProductCode}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.CategoryID}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left', fontWeight: '500' }}>{product.ProductName}</td>
                      <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Quantity}</td>
                      {activeTab === 'Hàng sắp hết' && (
                        <>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Capacity}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'right', fontWeight: '500' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.Brand}</td>
                          <td style={{ whiteSpace: 'nowrap', overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEdit(product.ProductID)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '5px',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#0069d9' }
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(product.ProductID)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#c82333' }
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </>
                      )}
                      {activeTab !== 'Hàng sắp hết' && (
                        <>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Capacity}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'right', fontWeight: '500' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.Brand}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Origin}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.Status}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ImgURL}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.SkinType}</td>
                          <td style={{ overflow: 'auto', maxHeight: '20px', overflowY: 'auto', maxWidth: '120px', width: '120px', whiteSpace: 'normal', textOverflow: 'ellipsis', padding: '8px 8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.Description}</td>
                          <td style={{ overflow: 'auto', maxHeight: '20px', overflowY: 'auto', maxWidth: '120px', width: '120px', whiteSpace: 'normal', textOverflow: 'ellipsis', padding: '8px 8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.Ingredients}</td>
                          <td style={{ overflow: 'auto', maxHeight: '20px', overflowY: 'auto', maxWidth: '120px', width: '120px', whiteSpace: 'normal', textOverflow: 'ellipsis', padding: '8px 8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{product.UsageInstructions}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ManufactureDate}</td>
                          <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{product.ngayNhapKho}</td>
                          <td style={{ whiteSpace: 'nowrap', overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                            <button
                              onClick={() => handleEdit(product.ProductID)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                marginRight: '5px',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#0069d9' }
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(product.ProductID)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                ':hover': { backgroundColor: '#c82333' }
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan={activeTab === 'Hàng sắp hết' ? "9" : "18"} 
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
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Dialog open={openFilterDialog} onClose={() => setOpenFilterDialog(false)}>
        <DialogTitle>Lọc sản phẩm</DialogTitle>
        <DialogContent>
          <Select
            value={selectedCategoryType}
            onChange={handleCategoryTypeChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value=""><em>Loại sản phẩm</em></MenuItem>
            {[...new Set(products.map(product => product.categoryType))].map((categoryType, index) => (
              <MenuItem key={index} value={categoryType}>{categoryType}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedSkinType}
            onChange={handleSkinTypeChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value=""><em>Loại da</em></MenuItem>
            {[...new Set(products.map(product => product.SkinType))].map((skinType, index) => (
              <MenuItem key={index} value={skinType}>{skinType}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)}>Hủy</Button>
          <Button onClick={handleFilterApply} color="primary">Áp dụng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Product;
