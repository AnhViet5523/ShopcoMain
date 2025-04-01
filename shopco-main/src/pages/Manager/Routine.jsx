import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus, FaTrash } from 'react-icons/fa';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, Pagination } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import './Manager.css';
import adminService from '../../apis/adminService';

const RoutineManager = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [routines, setRoutines] = useState([]);
  const [originalRoutines, setOriginalRoutines] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCount, setFilteredCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set activeItem thành 'routine' khi component được mount
    setActiveItem('routine');
    
    // Phần còn lại của useEffect
    let isMounted = true;
    
    const fetchRoutines = async () => {
      try {
        setError('Đang tải dữ liệu...');
        
        // Thêm tham số để tránh cache
        const response = await adminService.getSkinCareRoutines();
        
        // Kiểm tra nếu component vẫn mounted
        if (!isMounted) return;
        
        console.log('Full API Response:', response);
        
        // Xử lý nhiều định dạng response
        let routinesData = [];
        if (Array.isArray(response)) {
          routinesData = response;
        } else if (response && response["$values"]) {
          routinesData = response["$values"];
        } else if (response && Array.isArray(response.data)) {
          routinesData = response.data;
        } else if (response && typeof response === 'object') {
          // Nếu là object khác, thử chuyển thành mảng
          routinesData = [response];
        }

        console.log('Processed Routines:', routinesData);
        
        // Kiểm tra và chuyển đổi dữ liệu nếu cần
        const formattedRoutines = routinesData.map(routine => ({
          id: routine.id || routine.routineId || 0,
          skinType: routine.skinType || 'Tất cả các loại da',
          title: routine.title || 'Không có tiêu đề',
          content: routine.content || 'Không có nội dung',
          createdAt: routine.createdAt ? new Date(routine.createdAt).toLocaleDateString() : 'Chưa xác định'
        }));

        console.log('Formatted Routines:', formattedRoutines);
        
        if (isMounted) {
          setRoutines(formattedRoutines);
          setOriginalRoutines(formattedRoutines);
          
          // Nếu không có quy trình nào
          if (formattedRoutines.length === 0) {
            setError('Không có quy trình chăm sóc da nào');
          } else {
            setError(null);
          }
        }
      } catch (error) {
        console.error('Chi tiết lỗi tải quy trình chăm sóc da:', error);
        if (isMounted) {
          // Xử lý các loại lỗi khác nhau
          if (error.message.includes('cancelled') || error.message.includes('Không thể kết nối đến máy chủ')) {
            setError(
              <div>
                Kết nối bị gián đoạn. 
                <Button 
                  onClick={fetchRoutines} 
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
                  onClick={fetchRoutines} 
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
                  onClick={fetchRoutines} 
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
                {error.message || 'Không thể tải quy trình chăm sóc da. Vui lòng thử lại sau.'}
                <Button 
                  onClick={fetchRoutines} 
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

    fetchRoutines();
    
    // Cleanup function để tránh memory leak và race condition
    return () => {
      isMounted = false;
    };
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setRoutines(originalRoutines);
      setFilteredCount(0);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredRoutines = originalRoutines.filter(routine => {
      const titleMatches = routine.title.toLowerCase().includes(searchTermLower);
      const contentMatches = routine.content.toLowerCase().includes(searchTermLower);
      const skinTypeMatches = routine.skinType.toLowerCase().includes(searchTermLower);
      return titleMatches || contentMatches || skinTypeMatches;
    });

    setRoutines(filteredRoutines);
    setFilteredCount(filteredRoutines.length !== originalRoutines.length ? filteredRoutines.length : 0);
  }, [searchTerm, originalRoutines]);

  const handleClear = () => {
    setSearchTerm('');
    setRoutines(originalRoutines);
    setFilteredCount(0);
  };

  // Hàm lọc quy trình dựa trên từ khóa tìm kiếm
  const getFilteredRoutines = () => {
    if (!searchTerm.trim()) {
      return routines;
    }
    
    const searchTermLower = searchTerm.toLowerCase().trim();
    return routines.filter(routine => {
      const titleMatches = routine.title.toLowerCase().includes(searchTermLower);
      const contentMatches = routine.content.toLowerCase().includes(searchTermLower);
      const skinTypeMatches = routine.skinType.toLowerCase().includes(searchTermLower);
      return titleMatches || contentMatches || skinTypeMatches;
    });
  };

  // Lấy tổng số trang dựa trên số lượng quy trình và kích thước trang
  const filteredRoutines = getFilteredRoutines();
  const totalPages = Math.ceil(filteredRoutines.length / pageSize);

  // Hàm xử lý khi thay đổi trang
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Lấy quy trình cho trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * pageSize;
    return filteredRoutines.slice(startIndex, startIndex + pageSize);
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
    { id: 'feedback', name: 'Feedback', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' },
    { id: 'routine', name: 'Quy trình chăm sóc da', icon: '🧖‍♂️' }
  ];

  // Hàm mở dialog xác nhận xóa
  const handleOpenDeleteDialog = (routine) => {
    setRoutineToDelete(routine);
    setDeleteDialogOpen(true);
    setDeleteError(null);
  };

  // Hàm đóng dialog xác nhận xóa
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRoutineToDelete(null);
    setDeleteError(null);
  };

  // Hàm xử lý xóa quy trình chăm sóc da
  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await adminService.deleteSkincareRoutine(routineToDelete.id);
      
      // Cập nhật state sau khi xóa thành công
      const updatedRoutines = routines.filter(routine => routine.id !== routineToDelete.id);
      setRoutines(updatedRoutines);
      setOriginalRoutines(originalRoutines.filter(routine => routine.id !== routineToDelete.id));
      
      // Đóng dialog
      setDeleteDialogOpen(false);
      setRoutineToDelete(null);
      
      // Hiển thị thông báo thành công (có thể thêm toast notification ở đây)
      console.log('Xóa quy trình chăm sóc da thành công');
    } catch (error) {
      console.error('Lỗi khi xóa quy trình chăm sóc da:', error);
      setDeleteError(error.message || 'Đã xảy ra lỗi khi xóa quy trình chăm sóc da');
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
              placeholder="Tìm kiếm theo loại da, tiêu đề hoặc nội dung..." 
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
          <h1>Quy Trình Chăm Sóc Da</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {searchTerm && routines.length > 0 && (
              <div style={{ color: '#666', fontSize: '14px', alignSelf: 'center' }}>
                Tìm thấy: {routines.length} quy trình
              </div>
            )}
            <button 
              className="btn-create-payment"
              onClick={() => navigate("/Routine/Create")}
            >
              <FaPlus /> Tạo quy trình mới
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
                <th style={{ width: '150px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>LOẠI DA</th>
                <th style={{ width: '250px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TIÊU ĐỀ</th>
                <th style={{ width: '350px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NỘI DUNG</th>
                <th style={{ width: '200px', padding: '12px 8px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td 
                    colSpan="5" 
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
              ) : routines.length > 0 ? (
                getCurrentPageItems().map((routine, index) => (
                  <tr 
                    key={routine.id}
                    style={{ 
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                      transition: 'all 0.2s'
                    }}
                  >
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>{routine.skinType}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>{routine.title}</td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'left' }}>
                      <div style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {routine.content}
                      </div>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6', fontSize: '14px', textAlign: 'center' }}>
                      <button 
                        className="btn-view"
                        onClick={() => {
                          // Chuyển đổi loại da sang định dạng URL
                          let urlSkinType = '';
                          const skinType = routine.skinType.toLowerCase();
                          
                          if (skinType.includes('dầu') || skinType.includes('dau')) {
                            urlSkinType = 'da-dầu';
                          } else if (skinType.includes('khô') || skinType.includes('kho')) {
                            urlSkinType = 'da-khô';
                          } else if (skinType.includes('thường') || skinType.includes('thuong')) {
                            urlSkinType = 'da-thường';
                          } else if (skinType.includes('hỗn hợp') || skinType.includes('hon hop')) {
                            urlSkinType = 'da-hỗn-hợp';
                          } else if (skinType.includes('nhạy cảm') || skinType.includes('nhay cam')) {
                            urlSkinType = 'da-nhạy-cảm';
                          } else {
                            // Nếu không khớp với các loại da trên, chuyển đổi chung
                            urlSkinType = 'da-' + skinType.replace(/\s+/g, '-');
                          }
                          
                          navigate(`/quy-trinh-cham-soc/${urlSkinType}`, { 
                            state: { skinType: routine.skinType } 
                          });
                        }}
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
                        onClick={() => {
                          console.log('Đang chuyển hướng đến trang sửa quy trình:', `/Routine/Edit/${routine.id}`);
                          navigate(`/Routine/Edit/${routine.id}`);
                        }}
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
                        onClick={() => handleOpenDeleteDialog(routine)}
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
                    colSpan="5" 
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
        {routines.length > 0 && (
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

      {/* Dialog xác nhận xóa quy trình chăm sóc da */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa quy trình chăm sóc da</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa quy trình "{routineToDelete?.title}" không?
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
            onClick={handleDeleteRoutine} 
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

export default RoutineManager;
