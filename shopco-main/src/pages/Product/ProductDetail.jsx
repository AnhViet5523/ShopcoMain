import { useState, useEffect, memo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Rating, 
  Button, 
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Tabs,
  Tab,
  Badge,
  Modal,
  TextField
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import productService from '../../apis/productService';
import orderService from '../../apis/orderService';
import reviewService from "../../apis/reviewService";

const FlashDealTimer = memo(({ initialHours = 0, initialMinutes = 0, initialSeconds = 45 }) => {
  const [time, setTime] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => {
        const newSeconds = prevTime.seconds - 1;
        
        if (newSeconds < 0) {
          const newMinutes = prevTime.minutes - 1;
          
          if (newMinutes < 0) {
            const newHours = prevTime.hours - 1;
            
            if (newHours < 0) {
              clearInterval(timer);
              return { hours: 0, minutes: 0, seconds: 0 };
            }
            
            return { hours: newHours, minutes: 59, seconds: 59 };
          }
          
          return { ...prevTime, minutes: newMinutes, seconds: 59 };
        }
        
        return { ...prevTime, seconds: newSeconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <Typography variant="body2">
      KẾT THÚC TRONG {time.hours.toString().padStart(2, '0')} : {time.minutes.toString().padStart(2, '0')} : {time.seconds.toString().padStart(2, '0')}
    </Typography>
  );
});

FlashDealTimer.displayName = 'FlashDealTimer';
FlashDealTimer.propTypes = {
  initialHours: PropTypes.number,
  initialMinutes: PropTypes.number,
  initialSeconds: PropTypes.number
};

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const handleBuyNow = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.userId) {
        alert('Vui lòng đăng nhập để mua hàng');
        return;
      }

      const buyNowResponse = await orderService.buyNow(user.userId, id, quantity);
      const currentCartResponse = await orderService.getCurrentCart(user.userId);
      
      if (currentCartResponse && currentCartResponse.orderId) {
        const queryParams = new URLSearchParams({
          orderId: currentCartResponse.orderId,
          name: user.firstName + ' ' + user.lastName || '',
          email: user.email || '',
          phone: user.phoneNumber || '',
          address: user.address || ''
        }).toString();

        navigate(`/checkout?${queryParams}`);
      } else {
        throw new Error('Không thể lấy thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error buying now:', error);
      alert('Có lỗi xảy ra khi mua hàng. Vui lòng thử lại sau.');
    }
  };

  return (
    <Container>
      <Button variant="contained" color="primary" onClick={handleBuyNow}>
        Mua Ngay
      </Button>
    </Container>
  );
}
