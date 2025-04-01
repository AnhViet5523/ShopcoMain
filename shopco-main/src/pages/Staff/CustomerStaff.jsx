import { useNavigate } from 'react-router-dom';
import { Box, Pagination } from '@mui/material';
import './Manager.css';
import { useState, useEffect } from 'react';
import userService from '../../apis/userService';

const CustomerStaff = () => {
  const [activeItem, setActiveItem] = useState('');
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalCustomers, setOriginalCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ người dùng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Đánh giá sản phẩm', icon: '📢' },
    { id: 'blogStaff', name: 'Blog', icon: '📰' }
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getAllUsers();
        
        if (isMounted) {
          if (Array.isArray(data)) {
            // Sắp xếp người dùng theo ngày đăng ký mới nhất
            const sortedData = [...data].sort((a, b) => {
              const dateA = new Date(a.registrationDate || 0);
              const dateB = new Date(b.registrationDate || 0);
              return dateB - dateA;
            });
            setCustomers(sortedData);
            setOriginalCustomers(sortedData);
          } else {
            console.error('Dữ liệu không phải là mảng:', data);
            setCustomers([]);
            setOriginalCustomers([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Lỗi khi lấy danh sách khách hàng:', error);
          setError('Không thể tải dữ liệu khách hàng. Vui lòng thử lại sau.');
          setCustomers([]);
          setOriginalCustomers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setCustomers(originalCustomers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredCustomers = originalCustomers.filter(customer => {
      const name = (customer.name || '').toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const phone = (customer.phone || '').toLowerCase();
      const fullName = (customer.fullName || '').toLowerCase();

      return name.includes(searchTermLower) ||
             email.includes(searchTermLower) ||
             phone.includes(searchTermLower) ||
             fullName.includes(searchTermLower);
    });

    setCustomers(filteredCustomers);
  }, [searchTerm, originalCustomers]);

  // Lọc danh sách khách hàng dựa trên từ khóa tìm kiếm
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.fullName && customer.fullName.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
      (customer.address && customer.address.toLowerCase().includes(searchLower))
    );
  });

  // Lấy tổng số trang dựa trên số lượng khách hàng và số lượng hiển thị mỗi trang
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Lấy mảng khách hàng cho trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  };

  // Khi từ khóa tìm kiếm thay đổi, reset lại trang hiện tại
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleClear = () => {
    setSearchTerm('');
  };

  // Thêm hàm mới để định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    
    try {
      // Chuyển đổi chuỗi ngày tháng thành đối tượng Date
      const date = new Date(dateString);
      // Định dạng ngày như trong BlogStaff.jsx
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      // Nếu có lỗi, trả về định dạng cắt chuỗi như trước
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
    }
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
              <div key={item.id} className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} style={{ cursor: 'pointer' }}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
          
          
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header with Search */}
          <div className="dashboard-header">
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
            <h1>Hồ sơ người dùng</h1>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
              {searchTerm && customers.length > 0 && (
                <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                  Tìm thấy: {customers.length} khách hàng
                </div>
              )}
            </div>
          </div>
          
          {/* Table */}
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TÊN</th>
                  <th>HỌ VÀ TÊN</th>
                  <th>EMAIL</th>
                  <th>VAI TRÒ</th>
                  <th>SỐ ĐIỆN THOẠI</th>
                  <th>ĐỊA CHỈ</th>
                  <th>NGÀY ĐĂNG KÝ</th>
                  <th>LOẠI DA</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="empty-data-message">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="9" className="empty-data-message error-message">
                      {error}
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  getCurrentPageItems().map((customer, index) => (
                    <tr key={customer.userId || index}>
                      <td>{customer.userId || '-'}</td>
                      <td>{customer.name || '-'}</td>
                      <td>{customer.fullName || customer.name || '-'}</td>
                      <td>{customer.email || '-'}</td>
                      <td>{customer.role || '-'}</td>
                      <td>{customer.phone || '-'}</td>
                      <td>{customer.address || '-'}</td>
                      <td>{formatDate(customer.registrationDate) || '-'}</td>
                      <td>{customer.skinType || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-data-message">
                      Không có dữ liệu khách hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '20px',
              marginBottom: '20px'
            }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                variant="outlined" 
                color="primary" 
                showFirstButton 
                showLastButton
                size="large"
              />
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default CustomerStaff;
