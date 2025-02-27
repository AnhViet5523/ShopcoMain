import { useState } from 'react';
import { Button, Stack, TextField, Typography, colors, Checkbox, FormControlLabel } from '@mui/material';
import { ScreenMode } from '../../pages/SigninPage';
import userService from '../../apis/userService';

const SignupForm = ({ onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    
    if (!/^[A-Za-z]+$/.test(username)) {
      setError('Tên đăng nhập chỉ được chứa chữ cái.');
      return;
    }

    try {
      await userService.register(username, email, password);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      onSwitchMode(ScreenMode.SIGN_IN);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.status === 400) {
        if (err.response.data.message.includes('Email không hợp lệ')) {
          setError('Email không hợp lệ. Vui lòng nhập lại.');
        } else if (err.response.data.message.includes('Mật khẩu không hợp lệ')) {
          setError('Mật khẩu không hợp lệ. Mật khẩu phải ít nhất 8 ký tự, bao gồm 1 chữ cái và 1 ký tự đặc biệt.');
        } else {
          setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    }
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
          {error && <Typography color='error'>{error}</Typography>}
          <Stack spacing={2}>
            <TextField 
              label='Tên đăng nhập' 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label='Email' 
              type='email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              fullWidth 
            />
            <TextField 
              label='Mật khẩu' 
              type={showPassword ? 'text' : 'password'}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              fullWidth 
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
              }
              label="Hiện mật khẩu"
            />
          </Stack>
          <Button 
            variant='contained' 
            size='large' 
            sx={{ bgcolor: colors.grey[800], '&:hover': { bgcolor: colors.grey[600] } }} 
            onClick={handleRegister}
          >
            Đăng ký
          </Button>
        </Stack>

        <Stack direction='row' spacing={2}>
          <Typography>Đã có tài khoản?</Typography>
          <Typography 
            onClick={() => onSwitchMode(ScreenMode.SIGN_IN)} 
            fontWeight={600} 
            sx={{ cursor: 'pointer', userSelect: 'none' }}
          >
            Đăng nhập
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SignupForm;
