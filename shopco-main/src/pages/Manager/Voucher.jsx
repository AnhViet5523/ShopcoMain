import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus, FaSearch } from 'react-icons/fa';
import { Box } from '@mui/material';
import './Manager.css';
import { useState } from 'react';

const Voucher = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');

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
              <div key={item.id} className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} style={{ cursor: 'pointer' }}>
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
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Tìm kiếm voucher..." />
            </div>
          </div>
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Vouchers</h1>
            <div className="dashboard-actions">
              <button className="btn-filter">
                <FaFilter /> Lọc <span className="notification">1</span>
              </button>
              <button className="btn-export">
                <FaFileExport /> Xuất file
              </button>
              <button className="btn-create-payment">
                <FaPlus /> Tạo voucher
              </button>
            </div>
          </div>
          
          {/* Table */}
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" className="custom-checkbox" /></th>
                  <th>MÃ VOUCHER</th>
                  <th>LOẠI</th>
                  <th>GIÁ TRỊ</th>
                  <th>NGÀY BẮT ĐẦU</th>
                  <th>NGÀY KẾT THÚC</th>
                  <th>TRẠNG THÁI</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Dữ liệu sẽ được lấy từ API */}
                <tr>
                  <td colSpan="8" className="empty-data-message">
                    Đang tải dữ liệu voucher...
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

export default Voucher;
