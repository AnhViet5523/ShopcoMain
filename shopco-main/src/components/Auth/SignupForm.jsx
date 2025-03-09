import { useState, useEffect, useRef } from 'react';
import { Button, Stack, TextField, Typography, colors, Checkbox, FormControlLabel, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { ScreenMode } from '../../pages/SigninPage';
import userService from '../../apis/userService';
import axiosClient from '../../apis/axiosClient';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const SignupForm = ({ onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Sử dụng useRef để theo dõi component đã unmounted chưa
  const isMounted = useRef(true);
  
  // Thiết lập cleanup khi component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Hủy tất cả các request liên quan đến đăng ký
      axiosClient.cancelAllRequests();
    };
  }, []);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Kiểm tra username
    if (!username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
      isValid = false;
    } else if (!/^[A-Za-z]+$/.test(username)) {
      newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái';
      isValid = false;
    }

    // Kiểm tra email
    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    // Kiểm tra password
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      isValid = false;
    } else if (!/[A-Za-z]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'Mật khẩu phải bao gồm ít nhất 1 chữ cái và 1 ký tự đặc biệt';
      isValid = false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await userService.register(username, email, password);
      // Kiểm tra nếu component vẫn mounted trước khi cập nhật state
      if (isMounted.current) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        onSwitchMode(ScreenMode.SIGN_IN);
      }
    } catch (err) {
      // Kiểm tra nếu component vẫn mounted và lỗi không phải do hủy yêu cầu
      if (isMounted.current) {
        console.error('Registration error:', err);
        
        if (err.name === 'AbortError' || err.message?.includes('aborted') || axios.isCancel(err)) {
          setError('Yêu cầu đã bị hủy, vui lòng thử lại.');
        } else if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response && err.response.status === 400) {
          if (err.response.data.message?.includes('Email không hợp lệ')) {
            setError('Email không hợp lệ. Vui lòng nhập lại.');
          } else if (err.response.data.message?.includes('Mật khẩu không hợp lệ')) {
            setError('Mật khẩu không hợp lệ. Mật khẩu phải ít nhất 8 ký tự, bao gồm 1 chữ cái và 1 ký tự đặc biệt.');
          } else {
            setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
          }
        } else {
          setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      }
    } finally {
      // Kiểm tra nếu component vẫn mounted trước khi cập nhật state
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Stack justifyContent="center" alignItems="center" sx={{ height: '100%', color: colors.grey[800] }}>
      <Stack spacing={5} sx={{ width: '100%', maxWidth: '500px' }}>
        <Stack>
          <Typography variant='h4' fontWeight={600} color={colors.grey[800]}>
            Đăng Ký
          </Typography>
          <Typography color={colors.grey[600]}>
            Chào mừng bạn đến với BEAUTY COSMETICS!
          </Typography>
        </Stack>

        <Stack spacing={4}>
          {error && (
            <Typography color='error' sx={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>
              {error}
            </Typography>
          )}
          <Stack spacing={2}>
            <TextField 
              label='Tên đăng nhập' 
              value={username} 
              onChange={(e) => {
                setUsername(e.target.value);
                setFormErrors({...formErrors, username: ''});
              }} 
              fullWidth 
              required
              error={!!formErrors.username}
              helperText={formErrors.username}
              disabled={loading}
            />
            <TextField 
              label='Email' 
              type='email' 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                setFormErrors({...formErrors, email: ''});
              }} 
              fullWidth 
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={loading}
            />
            <TextField 
              label='Mật khẩu' 
              type={showPassword ? 'text' : 'password'}
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                setFormErrors({...formErrors, password: ''});
              }} 
              fullWidth 
              required
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField 
              label='Xác nhận mật khẩu' 
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword} 
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFormErrors({...formErrors, confirmPassword: ''});
              }} 
              fullWidth 
              required
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
          <Button 
            variant='contained' 
            size='large' 
            sx={{ 
              bgcolor: colors.grey[800], 
              '&:hover': { bgcolor: colors.grey[600] },
              height: '56px'
            }} 
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng ký'}
          </Button>
        </Stack>

        <Stack direction='row' spacing={2}>
          <Typography>Đã có tài khoản?</Typography>
          <Typography 
            onClick={() => !loading && onSwitchMode(ScreenMode.SIGN_IN)} 
            fontWeight={600} 
            sx={{ 
              cursor: loading ? 'default' : 'pointer', 
              userSelect: 'none',
              color: loading ? colors.grey[400] : 'inherit'
            }}
          >
            Đăng nhập
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SignupForm;
