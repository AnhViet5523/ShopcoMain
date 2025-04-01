import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus, FaTrash } from 'react-icons/fa';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, Pagination } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import './Manager.css';
import adminService from '../../apis/adminService';
import blogService from '../../apis/blog';

const BlogManager = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [posts, setPosts] = useState([]);
  const [originalPosts, setOriginalPosts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCount, setFilteredCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set activeItem thành 'blogManager' khi component được mount
    setActiveItem('blogManager');
    
    // Phần còn lại của useEffect
    let isMounted = true;
    
    const fetchPosts = async () => {
      try {
        setError('Đang tải dữ liệu...');
        
        // Thêm tham số để tránh cache
        const response = await adminService.getAllPosts();
        
        // Kiểm tra nếu component vẫn mounted
        if (!isMounted) return;
        
        console.log('Full API Response:', response);
        
        // Xử lý nhiều định dạng response
        let postsData = [];
        if (Array.isArray(response)) {
          postsData = response;
        } else if (response && response["$values"]) {
          postsData = response["$values"];
        } else if (response && Array.isArray(response.data)) {
          postsData = response.data;
        } else if (response && typeof response === 'object') {
          // Nếu là object khác, thử chuyển thành mảng
          postsData = [response];
        }

        console.log('Processed Posts:', postsData);
        
        // Kiểm tra và chuyển đổi dữ liệu nếu cần
        const formattedPosts = postsData.map(post => ({
          id: post.id || post.postId || 0,
          userId: post.userId || 'N/A',
          title: post.title || 'Không có tiêu đề',
          content: post.content || 'Không có nội dung',
          imageUrl: post.imageUrl || null,
          createdAt: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Chưa xác định'
        }));

        console.log('Formatted Posts:', formattedPosts);
        
        if (isMounted) {
          setPosts(formattedPosts);
          setOriginalPosts(formattedPosts);
          
          // Nếu không có bài viết nào
          if (formattedPosts.length === 0) {
            setError('Không có bài viết nào');
          } else {
            setError(null);
          }
        }
      } catch (error) {
        console.error('Chi tiết lỗi tải bài viết:', error);
        if (isMounted) {
          // Xử lý các loại lỗi khác nhau
          if (error.message.includes('cancelled') || error.message.includes('Không thể kết nối đến máy chủ')) {
            setError(
              <div>
                Kết nối bị gián đoạn. 
                <Button 
                  onClick={fetchPosts} 
                  variant="contained" 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  Thử lại
                </Button>
              </div>
            );
          } else if (error.message.includes('timeout') || error.message.includes('quá lâu')) {
            setError(
              <div>
                Máy chủ phản hồi quá lâu. 
                <Button 
                  onClick={fetchPosts} 
                  variant="contained" 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  Thử lại
                </Button>
              </div>
            );
          } else if (error.message.includes('Network Error') || error.message.includes('kiểm tra kết nối mạng')) {
            setError(
              <div>
                Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn. 
                <Button 
                  onClick={fetchPosts} 
                  variant="contained" 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  Thử lại
                </Button>
              </div>
            );
          } else {
            setError(
              <div>
                {error.message || 'Không thể tải bài viết. Vui lòng thử lại sau.'}
                <Button 
                  onClick={fetchPosts} 
                  variant="contained" 
                  size="small" 
                  sx={{ 
                    ml: 2, 
                    backgroundColor: '#059669',
                    '&:hover': { backgroundColor: '#047857' }
                  }}
                >
                  Thử lại
                </Button>
              </div>
            );
          }
        }
      }
    };

    fetchPosts();
    
    // Cleanup function để tránh memory leak và race condition
    return () => {
      isMounted = false;
    };
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setPosts(originalPosts);
      setFilteredCount(0);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredPosts = originalPosts.filter(post => {
      const titleMatches = post.title.toLowerCase().includes(searchTermLower);
      const contentMatches = post.content.toLowerCase().includes(searchTermLower);
      return titleMatches || contentMatches;
    });

    setPosts(filteredPosts);
    setFilteredCount(filteredPosts.length !== originalPosts.length ? filteredPosts.length : 0);
  }, [searchTerm, originalPosts]);

  const handleClear = () => {
    setSearchTerm('');
    setPosts(originalPosts);
    setFilteredCount(0);
  };

  // Hàm lọc blog dựa trên từ khóa tìm kiếm
  const getFilteredPosts = () => {
    if (!searchTerm.trim()) {
      return posts;
    }
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    return posts.filter(post => {
      const titleMatches = post.title.toLowerCase().includes(searchTermLower);
      const contentMatches = post.content.toLowerCase().includes(searchTermLower);
      return titleMatches || contentMatches;
    });
  };

  // Lấy tổng số trang dựa trên số lượng blog và kích thước trang
  const filteredPosts = getFilteredPosts();
  const totalPages = Math.ceil(filteredPosts.length / pageSize);

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Lấy blog cho trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * pageSize;
    return filteredPosts.slice(startIndex, startIndex + pageSize);
  };

  // Reset trang về 1 khi thay đổi từ khóa tìm kiếm
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

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

  // Hàm mở dialog xác nhận xóa
  const handleOpenDeleteDialog = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  // Hàm đóng dialog xác nhận xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
    setDeleteError(null);
  };

  // Hàm xử lý xóa bài viết
  const handleDeletePost = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await blogService.deletePost(postToDelete.id);
      
      // Cập nhật state sau khi xóa thành công
      const updatedPosts = posts.filter(post => post.id !== postToDelete.id);
      setPosts(updatedPosts);
      setOriginalPosts(originalPosts.filter(post => post.id !== postToDelete.id));
      
      // Đóng dialog
      setDeleteDialogOpen(false);
      setPostToDelete(null);
      
      // Hiển thị thông báo thành công (có thể thêm toast notification ở đây)
      console.log('Xóa bài viết thành công');
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      setDeleteError(error.message || 'Đã xảy ra lỗi khi xóa bài viết');
    } finally {
      setIsDeleting(false);
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
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..." 
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
          <h1>Bài Viết Blog</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {searchTerm && posts.length > 0 && (
              <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                Tìm thấy: {posts.length} bài viết
              </div>
            )}
            <button 
              className="btn-create-payment"
              onClick={() => navigate("/Blog/CreateEditPost/CreatePost")}
            >
              <FaPlus /> Tạo bài viết
            </button>
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
                <th style={{ width: '60px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>STT</th>
                <th style={{ width: '230px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TIÊU ĐỀ</th>
                <th style={{ width: '350px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NỘI DUNG</th>
                <th style={{ width: '140px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ẢNH</th>
                <th style={{ width: '120px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NGÀY TẠO</th>
                <th style={{ width: '200px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td 
                    colSpan="6" 
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
              ) : posts.length > 0 ? (
                getCurrentPageItems().map((post, index) => (
                  <tr 
                    key={post.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      transition: 'all 0.2s'
                    }}
                  >
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{post.title}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>
                      <div style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {post.content}
                      </div>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>
                      {post.imageUrl ? (
                        <img 
                          src={post.imageUrl} 
                          alt="Ảnh bài viết" 
                          style={{ 
                            width: '100px', 
                            height: '50px', 
                            objectFit: 'cover', 
                            borderRadius: '4px'
                          }} 
                        />
                      ) : (
                        'Không có ảnh'
                      )}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{post.createdAt}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/Blog/${post.id}`)}
                        style={{
                          padding: '5px 10px',
                          marginRight: '5px',
                          marginBottom: '5px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Chi tiết
                      </button>
                      <button 
                        className="btn-edit"
                        onClick={() => navigate(`/Blog/CreateEditPost/EditPost/${post.id}`)}
                        style={{
                          padding: '5px 10px',
                          marginRight: '5px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Sửa
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleOpenDeleteDialog(post)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#DC3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaTrash style={{ marginRight: '3px' }} /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="6" 
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
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {posts.length > 0 && (
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

      {/* Dialog xác nhận xóa bài viết */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa bài viết "{postToDelete?.title}" không?
          </Typography>
          <Typography variant="body2" style={{ marginTop: '10px', color: '#dc3545' }}>
            Lưu ý: Hành động này không thể khôi phục lại.
          </Typography>
          {deleteError && (
            <Typography color="error" style={{ marginTop: '10px' }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleDeletePost} 
            color="error" 
            disabled={isDeleting}
            variant="contained"
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    </Box>
  );
};

export default BlogManager;
