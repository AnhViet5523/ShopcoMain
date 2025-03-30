const handleDelivered = async (orderId) => {
  try {
    await adminService.markOrderAsDelivered(orderId);
    console.log('Order marked as delivered:', orderId);
    const response = await adminService.getAllOrders();
    console.log('Updated orders:', response.$values);
    setOrders(response.$values);
    
    // Chuyển sang tab "Giao thành công" sau khi cập nhật thành công
    setActiveTab('Giao thành công');
    
    // Thông báo thành công cho người dùng
    alert('Đơn hàng đã được cập nhật thành "Đã giao" thành công!');
  } catch (error) {
    console.error('Error marking order as delivered:', error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
  }
}; 