

import { useState } from 'react';
import { Button, Stack, TextField, Typography, colors } from '@mui/material';
import { ScreenMode } from '../../pages/SigninPage';

const SignupForm = ({ onSwitchMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/Users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      onSwitchMode(ScreenMode.SIGN_IN);
    } catch (err) {
      setError(err.message);
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
              label='Tên tài khoản' 
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
              type='password' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              fullWidth 
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
