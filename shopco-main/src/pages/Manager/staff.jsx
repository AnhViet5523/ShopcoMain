import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { Box } from '@mui/material';
import userService from '../../apis/userService'; // Import userService
import './Manager.css';

const Staff = () => {
  const [activeItem, setActiveItem] = useState('');
  const [staff, setStaff] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State để lưu trữ giá trị tìm kiếm
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getAllUsers(); // Gọi API để lấy danh sách người dùng
        
        if (Array.isArray(data)) {
          // Lọc danh sách để chỉ lấy những người có vai trò là "Staff"
          const staffMembers = data.filter(member => member.role === 'Staff');
          setStaff(staffMembers);
        } else {
          console.error('Dữ liệu không phải là mảng:', data);
          setStaff([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        setError('Không thể tải dữ liệu nhân viên. Vui lòng thử lại sau.');
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleEdit = (userId) => {
    // Logic để sửa thông tin nhân viên
    console.log('Sửa nhân viên với ID:', userId);
  };

  const handleDelete = (userId) => {
    // Logic để xóa nhân viên
    console.log('Xóa nhân viên với ID:', userId);
  };

  // Hàm để lọc nhân viên dựa trên giá trị tìm kiếm
  const filteredStaff = staff.filter(member => {
    const fullName = (member.fullName || '').toLowerCase();
    const email = (member.email || '').toLowerCase();
    const password = (member.password || '').toLowerCase();
    const phone = (member.phone || '').toLowerCase();
    const address = (member.address || '').toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      password.includes(searchTermLower) ||
      phone.includes(searchTermLower) ||
      address.includes(searchTermLower)
    );
  });

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
          
          <div className="sidebar-title">MANAGER</div>
          
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
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên, email, số điện thoại, địa chỉ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật giá trị tìm kiếm
                style={{ color: 'black' }} // Thay đổi màu chữ thành đen
              />
            </div>
          </div>
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Nhân Viên</h1>
            <div className="dashboard-actions">
              <button 
                className="btn-create-payment" 
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
                <FaPlus /> Thêm nhân viên
              </button>
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
                  <th>MẬT KHẨU</th>
                  <th>VAI TRÒ</th>
                  <th>SỐ ĐIỆN THOẠI</th>
                  <th>ĐỊA CHỈ</th>
                  <th>NGÀY ĐĂNG KÝ</th>
                  <th>THAO TÁC</th>
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
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((member, index) => (
                    <tr key={member.userId || index}>
                      <td>{member.userId || '-'}</td>
                      <td>{member.name || '-'}</td>
                      <td>{member.fullName || member.name || '-'}</td>
                      <td>{member.email || '-'}</td>
                      <td>{member.password || '-'}</td>
                      <td>{member.role || '-'}</td>
                      <td>{member.phone || '-'}</td>
                      <td>{member.address || '-'}</td>
                      <td>{member.registrationDate || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleEdit(member.userId)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              minWidth: '60px'
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(member.userId)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              minWidth: '60px'
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-data-message">
                      Không có dữ liệu nhân viên
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

export default Staff;
