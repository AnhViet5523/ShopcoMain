import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import blogService from '../../../apis/blog';

const CreatePost = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState({
    title: '',
    content: '',
    imageUrl: '',
    userId: 1 // Giá trị mặc định, có thể thay đổi tùy theo logic người dùng
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setPost(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý lưu bài viết mới
  const handleSave = async () => {
    // Kiểm tra dữ liệu nhập vào
    if (!post.title.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết');
      return;
    }

    if (!post.content.trim()) {
      setError('Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Gọi API để tạo bài viết mới
      const response = await blogService.createPost(post);
      console.log('Create post response:', response);

      // Hiển thị thông báo thành công
      alert('Tạo bài viết mới thành công!');

      // Chuyển hướng về trang quản lý blog
      navigate('/blogManager');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(`Không thể tạo bài viết. Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý quay lại
  const handleGoBack = () => {
    navigate('/blogManager');
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width: '99vw' }}>
      <Header />
      <Container maxWidth="md" sx={{ pt: 4, pb: 6 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            mb: 6,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 4, 
              textAlign: 'center',
              color: '#059669',
              background: 'linear-gradient(to right, #059669, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}
          >
            Tạo Bài Viết Mới
          </Typography>

          {error && (
            <Box sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, mb: 3, borderRadius: 1 }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Tiêu đề bài viết"
              variant="outlined"
              value={post.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              label="URL Ảnh bìa"
              variant="outlined"
              value={post.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              sx={{ mb: 3 }}
              helperText="Nhập URL hình ảnh cho bài viết (không bắt buộc)"
            />

            {post.imageUrl && (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3
                }}
              >
                <Box
                  component="img"
                  src={post.imageUrl}
                  alt="Xem trước ảnh bìa"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: 1
                  }}
                  onError={(e) => {
                    console.log('Preview image failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Nội dung bài viết"
              variant="outlined"
              multiline
              rows={15}
              value={post.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              sx={{ mb: 4 }}
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{ borderColor: '#059669', color: '#059669', '&:hover': { borderColor: '#047857', color: '#047857' } }}
              >
                Quay lại
              </Button>

              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
                sx={{ bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                    Đang lưu...
                  </>
                ) : 'Lưu bài viết'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default CreatePost; 