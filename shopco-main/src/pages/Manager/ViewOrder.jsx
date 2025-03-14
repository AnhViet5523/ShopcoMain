import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box } from '@mui/material';
import orderService from '../../apis/orderService'; // Import orderService
import './Manager.css';

const ViewOrder = () => {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeItem, setActiveItem] = useState('');
  const [orders, setOrders] = useState([]); // State to hold orders
  const [loading, setLoading] = useState(true); // State to manage loading
  const [orderItems, setOrderItems] = useState([]); // State to hold order items
  const [searchKey, setSearchKey] = useState(''); // State to hold search key
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
  ];

  const tabs = ['Tất cả', 'Đơn hàng đang xử lý', 'Đơn hàng bị hủy', 'Giao thành công'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getAllOrders(); // Gọi API để lấy tất cả đơn hàng
        
        // Kiểm tra xem response có chứa $values không
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
  }, []);

  // Hàm lọc đơn hàng theo từ khóa
  const filteredOrders = orders.filter(order => 
    order.userId.toString().includes(searchKey) || // Tìm theo UserID
    order.orderId.toString().includes(searchKey) || // Tìm theo OrderID
    order.note?.toLowerCase().includes(searchKey.toLowerCase()) || // Tìm theo Note
    order.orderStatus?.toLowerCase().includes(searchKey.toLowerCase()) || // Tìm theo OrderStatus
    order.totalAmount.toString().includes(searchKey) || // Tìm theo TotalAmount
    order.deliveryStatus?.toLowerCase().includes(searchKey.toLowerCase()) || // Tìm theo DeliveryStatus
    order.deliveryAddress?.toLowerCase().includes(searchKey.toLowerCase()) // Tìm theo DeliveryAddress
  );

  const handleClearSearch = () => {
    setSearchKey(''); // Xóa từ khóa tìm kiếm
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo">
              <img src="/images/logo.png" alt="Beauty Cosmetics" />
            </div>
            <div className="brand">
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
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Đơn Hàng</h1>
            <div className="dashboard-actions">
              <button className="btn-filter">
                <FaFilter /> Lọc <span className="notification">1</span>
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
                  <th>OrderID</th>
                  <th>UserID</th>
                  <th>ProductName</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>VoucherID</th>
                  <th>TotalAmount</th>
                  <th>OrderDate</th>
                  <th>OrderStatus</th>
                  <th>DeliveryStatus</th>
                  <th>DeliveryAddress</th>          
                  <th>Note</th>    
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="empty-data-message">
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <tr key={order.orderId}>
                      <td>{order.orderId}</td>
                      <td>{order.userId}</td>
                      <td>{orderItems[index]?.map(item => item.productName).join(', ')}</td>
                      <td>{orderItems[index]?.map(item => item.price).join(', ')}</td>
                      <td>{orderItems[index]?.map(item => item.quantity).join(', ')}</td>
                      <td>{order.voucherId}</td>
                      <td>{order.totalAmount}</td>
                      <td>{order.orderDate}</td>
                      <td>{order.orderStatus}</td>
                      <td>{order.deliveryStatus}</td>
                      <td>{order.deliveryAddress}</td>
                      <td>{order.note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="empty-data-message">
                      Không có đơn hàng nào.
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
