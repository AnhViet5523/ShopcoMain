import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import { Box } from '@mui/material';
import adminService from '../../apis/adminService'; 
import userService from '../../apis/userService'; // Import userService
import './Manager.css';

const OrderStaff = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [orderItems, setOrderItems] = useState([]);
  const [searchKey, setSearchKey] = useState(''); 
  const [cancelledOrders, setCancelledOrders] = useState([]); // Thêm state để lưu trữ các đơn hàng bị hủy
  const [filterStatus, setFilterStatus] = useState(''); // Thêm state để lưu trạng thái lọc
  const [showFilterMenu, setShowFilterMenu] = useState(false); // Thêm state để hiển thị/ẩn menu lọc
  const navigate = useNavigate();

  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 15;
  
  // Tính toán các đơn hàng cho trang hiện tại
  const paginatedOrders = (orders) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return orders.slice(startIndex, endIndex);
  };

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

  const tabs = ['Tất cả', 'Đơn hàng vận chuyển', 'Đơn hàng bị hủy', 'Giao thành công'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await adminService.getAllOrders(); // Gọi API để lấy tất cả đơn hàng
        console.log('Response từ API:', response); // Log phản hồi từ API
        
        if (response && response.$values && Array.isArray(response.$values)) {
          setOrders(response.$values); // Lưu dữ liệu vào state orders

          // Fetch order items for each order
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

    fetchCancelledOrders();
  }, []);

  // Hàm để lấy tên người dùng
  const getUserName = async (userId) => {
    try {
      const user = await userService.getUserProfile(userId); // Sử dụng getUserProfile để lấy thông tin người dùng
      return user.name; // Giả sử tên người dùng nằm trong thuộc tính 'name'
    } catch (error) {
      console.error('Error fetching user name:', error);
      return 'Unknown'; // Trả về 'Unknown' nếu có lỗi
    }
  };

  // Hàm lọc đơn hàng theo trạng thái và từ khóa tìm kiếm
  const filteredOrders = () => {
    let filtered = orders;

    // Lọc theo trạng thái tab
    if (activeTab === 'Đơn hàng vận chuyển') {
      filtered = filtered.filter(order => order.orderStatus === 'Paid' && order.deliveryStatus === 'Not Delivered');
    } else if (activeTab === 'Đơn hàng bị hủy') {
      filtered = cancelledOrders;
    } else if (activeTab === 'Giao thành công') {
      filtered = filtered.filter(order => order.orderStatus === 'Completed');
    }

    // Lọc theo trạng thái đơn hàng từ filter menu
    if (filterStatus && filterStatus !== 'Tất cả') {
      filtered = filtered.filter(order => order.orderStatus === filterStatus);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchKey) {
      const lowerCaseSearchKey = searchKey.toLowerCase();
      filtered = filtered.filter(order => 
        order.userId.toString().includes(lowerCaseSearchKey) ||
        order.orderId.toString().includes(lowerCaseSearchKey) ||
        order.note?.toLowerCase().includes(lowerCaseSearchKey) ||
        order.orderStatus?.toLowerCase().includes(lowerCaseSearchKey) ||
        order.totalAmount.toString().includes(lowerCaseSearchKey) ||
        order.deliveryStatus?.toLowerCase().includes(lowerCaseSearchKey) ||
        order.deliveryAddress?.toLowerCase().includes(lowerCaseSearchKey) ||
        order.voucherId?.toString().includes(lowerCaseSearchKey) ||
        order.orderDate?.toLowerCase().includes(lowerCaseSearchKey)
      );
    }

    return filtered;
  };

  const handleClearSearch = () => {
    setSearchKey(''); // Xóa từ khóa tìm kiếm
  };

  const handleApproveCancellation = async (cancelRequestId) => {
    try {
      await adminService.approveCancellation(cancelRequestId);
      console.log('Cancellation approved:', cancelRequestId); // Thêm log
      
      // Cập nhật trạng thái trong danh sách đơn hàng bị hủy
      setCancelledOrders(prevOrders => 
        prevOrders.map(order => 
          order.cancelRequestId === cancelRequestId 
            ? { ...order, status: 'Approved' } 
            : order
        )
      );
      
      // Refresh the orders list
      const response = await adminService.getAllOrders(); // Gọi lại API để lấy danh sách đơn hàng
      setOrders(response.$values); // Cập nhật lại danh sách đơn hàng
    } catch (error) {
      console.error('Error approving cancellation:', error);
    }
  };

  const handleRejectCancellation = async (cancelRequestId) => {
    try {
      await adminService.rejectCancellation(cancelRequestId);
      console.log('Cancellation rejected:', cancelRequestId); // Thêm log
      
      // Cập nhật trạng thái trong danh sách đơn hàng bị hủy
      setCancelledOrders(prevOrders => 
        prevOrders.map(order => 
          order.cancelRequestId === cancelRequestId 
            ? { ...order, status: 'Rejected' } 
            : order
        )
      );
      
      // Refresh the orders list
      const response = await adminService.getAllOrders(); // Gọi lại API để lấy danh sách đơn hàng
      setOrders(response.$values); // Cập nhật lại danh sách đơn hàng
    } catch (error) {
      console.error('Error rejecting cancellation:', error);
    }
  };

  const isCancellationApproved = (order) => {
    return order.status === 'Approved';
  };

  const isCancellationRejected = (order) => {
    return order.status === 'Rejected';
  };

  const getSelectedOrder = (cancelRequestId) => {
    return cancelledOrders.find(order => order.cancelRequestId === cancelRequestId);
  };

  const handleDelivered = async (orderId) => {
    try {
      await adminService.markOrderAsDelivered(orderId);
      console.log('Order marked as delivered:', orderId); // Thêm log
      // Refresh the orders list
      const response = await adminService.getAllOrders();
      console.log('Updated orders:', response.$values); // Thêm log
      setOrders(response.$values);
    } catch (error) {
      console.error('Error marking order as delivered:', error);
    }
  };

  // Function to toggle filter menu and handle status selection
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
    setShowFilterMenu(false);
  };

  // Function to count orders by status
  const getOrderCountByStatus = (status) => {
    if (!orders || !orders.length) return 0;
    
    if (status === '') {
      return orders.length; // Total count for "Tất cả"
    } else {
      return orders.filter(order => order.orderStatus === status).length;
    }
  };

  // Get count of cancelled orders
  const getCancelledOrdersCount = () => {
    return cancelledOrders?.length || 0;
  };

  // Cập nhật hàm handlePageChange để giống với Product.jsx
  const handlePageChange = (newPage) => {
    // Đảm bảo newPage trong phạm vi hợp lệ
    if (newPage >= 1 && newPage <= Math.ceil(filteredOrders().length / pageSize)) {
      setPage(newPage);
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
                placeholder="Tìm kiếm theo UserID, OrderID, Note, OrderStatus, TotalAmount, DeliveryStatus, DeliveryAddress..." 
                value={searchKey} 
                onChange={(e) => setSearchKey(e.target.value)} // Cập nhật state khi người dùng nhập
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
              {searchKey && (
                <button
                  onClick={handleClearSearch}
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
          
          {/* Dashboard Title Bar */}
          <div className="dashboard-title-bar">
            <h1>Đơn Hàng</h1>
            <div className="dashboard-actions">
              <div style={{ position: 'relative' }}>
                <button
                  onClick={toggleFilterMenu}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#495057'
                  }}
                >
                  <FaFilter />
                  <span>Lọc: {filterStatus || 'Tất cả'}</span>
                  {filterStatus && (
                    <span style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      marginLeft: '5px'
                    }}>
                      {filterStatus === '' 
                        ? getOrderCountByStatus('') 
                        : filterStatus === 'Cancelled' 
                          ? getCancelledOrdersCount() 
                          : getOrderCountByStatus(filterStatus)
                      }
                    </span>
                  )}
                </button>
                
                {showFilterMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    borderRadius: '5px',
                    zIndex: 10,
                    width: '200px',
                    marginTop: '5px'
                  }}>
                    <div 
                      style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: filterStatus === '' ? '#f0f0f0' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleFilterStatusChange('')}
                    >
                      <span>Tất cả</span>
                      <span style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        {getOrderCountByStatus('')}
                      </span>
                    </div>
                    <div 
                      style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: filterStatus === 'Completed' ? '#f0f0f0' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleFilterStatusChange('Completed')}
                    >
                      <span>Completed</span>
                      <span style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        {getOrderCountByStatus('Completed')}
                      </span>
                    </div>
                    <div 
                      style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: filterStatus === 'Pending' ? '#f0f0f0' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleFilterStatusChange('Pending')}
                    >
                      <span>Pending</span>
                      <span style={{
                        backgroundColor: '#ffc107',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        {getOrderCountByStatus('Pending')}
                      </span>
                    </div>
                    <div 
                      style={{
                        padding: '10px 15px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: filterStatus === 'Paid' ? '#f0f0f0' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleFilterStatusChange('Paid')}
                    >
                      <span>Paid</span>
                      <span style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        {getOrderCountByStatus('Paid')}
                      </span>
                    </div>
                    <div 
                      style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        backgroundColor: filterStatus === 'Cancelled' ? '#f0f0f0' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleFilterStatusChange('Cancelled')}
                    >
                      <span>Cancelled</span>
                      <span style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        {getCancelledOrdersCount()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <div 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          
          {/* Table */}
          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  {activeTab === 'Đơn hàng bị hủy' ? (
                    <>
                      <th>ID</th>
                      <th>ID ĐƠN HÀNG</th>
                      <th>TÊN ĐẦY ĐỦ</th>
                      <th>SỐ ĐIỆN THOẠI</th>
                      <th>LÝ DO</th>
                      <th>NGÀY YÊU CẦU</th>
                      <th>TRẠNG THÁI</th>
                      <th>HÀNH ĐỘNG</th>
                    </>
                  ) : activeTab === 'Đơn hàng vận chuyển' ? (
                    <>
                      <th>ID ĐƠN HÀNG</th>
                      <th>ID NGƯỜI DÙNG</th>
                      <th>TÊN SẢN PHẨM</th>
                      <th>GIÁ</th>
                      <th>SỐ LƯỢNG</th>
                      <th>MÃ GIẢM GIÁ</th>
                      <th>TỔNG TIỀN</th>
                      <th>NGÀY ĐẶT HÀNG</th>
                      <th>TÌNH TRẠNG ĐƠN HÀNG</th>
                      <th>TÌNH TRẠNG GIAO HÀNG</th>
                      <th>ĐỊA CHỈ</th>          
                      <th>GHI CHÚ</th>
                      <th>HÀNH ĐỘNG</th>
                    </>
                  ) : (
                    <>
                      <th>ID ĐƠN HÀNG</th>
                      <th>ID NGƯỜI DÙNG</th>
                      <th>TÊN SẢN PHẨM</th>
                      <th>GIÁ</th>
                      <th>SỐ LƯỢNG</th>
                      <th>MÃ GIẢM GIÁ</th>
                      <th>TỔNG TIỀN</th>
                      <th>NGÀY ĐẶT HÀNG</th>
                      <th>TÌNH TRẠNG ĐƠN HÀNG</th>
                      <th>TÌNH TRẠNG GIAO HÀNG</th>
                      <th>ĐỊA CHỈ</th>          
                      <th>GHI CHÚ</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'Đơn hàng vận chuyển' || activeTab === 'Đơn hàng bị hủy' ? "13" : "12"} className="empty-data-message">
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders().length > 0 ? (
                  paginatedOrders(filteredOrders()).map((order, index) => (
                    activeTab === 'Đơn hàng bị hủy' ? (
                      <tr key={order.cancelRequestId}>
                        <td>{order.cancelRequestId}</td>
                        <td>{order.orderId}</td>
                        <td>{order.fullName}</td>
                        <td>{order.phone}</td>
                        <td>{order.reason}</td>
                        <td>{order.requestDate}</td>
                        <td>{order.status}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                              onClick={() => handleApproveCancellation(order.cancelRequestId)}
                              disabled={isCancellationApproved(order) || isCancellationRejected(order)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: isCancellationApproved(order) || isCancellationRejected(order) ? '#6c757d' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isCancellationApproved(order) || isCancellationRejected(order) ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                flex: '1',
                                marginRight: '5px',
                              }}
                            >
                              Đồng ý
                            </button>
                            <button
                              onClick={() => handleRejectCancellation(order.cancelRequestId)}
                              disabled={isCancellationApproved(order) || isCancellationRejected(order)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: isCancellationApproved(order) || isCancellationRejected(order) ? '#6c757d' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isCancellationApproved(order) || isCancellationRejected(order) ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                flex: '1',
                                marginLeft: '5px',
                              }}
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.userId}</td>
                        <td>{order.items?.$values.map(item => item.productName).join(', ')}</td>
                        <td>{order.items?.$values.map(item => item.price).join(', ')}</td>
                        <td>{order.items?.$values.map(item => item.quantity).join(', ')}</td>
                        <td>{order.voucherId}</td>
                        <td>{order.totalAmount}</td>
                        <td>{order.orderDate}</td>
                        <td>{order.orderStatus}</td>
                        <td>{order.deliveryStatus}</td>
                        <td>{order.deliveryAddress}</td>
                        <td>{order.note}</td>
                        {activeTab === 'Đơn hàng vận chuyển' && (
                          <td>
                            <button
                              onClick={() => handleDelivered(order.orderId)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                            >
                              Đã giao
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeTab === 'Đơn hàng vận chuyển' || activeTab === 'Đơn hàng bị hủy' ? "13" : "12"} className="empty-data-message">
                      Chưa có đơn hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredOrders().length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    color: page === 1 ? '#ccc' : '#000',
                    borderRadius: '4px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  &lt;
                </button>
                
                {Array.from({ length: Math.ceil(filteredOrders().length / pageSize) }).map((_, i) => {
                  const pageNumber = i + 1;
                  // Hiển thị trang 1, trang hiện tại và các trang xung quanh trang hiện tại, và trang cuối
                  const shouldShowPage = 
                    pageNumber === 1 || 
                    pageNumber === Math.ceil(filteredOrders().length / pageSize) ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1);
                  
                  // Hiển thị dấu ... sau trang 1 nếu trang hiện tại > 3
                  const showEllipsisBegin = pageNumber === 2 && page > 3;
                  
                  // Hiển thị dấu ... trước trang cuối nếu trang hiện tại < tổng trang - 2
                  const showEllipsisEnd = pageNumber === Math.ceil(filteredOrders().length / pageSize) - 1 && 
                                         page < Math.ceil(filteredOrders().length / pageSize) - 2;
                  
                  if (shouldShowPage) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: page === pageNumber ? 'none' : '1px solid #ddd',
                          backgroundColor: page === pageNumber ? '#000' : 'white',
                          color: page === pageNumber ? 'white' : 'black',
                          borderRadius: '50%',
                          margin: '0 5px',
                          cursor: 'pointer'
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (showEllipsisBegin || showEllipsisEnd) {
                    return (
                      <span key={`ellipsis-${pageNumber}`} style={{ margin: '0 5px' }}>...</span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === Math.ceil(filteredOrders().length / pageSize)}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    color: page === Math.ceil(filteredOrders().length / pageSize) ? '#ccc' : '#000',
                    borderRadius: '4px',
                    cursor: page === Math.ceil(filteredOrders().length / pageSize) ? 'not-allowed' : 'pointer'
                  }}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Box>
  );
};

export default OrderStaff;
