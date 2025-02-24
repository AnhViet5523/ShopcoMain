import { Button, Stack, TextField, Typography, colors } from '@mui/material';
import React, { useState } from 'react';
import { ScreenMode } from '../../pages/SigninPage';

const SigninForm = ({ onSwitchMode, onSignIn }) => {
  // Thêm state để quản lý form
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Thêm state để quản lý lỗi
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Hàm validate form
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.email) {
      tempErrors.email = 'Email không được để trống';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = 'Mật khẩu không được để trống';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Tạm thời hardcode tài khoản test
      if (formData.email === 'test@example.com' && formData.password === '123456') {
        onSignIn();
      } else {
        setErrors({
          email: 'Email hoặc mật khẩu không chính xác',
          password: 'Email hoặc mật khẩu không chính xác'
        });
      }
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "100%",
        color: colors.grey[800]
      }}
    >
      <Stack spacing={5} sx={{
        width: "100%",
        maxWidth: "500px"
      }}>
        <Stack>
          <Typography variant='h4' fontWeight={600} color={colors.grey[800]}>
            Đăng nhập
          </Typography>
          <Typography color={colors.grey[600]}>
            Chào mừng bạn trở lại!
          </Typography>
        </Stack>

        <Stack spacing={4}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Email</Typography>
              <TextField
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Stack>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Mật khẩu</Typography>
              <TextField
                type='password'
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
              />
            </Stack>
          </Stack>
          <Button
            type="submit"
            variant='contained'
            size='large'
            sx={{
              bgcolor: colors.grey[800],
              "&:hover": {
                bgcolor: colors.grey[600]
              }
            }}
          >
            Đăng nhập
          </Button>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Typography>Chưa có tài khoản?</Typography>
          <Typography
            onClick={() => onSwitchMode(ScreenMode.SIGN_UP)}
            fontWeight={600}
            sx={{
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            Đăng kí ngay
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SigninForm;