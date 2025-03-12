import { useState, useEffect } from 'react';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
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

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewQuiz', name: 'Xem quiz', icon: '📝' },
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
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

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
        
        <div className="logout-button">
          <span className="logout-icon">🚪</span>
          <span>Log out</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        
        {/* Dashboard Title and Actions */}
        <div className="dashboard-title-bar">
          <h1>Sản Phẩm</h1>
          <div className="dashboard-actions">
            <button className="btn-filter" onClick={handleFilterClick}>
              <FaFilter /> Lọc <span className="notification">{filteredCount}</span>
            </button>
            <button className="btn-export">
              <FaFileExport /> Export
            </button>
            <button className="btn-create-payment">
              <FaPlus /> Create payment
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
          <table>
            <thead>
              <tr>
                <th>ProductID</th>
                <th>ProductCode</th>
                <th>categoryType - categoryName</th>
                <th>ProductName</th>
                <th>Quantity</th>
                {activeTab === 'Hàng sắp hết' && (
                  <>
                    <th>Capacity</th>
                    <th>Price</th>
                    <th>Brand</th>
                  </>
                )}
                {activeTab !== 'Hàng sắp hết' && (
                  <>
                    <th>Capacity</th>
                    <th>Price</th>
                    <th>Brand</th>
                    <th>Origin</th>
                    <th>Status</th>
                    <th>ImgURL</th>
                    <th>SkinType</th>
                    <th>Description</th>
                    <th>Ingredients</th>
                    <th>UsageInstructions</th>
                    <th>ManufactureDate</th>
                    <th>NGÀY NHẬP KHO</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product.ProductID}>
                    <td>{product.ProductID}</td>
                    <td>{product.ProductCode}</td>
                    <td>{product.CategoryID}</td>
                    <td>{product.ProductName}</td>
                    <td>{product.Quantity}</td>
                    {activeTab === 'Hàng sắp hết' && (
                      <>
                        <td>{product.Capacity}</td>
                        <td>{product.Price}</td>
                        <td>{product.Brand}</td>
                      </>
                    )}
                    {activeTab !== 'Hàng sắp hết' && (
                      <>
                        <td>{product.Capacity}</td>
                        <td>{product.Price}</td>
                        <td>{product.Brand}</td>
                        <td>{product.Origin}</td>
                        <td>{product.Status}</td>
                        <td>{product.ImgURL}</td>
                        <td>{product.SkinType}</td>
                        <td>{product.Description}</td>
                        <td>{product.Ingredients}</td>
                        <td>{product.UsageInstructions}</td>
                        <td>{product.ManufactureDate}</td>
                        <td>{product.ngayNhapKho}</td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEdit(product.ProductID)}>Edit</button>
                          <button className="btn-delete" onClick={() => handleDelete(product.ProductID)}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'Hàng sắp hết' ? "8" : "18"} className="empty-data-message">
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
