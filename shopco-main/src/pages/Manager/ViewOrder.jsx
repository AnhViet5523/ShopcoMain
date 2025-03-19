import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter } from 'react-icons/fa';
import { Box } from '@mui/material';
import adminService from '../../apis/adminService'; 
import userService from '../../apis/userService'; // Import userService
import './Manager.css';

const ViewOrder = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [orderItems, setOrderItems] = useState([]);
  const [searchKey, setSearchKey] = useState(''); 
  const [cancelledOrders, setCancelledOrders] = useState([]); // Thêm state để lưu trữ các đơn hàng bị hủy
  const navigate = useNavigate();

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

  const tabs = ['Tất cả', 'Đơn hàng đang vận chuyển', 'Đơn hàng bị hủy', 'Giao thành công'];

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

    // Lọc theo trạng thái
    if (activeTab === 'Đơn hàng đang vận chuyển') {
      filtered = filtered.filter(order => order.orderStatus === 'Paid' && order.deliveryStatus === 'Not Delivered');
    } else if (activeTab === 'Đơn hàng bị hủy') {
      filtered = cancelledOrders;
    } else if (activeTab === 'Giao thành công') {
      filtered = filtered.filter(order => order.orderStatus === 'Completed');
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

    return filtered; // Trả về danh sách đơn hàng đã lọc
  };

  const handleClearSearch = () => {
    setSearchKey(''); // Xóa từ khóa tìm kiếm
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
          
          {/* Dashboard Title Bar - Giống ViewSupport.jsx */}
          <div className="dashboard-title-bar">
            <h1>Đơn Hàng</h1>
            <div className="dashboard-actions">
              <button
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
                <span>Lọc</span>
              </button>
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
                  ) : activeTab === 'Đơn hàng đang vận chuyển' ? (
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
                      <th>THAO TÁC</th>
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
                    <td colSpan={activeTab === 'Đơn hàng đang vận chuyển' ? "13" : "12"} className="empty-data-message">
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders().length > 0 ? (
                  filteredOrders().map((order, index) => (
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
                        {activeTab === 'Đơn hàng đang vận chuyển' && (
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
                    <td colSpan={activeTab === 'Đơn hàng đang vận chuyển' ? "13" : "12"} className="empty-data-message">
                      Chưa có đơn hàng nào.
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

export default ViewOrder;
