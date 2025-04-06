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
  const [newStaff, setNewStaff] = useState({ 
    username: '', 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [staffToChangeRole, setStaffToChangeRole] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Đánh giá sản phẩm', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' }
  ];

  // Khởi tạo giá trị currentUserRole từ localStorage khi component được mount
  useEffect(() => {
    try {
      // Sửa role nếu cần
      const fixedRole = userService.fixUserRole();
      console.log('Vai trò đã được chuẩn hóa:', fixedRole);
      
      // Sau đó đọc lại từ localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role || '');
      }
    } catch (error) {
      console.error('Lỗi khi đọc vai trò người dùng từ localStorage:', error);
    }
  }, []);

  useEffect(() => {
    // Kiểm tra quyền truy cập khi trang được tải
    const checkAccess = () => {
      try {
        // Sửa role nếu cần
        userService.fixUserRole();
        
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          alert('Bạn cần đăng nhập để truy cập trang này');
          navigate('/login');
          return false;
        }
        
        const user = JSON.parse(userStr);
        console.log('Kiểm tra vai trò để truy cập:', user.role);
        
        if (user.role !== 'Manager' && user.role !== 'Admin') {
          alert('Bạn không có quyền truy cập trang này. Chỉ Manager hoặc Admin mới được phép vào.');
          navigate('/');
          return false;
        }
        
        // Lưu vai trò người dùng hiện tại
        setCurrentUserRole(user.role);
        
        return true;
      } catch (error) {
        console.error('Lỗi khi kiểm tra quyền truy cập:', error);
        alert('Có lỗi xảy ra khi kiểm tra quyền truy cập');
        navigate('/');
        return false;
      }
    };
    
    // Nếu không có quyền truy cập, không cần fetch dữ liệu
    if (!checkAccess()) return;
    
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Gọi API để lấy danh sách người dùng
        const data = await userService.getAllUsers();
        console.log('Data returned from getAllUsers:', data);
        
        // Log chi tiết từng người dùng và role của họ
        console.log('Chi tiết người dùng và role:');
        data.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            userId: user.userId,
            name: user.name,
            role: user.role,
            roleLowerCase: user.role?.toLowerCase()
          });
        });
        
        if (Array.isArray(data) && data.length > 0) {
          // Lọc danh sách để chỉ lấy những người có vai trò là "Staff" hoặc "Manager"
          let staffMembers = data.filter(member => {
            // Kiểm tra vai trò của thành viên, sử dụng includes() để bắt cả các biến thể
            const memberRole = (member?.role || '').toLowerCase();
            return memberRole.includes('staff') || memberRole.includes('manager');
          });
          
          console.log('Lọc người dùng có role là Staff hoặc Manager');
          
          console.log('Số lượng nhân viên tìm thấy:', staffMembers.length);
          
          // Log chi tiết danh sách nhân viên sau khi lọc
          console.log('Danh sách nhân viên sau khi lọc:');
          staffMembers.forEach((member, index) => {
            console.log(`Staff member ${index + 1}:`, {
              userId: member.userId,
              name: member.name,
              role: member.role,
              roleLowerCase: member.role?.toLowerCase()
            });
          });
          
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
                  const roleLower = member[roleProps].toLowerCase();
                  return roleLower.includes('staff') || roleLower.includes('manager');
                }
              }
              return false;
            });
          }
          
          // Sắp xếp danh sách nhân viên theo ID để dễ dàng theo dõi
          staffMembers = staffMembers.sort((a, b) => 
            (a.userId || 0) - (b.userId || 0)
          );
          
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

  const handleOpenRoleDialog = (member) => {
    setStaffToChangeRole(member);
    setSelectedRole(member.role || 'Staff');
    setOpenRoleDialog(true);
  };

  const handleRoleUpdate = async () => {
    try {
      // Sửa role trước khi kiểm tra quyền
      userService.fixUserRole();
      
      // Kiểm tra quyền từ localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Bạn cần đăng nhập để thực hiện thao tác này');
        return;
      }

      const user = JSON.parse(userStr);
      
      // Thêm log để xem thông tin người dùng và vai trò
      console.log('Thông tin người dùng khi đổi vai trò:', {
        userId: user.userId,
        username: user.username,
        role: user.role,
        roleType: typeof user.role,
        roleUpperCase: user.role?.toUpperCase(),
        isManager: user.role === 'Manager',
        isManagerIgnoreCase: user.role?.toUpperCase() === 'MANAGER',
        staffToChangeUserId: staffToChangeRole?.userId,
        selectedRole: selectedRole
      });

      // Kiểm tra vai trò một cách chính xác
      if (user.role !== 'Manager' && user.role !== 'Admin') {
        alert('Bạn không có quyền thay đổi vai trò người dùng. Chỉ Manager hoặc Admin mới được phép thao tác này.');
        return;
      }

      // Không cho phép thay đổi vai trò của chính mình
      if (staffToChangeRole.userId === user.userId) {
        alert('Bạn không thể thay đổi vai trò của chính mình');
        return;
      }

      // Kiểm tra vai trò hợp lệ (chỉ cho phép Staff và Customer)
      const validRoles = ['Staff', 'Customer'];
      if (!validRoles.includes(selectedRole)) {
        alert('Vai trò không hợp lệ. Chỉ được chọn Staff hoặc Customer.');
        return;
      }

      // Tái xác nhận vai trò người dùng
      if (currentUserRole !== 'Manager' && currentUserRole !== 'Admin') {
        alert('Chỉ Manager hoặc Admin mới có quyền thay đổi vai trò của người dùng.');
        setOpenRoleDialog(false);
        return;
      }

      // Lưu vai trò hiện tại trước khi thay đổi để so sánh sau
      const currentRoleOfUser = staffToChangeRole.role;

      setLoading(true);
      
      // Gọi API mới đã thêm - thêm log cho request
      console.log('Gửi request đổi vai trò:', {
        userId: staffToChangeRole.userId,
        newRole: selectedRole,
        currentUserRole: user.role, // Thêm vai trò người dùng hiện tại vào log
        currentRoleOfUser: currentRoleOfUser // Thêm vai trò hiện tại của người được đổi
      });
      
      // Đặt lại giá trị trong localStorage để đảm bảo thông tin đúng
      localStorage.setItem('user_role', user.role);
      
      try {
        // Sử dụng adminService.updateUserRole để gọi API với headers bổ sung
        const response = await adminService.updateUserRole(staffToChangeRole.userId, selectedRole);
        
        // Thêm log cho response
        console.log('Phản hồi từ API:', response);
        
        // Cập nhật state dựa trên vai trò mới
        if (selectedRole === 'Customer' && currentRoleOfUser === 'Staff') {
          // Nếu chuyển từ Staff sang Customer, loại bỏ người dùng khỏi danh sách
          setStaff(prevStaff => 
            prevStaff.filter(member => member.userId !== staffToChangeRole.userId)
          );
          alert(`Đã thay đổi vai trò của "${staffToChangeRole.name}" thành "${selectedRole}". Người dùng đã được loại khỏi danh sách nhân viên.`);
        } else if (selectedRole === 'Staff') {
          // Nếu chuyển sang vai trò Staff, cập nhật người dùng trong danh sách
          setStaff(prevStaff => 
            prevStaff.map(member => 
              member.userId === staffToChangeRole.userId 
                ? { ...member, role: selectedRole } 
                : member
            )
          );
          alert(`Đã thay đổi vai trò của "${staffToChangeRole.name}" thành "${selectedRole}"`);
        }
        
        setOpenRoleDialog(false);
        setStaffToChangeRole(null);
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        if (apiError.response) {
          const statusCode = apiError.response.status;
          const errorData = apiError.response.data;
          let errorMessage = 'Không xác định';
          
          // Xử lý thông báo lỗi
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData && typeof errorData === 'object') {
            errorMessage = JSON.stringify(errorData);
          }
          
          // Xử lý riêng cho lỗi 500
          if (statusCode === 500) {
            console.error('Lỗi 500:', errorData);
            
            // Kiểm tra nếu có chứa "inner exception"
            if (errorMessage.includes('inner exception')) {
              alert(`Có lỗi xảy ra với cơ sở dữ liệu. Vai trò "${selectedRole}" có thể không hợp lệ trong hệ thống.`);
            } else {
              alert(`Lỗi máy chủ (500): ${errorMessage}`);
            }
          } else if (statusCode === 401) {
            alert(`Lỗi xác thực: ${errorMessage}`);
            console.error('Headers gửi đi:', apiError.config?.headers);
          } else {
            alert(`Lỗi (${statusCode}): ${errorMessage}`);
          }
        } else if (apiError.request) {
          alert('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
        } else {
          alert(`Lỗi: ${apiError.message || 'Không thể kết nối đến máy chủ'}`);
        }
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật vai trò:', error);
      
      let errorMessage = 'Đã xảy ra lỗi không xác định khi cập nhật vai trò.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Bạn không có quyền thay đổi vai trò người dùng';
        } else if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy người dùng';
        } else if (error.response.status === 500) {
          errorMessage = `Lỗi máy chủ: ${error.response.data || 'Có thể có vấn đề với vai trò được chọn'}`;
        } else {
          errorMessage = `Lỗi (${error.response.status}): ${error.response.data?.message || 'Vui lòng thử lại sau'}`;
        }
      } else if (error.request) {
        errorMessage = 'Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = `Lỗi: ${error.message || 'Không thể kết nối đến máy chủ'}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
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
    const role = (member?.role || '').toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      password.includes(searchTermLower) ||
      phone.includes(searchTermLower) ||
      address.includes(searchTermLower) ||
      role.includes(searchTermLower)
    );
  });

  // Hàm kiểm tra định dạng email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email không được để trống';
    } else if (!emailRegex.test(email)) {
      return 'Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: example@domain.com)';
    }
    return '';
  };

  // Hàm kiểm tra trực tiếp và cập nhật lỗi email khi người dùng nhập
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setNewStaff({ ...newStaff, email: emailValue });
    
    // Chỉ kiểm tra khi người dùng đã nhập gì đó và di chuyển ra khỏi trường
    if (e.type === 'blur') {
      setFormErrors({
        ...formErrors,
        email: validateEmail(emailValue)
      });
    }
  };

  // Cập nhật hàm handleAddStaff
  const handleAddStaff = async () => {
    // Kiểm tra quyền của người dùng hiện tại từ localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }

    const user = JSON.parse(userStr);
    // Kiểm tra xem người dùng có phải là Manager không
    if (user.role !== 'Manager' && user.role !== 'Admin') {
      alert('Bạn không có quyền thêm nhân viên mới. Chỉ Manager mới được phép thực hiện thao tác này.');
      return;
    }

    // Kiểm tra tất cả các trường và cập nhật lỗi
    const errors = {
      username: !newStaff.username ? 'Tên người dùng không được để trống' : '',
      email: validateEmail(newStaff.email),
      password: !newStaff.password 
        ? 'Mật khẩu không được để trống' 
        : !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(newStaff.password) 
          ? 'Mật khẩu phải chứa chữ, số và ít nhất một ký tự đặc biệt, tối thiểu 8 ký tự' 
          : ''
    };

    // Cập nhật state lỗi
    setFormErrors(errors);

    // Kiểm tra xem có lỗi nào không
    if (errors.username || errors.email || errors.password) {
      return; // Dừng lại nếu có lỗi
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
        // Sử dụng mật khẩu thực tế mà người dùng đã nhập
        const displayPassword = newStaff.password;
        
        // Thêm nhân viên mới vào state với mật khẩu thực tế
        const newStaffMember = {
          ...response,
          userId: response.userId || Date.now(),
          name: response.name || response.username || newStaff.username,
          fullName: response.fullName || response.name || newStaff.username,
          email: response.email || newStaff.email,
          role: 'Staff',
          password: displayPassword // Sử dụng mật khẩu thực tế người dùng đã nhập
        };
        
        console.log('Nhân viên mới được thêm vào state:', newStaffMember);
        
        // Cập nhật state với nhân viên mới
        setStaff(prevStaff => [...prevStaff, newStaffMember]);
        
        alert('Thêm nhân viên thành công!');
        setOpenDialog(false);
        setNewStaff({ username: '', email: '', password: '' });
        setFormErrors({ username: '', email: '', password: '' }); // Reset lỗi
      }
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response) {
        if (error.response.status === 409) {
          // Kiểm tra lỗi trùng email hoặc username
          const errorMessage = error.response.data?.message || '';
          if (errorMessage.toLowerCase().includes('email')) {
            setFormErrors({
              ...formErrors,
              email: 'Email đã tồn tại trong hệ thống!'
            });
          } else {
            setFormErrors({
              ...formErrors,
              username: 'Tên người dùng đã tồn tại!'
            });
          }
        } else if (error.response.status === 401) {
          alert('Bạn không có quyền thêm nhân viên mới');
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

  // Kiểm tra xem người dùng hiện tại có thể thay đổi vai trò không
  const canChangeRole = () => {
    return currentUserRole === 'Manager' || currentUserRole === 'Admin';
  };

  // Kiểm tra xem người dùng hiện tại có thể thêm nhân viên không
  const canAddStaff = () => {
    return currentUserRole === 'Manager' || currentUserRole === 'Admin';
  };

  // Thêm hàm để định dạng ngày
  const formatDate = (dateString) => {
    if (!dateString || dateString === '-') return '-';
    
    try {
      // Chuyển đổi chuỗi ngày tháng thành đối tượng Date
      const date = new Date(dateString);
      // Định dạng ngày theo kiểu Việt Nam
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Lỗi khi định dạng ngày:', error);
      // Nếu có lỗi, trả về định dạng cắt chuỗi
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
              {canAddStaff() && (
                <button 
                  className="btn-create-payment" 
                  onClick={() => { setOpenDialog(true); }}
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
                      <td>{member.role || '-'}</td>
                      <td>{member.phone || '-'}</td>
                      <td>{member.address || '-'}</td>
                      <td>{formatDate(member.registrationDate) || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          {canChangeRole() ? (
                            <button
                              onClick={() => handleOpenRoleDialog(member)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                minWidth: '100px'
                              }}
                            >
                              Đổi vai trò
                            </button>
                          ) : (
                            <span style={{ 
                              fontSize: '12px', 
                              color: '#888', 
                              fontStyle: 'italic' 
                            }}>
                              Cần quyền Manager
                            </span>
                          )}
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
        <DialogTitle>Thêm Nhân Viên Mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên người dùng"
            type="text"
            fullWidth
            value={newStaff.username}
            onChange={(e) => {
              setNewStaff({ ...newStaff, username: e.target.value });
              if (formErrors.username) setFormErrors({...formErrors, username: ''});
            }}
            onBlur={(e) => {
              if (!e.target.value) {
                setFormErrors({...formErrors, username: 'Tên người dùng không được để trống'});
              }
            }}
            error={!!formErrors.username}
            helperText={formErrors.username}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newStaff.email}
            onChange={(e) => {
              setNewStaff({ ...newStaff, email: e.target.value });
              // Xóa thông báo lỗi khi người dùng đang nhập
              if (formErrors.email) setFormErrors({...formErrors, email: ''});
            }}
            onBlur={(e) => {
              setFormErrors({...formErrors, email: validateEmail(e.target.value)});
            }}
            error={!!formErrors.email}
            helperText={formErrors.email}
            required
          />
          <TextField
            margin="dense"
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={newStaff.password}
            onChange={(e) => {
              setNewStaff({ ...newStaff, password: e.target.value });
              if (formErrors.password) setFormErrors({...formErrors, password: ''});
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!value) {
                setFormErrors({...formErrors, password: 'Mật khẩu không được để trống'});
              } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/.test(value)) {
                setFormErrors({...formErrors, password: 'Mật khẩu phải chứa chữ, số và ít nhất một ký tự đặc biệt, tối thiểu 8 ký tự'});
              }
            }}
            error={!!formErrors.password}
            helperText={formErrors.password || "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt"}
            required
          />
          <FormControlLabel
            control={<Checkbox checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />}
            label="Hiện mật khẩu"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setFormErrors({ username: '', email: '', password: '' }); // Reset lỗi khi đóng dialog
          }} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleAddStaff} 
            color="primary"
            disabled={loading || (!newStaff.username || !newStaff.email || !newStaff.password)}
          >
            {loading ? 'Đang xử lý...' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)}>
        <DialogTitle>Thay đổi vai trò người dùng</DialogTitle>
        <DialogContent>
          {staffToChangeRole && (
            <>
              <p>Người dùng: <strong>{staffToChangeRole.name}</strong></p>
              <p>Email: {staffToChangeRole.email}</p>
              <p>Vai trò hiện tại: <strong>{staffToChangeRole.role || 'Staff'}</strong></p>
              
              <Select
                fullWidth
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ marginTop: '20px' }}
              >
                <MenuItem value="Staff">Staff</MenuItem>
                <MenuItem value="Customer">Customer</MenuItem>
              </Select>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleRoleUpdate} 
            color="primary"
            disabled={loading || !staffToChangeRole}
          >
            {loading ? 'Đang xử lý...' : 'Cập nhật vai trò'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Staff;
