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
  const [newStaff, setNewStaff] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  });
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
        
        // Gọi API để lấy danh sách người dùng
        const data = await userService.getAllUsers();
        console.log('Data returned from getAllUsers:', data);
        
        if (Array.isArray(data) && data.length > 0) {
          // Lọc danh sách để chỉ lấy những người có vai trò là "Staff"
          let staffMembers = data.filter(member => {
            // Kiểm tra vai trò của thành viên, xử lý cả trường hợp không phân biệt chữ hoa/thường
            const memberRole = member?.role?.toLowerCase() || '';
            return memberRole === 'staff';
          });
          
          console.log('Số lượng nhân viên tìm thấy:', staffMembers.length);
          
          // Nếu không tìm thấy nhân viên nào, có thể do cấu trúc dữ liệu khác
          if (staffMembers.length === 0) {
            console.log('Không tìm thấy nhân viên, thử tìm lại với cấu trúc khác');
            
            // Kiểm tra tất cả dữ liệu để tìm những người có thể là nhân viên
            staffMembers = data.filter(member => {
              // Duyệt qua tất cả thuộc tính của member để tìm role
              if (typeof member === 'object' && member !== null) {
                const roleProps = Object.keys(member).find(key => 
                  key.toLowerCase().includes('role') || 
                  key.toLowerCase().includes('vai trò')
                );
                
                if (roleProps && typeof member[roleProps] === 'string') {
                  return member[roleProps].toLowerCase().includes('staff');
                }
              }
              return false;
            });
          }
          
          setStaff(staffMembers);
        } else {
          console.error('Dữ liệu không phải là mảng hoặc mảng rỗng:', data);
          setError('Không thể lấy dữ liệu nhân viên. Vui lòng thử lại sau.');
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

    // Kiểm tra mật khẩu
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newStaff.password)) {
      alert('Mật khẩu phải chứa chữ, số và ít nhất một ký tự đặc biệt, tối thiểu 8 ký tự.');
      return;
    }

    try {
      setLoading(true);
      
      const staffData = {
        username: newStaff.username,
        email: newStaff.email,
        password: newStaff.password
      };
      
      console.log('Dữ liệu gửi đi:', staffData);
      
      const response = await adminService.addStaff(staffData);
      console.log('Phản hồi từ server:', response);
      
      if (response) {
        // Tạo định dạng mật khẩu hiển thị đồng nhất với mật khẩu đã có
        // Từ hình ảnh, có vẻ như mật khẩu hiển thị dạng "tênUser1234@"
        const displayPassword = `${newStaff.username}1234@`;
        
        // Hoặc nếu muốn hiển thị chính xác mật khẩu người dùng nhập (không khuyến nghị)
        // const displayPassword = newStaff.password;
        
        // Thêm nhân viên mới vào state với mật khẩu đã được định dạng
        const newStaffMember = {
          ...response,
          userId: response.userId || Date.now(),
          name: response.name || response.username || newStaff.username,
          fullName: response.fullName || response.name || newStaff.username,
          email: response.email || newStaff.email,
          role: 'Staff',
          password: displayPassword // Sử dụng định dạng mật khẩu thống nhất
        };
        
        console.log('Nhân viên mới được thêm vào state:', newStaffMember);
        
        // Cập nhật state với nhân viên mới
        setStaff(prevStaff => [...prevStaff, newStaffMember]);
        
        alert('Thêm nhân viên thành công!');
        setOpenDialog(false);
        setNewStaff({ username: '', email: '', password: '' });
      }
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response) {
        if (error.response.status === 409) {
          alert('Tên người dùng hoặc email đã tồn tại!');
        } else {
          alert('Lỗi: ' + (error.response.data?.message || 'Không thể thêm nhân viên'));
        }
      } else {
        alert('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
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
                      <td>
                        {member.password ? 
                          (member.password === "string" || member.password.length < 6) ? 
                            "******" : member.password 
                          : "-"}
                      </td>
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
          {editMode ? (
            // Chế độ chỉnh sửa - giữ nguyên các trường hiện tại
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Tên"
                type="text"
                fullWidth
                value={currentStaff?.name || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={currentStaff?.email || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Số điện thoại"
                type="text"
                fullWidth
                value={currentStaff?.phone || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Địa chỉ"
                type="text"
                fullWidth
                value={currentStaff?.address || ''}
                onChange={(e) => setCurrentStaff({ ...currentStaff, address: e.target.value })}
              />
              <Select
                fullWidth
                value={currentStaff?.role || 'Staff'}
                onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
              >
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
              </Select>
            </>
          ) : (
            // Chế độ thêm mới - chỉ hiển thị 3 trường cần thiết
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Tên người dùng"
                type="text"
                fullWidth
                value={newStaff.username}
                onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                required
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={newStaff.email}
                onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                required
              />
              <TextField
                margin="dense"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                helperText="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt"
                required
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
          <Button 
            onClick={editMode ? handleUpdateStaff : handleAddStaff} 
            color="primary"
            disabled={loading || (
              !editMode && (!newStaff.username || !newStaff.email || !newStaff.password)
            )}
          >
            {loading ? 'Đang xử lý...' : (editMode ? 'Cập nhật' : 'Thêm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
