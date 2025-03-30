import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save, CloudUpload } from '@mui/icons-material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import blogService from '../../../apis/blog';

const CreatePost = ({ editMode }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ params nếu đang ở chế độ chỉnh sửa
  const [post, setPost] = useState({
    title: '',
    content: '',
    imageUrl: '',
    userId: 1 // Giá trị mặc định, có thể thay đổi tùy theo logic người dùng
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [initialLoading, setInitialLoading] = useState(editMode); // Đánh dấu đang tải dữ liệu ban đầu nếu ở chế độ edit

  // Nếu ở chế độ chỉnh sửa, tải dữ liệu bài viết khi component được mount
  useEffect(() => {
    if (editMode && id) {
      const fetchPost = async () => {
        try {
          setInitialLoading(true);
          setError(null);
          
          // Gọi API để lấy thông tin bài viết
          const response = await blogService.getPostById(id);
          
          // Cập nhật state với dữ liệu từ API
          setPost({
            id: response.postId || id,
            title: response.title || '',
            content: response.content || '',
            imageUrl: response.imageUrl || '',
            userId: response.userId || 1
          });
          
          setInitialLoading(false);
        } catch (error) {
          console.error('Lỗi khi tải bài viết:', error);
          setError(`Không thể tải bài viết. Lỗi: ${error.message}`);
          setInitialLoading(false);
        }
      };
      
      fetchPost();
    }
  }, [editMode, id]);

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setPost(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý khi chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Tạo URL xem trước cho ảnh
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  // Xử lý lưu bài viết
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

      const postData = {
        ...post,
        image: imageFile // Thêm file ảnh nếu có
      };

      // Đảm bảo postId/id trong dữ liệu gửi đi khớp với ID trên URL khi chỉnh sửa
      if (editMode) {
        postData.postId = parseInt(id); // Thêm postId để tránh lỗi "ID không trùng khớp"
      }

      let response;
      
      if (editMode) {
        // Gọi API để cập nhật bài viết
        response = await blogService.updatePost(id, postData);
        console.log('Update post response:', response);
        alert('Cập nhật bài viết thành công!');
      } else {
        // Gọi API để tạo bài viết mới
        response = await blogService.createPost(postData);
        console.log('Create post response:', response);
        alert('Tạo bài viết mới thành công!');
      }

      // Chuyển hướng về trang quản lý blog
      navigate('/blogManager');
    } catch (error) {
      console.error('Error saving post:', error);
      setError(`Không thể ${editMode ? 'cập nhật' : 'tạo'} bài viết. Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý quay lại
  const handleGoBack = () => {
    navigate('/blogManager');
  };

  // Hiển thị loading khi đang tải dữ liệu ban đầu cho chế độ chỉnh sửa
  if (initialLoading) {
    return (
      <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width: '99vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Header />
        <CircularProgress sx={{ color: '#059669', mt: 10 }} />
      </Box>
    );
  }

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
            {editMode ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}
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

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ 
                mb: 2,
                borderColor: '#059669', 
                color: '#059669', 
                '&:hover': { 
                  borderColor: '#047857', 
                  color: '#047857' 
                }
              }}
            >
              Tải ảnh lên
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            <TextField
              fullWidth
              label="URL Ảnh bìa"
              variant="outlined"
              value={post.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              sx={{ mb: 3 }}
              helperText="Nhập URL hình ảnh cho bài viết (không bắt buộc)"
            />

            {/* Hiển thị xem trước ảnh từ file được tải lên */}
            {imagePreview && (
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
                  src={imagePreview}
                  alt="Xem trước ảnh bìa"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: 1
                  }}
                />
              </Box>
            )}

            {/* Hiển thị ảnh từ URL nếu không có file được tải lên */}
            {!imagePreview && post.imageUrl && (
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
                ) : (editMode ? 'Cập nhật bài viết' : 'Lưu bài viết')}
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