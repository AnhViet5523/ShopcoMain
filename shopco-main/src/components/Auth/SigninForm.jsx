import { Button, Stack, TextField, Typography, colors, Checkbox, FormControlLabel } from '@mui/material';
import React, { useState } from 'react';
import { ScreenMode } from '../../pages/SigninPage';
import userService from '../../apis/userService'; // Thêm import userService

const SigninForm = ({ onSwitchMode, onSignIn }) => {
  // Thêm state để quản lý form
  const [formData, setFormData] = useState({
    username: '', 
    password: ''
  });
  
  // Thêm state để quản lý lỗi
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  // Thêm state để quản lý hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // Hàm validate form
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.username) {
      tempErrors.username = 'Tên đăng nhập không được để trống';
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = 'Mật khẩu không được để trống';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Gọi hàm đăng nhập từ userService
        await userService.login(formData.username, formData.password); 
        onSignIn(); 
      } catch (error) {
        console.error('Login failed:', error);
        if (error.response && error.response.status === 404) {
          setErrors(prev => ({ ...prev, username: 'Tên không tồn tại' })); 
        } else if (error.response && error.response.status === 401) {
          setErrors(prev => ({ ...prev, password: 'Tên đăng nhập hoặc mật khẩu sai' })); 
        } else if (error.response && error.response.status === 400) {
          setErrors(prev => ({ ...prev, password: 'CONCAC' })); 
        }else {
          setErrors(prev => ({ ...prev, password: 'Đã xảy ra lỗi. Vui lòng thử lại.' })); 
        }
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
        minHeight: "100vh",
        color: colors.grey[800],
        bgcolor: "white"
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
              <Typography color={colors.grey[800]}>Tên đăng nhập</Typography>
              <TextField
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={Boolean(errors.username)}
                helperText={errors.username}
              />
            </Stack>
            <Stack spacing={1}>
              <Typography color={colors.grey[800]}>Mật khẩu</Typography>
              <TextField
                type={showPassword ? 'text' : 'password'} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
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