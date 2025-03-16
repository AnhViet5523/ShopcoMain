import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './checkout.css';
import Header from '../../components/Header';
import orderService from '../../apis/orderService';
import voucherService from '../../apis/voucherService';
import paymentService from '../../apis/paymentService';

const Checkout = () => {
  const [open, setOpen] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Thanh toán khi nhận hàng (COD)');
  const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tempDeliveryAddress, setTempDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [tempRecipientName, setTempRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tempPhoneNumber, setTempPhoneNumber] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState(null);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const isMounted = useRef(true);
  const requestInProgress = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const userName = searchParams.get('name');
  const userEmail = searchParams.get('email');
  const userPhone = searchParams.get('phone');
  const userAddress = searchParams.get('address');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sentToVnpay, setSentToVnpay] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    isMounted.current = true;
    
    // Đặt lại requestInProgress về false khi component được mount
    requestInProgress.current = false;
    
    // Kiểm tra user đã login chưa
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) {
      navigate('/login'); // Chuyển về trang login nếu chưa đăng nhập
      return;
    }

    // Tạo một timeout để tránh fetch ngay lập tức sau khi redirect
    const timer = setTimeout(() => {
      // Only fetch data if orderId exists
      if (orderId) {
        fetchOrderById(orderId);
      } else if (!orderId) {
        setLoading(false);
        // Kiểm tra xem có pendingOrderId không (người dùng quay lại từ VNPAY)
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        if (pendingOrderId) {
          // Nếu có, thay thế orderId từ URL bằng pendingOrderId
          navigate(`/checkout?orderId=${pendingOrderId}`);
        }
      }
    }, 300); // Đợi 300ms
    
    // Get note from URL params
    const noteFromUrl = searchParams.get('note');
    if (noteFromUrl) {
      setNote(noteFromUrl);
    }
    
    // Kiểm tra xem có pendingOrderId không (người dùng quay lại từ VNPAY)
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId && pendingOrderId === orderId) {
      // Đánh dấu đơn hàng đang chờ thanh toán
      setPaymentPending(true);
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [orderId, navigate, searchParams]);

  useEffect(() => {
    if (orderId) {
      // Nếu có pendingOrderId trong localStorage và trùng với orderId hiện tại
      const pendingOrderId = localStorage.getItem('pendingOrderId');
      if (pendingOrderId && pendingOrderId === orderId) {
        // Kiểm tra lại trạng thái đơn hàng để cập nhật chính xác
        orderService.getOrderById(orderId).then(response => {
          if (response) {
            // Nếu đơn hàng chưa thanh toán, cập nhật lại trạng thái
            if (response.orderStatus === 'Paid') {
              setSentToVnpay(true);
            } else {
              setSentToVnpay(false);
            }
            setOrder(response);
          }
        }).catch(error => {
          console.error('Error re-fetching order status:', error);
        });
      }
    }
  }, [orderId]);

  const fetchOrderById = async (id) => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      setError(null); // Reset error
      
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Thêm retry logic với thời gian chờ
      let retries = 3;
      let response = null;
      
      while (retries > 0 && !response) {
        try {
          response = await orderService.getOrderById(id);
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          // Đợi 500ms trước khi thử lại
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      if (response) {
        setOrder(response);
        
        // Kiểm tra nếu đơn hàng có pendingOrderId và không ở trạng thái Paid
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        if (pendingOrderId && pendingOrderId === id && 
            response.orderStatus !== 'Paid') {
          // Đánh dấu đơn hàng đang chờ thanh toán
          setPaymentPending(true);
          
          // Nếu payment method trong đơn hàng là VNPAY, cho phép chọn lại
          if (response.payments && response.payments.$values && 
              response.payments.$values.some(p => p.paymentMethod === 'Thanh toán ví VNPAY')) {
            // Đặt lại paymentMethod để người dùng có thể chọn lại
            setPaymentMethod('Thanh toán khi nhận hàng (COD)');
          }
        } else if (response.orderStatus === 'Paid') {
          setSentToVnpay(true);
        }
        
        // Set delivery address từ thông tin user đã login
        if (user && user.address) {
          setDeliveryAddress(user.address);
        } else if (response.deliveryAddress) {
          setDeliveryAddress(response.deliveryAddress);
        } else {
          setDeliveryAddress(userAddress || '');
        }
        
        // Set recipient name và phone từ thông tin user đã login
        if (user) {
          setRecipientName(`${user.firstName} ${user.lastName}`);
          setPhoneNumber(user.phoneNumber);
        } else {
          setRecipientName(userName || '');
          setPhoneNumber(userPhone || '');
        }
        
        // Set payment method if available in the order
        if (response.payments && response.payments.$values && response.payments.$values.length > 0) {
          const paymentInfo = response.payments.$values[0];
          setPaymentMethod(paymentInfo.paymentMethod || 'Thanh toán khi nhận hàng (COD)');
        }

        // Set voucher if available in the order
        if (response.voucher) {
          setSelectedVoucher(response.voucher);
          setVoucherApplied(true);
        }
      } else {
        throw new Error('Không thể tải thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      // Đợi một khoảng thời gian trước khi đặt requestInProgress về false
      setTimeout(() => {
        requestInProgress.current = false;
      }, 300);
    }
  };

  const fetchVouchers = async () => {
    try {
      setVoucherLoading(true);
      setVoucherError(null);
      const response = await voucherService.getVouchers();
      if (response && response.$values) {
        // Filter active vouchers that meet the minimum order amount
        const activeVouchers = response.$values.filter(
          voucher => 
            voucher.status === 'Active' && 
            voucher.quantity > 0 && 
            order.totalAmount >= voucher.minOrderAmount
        );
        setVouchers(activeVouchers);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVoucherError('Failed to load vouchers. Please try again later.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddressDialogOpen = () => {
    setTempDeliveryAddress(deliveryAddress);
    setTempRecipientName(recipientName);
    setTempPhoneNumber(phoneNumber);
    setAddressDialogOpen(true);
  };

  const handleAddressDialogClose = () => {
    setAddressDialogOpen(false);
  };

  const handleVoucherDialogOpen = () => {
    fetchVouchers();
    setVoucherDialogOpen(true);
  };

  const handleVoucherDialogClose = () => {
    setVoucherDialogOpen(false);
  };

  const handleConfirmAddressChange = async () => {
    // Update the delivery address
    setDeliveryAddress(tempDeliveryAddress);
    setRecipientName(tempRecipientName);
    setPhoneNumber(tempPhoneNumber);
    
    // Here you would typically call an API to update the order's delivery address
    // For example:
    // try {
    //   await orderService.updateOrderAddress(order.orderId, tempDeliveryAddress);
    // } catch (error) {
    //   console.error('Error updating address:', error);
    // }
    
    // Close the dialog
    handleAddressDialogClose();
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleConfirmPaymentMethod = () => {
    // Here you would typically handle saving the payment method
    handleClose();
  };

  const handleVoucherSelect = (voucher) => {
    setSelectedVoucher(voucher);
  };

  const handleApplyVoucher = async () => {
    if (!selectedVoucher || !order) return;

    try {
      setVoucherLoading(true);
      setVoucherError(null);
      
      // Kiểm tra xem voucher có hết hạn không
      const currentDate = new Date();
      const voucherEndDate = new Date(selectedVoucher.endDate);
      
      if (voucherEndDate < currentDate) {
        setVoucherError('Voucher đã hết hạn sử dụng. Vui lòng chọn voucher khác.');
        return;
      }
      
      // Nếu đã có voucher được áp dụng trước đó, xóa nó trước
      if (voucherApplied || order.voucher) {
        // Có thể cần gọi API để xóa voucher cũ nếu có endpoint này
        // await orderService.removeVoucher(order.orderId);
      }
      
      // Call API to apply voucher to order
      await orderService.applyvoucher(order.orderId, selectedVoucher.voucherId);
      
      // Update order with voucher
      const updatedOrder = await orderService.getOrderById(order.orderId);
      setOrder(updatedOrder);
      setVoucherApplied(true);
      
      // Close the dialog
      handleVoucherDialogClose();
    } catch (error) {
      console.error('Error applying voucher:', error);
      // Hiển thị thông báo lỗi bằng tiếng Việt
      setVoucherError('Không thể áp dụng voucher. Voucher có thể đã hết hạn hoặc không hợp lệ cho đơn hàng này.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!order || !order.orderId) return;
      
      setIsProcessing(true);
      console.log('Bắt đầu xử lý thanh toán:', paymentMethod);
      
      // Validate thông tin giao hàng
      if (!deliveryAddress?.trim()) {
        setError('Vui lòng nhập địa chỉ giao hàng');
        setIsProcessing(false);
        return;
      }

      // Luôn thêm phương thức thanh toán vào dữ liệu
      const paymentData = {
        orderId: order.orderId,
        deliveryAddress: deliveryAddress?.trim() || "",
        paymentMethod: paymentMethod?.trim(), // Luôn lưu phương thức thanh toán
        note: note?.trim() || ""
      };

      // Lưu thông tin giao hàng
      try {
        await orderService.confirmpayment(paymentData);
        console.log('Đã lưu thông tin giao hàng thành công');
      } catch (error) {
        console.error('Lỗi khi lưu thông tin giao hàng:', error);
        setError('Không thể lưu thông tin giao hàng. Vui lòng thử lại.');
        setIsProcessing(false);
        return;
      }
      
      // Xử lý theo phương thức thanh toán
      if (paymentMethod === 'Thanh toán ví VNPAY') {
        try {
          const amount = Math.round(calculateFinalAmount());
          const response = await paymentService.createVnpPayment(
            order.orderId,
            amount
          );
          
          if (response && response.paymentUrl) {
            // Lưu orderId vào localStorage để có thể quay lại checkout
            localStorage.setItem('pendingOrderId', order.orderId);
            // Đặt trạng thái đã gửi đến VNPAY
            setSentToVnpay(true);
            window.location.href = response.paymentUrl;
            return;
          } else {
            throw new Error('Không nhận được URL thanh toán từ VNPAY');
          }
        } catch (error) {
          console.error('VNPAY Error:', error);
          setError('Không thể khởi tạo thanh toán VNPAY. Vui lòng thử lại sau.');
          setIsProcessing(false);
        }
      } else {
        // Thanh toán COD - hiển thị dialog cảm ơn ngay lập tức, không cần kiểm tra gì thêm
        setThankYouDialogOpen(true);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      setError('Không thể xác nhận thanh toán. Vui lòng thử lại sau.');
      setIsProcessing(false);
    }
  };

  const handleThankYouDialogClose = () => {
    setThankYouDialogOpen(false);
    // Xóa pendingOrderId khi thanh toán COD thành công
    localStorage.removeItem('pendingOrderId');
    // Redirect to home page
    navigate('/');
  };

  // Thêm một hàm retry để người dùng có thể thử lại khi gặp lỗi
  const handleRetryFetchOrder = () => {
    if (orderId) {
      // Reset các state
      setLoading(true);
      setError(null);
      requestInProgress.current = false;
      
      // Fetch lại sau một khoảng thời gian ngắn
      setTimeout(() => {
        fetchOrderById(orderId);
      }, 500);
    }
  };

  // Calculate discount amount
  const calculateDiscount = () => {
    if (!order) return 0;
    
    if (order.voucher) {
      return order.totalAmount * order.voucher.discountPercent / 100;
    } else if (selectedVoucher && voucherApplied) {
      return order.totalAmount * selectedVoucher.discountPercent / 100;
    }
    
    return 0;
  };

  // Calculate final amount
  const calculateFinalAmount = () => {
    if (!order) return 0;
    
    const shippingFee = 30000;
    const discount = calculateDiscount();
    
    return order.totalAmount + shippingFee - discount;
  };

  // Cập nhật useEffect xử lý callback từ VNPAY
  useEffect(() => {
    const handleVnpayReturn = async () => {
      // Lấy toàn bộ query string từ URL
      const queryString = window.location.search;
      
      // Kiểm tra xem có phải là callback từ VNPAY không
      if (queryString.includes('vnp_')) {
        try {
          setLoading(true);
          
          // Lấy các tham số từ URL
          const urlParams = new URLSearchParams(queryString);
          const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
          const vnp_TransactionStatus = urlParams.get('vnp_TransactionStatus');
          
          if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
            // Thanh toán thành công - chuyển về trang chính
            navigate('/');
          } else {
            // Thanh toán thất bại - chuyển về trang chính với thông báo lỗi
            navigate('/', { 
              state: { 
                error: 'Thanh toán không thành công hoặc đã bị hủy. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.' 
              } 
            });
          }
        } catch (error) {
          console.error('Error handling VNPAY return:', error);
          // Trong trường hợp lỗi, vẫn chuyển về trang chính
          navigate('/', { 
            state: { 
              error: 'Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ.' 
            } 
          });
        }
      }
    };

    handleVnpayReturn();
  }, [navigate]);

  if (!order && !loading && !orderId) {
    return (
      <Box sx={{ bgcolor: "#fff176", minHeight: "100vh", width: '100vw' }}>
        <Header />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Không có đơn hàng nào để thanh toán</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/cart')}
            sx={{ 
              backgroundColor: 'darkgreen', 
              color: 'white', 
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#005000',
              }
            }}
          >
            Quay lại giỏ hàng
          </Button>
        </Box>
      </Box>
    );
  }

  if (!order && !loading) {
    return (
      <Box sx={{ bgcolor: "#fff176", minHeight: "100vh", width: '100vw' }}>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Typography variant="h6">Không tìm thấy đơn hàng</Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: "#fff176" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: "#fff176" }}>
        <Typography variant="h6" color="error" sx={{ mb: 3 }}>{error}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleRetryFetchOrder}
            sx={{ backgroundColor: 'darkgreen', color: 'white' }}
          >
            Thử lại
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/cart')}
            sx={{ borderColor: 'darkgreen', color: 'darkgreen' }}
          >
            Quay lại giỏ hàng
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#fff176", minHeight: "100vh", width: '100vw' }}>
      <Header />
      <div className="checkout-container">
        <div className="grid-container">
          <div className="left-column">
            <div className="address-section">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Địa chỉ nhận hàng
                </Typography>
                <Button 
                  variant="text" 
                  size="large" 
                  sx={{ 
                    textTransform: 'none', 
                    color: 'green', 
                    fontWeight: 'bold' 
                  }}
                  onClick={handleAddressDialogOpen}
                >
                  Thay đổi
                </Button>
              </Box>
              <p>{recipientName} - {phoneNumber}</p>
              <p>{deliveryAddress}</p>
              <p>{userEmail}</p>
            </div>
            
            <div className="payment-method">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Hình thức thanh toán
                </Typography>
                <Button 
                  variant="text" 
                  size="large" 
                  sx={{ 
                    textTransform: 'none', 
                    color: 'green', 
                    fontWeight: 'bold' 
                  }}
                  onClick={handleClickOpen}
                >
                  Chọn hình thức
                </Button>
              </Box>
              <p>{paymentMethod}</p>
            </div>
            
            <div className="discount-code">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Mã giảm giá
                </Typography>
                <Button 
                  variant="text" 
                  size="large" 
                  sx={{ 
                    textTransform: 'none', 
                    color: 'green', 
                    fontWeight: 'bold' 
                  }}
                  onClick={handleVoucherDialogOpen}
                >
                  {voucherApplied ? 'Thay đổi' : 'Nhập mã giảm giá'}
                </Button>
              </Box>
              {(order.voucher || (selectedVoucher && voucherApplied)) && (
                <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Mã giảm giá: {order.voucher ? order.voucher.voucherName : selectedVoucher.voucherName}
                  </Typography>
                  <Typography variant="body2">
                    Giảm {order.voucher ? order.voucher.discountPercent : selectedVoucher.discountPercent}% cho đơn hàng
                  </Typography>
                </Box>
              )}
            </div>
          </div>
          
          <div className="right-column">
            <Paper elevation={0} sx={{ bgcolor: '#ffffff', color: 'black', p: 3, borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 3, color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
                Đơn hàng
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Tạm tính:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {order.totalAmount?.toLocaleString()} ₫
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Giảm giá:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {`-${calculateDiscount().toLocaleString()} ₫`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  30.000 ₫
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography>Thành tiền:</Typography>
                <Typography sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                  {calculateFinalAmount().toLocaleString()} ₫
                </Typography>
              </Box>
              
              <TextField
                label="Ghi chú đơn hàng"
                fullWidth
                multiline
                rows={2}
                margin="normal"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button 
                variant="contained" 
                fullWidth 
                sx={{ 
                  mt: 2, 
                  backgroundColor: 'darkgreen', 
                  color: 'white', 
                  fontWeight: 'bold',
                  padding: '10px',
                  '&:hover': {
                    backgroundColor: '#005000',
                  }
                }}
                onClick={handlePlaceOrder}
                disabled={order.orderStatus === 'Paid' && !paymentPending || isProcessing}
              >
                {isProcessing ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
                    Đang xử lý...
                  </Box>
                ) : order.orderStatus === 'Paid' && !paymentPending ? (
                  'Đã thanh toán'
                ) : paymentPending && paymentMethod === 'Thanh toán ví VNPAY' ? (
                  'Tiếp tục thanh toán VNPAY'
                ) : (
                  'Đặt hàng'
                )}
              </Button>
            </Paper>
          </div>
        </div>
        
        <Paper elevation={0} sx={{ bgcolor: '#ffffff', color: 'black', p: 3, borderRadius: 1, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'darkgreen', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Thông tin kiện hàng
          </Typography>
          <Typography sx={{ mb: 2 }}>Giao trong 48 giờ</Typography>
          
          {order?.items?.$values && order.items.$values && order.items.$values.map((item) => (
            <Box key={item.orderItemId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              {/* Product Image */}
              <Box sx={{ width: '70px', height: '70px', mr: 2 }}>
                <img 
                  src={item.product?.imgUrl ? `https://klairscosmetics.com/wp-content/uploads/2017/04/${item.product.imgUrl}.jpg` : "https://klairscosmetics.com/wp-content/uploads/2017/04/supple-toner-1.jpg"} 
                  // alt={item.product?.productName || "Product"} 
                  alt="Product"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                />
                <Box 
                  sx={{ 
                    position: 'relative', 
                    top: '-65px', 
                    left: '0', 
                    backgroundColor: '#ff6b6b', 
                    color: 'white', 
                    padding: '2px 4px', 
                    borderRadius: '2px',
                    fontSize: '10px',
                    width: 'fit-content'
                  }}
                >
                  -20%
                </Box>
              </Box>
              
              {/* Product Info */}
              <Box sx={{ flex: 1, ml: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {item.product?.brand || "Klairs"}
                </Typography>
                <Typography variant="body2">
                  {item?.productName || "Nước Hoa Hồng Klairs Không Mùi Cho Da Nhạy Cảm 180ml"}
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey', fontSize: '0.8rem' }}>
                  {item.product?.capacity?.split(',')[0] || "180ml"}
                </Typography>
              </Box>
              
              {/* Price & Quantity */}
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ml: 2 }}>
                <Typography sx={{ mr: 1 }}>{item?.quantity}</Typography>
                <Typography sx={{ fontWeight: 'bold', mr: 1 }}>×</Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                  {item?.price?.toLocaleString()} ₫
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: 'darkgreen', fontWeight: 'bold' }}>
          Chọn hình thức thanh toán
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="payment-method"
              name="payment-method"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <FormControlLabel 
                value="Thanh toán khi nhận hàng (COD)" 
                control={<Radio />} 
                label="Thanh toán khi nhận hàng (COD)" 
              />
              <FormControlLabel 
                value="Thanh toán ví VNPAY" 
                control={<Radio />} 
                label="Thanh toán ví VNPAY" 
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'gray' }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmPaymentMethod} sx={{ color: 'green', fontWeight: 'bold' }}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Address Change Dialog */}
      <Dialog 
        open={addressDialogOpen} 
        onClose={handleAddressDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: 'darkgreen', fontWeight: 'bold' }}>
          Thay đổi địa chỉ nhận hàng
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Họ và tên người nhận"
              fullWidth
              margin="normal"
              value={tempRecipientName}
              onChange={(e) => setTempRecipientName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Số điện thoại"
              fullWidth
              margin="normal"
              value={tempPhoneNumber}
              onChange={(e) => setTempPhoneNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Địa chỉ nhận hàng"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={tempDeliveryAddress}
              onChange={(e) => setTempDeliveryAddress(e.target.value)}
              placeholder="Nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddressDialogClose} sx={{ color: 'gray' }}>
            Hủy
          </Button>
          <Button onClick={handleConfirmAddressChange} sx={{ color: 'green', fontWeight: 'bold' }}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Voucher Dialog */}
      <Dialog
        open={voucherDialogOpen}
        onClose={handleVoucherDialogClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ color: 'darkgreen', fontWeight: 'bold' }}>
          Chọn mã giảm giá
        </DialogTitle>
        <DialogContent>
          {voucherLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : voucherError ? (
            <Alert severity="error" sx={{ my: 2 }}>{voucherError}</Alert>
          ) : vouchers.length === 0 ? (
            <Box sx={{ my: 2 }}>
              <Typography>Không có mã giảm giá nào phù hợp với đơn hàng của bạn.</Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {vouchers.map((voucher) => (
                <Box key={voucher.voucherId}>
                  <ListItem 
                    button 
                    selected={selectedVoucher && selectedVoucher.voucherId === voucher.voucherId}
                    onClick={() => handleVoucherSelect(voucher)}
                    sx={{ 
                      borderRadius: 1,
                      mb: 1,
                      border: '1px solid #e0e0e0',
                      '&.Mui-selected': {
                        backgroundColor: '#e8f5e9',
                        border: '1px solid #4caf50',
                      }
                    }}
                  >
                    <Radio
                      checked={selectedVoucher && selectedVoucher.voucherId === voucher.voucherId}
                      onChange={() => handleVoucherSelect(voucher)}
                    />
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'darkgreen' }}>
                          {voucher.voucherName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{voucher.description}</Typography>
                          <Typography variant="body2" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                            Giảm {voucher.discountPercent}% - Đơn tối thiểu {voucher.minOrderAmount.toLocaleString()}₫
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'gray' }}>
                            HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVoucherDialogClose} sx={{ color: 'gray' }}>
            Hủy
          </Button>
          <Button 
            onClick={handleApplyVoucher} 
            sx={{ color: 'green', fontWeight: 'bold' }}
            disabled={!selectedVoucher || voucherLoading}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thank You Dialog */}
      <Dialog
        open={thankYouDialogOpen}
        onClose={handleThankYouDialogClose}
        aria-labelledby="thank-you-dialog-title"
        aria-describedby="thank-you-dialog-description"
      >
        <DialogTitle id="thank-you-dialog-title" sx={{ color: 'darkgreen', fontWeight: 'bold' }}>
          Cảm ơn bạn đã đặt hàng
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="thank-you-dialog-description">
            Cảm ơn bạn đã tin tưởng và mua hàng. Chúng tôi rất hân hạnh phục vụ bạn cho những lần kế tiếp.
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Checkout;
