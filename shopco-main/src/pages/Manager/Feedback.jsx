import { useState, useEffect, useMemo } from 'react';
import { FaFilter, FaReply } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, Pagination, CircularProgress, TextField, Snackbar, Alert } from '@mui/material';
import './Manager.css';
import { useNavigate } from 'react-router-dom';
import reviewService from '../../apis/reviewService';
import userService from '../../apis/userService';
import productService from '../../apis/productService';

const Feedback = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('feedback');
  const [reviews, setReviews] = useState([]);
  const [originalReviews, setOriginalReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCount, setFilteredCount] = useState(0);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedResponseStatus, setSelectedResponseStatus] = useState('');
  const [userNames, setUserNames] = useState({});
  const [productNames, setProductNames] = useState({});
  
  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // States cho chức năng phản hồi
  const [openReplyDialog, setOpenReplyDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' },
    { id: 'routine', name: 'Quy trình chăm sóc da', icon: '🧖‍♂️' }
  ];

  // Lấy danh sách đánh giá
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Bắt đầu lấy danh sách đánh giá...');
      const response = await reviewService.getAllReviews();
      console.log('Reviews response:', response);
      
      const processedReviews = response.map(review => ({
        reviewId: review.reviewId,
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        reviewComment: review.reviewComment,
        reviewDate: new Date(review.reviewDate).toLocaleDateString('vi-VN'),
        staffResponse: review.staffResponse || ''
      }));
      
      setReviews(processedReviews);
      setOriginalReviews(processedReviews);
      
      // Fetch user names and product names
      await Promise.all([
        fetchUserNames(processedReviews),
        fetchProductNames(processedReviews)
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      setError('Đã xảy ra lỗi khi tải dữ liệu đánh giá');
      setLoading(false);
    }
  };

  // Sửa lại hàm fetchUserNames
  const fetchUserNames = async (reviews) => {
    try {
      const users = await userService.getAllUsers();
      const userNameMap = {};
      users.forEach(user => {
        // Sử dụng fullName nếu có, nếu không thì dùng name
        userNameMap[user.userId] = user.fullName || user.name || 'Chưa có tên';
      });
      setUserNames(userNameMap);
    } catch (error) {
      console.error('Lỗi khi lấy tên người dùng:', error);
    }
  };

  // Thêm hàm fetchProductNames
  const fetchProductNames = async (reviews) => {
    try {
      console.log('Bắt đầu lấy tên sản phẩm...');
      const response = await productService.getAllProducts();
      console.log('Phản hồi API sản phẩm:', response);
      
      const productNameMap = {};
      
      // Xử lý response để lấy tên sản phẩm
      if (Array.isArray(response)) {
        console.log(`Xử lý ${response.length} sản phẩm từ mảng`);
        response.forEach(product => {
          if (product && product.productId !== undefined) {
            productNameMap[product.productId] = product.productName || 'Không có tên';
          }
        });
      } else if (response && response.$values) {
        console.log(`Xử lý ${response.$values.length} sản phẩm từ $values`);
        response.$values.forEach(product => {
          if (product && product.productId !== undefined) {
            productNameMap[product.productId] = product.productName || 'Không có tên';
          }
        });
      }
      
      console.log('Product name mapping:', productNameMap);
      setProductNames(productNameMap);
    } catch (error) {
      console.error('Lỗi khi lấy tên sản phẩm:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  // Sửa lại useEffect xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setReviews(originalReviews);
      setFilteredCount(0);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredReviews = originalReviews.filter(review => {
      const reviewId = review.reviewId.toString().toLowerCase();
      const userName = (userNames[review.userId] || '').toLowerCase();
      const productName = (productNames[review.productId] || '').toLowerCase();
      const reviewComment = (review.reviewComment || '').toLowerCase();

      return reviewId.includes(searchTermLower) ||
             userName.includes(searchTermLower) ||
             productName.includes(searchTermLower) ||
             reviewComment.includes(searchTermLower);
    });

    setReviews(filteredReviews);
    setFilteredCount(filteredReviews.length !== originalReviews.length ? filteredReviews.length : 0);
  }, [searchTerm, originalReviews, userNames, productNames]);

  // Sử dụng useMemo để tính toán đánh giá hiển thị theo phân trang
  const displayedReviews = useMemo(() => {
    // Phân trang ở client
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return reviews.slice(startIndex, endIndex);
  }, [reviews, page, pageSize]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Xử lý lọc
  const handleFilterClick = () => {
    setSelectedRating('');
    setSelectedResponseStatus('');
    setOpenFilterDialog(true);
  };

  const handleFilterApply = () => {
    console.log('Selected Rating:', selectedRating);
    console.log('Selected Response Status:', selectedResponseStatus);
    
    // Nếu không có bộ lọc nào được chọn, reset về danh sách gốc
    if (!selectedRating && !selectedResponseStatus) {
      setReviews(originalReviews);
      setFilteredCount(0);
      setOpenFilterDialog(false);
      return;
    }
    
    const filtered = originalReviews.filter(review => {
      // Lọc theo rating nếu có chọn
      const ratingMatch = selectedRating ? review.rating === parseInt(selectedRating) : true;
      
      // Lọc theo trạng thái phản hồi nếu có chọn
      let responseMatch = true;
      if (selectedResponseStatus === 'replied') {
        responseMatch = Boolean(review.staffResponse);
      } else if (selectedResponseStatus === 'notReplied') {
        responseMatch = !Boolean(review.staffResponse);
      }
      
      return ratingMatch && responseMatch;
    });

    console.log('Filtered Reviews:', filtered);
    // Chỉ hiển thị thông báo nếu có đánh giá được lọc và khác với danh sách gốc
    setFilteredCount(filtered.length !== originalReviews.length ? filtered.length : 0);
    setReviews(filtered);
    setPage(1); // Reset về trang đầu tiên khi lọc
    setOpenFilterDialog(false);
  };

  const handleRatingChange = (event) => {
    setSelectedRating(event.target.value);
  };
  
  const handleResponseStatusChange = (event) => {
    setSelectedResponseStatus(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setReviews(originalReviews);
    // Reset thông báo số lượng lọc khi xóa tìm kiếm
    setFilteredCount(0);
  };

  // Thêm hàm để xóa bộ lọc
  const handleClearFilters = () => {
    setReviews(originalReviews);
    setFilteredCount(0);
    setSelectedRating('');
    setSelectedResponseStatus('');
    setSearchTerm('');
  };

  // Tạo danh sách rating cho bộ lọc
  const ratingOptions = [1, 2, 3, 4, 5];

  // Thêm các hàm xử lý phản hồi
  const handleOpenReplyDialog = (review) => {
    setSelectedReview(review);
    setReplyContent(review.staffResponse || ''); // Sử dụng phản hồi hiện tại nếu có
    setOpenReplyDialog(true);
  };

  const handleCloseReplyDialog = () => {
    setOpenReplyDialog(false);
    setSelectedReview(null);
    setReplyContent('');
  };

  const handleReplyContentChange = (e) => {
    setReplyContent(e.target.value);
  };

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyContent.trim()) return;
    
    setReplyLoading(true);
    try {
      await reviewService.postReply(selectedReview.reviewId, replyContent);
      
      // Cập nhật state reviews và originalReviews
      const updatedReviews = reviews.map(review => 
        review.reviewId === selectedReview.reviewId 
          ? { ...review, staffResponse: replyContent } 
          : review
      );
      
      setReviews(updatedReviews);
      setOriginalReviews(updatedReviews);
      
      setSnackbar({
        open: true,
        message: 'Phản hồi đã được gửi thành công!',
        severity: 'success'
      });
      
      handleCloseReplyDialog();
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại!',
        severity: 'error'
      });
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
              placeholder="Tìm kiếm theo ID, tên người dùng, tên sản phẩm, bình luận..." 
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
          <h1>Đánh Giá Sản Phẩm</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {searchTerm && reviews.length > 0 && (
              <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                Tìm thấy: {reviews.length} đánh giá
              </div>
            )}
            
            {/* Thêm thông tin thống kê */}
            <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center', marginRight: '15px' }}>
              {originalReviews.length > 0 && (
                <>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    {originalReviews.filter(r => Boolean(r.staffResponse)).length}
                  </span> đã phản hồi / 
                  <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                    {originalReviews.filter(r => !Boolean(r.staffResponse)).length}
                  </span> chưa phản hồi
                </>
              )}
            </div>
            
            <button 
              className="btn-filter" 
              onClick={handleFilterClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaFilter /> 
                <span>Lọc</span>
                {filteredCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {filteredCount}
                  </span>
                )}
              </div>
            </button>
            {filteredCount > 0 && (
              <button
                onClick={handleClearFilters}
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
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>
        
        {/* Table */}
        <div className="dashboard-table">
          <table style={{ 
            tableLayout: 'fixed', 
            width: '100%', 
            borderCollapse: 'separate', 
            borderSpacing: '0',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', height: '50px' }}>
                <th style={{ width: '80px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ID</th>
                <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TÊN NGƯỜI DÙNG</th>
                <th style={{ width: '200px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TÊN SẢN PHẨM</th>                              
                <th style={{ width: '80px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ĐÁNH GIÁ</th>
                <th style={{ width: '200px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NỘI DUNG</th>
                <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NGÀY ĐÁNH GIÁ</th>
                <th style={{ width: '180px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>PHẢN HỒI</th>
                <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td 
                    colSpan="8" 
                    style={{ 
                      padding: '30px', 
                      textAlign: 'center', 
                      color: '#6c757d', 
                      fontSize: '16px',
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #dee2e6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                      <CircularProgress size={24} />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td 
                    colSpan="8" 
                    style={{ 
                      padding: '30px', 
                      textAlign: 'center', 
                      color: '#dc3545', 
                      fontSize: '16px',
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #dee2e6'
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : displayedReviews.length > 0 ? (
                displayedReviews.map((review, index) => (
                  <tr 
                    key={review.reviewId} 
                    style={{ 
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      transition: 'all 0.2s',
                      ':hover': { backgroundColor: '#f1f3f5' }
                    }}
                  >
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{review.reviewId}</td>
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{userNames[review.userId] || 'Loading...'}</td>
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{productNames[review.productId] || 'Loading...'}</td>
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#ffc107' : '#e4e5e9', fontSize: '16px' }}>★</span>
                      ))}
                    </td>
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{review.reviewComment}</td>
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{review.reviewDate}</td>
                    <td style={{ overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>
                      {review.staffResponse ? (
                        <div style={{ 
                          padding: '8px', 
                          backgroundColor: '#f0f8ff', 
                          borderRadius: '5px', 
                          border: '1px solid #cce5ff',
                          fontSize: '13px'
                        }}>
                          {review.staffResponse}
                        </div>
                      ) : (
                        <span style={{ color: '#6c757d', fontStyle: 'italic', fontSize: '13px' }}>
                          Chưa có phản hồi
                        </span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'auto', maxHeight: '100px', padding: '8px', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button
                          onClick={() => navigate(`/product/${review.productId}`)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontSize: '13px',
                            ':hover': { backgroundColor: '#0069d9' }
                          }}
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleOpenReplyDialog(review)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: review.staffResponse ? '#28a745' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaReply size={12} />
                          {review.staffResponse ? 'Sửa' : 'Phản hồi'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="8" 
                    className="empty-data-message"
                    style={{ 
                      padding: '30px', 
                      textAlign: 'center', 
                      color: '#6c757d', 
                      fontSize: '16px',
                      fontStyle: 'italic',
                      backgroundColor: '#f8f9fa',
                      borderBottom: '1px solid #dee2e6'
                    }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Phân trang */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px',
            marginBottom: '20px'
          }}>
            <Pagination
              count={Math.ceil(reviews.length / pageSize)}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              color="primary"
              showFirstButton
              showLastButton
              size="large"
            />
          </div>
        </div>
      </div>
    </div>
    <Dialog 
      open={openFilterDialog} 
      onClose={() => setOpenFilterDialog(false)}
      PaperProps={{ 
        style: { 
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        } 
      }}
    >
      <DialogTitle style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', padding: '16px 24px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Lọc đánh giá</div>
      </DialogTitle>
      <DialogContent style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Số sao đánh giá:</div>
          <Select
            value={selectedRating}
            onChange={handleRatingChange}
            displayEmpty
            fullWidth
            style={{ 
              borderRadius: '4px',
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ddd'
              }
            }}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            {ratingOptions.map((rating) => (
              <MenuItem key={rating} value={rating.toString()}>
                {[...Array(rating)].map((_, i) => (
                  <span key={i} style={{ color: '#ffc107' }}>★</span>
                ))}
                {[...Array(5-rating)].map((_, i) => (
                  <span key={i} style={{ color: '#e4e5e9' }}>★</span>
                ))}
              </MenuItem>
            ))}
          </Select>
        </div>
        
        <div>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Trạng thái phản hồi:</div>
          <Select
            value={selectedResponseStatus}
            onChange={handleResponseStatusChange}
            displayEmpty
            fullWidth
            style={{ 
              borderRadius: '4px',
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#ddd'
              } 
            }}
          >
            <MenuItem value=""><em>Tất cả</em></MenuItem>
            <MenuItem value="replied" style={{ color: '#28a745' }}>✓ Đã phản hồi</MenuItem>
            <MenuItem value="notReplied" style={{ color: '#dc3545' }}>✗ Chưa phản hồi</MenuItem>
          </Select>
        </div>
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button 
          onClick={() => setOpenFilterDialog(false)} 
          style={{ 
            color: '#6c757d',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleFilterApply} 
          color="primary" 
          variant="contained"
          style={{ 
            backgroundColor: '#007bff',
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow: 'none'
          }}
        >
          Áp dụng
        </Button>
      </DialogActions>
    </Dialog>

    {/* Dialog phản hồi đánh giá */}
    <Dialog 
      open={openReplyDialog} 
      onClose={handleCloseReplyDialog}
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
          {selectedReview?.staffResponse ? 'Chỉnh sửa phản hồi' : 'Thêm phản hồi'}
        </div>
      </DialogTitle>
      <DialogContent style={{ padding: '24px' }}>
        {selectedReview && (
          <>
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: '#f8f9fa', 
              borderRadius: 1,
              border: '1px solid #eee'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Đánh giá từ:</strong> {userNames[selectedReview.userId] || 'Khách hàng'}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '14px', color: '#666', marginRight: '5px' }}>Đánh giá:</strong>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < selectedReview.rating ? '#ffc107' : '#e4e5e9', fontSize: '16px' }}>★</span>
                ))}
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                <strong>Sản phẩm:</strong> {productNames[selectedReview.productId] || 'Sản phẩm'}
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                <strong>Nội dung đánh giá:</strong>
              </div>
              
              <div style={{ 
                padding: '12px', 
                backgroundColor: 'white', 
                borderRadius: '4px', 
                border: '1px solid #ddd', 
                fontSize: '14px',
                color: '#333'
              }}>
                {selectedReview.reviewComment}
              </div>
            </Box>
            
            <TextField
              label="Phản hồi của bạn"
              multiline
              rows={4}
              fullWidth
              value={replyContent}
              onChange={handleReplyContentChange}
              variant="outlined"
              placeholder="Nhập phản hồi của bạn tại đây..."
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
          </>
        )}
      </DialogContent>
      <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
        <Button 
          onClick={handleCloseReplyDialog}
          style={{ 
            color: '#6c757d',
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmitReply} 
          color="primary" 
          variant="contained"
          disabled={replyLoading || !replyContent.trim()}
          style={{ 
            backgroundColor: !replyLoading && replyContent.trim() ? '#007bff' : undefined,
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '4px',
            boxShadow: 'none'
          }}
        >
          {replyLoading ? 'Đang gửi...' : (selectedReview?.staffResponse ? 'Cập nhật' : 'Gửi phản hồi')}
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Snackbar thông báo */}
    <Snackbar 
      open={snackbar.open} 
      autoHideDuration={6000} 
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleCloseSnackbar} 
        severity={snackbar.severity}
        variant="filled"
        style={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
    </Box>
  );
};

export default Feedback;
