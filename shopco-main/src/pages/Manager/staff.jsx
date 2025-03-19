import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControlLabel, Checkbox, Select, MenuItem } from '@mui/material';
import userService from '../../apis/userService'; // Import userService
import adminService from '../../apis/adminService'; // Import adminService
import './Manager.css';

const Staff = () => {
  const [activeItem, setActiveItem] = useState('');
  const [staff, setStaff] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State để lưu trữ giá trị tìm kiếm
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' }
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

  const handleEdit = (member) => {
    setCurrentStaff(member);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleUpdateStaff = async () => {
    try {
      const response = await adminService.updateStaff(currentStaff.userId, {
        name: currentStaff.name,
        fullName: currentStaff.fullName,
        email: currentStaff.email,
        phone: currentStaff.phone,
        address: currentStaff.address,
        role: currentStaff.role,
      });
      const updatedMember = response.data;

      setStaff((prevStaff) =>
        prevStaff.map((member) =>
          member.userId === updatedMember.userId ? updatedMember : member
        )
      );

      alert('Đã cập nhật thông tin nhân viên');
      setOpenDialog(false);
      setCurrentStaff(null);
    } catch (error) {
      alert('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.');
      console.error('Error updating staff:', error);
    }
  };

  const handleDelete = (userId) => {
    // Logic để xóa nhân viên
    console.log('Xóa nhân viên với ID:', userId);
  };

  // Hàm để lọc nhân viên dựa trên giá trị tìm kiếm
  const filteredStaff = staff.filter(member => {
    const fullName = (member?.fullName || '').toLowerCase();
    const email = (member?.email || '').toLowerCase();
    const password = (member?.password || '').toLowerCase();
    const phone = (member?.phone || '').toLowerCase();
    const address = (member?.address || '').toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      password.includes(searchTermLower) ||
      phone.includes(searchTermLower) ||
      address.includes(searchTermLower)
    );
  });

  const handleAddStaff = async () => {
    if (!newStaff.username || !newStaff.email || !newStaff.password) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaff.email)) {
      alert('Email không hợp lệ.');
      return;
    }

    if (staff.some(member => member.email === newStaff.email)) {
      alert('Email đã tồn tại trong hệ thống.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newStaff.password)) {
      alert('Mật khẩu phải chứa chữ, số và ít nhất một ký tự đặc biệt.');
      return;
    }

    try {
      const response = await adminService.addStaff(newStaff);
      const newMember = response.data;

      if (newMember && newMember.userId && newMember.email) {
        setStaff((prevStaff) => [...prevStaff, newMember]);
        alert('Đã thêm 1 nhân viên');
      } else {
        console.error('Dữ liệu nhân viên mới không hợp lệ:', newMember);
      }

      setOpenDialog(false);
      setNewStaff({ username: '', email: '', password: '' });
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          const errorMessage = error.response.data.message;
          if (errorMessage.includes('Username')) {
            alert('Tên người dùng đã tồn tại.');
          } else if (errorMessage.includes('Email')) {
            alert('Email đã tồn tại.');
          } else {
            alert('Đã xảy ra lỗi khi thêm nhân viên. Vui lòng thử lại.');
          }
        } else {
          alert('Đã xảy ra lỗi khi thêm nhân viên. Vui lòng thử lại.');
        }
      } else {
        alert('Đã xảy ra lỗi khi thêm nhân viên. Vui lòng thử lại.');
      }
      console.error('Error adding staff:', error);
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
          
          <div className="sidebar-title">MANAGER</div>
          
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
                onClick={() => { setEditMode(false); setOpenDialog(true); }}
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
                            onClick={() => handleEdit(member)}
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editMode ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên"
            type="text"
            fullWidth
            value={editMode ? currentStaff?.name || '' : newStaff.username}
            onChange={(e) => editMode ? setCurrentStaff({ ...currentStaff, name: e.target.value }) : setNewStaff({ ...newStaff, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={editMode ? currentStaff?.email || '' : newStaff.email}
            onChange={(e) => editMode ? setCurrentStaff({ ...currentStaff, email: e.target.value }) : setNewStaff({ ...newStaff, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Số điện thoại"
            type="text"
            fullWidth
            value={editMode ? currentStaff?.phone || '' : ''}
            onChange={(e) => editMode && setCurrentStaff({ ...currentStaff, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Địa chỉ"
            type="text"
            fullWidth
            value={editMode ? currentStaff?.address || '' : ''}
            onChange={(e) => editMode && setCurrentStaff({ ...currentStaff, address: e.target.value })}
          />
          <Select
            fullWidth
            value={editMode ? currentStaff?.role || 'Staff' : 'Staff'}
            onChange={(e) => editMode && setCurrentStaff({ ...currentStaff, role: e.target.value })}
          >
            <MenuItem value="Staff">Staff</MenuItem>
            <MenuItem value="Customer">Customer</MenuItem>
          </Select>
          {!editMode && (
            <>
              <TextField
                margin="dense"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              />
              <FormControlLabel
                control={<Checkbox checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />}
                label="Hiện mật khẩu"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Hủy
          </Button>
          <Button onClick={editMode ? handleUpdateStaff : handleAddStaff} color="primary">
            {editMode ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
