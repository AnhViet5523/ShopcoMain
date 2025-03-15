import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box } from '@mui/material';
import './Manager.css';
import { useState } from 'react';

const SupportStaff = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Feedback', icon: '📢' },
  ];

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
            <div key={item.id} className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} style={{ cursor: 'pointer' }}>
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
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
        </div>
        
        {/* Dashboard Title and Actions */}
        <div className="dashboard-title-bar">
          <h1>Đơn Hỗ Trợ</h1>
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
          {/* const tabs = ['Tất cả', 'Đơn hàng đang xử lý', 'Đơn hàng bị hủy', 'Giao thành công']; */}
        </div>
        
        {/* Table */}
        <div className="dashboard-table">
          <table>
            <thead>
              <tr>
                <th>TÊN NGƯỜI DÙNG</th>
                <th>EMAIL</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>NỘI DUNG</th>
                <th>NGÀY GỬI ĐƠN</th>
                <th>TRẠNG THÁI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Dữ liệu sẽ được lấy từ API */}
              <tr>
                <td colSpan="9" className="empty-data-message">
                  Đang tải dữ liệu...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Box>
  );
};

export default SupportStaff;
