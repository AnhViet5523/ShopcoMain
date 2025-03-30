import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, Pagination } from '@mui/material';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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
      setLoading(true);
      const response = await feedbackService.getAllFeedbacks();
      console.log('Dữ liệu đơn hỗ trợ từ API:', response);
      
      if (response && response.$values) {
        const formattedData = response.$values.map(request => {
          // Đảm bảo trường status được xử lý đúng
          const hasStaffReply = request.messages && 
                              request.messages.$values && 
                              request.messages.$values.some(msg => msg.isAdmin === true);
          
          // Lấy thông tin từ tin nhắn đầu tiên
          const firstMessage = request.messages && request.messages.$values && request.messages.$values.length > 0 
                             ? request.messages.$values[0] 
                             : null;
                             
          // Đảm bảo email và số điện thoại được lấy từ tin nhắn đầu tiên
          const userEmail = firstMessage?.email || '';
          const userPhone = firstMessage?.phoneNumber || '';
          
          // Lấy timestamp để sắp xếp theo thời gian
          const timestamp = firstMessage ? new Date(firstMessage.sendTime).getTime() : 0;
          
          return {
            ...request,
            messages: request.messages.$values,
            // Đảm bảo status được gán chính xác dựa trên dữ liệu
            status: hasStaffReply ? 'Replied' : (request.status || 'Pending'),
            // Lưu email và số điện thoại vào đối tượng chính
            userEmail: userEmail,
            userPhone: userPhone,
            // Thêm timestamp để sắp xếp
            timestamp: timestamp
          };
        });
        
        // Sắp xếp theo thời gian mới nhất (timestamp lớn nhất đầu tiên)
        formattedData.sort((a, b) => b.timestamp - a.timestamp);
        
        console.log('Dữ liệu đã xử lý và sắp xếp:', formattedData);
        setSupportRequests(formattedData);
      } else {
        setSupportRequests([]);
        console.error('Không có dữ liệu từ API');
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hỗ trợ:', error);
      setSupportRequests([]);
    } finally {
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
      
      // Cập nhật trạng thái của đơn hỗ trợ trong state nếu API không tự cập nhật
      setSupportRequests(prev => 
        prev.map(request => 
          request.conversationId === selectedRequest.conversationId
            ? { ...request, status: 'Replied' } // Cập nhật trạng thái thành "Đã phản hồi"
            : request
        )
      );
      
      alert('Phản hồi thành công!');
      handleCloseDialog();
      fetchSupportRequests(); // Tải lại dữ liệu từ server
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
    // Lọc theo điều kiện nhưng giữ nguyên thứ tự sắp xếp theo thời gian
    return supportRequests.filter(request => {
      const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'pending') return matchesSearch && request.status === 'Pending';
      if (filterStatus === 'replied') return matchesSearch && request.status !== 'Pending';
      
      return matchesSearch;
    });
  };

  // Lấy tổng số trang dựa trên số lượng hỗ trợ và số lượng hiển thị mỗi trang
  const filteredRequests = getFilteredRequests();
  const totalPages = Math.ceil(filteredRequests.length / pageSize);

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Lấy mảng yêu cầu hỗ trợ cho trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  };

  // Khi từ khóa tìm kiếm hoặc bộ lọc thay đổi, reset lại trang hiện tại
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  
  // Thêm effect để kiểm tra lại supportRequests khi thay đổi
  useEffect(() => {
    console.log('Support Requests đã cập nhật:', supportRequests);
    // Kiểm tra số lượng đã phản hồi/chưa phản hồi
    const repliedCount = supportRequests.filter(r => r.status !== 'Pending').length;
    const pendingCount = supportRequests.filter(r => r.status === 'Pending').length;
    console.log(`Đã phản hồi: ${repliedCount}, Chưa phản hồi: ${pendingCount}`);
  }, [supportRequests]);

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
          <div className="dashboard-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Thêm thông tin thống kê */}
            <div style={{ color: '#666', fontSize: '14px', marginRight: '15px' }}>
              {supportRequests.length > 0 && (
                <>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    {supportRequests.filter(r => r.status !== 'Pending').length}
                  </span> đã phản hồi / 
                  <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                    {supportRequests.filter(r => r.status === 'Pending').length}
                  </span> chưa phản hồi
                </>
              )}
            </div>
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
        
        {/* Table */}
        <div className="dashboard-table">
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            tableLayout: 'fixed'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>ID</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>TÊN NGƯỜI DÙNG</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>EMAIL</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>SỐ ĐIỆN THOẠI</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>NỘI DUNG</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>HÌNH ẢNH</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>THỜI GIAN GỬI</th>
                <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid #e9ecef', fontWeight: 'bold', color: '#495057' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                    Không tìm thấy đơn hỗ trợ nào
                  </td>
                </tr>
              ) : (
                getCurrentPageItems().map((request) => {
                  if (!request || !request.messages || request.messages.length === 0) {
                    return null;
                  }

                  const firstMessage = request.messages[0];
                  return (
                    <tr key={request.conversationId} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>{request.conversationId || 'N/A'}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'left' }}>{request.userName || 'N/A'}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'left', fontSize: '14px' }}>{request.userEmail || firstMessage?.email || 'N/A'}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'left', fontSize: '14px' }}>{request.userPhone || firstMessage?.phoneNumber || 'N/A'}</td>
                      <td style={{ padding: '12px 15px', textAlign: 'left', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {firstMessage?.messageContent || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        {firstMessage?.imageUrl ? (
                          <span style={{ color: 'green', fontWeight: 'bold', fontSize: '14px' }}>
                            Có ảnh đính kèm
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d', fontSize: '14px' }}>Không có ảnh</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'center', fontSize: '14px' }}>
                        {firstMessage?.sendTime ? formatDateTime(firstMessage.sendTime) : formatDateTime(request.timestamp)}
                      </td>
                      <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleViewDetail(request)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Chi tiết
                          </button>
                          <button 
                            onClick={() => handleReply(request)}
                            disabled={request.status !== 'Pending'}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: request.status === 'Pending' ? '#28a745' : '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: request.status === 'Pending' ? 'pointer' : 'default',
                              fontSize: '12px',
                              opacity: request.status === 'Pending' ? 1 : 0.7
                            }}
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

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
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

    {/* Thêm Dialog phản hồi */}
    <Dialog 
      open={openReplyDialog} 
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="sm"
      PaperProps={{ 
        style: { 
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        } 
      }}
    >
      <DialogTitle style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', padding: '16px 24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          Phản hồi đơn hỗ trợ
        </div>
      </DialogTitle>
      <DialogContent style={{ padding: '24px' }}>
        {selectedRequest && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #e0e0e0' 
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Từ khách hàng:</strong> {selectedRequest.userName}</p>
              {selectedRequest.userEmail && (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}><strong>Email:</strong> {selectedRequest.userEmail}</p>
              )}
              {selectedRequest.userPhone && (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#555' }}><strong>Số điện thoại:</strong> {selectedRequest.userPhone}</p>
              )}
              <div style={{ margin: '12px 0 0 0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Nội dung:</strong></p>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'white', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  fontSize: '14px' 
                }}>
                  {selectedRequest.messages[0]?.messageContent}
                </div>
              </div>
            </div>
            
            {selectedRequest.messages[0]?.imageUrl && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '15px' }}><strong>Ảnh đính kèm của khách hàng:</strong></p>
                <div style={{ 
                  display: 'inline-block',
                  padding: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white'
                }}>
                  <img 
                    src={feedbackService.getImageUrl(selectedRequest.messages[0].imageUrl)} 
                    alt="Ảnh đính kèm" 
                    style={{ 
                      maxWidth: '300px', 
                      maxHeight: '200px', 
                      cursor: 'pointer',
                      borderRadius: '2px' 
                    }}
                    onClick={() => window.open(feedbackService.getImageUrl(selectedRequest.messages[0].imageUrl), '_blank')}
                  />
                </div>
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
          InputProps={{
            style: { fontSize: '14px' }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#ddd',
              },
              '&:hover fieldset': {
                borderColor: '#aaa',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#007bff',
              },
            },
          }}
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
              style={{ 
                marginRight: '10px',
                textTransform: 'none',
                borderColor: '#ddd',
                color: '#333'
              }}
            >
              Chọn ảnh
            </Button>
          </label>
          {previewImage && (
            <div style={{ 
              marginTop: '15px', 
              position: 'relative',
              display: 'inline-block',
              padding: '4px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}>
              <img 
                src={previewImage} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px',
                  borderRadius: '2px'
                }}
              />
              <Button
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  minWidth: '30px',
                  width: '25px',
                  height: '25px',
                  padding: '0',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
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
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button 
          onClick={handleCloseDialog} 
          style={{ 
            color: '#6c757d',
            textTransform: 'none',
            fontWeight: '500',
            fontSize: '14px',
            padding: '6px 12px'
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmitReply} 
          variant="contained" 
          color="primary"
          disabled={!replyMessage.trim()}
          style={{ 
            backgroundColor: replyMessage.trim() ? '#007bff' : undefined,
            textTransform: 'none',
            fontWeight: '500',
            boxShadow: 'none',
            fontSize: '14px',
            padding: '6px 12px'
          }}
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
      PaperProps={{ 
        style: { 
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        } 
      }}
    >
      <DialogTitle style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', padding: '16px 24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          Chi tiết đơn hỗ trợ
        </div>
      </DialogTitle>
      <DialogContent style={{ padding: '24px' }}>
        {selectedDetailRequest && (
          <div className="conversation-detail">
            <div className="conversation-header" style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Thông tin người gửi</h3>
              <p style={{ margin: '5px 0' }}><strong>Tên:</strong> {selectedDetailRequest.userName || 'Không có thông tin'}</p>
              <p style={{ margin: '5px 0' }}><strong>Email:</strong> {selectedDetailRequest.userEmail || 'Không có thông tin'}</p>
              <p style={{ margin: '5px 0' }}><strong>Số điện thoại:</strong> {selectedDetailRequest.userPhone || 'Không có thông tin'}</p>
              <p style={{ margin: '5px 0' }}><strong>Thời gian gửi:</strong> {formatDateTime(selectedDetailRequest.timestamp)}</p>
              <p style={{ margin: '5px 0' }}><strong>Trạng thái:</strong> 
                <span style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  marginLeft: '8px',
                  backgroundColor: selectedDetailRequest.status === 'Pending' ? '#ff9800' : '#4caf50',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {selectedDetailRequest.status === 'Pending' ? 'Chưa phản hồi' : 'Đã phản hồi'}
                </span>
              </p>
            </div>
            
            <div className="conversation-messages">
              <h3 style={{ margin: '20px 0 10px 0', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Nội dung trao đổi</h3>
              {selectedDetailRequest.messages.map((message, index) => (
                <div 
                  key={message.messageId || index} 
                  style={{
                    backgroundColor: message.isAdmin ? '#e8f4fd' : '#f5f5f5',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    margin: '10px 0',
                    maxWidth: '80%',
                    marginLeft: message.isAdmin ? 'auto' : '0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '5px',
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    paddingBottom: '5px'
                  }}>
                    <strong>{message.isAdmin ? 'Nhân viên' : selectedDetailRequest.userName}</strong>
                    <span style={{ fontSize: '12px', color: '#666' }}>{formatDateTime(message.sendTime)}</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ margin: '0 0 8px 0', wordBreak: 'break-word' }}>{message.messageContent}</p>
                    {message.imageUrl && (
                      <img 
                        src={feedbackService.getImageUrl(message.imageUrl)} 
                        alt="Hình ảnh kèm theo" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'block',
                          marginTop: '8px'
                        }}
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
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button 
          onClick={handleCloseDetailDialog} 
          variant="contained" 
          color="primary"
          style={{ 
            textTransform: 'none',
            fontWeight: '500',
            boxShadow: 'none',
            fontSize: '14px',
            padding: '6px 12px'
          }}
        >
          Đóng
        </Button>
        {selectedDetailRequest && selectedDetailRequest.status === 'Pending' && (
          <Button 
            onClick={() => {
              handleCloseDetailDialog();
              handleReply(selectedDetailRequest);
            }} 
            variant="contained" 
            color="success"
            style={{ 
              marginLeft: '10px',
              textTransform: 'none',
              fontWeight: '500',
              boxShadow: 'none',
              fontSize: '14px',
              padding: '6px 12px'
            }}
          >
            Trả lời ngay
          </Button>
        )}
      </DialogActions>
    </Dialog>
    </Box>
  );
};

export default SupportStaff;
