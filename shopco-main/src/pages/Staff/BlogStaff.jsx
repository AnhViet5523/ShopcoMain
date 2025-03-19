import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box } from '@mui/material';
import './Manager.css';
import adminService from '../../apis/adminService';

const BlogStaff = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [posts, setPosts] = useState([]);
  const [originalPosts, setOriginalPosts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCount, setFilteredCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {

    setActiveItem('blogStaff');
    
    // Phần còn lại của useEffect
    let isMounted = true;
    
    const fetchPosts = async () => {
      try {
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
          setError(`Không thể tải bài viết: ${error.message}`);
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

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Feedback', icon: '📢' },
    { id: 'blogStaff', name: 'Blog', icon: '📰' }
  ];


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
              onClick={() => navigate('/create-post')}
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
                <th style={{ width: '150px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
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
                posts.map((post, index) => (
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
                        onClick={() => navigate(`/blogManager/${post.id}`)}
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
                        onClick={() => navigate(`/edit-post/${post.id}`)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Sửa
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
      </div>
    </div>
    </Box>
  );
};

export default BlogStaff;
