import { useState, useEffect } from 'react';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Manager.css';

const Product = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

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

  useEffect(() => {
    fetch('/api/Products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

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
            <button className="btn-filter">
              <FaFilter /> Filter <span className="notification">1</span>
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
                <th>CategoryID</th>
                <th>ProductName</th>
                <th>Quantity</th>
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
                
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id}>
                    <td>{product.ProductID}</td>
                    <td>{product.ProductCode}</td>
                    <td>{product.CategoryID}</td>
                    <td>{product.ProductName}</td>
                    <td>{product.Quantity}</td>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="17" className="empty-data-message">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Box>
  );
};

export default Product;
