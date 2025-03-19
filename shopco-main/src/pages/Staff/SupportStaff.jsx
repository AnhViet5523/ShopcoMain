import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import './Manager.css';
import { useState, useEffect } from 'react';
import feedbackService from '../../apis/feedbackService';

const  SupportStaff = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'replied'

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Feedback', icon: '📢' },
    { id: 'blogStaff', name: 'Blog', icon: '📰' }
  ];


  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      const response = await feedbackService.getAllFeedbacks();
      if (response && response.$values) {
        const formattedData = response.$values.map(request => ({
          ...request,
          messages: request.messages.$values
        }));
        setSupportRequests(formattedData);
      } else {
        setSupportRequests([]);
        console.error('Không có dữ liệu từ API');
      }
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hỗ trợ:', error);
      setSupportRequests([]);
      setLoading(false);
    }
  };

  // Hàm format ngày giờ
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const handleReply = (request) => {
    setSelectedRequest(request);
    setOpenReplyDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenReplyDialog(false);
    setReplyMessage('');
    setSelectedRequest(null);
    setReplyImage(null);
    setPreviewImage(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Kiểm tra kích thước > 5MB
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyImage(file);
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyMessage.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!');
      return;
    }

    try {
      // Chuẩn bị dữ liệu reply với ảnh (nếu có)
      const replyData = {
        conversationId: selectedRequest.conversationId,
        userId: 1, // ID của staff
        messageContent: replyMessage,
        imageFile: replyImage, // File ảnh gốc
      };
      
      console.log("Replying to feedback. Image included:", !!replyImage);
      
      // Sử dụng API mới để gửi phản hồi kèm ảnh trong một request duy nhất
      const replyResponse = await feedbackService.replyFeedbackWithImage(replyData);
      console.log("Kết quả phản hồi:", replyResponse);
      
      alert('Phản hồi thành công!');
      handleCloseDialog();
      fetchSupportRequests();
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      let errorMessage = 'Không thể gửi phản hồi. Vui lòng thử lại sau!';
      
      // Hiển thị thông báo lỗi chi tiết nếu có
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage += '\n\nLỗi: ' + error.response.data.error;
      } else if (error.message) {
        errorMessage += '\n\nLỗi: ' + error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleViewDetail = (request) => {
    setSelectedDetailRequest(request);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedDetailRequest(null);
  };

  const getFilteredRequests = () => {
    return supportRequests.filter(request => {
      const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'pending') return matchesSearch && request.status === 'Pending';
      if (filterStatus === 'replied') return matchesSearch && request.status !== 'Pending';
      
      return matchesSearch;
    });
  };

  // Thêm styles cho component
  const styles = {
    filterSelect: {
      padding: '8px 15px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      cursor: 'pointer',
      minWidth: '180px',
      color: '#2c3e50',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: '#3498db',
        boxShadow: '0 0 0 2px rgba(52,152,219,0.1)'
      }
    },
    filterOption: {
      padding: '8px 12px',
      fontSize: '14px',
      color: '#2c3e50',
      backgroundColor: '#fff',
      '&:hover': {
        backgroundColor: '#f8f9fa'
      }
    },
    filterContainer: {
      position: 'relative',
      display: 'inline-block'
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
          <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên..." 
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
                onClick={() => setSearchTerm('')}
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
          <h1>Đơn Hỗ Trợ</h1>
          <div className="dashboard-actions">
            <div className="filter-group" style={styles.filterContainer}>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  ...styles.filterSelect,
                  backgroundColor: filterStatus === 'pending' ? '#fff8e1' : 
                                 filterStatus === 'replied' ? '#e8f5e9' : '#fff'
                }}
              >
                <option value="all" style={styles.filterOption}>🔍 Tất cả</option>
                <option value="pending" style={{...styles.filterOption, color: '#ff9800'}}>⏳ Chưa phản hồi</option>
                <option value="replied" style={{...styles.filterOption, color: '#4caf50'}}>✓ Đã phản hồi</option>
              </select>
            </div>
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
                <th>ID</th>
                <th>TÊN NGƯỜI DÙNG</th>
                <th>EMAIL</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>NỘI DUNG</th>
                <th>HÌNH ẢNH</th>
                <th>THỜI GIAN GỬI</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="empty-data-message">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : getFilteredRequests().length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-data-message">
                    Không tìm thấy đơn hỗ trợ nào
                  </td>
                </tr>
              ) : (
                getFilteredRequests().map((request) => {
                  if (!request || !request.messages || request.messages.length === 0) {
                    return null;
                  }

                  const firstMessage = request.messages[0];
                  return (
                    <tr key={request.conversationId}>
                      <td>{firstMessage?.messageId || 'N/A'}</td>
                      <td>{request.userName || 'N/A'}</td>
                      <td>{firstMessage?.email || 'N/A'}</td>
                      <td>{firstMessage?.phoneNumber || 'N/A'}</td>
                      <td className="message-content">{firstMessage?.messageContent || 'N/A'}</td>
                      <td>
                        {firstMessage?.imageUrl ? (
                          <span className="has-image" style={{ color: 'green', fontWeight: 'bold' }}>
                            Có ảnh đính kèm
                          </span>
                        ) : (
                          <span className="no-image">Không có ảnh</span>
                        )}
                      </td>
                      <td>{firstMessage?.sendTime ? formatDateTime(firstMessage.sendTime) : 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="detail-button"
                            onClick={() => handleViewDetail(request)}
                          >
                            Chi tiết
                          </button>
                          <button 
                            className={`reply-button ${request.status === 'Pending' ? 'active' : 'disabled'}`}
                            onClick={() => handleReply(request)}
                            disabled={request.status !== 'Pending'}
                          >
                            {request.status === 'Pending' ? 'Phản hồi' : 'Đã phản hồi'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Thêm Dialog phản hồi */}
    <Dialog 
      open={openReplyDialog} 
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Phản hồi đơn hỗ trợ
      </DialogTitle>
      <DialogContent>
        {selectedRequest && (
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Từ khách hàng:</strong> {selectedRequest.userName}</p>
            <p><strong>Nội dung:</strong> {selectedRequest.messages[0]?.messageContent}</p>
            {selectedRequest.messages[0]?.imageUrl && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>Ảnh đính kèm của khách hàng:</strong></p>
                <img 
                  src={feedbackService.getImageUrl(selectedRequest.messages[0].imageUrl)} 
                  alt="Customer attachment" 
                  style={{ maxWidth: '200px', cursor: 'pointer' }}
                  onClick={() => window.open(feedbackService.getImageUrl(selectedRequest.messages[0].imageUrl), '_blank')}
                />
              </div>
            )}
          </div>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Nội dung phản hồi"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
        />
        
        {/* Phần upload ảnh */}
        <div style={{ marginTop: '20px' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="reply-image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="reply-image-upload">
            <Button
              variant="outlined"
              component="span"
              style={{ marginRight: '10px' }}
            >
              Chọn ảnh
            </Button>
          </label>
          {previewImage && (
            <div style={{ marginTop: '10px', position: 'relative' }}>
              <img 
                src={previewImage} 
                alt="Preview" 
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
              <Button
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  minWidth: '30px',
                  padding: '2px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white'
                }}
                onClick={() => {
                  setReplyImage(null);
                  setPreviewImage(null);
                }}
              >
                ✕
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="inherit">
          Hủy
        </Button>
        <Button 
          onClick={handleSubmitReply} 
          variant="contained" 
          color="primary"
          disabled={!replyMessage.trim()}
        >
          Gửi phản hồi
        </Button>
      </DialogActions>
    </Dialog>

    {/* Dialog xem chi tiết */}
    <Dialog
      open={openDetailDialog}
      onClose={handleCloseDetailDialog}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Chi tiết đơn hỗ trợ
      </DialogTitle>
      <DialogContent>
        {selectedDetailRequest && (
          <div className="conversation-detail">
            <div className="conversation-header">
              <h3>Thông tin người gửi</h3>
              <p><strong>Tên:</strong> {selectedDetailRequest.userName}</p>
              <p><strong>Email:</strong> {selectedDetailRequest.messages[0]?.email}</p>
              <p><strong>Số điện thoại:</strong> {selectedDetailRequest.messages[0]?.phoneNumber}</p>
            </div>
            
            <div className="conversation-messages">
              <h3>Nội dung trao đổi</h3>
              {selectedDetailRequest.messages.map((message, index) => (
                <div 
                  key={message.messageId} 
                  className={`message-item ${message.isAdmin ? 'admin-message' : 'user-message'}`}
                >
                  <div className="message-header">
                    <strong>{message.isAdmin ? 'Admin' : selectedDetailRequest.userName}</strong>
                    <span>{formatDateTime(message.sendTime)}</span>
                  </div>
                  <div className="message-content">
                    <p>{message.messageContent}</p>
                    {message.imageUrl && (
                      <img 
                        src={feedbackService.getImageUrl(message.imageUrl)} 
                        alt="Attachment" 
                        onClick={() => window.open(feedbackService.getImageUrl(message.imageUrl), '_blank')}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDetailDialog} color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default SupportStaff;
