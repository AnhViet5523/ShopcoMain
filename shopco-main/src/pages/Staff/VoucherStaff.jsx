import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import './Manager.css';
import { useState, useEffect } from 'react';
import voucherService from '../../apis/voucherService';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const VoucherStaff = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalVouchers, setOriginalVouchers] = useState([]);

  // State cho dialog thêm voucher
  const [openDialog, setOpenDialog] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    voucherName: '',
    discountPercent: '',
    minOrderAmount: '',
    startDate: null,
    endDate: null,
    quantity: '',
    description: '',
    status: 'Active'
  });

  const [editingVoucherId, setEditingVoucherId] = useState(null);

  // Thêm state để theo dõi khi nào cần refresh dữ liệu
  const [refreshData, setRefreshData] = useState(false);

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Feedback', icon: '📢' },
  ];

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await voucherService.getVouchers();
        if (response.$values) {
          setVouchers(response.$values);
          setOriginalVouchers(response.$values);
        } else {
          console.error('Dữ liệu không đúng định dạng:', response);
          setVouchers([]);
          setOriginalVouchers([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách voucher:', error);
        setError('Không thể tải dữ liệu voucher. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [refreshData]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setVouchers(originalVouchers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredVouchers = originalVouchers.filter(voucher => {
      const voucherName = (voucher.voucherName || '').toLowerCase();
      const description = (voucher.description || '').toLowerCase();
      const status = (voucher.status || '').toLowerCase();
      const discountPercent = (voucher.discountPercent || '').toString();
      const minOrderAmount = (voucher.minOrderAmount || '').toString();
      const startDate = new Date(voucher.startDate).toLocaleDateString('vi-VN');
      const endDate = new Date(voucher.endDate).toLocaleDateString('vi-VN');
      const quantity = (voucher.quantity || '').toString();

      return voucherName.includes(searchTermLower) ||
             description.includes(searchTermLower) ||
             status.includes(searchTermLower) ||
             discountPercent.includes(searchTermLower) ||
             minOrderAmount.includes(searchTermLower) ||
             startDate.includes(searchTermLower) ||
             endDate.includes(searchTermLower) ||
             quantity.includes(searchTermLower);
    });

    setVouchers(filteredVouchers);
  }, [searchTerm, originalVouchers]);

  const handleClear = () => {
    setSearchTerm('');
    setVouchers(originalVouchers);
  };

  const handleEdit = (voucherId) => {
    const voucherToEdit = vouchers.find(v => v.voucherId === voucherId);
    if (voucherToEdit) {
      setNewVoucher({
        voucherName: voucherToEdit.voucherName,
        discountPercent: voucherToEdit.discountPercent,
        minOrderAmount: voucherToEdit.minOrderAmount,
        startDate: voucherToEdit.startDate ? dayjs(voucherToEdit.startDate) : null,
        endDate: voucherToEdit.endDate ? dayjs(voucherToEdit.endDate) : null,
        quantity: voucherToEdit.quantity,
        description: voucherToEdit.description,
        status: voucherToEdit.status
      });
      setEditingVoucherId(voucherId);
      setOpenDialog(true);
    }
  };

  const handleDelete = async (voucherId) => {
    if (window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái voucher này?')) {
      try {
        await voucherService.toggleVoucherStatus(voucherId);
        // Trigger refresh data để cập nhật lại danh sách
        setRefreshData(prev => !prev);
      } catch (error) {
        console.error('Lỗi khi thay đổi trạng thái voucher:', error);
        alert('Không thể thay đổi trạng thái voucher. Vui lòng thử lại sau.');
      }
    }
  };

  const handleAdd = () => {
    setOpenDialog(true); // Mở dialog khi nhấn nút "Thêm Voucher"
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewVoucher({
      voucherName: '',
      discountPercent: '',
      minOrderAmount: '',
      startDate: null,
      endDate: null,
      quantity: '',
      description: '',
      status: 'Active'
    }); // Đặt lại giá trị voucher mới
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVoucher((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setNewVoucher((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyPress = (e) => {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const handleSubmit = async () => {
    // Kiểm tra các trường bắt buộc
    if (!newVoucher.voucherName || !newVoucher.discountPercent || !newVoucher.minOrderAmount || 
        !newVoucher.startDate || !newVoucher.endDate || !newVoucher.quantity) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (dayjs(newVoucher.endDate).isBefore(dayjs(newVoucher.startDate))) {
      alert('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    // Chuẩn bị dữ liệu để gửi đi
    const voucherData = {
      voucherName: newVoucher.voucherName,
      discountPercent: parseInt(newVoucher.discountPercent),
      minOrderAmount: parseInt(newVoucher.minOrderAmount),
      startDate: dayjs(newVoucher.startDate).format(),
      endDate: dayjs(newVoucher.endDate).format(),
      quantity: parseInt(newVoucher.quantity),
      description: newVoucher.description,
      status: newVoucher.status
    };

    try {
      if (editingVoucherId) {
        // Cập nhật voucher
        await voucherService.updateVoucher(editingVoucherId, voucherData);
        alert('Đã cập nhật voucher thành công');
      } else {
        // Thêm voucher mới
        await voucherService.createVoucher(voucherData);
        alert('Đã thêm voucher thành công');
      }
      
      // Đóng dialog và cập nhật state
      setEditingVoucherId(null);
      handleDialogClose();
      
      // Trigger refresh data
      setRefreshData(prev => !prev);
      
    } catch (error) {
      console.error('Lỗi khi thêm hoặc cập nhật voucher:', error.response ? error.response.data : error.message);
      alert('Không thể thêm hoặc cập nhật voucher. Vui lòng thử lại sau.');
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
              <div key={item.id} 
                   className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} 
                   onClick={() => { 
                     setActiveItem(item.id); 
                     navigate(`/${item.id}`);  // Đảm bảo đường dẫn phù hợp với route
                   }} 
                   style={{ cursor: 'pointer' }}>
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
                placeholder="Tìm kiếm theo tên voucher, mô tả, trạng thái..."
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
            <h1>Vouchers</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {searchTerm && vouchers.length > 0 && (
                <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                  Tìm thấy: {vouchers.length} voucher
                </div>
              )}
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
                + Thêm Voucher
              </button>
            </div>
          </div>
          
          {/* Table */}
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>TÊN VOUCHER</th>
                  <th>GIẢM GIÁ (%)</th>
                  <th>ĐƠN TỐI THIỂU</th>
                  <th>NGÀY BẮT ĐẦU</th>
                  <th>NGÀY KẾT THÚC</th>
                  <th>SỐ LƯỢNG</th>
                  <th>TRẠNG THÁI</th>
                  <th>MÔ TẢ</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="empty-data-message">
                      Đang tải dữ liệu voucher...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="10" className="empty-data-message error-message">
                      {error}
                    </td>
                  </tr>
                ) : vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <tr key={voucher.voucherId}>
                      <td>{voucher.voucherId}</td>
                      <td>{voucher.voucherName}</td>
                      <td>{voucher.discountPercent}%</td>
                      <td>{voucher.minOrderAmount ? voucher.minOrderAmount.toLocaleString() : 0}đ</td>
                      <td>{new Date(voucher.startDate).toLocaleDateString('vi-VN')}</td>
                      <td>{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</td>
                      <td>{voucher.quantity}</td>
                      <td>{voucher.status}</td>
                      <td>{voucher.description}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleEdit(voucher.voucherId)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.voucherId)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Thay đổi trạng thái
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-data-message">
                      Không có dữ liệu voucher
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog thêm voucher */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{editingVoucherId ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="voucherName"
            label="Tên Voucher"
            type="text"
            fullWidth
            variant="outlined"
            value={newVoucher.voucherName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="discountPercent"
            label="Giảm Giá (%)"
            type="number"
            fullWidth
            variant="outlined"
            value={newVoucher.discountPercent}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            error={isNaN(newVoucher.discountPercent) || newVoucher.discountPercent === ''}
            helperText={isNaN(newVoucher.discountPercent) || newVoucher.discountPercent === '' ? 'Vui lòng nhập số' : ''}
          />
          <TextField
            margin="dense"
            name="minOrderAmount"
            label="Đơn Tối Thiểu"
            type="number"
            fullWidth
            variant="outlined"
            value={newVoucher.minOrderAmount}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            error={isNaN(newVoucher.minOrderAmount) || newVoucher.minOrderAmount === ''}
            helperText={isNaN(newVoucher.minOrderAmount) || newVoucher.minOrderAmount === '' ? 'Vui lòng nhập số' : ''}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
              label="Ngày Bắt Đầu"
              value={newVoucher.startDate}
              onChange={(value) => handleDateChange('startDate', value)}
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
            <DatePicker
              label="Ngày Kết Thúc"
              value={newVoucher.endDate}
              onChange={(value) => handleDateChange('endDate', value)}
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            name="quantity"
            label="Số Lượng"
            type="number"
            fullWidth
            variant="outlined"
            value={newVoucher.quantity}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            error={isNaN(newVoucher.quantity) || newVoucher.quantity === ''}
            helperText={isNaN(newVoucher.quantity) || newVoucher.quantity === '' ? 'Vui lòng nhập số' : ''}
          />
          <TextField
            margin="dense"
            name="description"
            label="Mô Tả"
            type="text"
            fullWidth
            variant="outlined"
            value={newVoucher.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Hủy
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {editingVoucherId ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoucherStaff;
