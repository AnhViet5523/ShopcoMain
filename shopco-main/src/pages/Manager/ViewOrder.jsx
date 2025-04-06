import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Pagination, Card, Typography, Container, TextField, Button, 
  Chip, Badge, Tabs, Tab, CircularProgress, Grid, Divider, IconButton, Dialog, 
  DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RefreshIcon from '@mui/icons-material/Refresh';
import adminService from '../../apis/adminService'; 
import userService from '../../apis/userService';
import orderService from '../../apis/orderService';
import './Manager.css';

/**
 * Component ViewOrder - Quản lý và hiển thị danh sách đơn hàng cho quản lý
 * Cho phép xem, tìm kiếm, lọc và cập nhật trạng thái đơn hàng
 */
const ViewOrder = () => {
  // State quản lý tab đang được chọn (Tất cả, Đơn hàng vận chuyển, Đơn hàng bị hủy, Giao thành công)
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  // State quản lý mục đang được chọn trong sidebar
  const [activeItem, setActiveItem] = useState('viewOrder');
  
  // State lưu trữ danh sách tất cả đơn hàng
  const [orders, setOrders] = useState([]); 
  
  // State quản lý trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(true); 
  
  // State lưu trữ danh sách các mặt hàng trong đơn hàng
  const [orderItems, setOrderItems] = useState([]);
  
  // State lưu trữ từ khóa tìm kiếm
  const [searchKey, setSearchKey] = useState(''); 
  
  // State lưu trữ danh sách đơn hàng bị hủy
  const [cancelledOrders, setCancelledOrders] = useState([]);
  
  // State quản lý trang hiện tại cho phân trang
  const [page, setPage] = useState(1);
  
  // Số lượng đơn hàng hiển thị trên mỗi trang
  const pageSize = 15;
  
  // State lưu trữ ID đơn hàng cuối cùng được đánh dấu đã giao
  const [lastDeliveredOrderId, setLastDeliveredOrderId] = useState(null);
  
  // State quản lý trạng thái đang làm mới dữ liệu
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State lưu trữ ID đơn hàng đang xem chi tiết
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // State quản lý trạng thái hiển thị dialog chi tiết
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // State lưu trữ thông tin chi tiết đơn hàng
  const [orderDetail, setOrderDetail] = useState(null);
  
  // State quản lý trạng thái đang tải chi tiết đơn hàng
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Hook điều hướng trang
  const navigate = useNavigate();

  /**
   * Hàm tính toán các đơn hàng cho trang hiện tại
   * @param {Array} orders - Danh sách đơn hàng cần phân trang
   * @returns {Array} - Danh sách đơn hàng đã được phân trang
   */
  const paginatedOrders = (orders) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  };

  // Danh sách các mục trong sidebar
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

  // Danh sách các tab
  const tabs = ['Tất cả', 'Đơn hàng vận chuyển', 'Đơn hàng bị hủy', 'Giao thành công'];

  /**
   * Effect hook để tải dữ liệu khi component được mount hoặc khi lastDeliveredOrderId thay đổi
   */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllOrders();
        console.log('Response từ API:', response);
        if (response && response.$values && Array.isArray(response.$values)) {
          setOrders(response.$values);
          const itemsPromises = response.$values.map(order => orderService.getOrderItems(order.orderId));
          const allOrderItems = await Promise.all(itemsPromises);
          setOrderItems(allOrderItems);
        } else {
          console.error('Dữ liệu trả về không đúng định dạng:', response);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCancelledOrders = async () => {
      try {
        const response = await adminService.getCancelledOrders();
        console.log('Response từ API cancelled orders:', response);
        if (response && response.$values && Array.isArray(response.$values)) {
          setCancelledOrders(response.$values);
        } else {
          console.error('Dữ liệu trả về không đúng định dạng:', response);
        }
      } catch (error) {
        console.error('Error fetching cancelled orders:', error);
      }
    };

    fetchOrders();
    fetchCancelledOrders();
  }, [lastDeliveredOrderId]);

  /**
   * Hàm lấy tên người dùng dựa trên ID
   * @param {string} userId - ID của người dùng cần lấy thông tin
   * @returns {string} - Tên của người dùng
   */
  const getUserName = async (userId) => {
    try {
      const user = await userService.getUserProfile(userId);
      return user.name;
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Unknown User';
    }
  };

  /**
   * Hàm định dạng ngày tháng
   * @param {string} dateString - Chuỗi ngày tháng cần định dạng
   * @returns {string} - Chuỗi ngày tháng đã được định dạng
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Định dạng ngày tháng theo định dạng Việt Nam: DD/MM/YYYY HH:MM
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  /**
   * Hàm lọc đơn hàng theo tab và từ khóa tìm kiếm
   * @returns {Array} - Danh sách đơn hàng đã được lọc
   */
  const filteredOrders = () => {
    let filteredList = [];
    
    // Xử lý lọc theo tab
    if (activeTab === 'Tất cả') {
      filteredList = orders;
      // Sắp xếp đơn hàng mới nhất lên đầu danh sách
      filteredList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } else if (activeTab === 'Đơn hàng vận chuyển') {
      filteredList = orders.filter(order => 
        (order.deliveryStatus === 'Shipping' || order.orderStatus === 'Paid') && 
        order.orderStatus !== 'Cancelled'
      );
      // Sắp xếp đơn hàng mới nhất lên đầu danh sách
      filteredList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    } else if (activeTab === 'Đơn hàng bị hủy') {
      filteredList = orders;
    } else if (activeTab === 'Giao thành công') {
      filteredList = orders.filter(order => 
        order.deliveryStatus === 'Delivered' && 
        order.orderStatus !== 'Cancelled'
      );
      
      // Sắp xếp đơn hàng đã giao theo thời gian cập nhật mới nhất (nếu có) hoặc theo thời gian đặt hàng
      filteredList.sort((a, b) => {
        // Nếu có lastUpdated, sử dụng nó để sắp xếp
        if (a.lastUpdated && b.lastUpdated) {
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
        // Nếu không có lastUpdated, sử dụng orderDate
        return new Date(b.orderDate) - new Date(a.orderDate);
      });
    }
    
    // Nếu không có từ khóa tìm kiếm, trả về danh sách đã lọc theo tab
    if (!searchKey.trim()) {
      return filteredList;
    }
    
    // Xử lý tìm kiếm với từ khóa
    const searchTerm = searchKey.toLowerCase().trim();
    
    // Hàm kiểm tra nếu một giá trị chứa từ khóa tìm kiếm
    const containsSearchTerm = (value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchTerm);
    };

    // Hàm kiểm tra nếu một ngày chứa từ khóa tìm kiếm
    const dateContainsSearchTerm = (dateString) => {
      if (!dateString) return false;
      
      try {
        // Chuyển đổi chuỗi ngày thành đối tượng Date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return false;
        
        // Định dạng ngày thành các chuỗi khác nhau để so sánh
        const formats = [
          date.toLocaleDateString('vi-VN'), // VD: 04/04/2025
          date.toLocaleDateString('en-US'), // VD: 4/4/2025
          `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`, // VD: 4/4/2025
          `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`, // VD: 4-4-2025
          `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` // VD: 2025-4-4
        ];
        
        return formats.some(format => format.includes(searchTerm));
      } catch (error) {
        return false;
      }
    };
    
    return filteredList.filter(order => {
      // Tìm kiếm trong các thuộc tính cơ bản của đơn hàng
      const basicMatch = 
        containsSearchTerm(order.orderId) ||
        containsSearchTerm(order.orderStatus) ||
        containsSearchTerm(order.deliveryStatus) ||
        containsSearchTerm(order.deliveryAddress) ||
        containsSearchTerm(order.note) ||
        containsSearchTerm(order.voucherId) ||
        containsSearchTerm(order.paymentMethod) ||
        containsSearchTerm(order.name) || // Tên người nhận
        containsSearchTerm(order.phoneNumber) || // Số điện thoại
        dateContainsSearchTerm(order.orderDate); // Ngày đặt hàng
      
      if (basicMatch) return true;
      
      // Tìm kiếm trong thông tin thanh toán
      if (order.payment) {
        const paymentMatch = 
          containsSearchTerm(order.payment.paymentMethod) ||
          containsSearchTerm(order.payment.paymentStatus);
        
        if (paymentMatch) return true;
      }
      
      // Tìm kiếm trong danh sách sản phẩm của đơn hàng
      if (order.items) {
        // Xử lý cả hai trường hợp: items là mảng hoặc có cấu trúc $values
        const itemsArray = Array.isArray(order.items) 
          ? order.items 
          : (order.items.$values && Array.isArray(order.items.$values) ? order.items.$values : []);
        
        return itemsArray.some(item => 
          containsSearchTerm(item.productName) ||
          containsSearchTerm(item.price) ||
          containsSearchTerm(item.quantity)
        );
      }
      
      return false;
    });
  };

  /**
   * Hàm xử lý khi thay đổi trang
   * @param {object} event - Sự kiện thay đổi trang
   * @param {number} newPage - Số trang mới
   */
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  /**
   * Hàm xử lý khi xóa từ khóa tìm kiếm
   */
  const handleClearSearch = () => {
    setSearchKey('');
  };

  /**
   * Hàm xử lý khi chấp nhận yêu cầu hủy đơn hàng
   * @param {string} cancelRequestId - ID của yêu cầu hủy đơn hàng
   */
  const handleApproveCancellation = async (cancelRequestId) => {
    try {
      await adminService.approveCancelRequest(cancelRequestId);
      // Cập nhật lại danh sách đơn hàng bị hủy sau khi chấp nhận
      const updatedCancelledOrders = await adminService.getCancelledOrders();
      if (updatedCancelledOrders && updatedCancelledOrders.$values) {
        setCancelledOrders(updatedCancelledOrders.$values);
      }
      // Cập nhật lại danh sách tất cả đơn hàng
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const response = await adminService.getAllOrders();
          console.log('Response từ API:', response);
          if (response && response.$values && Array.isArray(response.$values)) {
            setOrders(response.$values);
            const itemsPromises = response.$values.map(order => orderService.getOrderItems(order.orderId));
            const allOrderItems = await Promise.all(itemsPromises);
            setOrderItems(allOrderItems);
          } else {
            console.error('Dữ liệu trả về không đúng định dạng:', response);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } catch (error) {
      console.error('Error approving cancellation:', error);
    }
  };

  /**
   * Hàm xử lý khi từ chối yêu cầu hủy đơn hàng
   * @param {string} cancelRequestId - ID của yêu cầu hủy đơn hàng
   */
  const handleRejectCancellation = async (cancelRequestId) => {
    try {
      await adminService.rejectCancelRequest(cancelRequestId);
      // Cập nhật lại danh sách đơn hàng bị hủy sau khi từ chối
      const updatedCancelledOrders = await adminService.getCancelledOrders();
      if (updatedCancelledOrders && updatedCancelledOrders.$values) {
        setCancelledOrders(updatedCancelledOrders.$values);
      }
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
    }
  };

  /**
   * Hàm kiểm tra xem yêu cầu hủy đơn hàng đã được chấp nhận chưa
   * @param {object} order - Đơn hàng cần kiểm tra
   * @returns {boolean} - true nếu đã được chấp nhận, false nếu chưa
   */
  const isCancellationApproved = (order) => order.status === 'Approved';

  /**
   * Hàm kiểm tra xem yêu cầu hủy đơn hàng đã bị từ chối chưa
   * @param {object} order - Đơn hàng cần kiểm tra
   * @returns {boolean} - true nếu đã bị từ chối, false nếu chưa
   */
  const isCancellationRejected = (order) => order.status === 'Rejected';

  /**
   * Hàm xử lý khi đánh dấu đơn hàng đã giao
   * @param {string} orderId - ID của đơn hàng
   */
  const handleDelivered = async (orderId) => {
    try {
      // Gọi API để cập nhật trạng thái đơn hàng thành "Đã giao"
      const response = await adminService.markOrderAsDelivered(orderId);
      
      if (response) {
        // Cập nhật ID đơn hàng cuối cùng được đánh dấu đã giao
        setLastDeliveredOrderId(orderId);
        
        // Cập nhật lại danh sách đơn hàng
        const updatedOrders = orders.map(order => {
          if (order.orderId === orderId) {
            return {
              ...order,
              deliveryStatus: 'Delivered',
              orderStatus: 'Completed'
            };
          }
          return order;
        });
        
        setOrders(updatedOrders);
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  /**
   * Hàm lấy số lượng đơn hàng theo từng tab
   * @param {string} tabName - Tên tab cần lấy số lượng
   * @returns {number} - Số lượng đơn hàng
   */
  const getOrderCount = (tabName) => {
    if (tabName === 'Tất cả') {
      return orders.length;
    } else if (tabName === 'Đơn hàng vận chuyển') {
      return orders.filter(order => (order.deliveryStatus === 'Shipping' || order.orderStatus === 'Paid') && order.orderStatus !== 'Cancelled').length;
    } else if (tabName === 'Đơn hàng bị hủy') {
      return orders.filter(order => order.orderStatus === 'Cancelled' || order.orderStatus === 'Cancelling').length;
    } else if (tabName === 'Giao thành công') {
      return orders.filter(order => order.deliveryStatus === 'Delivered' && order.orderStatus !== 'Cancelled').length;
    }
    return 0;
  };

  /**
   * Hàm chuyển đổi từ tab dạng text sang index cho Material UI Tabs
   * @returns {number} - Index của tab
   */
  const getTabIndex = () => {
    return tabs.indexOf(activeTab);
  };

  /**
   * Hàm xử lý khi thay đổi tab
   * @param {object} event - Sự kiện thay đổi tab
   * @param {number} newValue - Index của tab mới
   */
  const handleTabChange = (event, newValue) => {
    setActiveTab(tabs[newValue]);
  };

  /**
   * Hàm xử lý khi mở dialog chi tiết đơn hàng
   * @param {number} orderId - ID của đơn hàng cần xem chi tiết
   */
  const handleOpenDetail = async (orderId) => {
    try {
      setSelectedOrderId(orderId);
      setOpenDetailDialog(true);
      setLoadingDetail(true);
      
      // Gọi API để lấy thông tin chi tiết đơn hàng
      const response = await orderService.getOrderById(orderId);
      setOrderDetail(response);
      console.log("Chi tiết đơn hàng:", response);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      // toast.error("Không thể lấy thông tin chi tiết đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoadingDetail(false);
    }
  };

  /**
   * Hàm xử lý khi đóng dialog chi tiết đơn hàng
   */
  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setOrderDetail(null);
  };

  /**
   * Hàm lấy đơn hàng theo ID
   * @param {number} orderId - ID của đơn hàng cần lấy thông tin
   * @returns {object} - Thông tin đơn hàng
   */
  const getOrderById = (orderId) => {
    return orders.find(order => order.orderId === orderId) || null;
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", width: '100vw' }}>
      <div className="manager-container">
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo" style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => navigate("/")}>
              <img 
                src="/images/logo.png" 
                alt="Beauty Cosmetics"
                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }}
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
              <div 
                key={item.id} 
                className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} 
                onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} 
                style={{ cursor: 'pointer' }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="main-content">
          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Card elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center' }}>
                Quản lý Đơn Hàng
                {isRefreshing ? (
                  <CircularProgress size={24} sx={{ ml: 2 }} />
                ) : (
                  <IconButton 
                    color="primary" 
                    onClick={async () => {
                      setIsRefreshing(true);
                      const fetchOrders = async () => {
                        try {
                          setLoading(true);
                          const response = await adminService.getAllOrders();
                          console.log('Response từ API:', response);
                          if (response && response.$values && Array.isArray(response.$values)) {
                            setOrders(response.$values);
                            const itemsPromises = response.$values.map(order => orderService.getOrderItems(order.orderId));
                            const allOrderItems = await Promise.all(itemsPromises);
                            setOrderItems(allOrderItems);
                          } else {
                            console.error('Dữ liệu trả về không đúng định dạng:', response);
                          }
                        } catch (error) {
                          console.error('Error fetching orders:', error);
                        } finally {
                          setLoading(false);
                        }
                      };
                      fetchOrders();
                      setIsRefreshing(false);
                    }} 
                    sx={{ ml: 1 }}
                    title="Làm mới dữ liệu"
                  >
                    <RefreshIcon />
                  </IconButton>
                )}
              </Typography>
              
              <Box sx={{ mt: 3, mb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Tìm kiếm đơn hàng (ID, người dùng, trạng thái, địa chỉ...)"
                      variant="outlined"
                      value={searchKey}
                      onChange={(e) => setSearchKey(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        endAdornment: searchKey ? (
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        ) : null,
                        sx: { borderRadius: 2, backgroundColor: '#f9f9f9' }
                      }}
                    />
                  </Grid>

                </Grid>
              </Box>
            </Card>
            
            <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={getTabIndex()} 
                  onChange={handleTabChange} 
                  variant="fullWidth"
                  sx={{ px: 2, pt: 1 }}
                >
                  {tabs.map((tab, index) => (
                    <Tab 
                      key={index} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {tab}
                          <Badge 
                            color={tab === activeTab ? "error" : "default"}
                            badgeContent={getOrderCount(tab)} 
                            max={999}
                            sx={{ 
                              ml: 1.5,
                              '& .MuiBadge-badge': {
                                marginLeft: '8px',
                                marginRight: '-8px',
                                backgroundColor: tab === activeTab ? '#f44336' : '#757575',
                                color: 'white',
                                fontWeight: 'bold',
                                padding: '0 6px',
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '10px'
                              }
                            }}
                          />
                        </Box>
                      } 
                      sx={{ 
                        fontWeight: activeTab === tab ? 'bold' : 'normal',
                        textTransform: 'none',
                        fontSize: '0.95rem'
                      }}
                      icon={
                        tab === 'Đơn hàng vận chuyển' ? <LocalShippingIcon fontSize="small" /> :
                        tab === 'Giao thành công' ? <CheckCircleIcon fontSize="small" /> :
                        tab === 'Đơn hàng bị hủy' ? <CancelIcon fontSize="small" /> :
                        null
                      }
                      iconPosition="start"
                    />
                  ))}
                </Tabs>
              </Box>
              
              <Box sx={{ p: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Đang tải dữ liệu đơn hàng...</Typography>
                  </Box>
                ) : (
                  <div className="dashboard-table-container">
                    <div className="dashboard-table">
                      <table>
                        <thead>
                          <tr>
                            {activeTab === 'Đơn hàng bị hủy' ? (
                              <>
                                <th>ID ĐƠN HÀNG</th>
                                <th>TÊN NGƯỜI NHẬN</th>
                                <th>SỐ ĐIỆN THOẠI</th>
                                <th>TÊN SẢN PHẨM</th>
                                <th>TỔNG TIỀN</th>
                                <th>NGÀY ĐẶT HÀNG</th>
                                <th>ĐỊA CHỈ</th>
                                <th>HÀNH ĐỘNG</th>
                              </>
                            ) : activeTab === 'Đơn hàng vận chuyển' ? (
                              <>
                                <th>ID ĐƠN HÀNG</th>
                                <th>TÊN NGƯỜI NHẬN</th>
                                <th>SỐ ĐIỆN THOẠI</th>
                                <th>TÊN SẢN PHẨM</th>
                                <th>TỔNG TIỀN</th>
                                <th>NGÀY ĐẶT HÀNG</th>
                                <th>ĐỊA CHỈ</th>
                                <th>HÀNH ĐỘNG</th>
                              </>
                            ) : (
                              <>
                                <th>ID ĐƠN HÀNG</th>
                                <th>TÊN NGƯỜI NHẬN</th>
                                <th>SỐ ĐIỆN THOẠI</th>
                                <th>TÊN SẢN PHẨM</th>
                                <th>TỔNG TIỀN</th>
                                <th>NGÀY ĐẶT HÀNG</th>
                                <th>ĐỊA CHỈ</th>
                                <th>HÀNH ĐỘNG</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders().length > 0 ? (
                            paginatedOrders(filteredOrders()).map((order) => (
                              activeTab === 'Đơn hàng bị hủy' ? (
                                <tr key={order.orderId}>
                                  <td>{order.orderId}</td>
                                  <td>{order.name || '-'}</td>
                                  <td>{order.phoneNumber || '-'}</td>
                                  <td className="product-name-cell">{order.items?.$values ? order.items.$values.map(item => item.productName).join(', ') : (Array.isArray(order.items) ? order.items.map(item => item.productName).join(', ') : '-')}</td>
                                  <td>
                                    <strong>{order.totalAmount?.toLocaleString('vi-VN')} đ</strong>
                                  </td>
                                  <td>{formatDate(order.orderDate)}</td>
                                  <td className="address-cell">{order.deliveryAddress}</td>
                                  <td>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOpenDetail(order.orderId)}
                                      >
                                        Chi tiết
                                      </Button>
                                      {order.orderStatus === 'Cancelling' && (
                                        <>
                                          <Chip
                                            label="Đang chờ xác nhận hủy"
                                            size="small"
                                            color="warning"
                                            sx={{ fontSize: '0.7rem' }}
                                          />
                                          <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleApproveCancellation(order.cancelRequest?.cancelRequestId)}
                                            startIcon={<CheckCircleIcon />}
                                            sx={{ 
                                              fontSize: '0.75rem',
                                              ml: 1
                                            }}
                                          >
                                            Đồng ý
                                          </Button>
                                          <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleRejectCancellation(order.cancelRequest?.cancelRequestId)}
                                            startIcon={<CancelIcon />}
                                            sx={{ fontSize: '0.75rem' }}
                                          >
                                            Từ chối
                                          </Button>
                                        </>
                                      )}
                                    </Box>
                                  </td>
                                </tr>
                              ) : (
                                <tr key={order.orderId}>
                                  <td>{order.orderId}</td>
                                  <td>{order.name || '-'}</td>
                                  <td>{order.phoneNumber || '-'}</td>
                                  <td className="product-name-cell">{order.items?.$values ? order.items.$values.map(item => item.productName).join(', ') : (Array.isArray(order.items) ? order.items.map(item => item.productName).join(', ') : '-')}</td>
                                  <td>
                                    <strong>{order.totalAmount?.toLocaleString('vi-VN')} đ</strong>
                                  </td>
                                  <td>{formatDate(order.orderDate)}</td>
                                  <td className="address-cell">{order.deliveryAddress}</td>
                                  <td>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOpenDetail(order.orderId)}
                                      >
                                        Chi tiết
                                      </Button>
                                      {activeTab === 'Đơn hàng vận chuyển' && (
                                        <Button
                                          variant="contained"
                                          color="success"
                                          size="small"
                                          onClick={() => handleDelivered(order.orderId)}
                                          startIcon={<CheckCircleIcon />}
                                          sx={{ 
                                            fontSize: '0.75rem',
                                            textTransform: 'none',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            '&:hover': {
                                              boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                            }
                                          }}
                                        >
                                          Đã giao
                                        </Button>
                                      )}
                                    </Box>
                                  </td>
                                </tr>
                              )
                            ))
                          ) : (
                            <tr>
                              <td colSpan={activeTab === 'Đơn hàng vận chuyển' ? "8" : "8"} className="empty-data-message">
                                Chưa có đơn hàng nào.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Box>
            </Card>

            {filteredOrders().length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 3,
                mb: 3
              }}>
                <Pagination 
                  count={Math.ceil(filteredOrders().length / pageSize)} 
                  page={page} 
                  onChange={handlePageChange} 
                  variant="outlined" 
                  color="primary" 
                  showFirstButton 
                  showLastButton
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 'medium',
                      mx: 0.5
                    }
                  }}
                />
              </Box>
            )}
          </Container>
        </div>
      </div>

      {/* Dialog hiển thị chi tiết đơn hàng */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết đơn hàng #{selectedOrderId}
          <IconButton
            aria-label="close"
            onClick={handleCloseDetail}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <ClearIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : orderDetail ? (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Thông tin đơn hàng</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" width="40%">ID đơn hàng</TableCell>
                          <TableCell>{orderDetail.orderId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Trạng thái đơn hàng</TableCell>
                          <TableCell>
                            <Chip 
                              label={orderDetail.orderStatus}
                              color={
                                orderDetail.orderStatus === 'Completed' ? 'success' :
                                orderDetail.orderStatus === 'Cancelled' ? 'error' :
                                orderDetail.orderStatus === 'Paid' ? 'info' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Trạng thái giao hàng</TableCell>
                          <TableCell>
                            <Chip 
                              label={orderDetail.deliveryStatus}
                              color={
                                orderDetail.deliveryStatus === 'Delivered' ? 'success' : 'warning'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Ngày đặt hàng</TableCell>
                          <TableCell>{formatDate(orderDetail.orderDate)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Phương thức thanh toán</TableCell>
                          <TableCell>{orderDetail.paymentMethod || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Mã giảm giá</TableCell>
                          <TableCell>{orderDetail.voucherId || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Ghi chú</TableCell>
                          <TableCell>{orderDetail.note || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Thông tin người nhận</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" width="40%">Tên người nhận</TableCell>
                          <TableCell>{orderDetail.name || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Số điện thoại</TableCell>
                          <TableCell>{orderDetail.phoneNumber || '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th">Địa chỉ giao hàng</TableCell>
                          <TableCell>{orderDetail.deliveryAddress || '-'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Chi tiết sản phẩm</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tên sản phẩm</TableCell>
                          <TableCell align="right">Giá</TableCell>
                          <TableCell align="right">Số lượng</TableCell>
                          <TableCell align="right">Thành tiền</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderDetail.items && Array.isArray(orderDetail.items) 
                          ? orderDetail.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product ? item.product.productName : 'Sản phẩm không xác định'}</TableCell>
                              <TableCell align="right">{item.price.toLocaleString('vi-VN')} đ</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</TableCell>
                            </TableRow>
                          ))
                          : orderDetail.items && orderDetail.items.$values 
                            ? orderDetail.items.$values.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.productName || (item.product ? item.product.productName : 'Sản phẩm không xác định')}</TableCell>
                                <TableCell align="right">{item.price.toLocaleString('vi-VN')} đ</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</TableCell>
                              </TableRow>
                            ))
                            : <TableRow><TableCell colSpan={4}>Không có thông tin sản phẩm</TableCell></TableRow>
                        }
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Tổng tiền:</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {orderDetail.totalAmount?.toLocaleString('vi-VN')} đ
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>Không tìm thấy thông tin đơn hàng</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} variant="outlined">
            Đóng
          </Button>
          {activeTab === 'Đơn hàng vận chuyển' && orderDetail && (
            <Button 
              onClick={() => {
                handleDelivered(selectedOrderId);
                handleCloseDetail();
              }} 
              variant="contained" 
              color="success"
              startIcon={<CheckCircleIcon />}
            >
              Đánh dấu đã giao
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewOrder;