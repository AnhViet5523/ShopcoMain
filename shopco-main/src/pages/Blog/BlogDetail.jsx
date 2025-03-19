import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, CircularProgress, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import DOMPurify from 'dompurify';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import blogService from '../../apis/blog';
import './Blog.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  
  // Tạo refs cho các section
  const sectionRefs = useRef({});

  useEffect(() => {
    // Cuộn lên đầu trang khi component được tải
    window.scrollTo(0, 0);
    
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await blogService.getPostById(id);
        console.log('Post data:', response);
        
        // Kiểm tra các định dạng response khác nhau
        let postData = response;
        if (response && response.data) {
          postData = response.data;
        }
        
        setPost(postData);
        
        // Tự động tạo các section từ nội dung
        if (postData && postData.content) {
          generateSectionsFromContent(postData.content);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  // Hàm phân tích nội dung để tạo mục lục
  const generateSectionsFromContent = (content) => {
    // Tạm thời tạo DOM element từ content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(content);
    
    // Tìm tất cả các thẻ heading (h2, h3, etc.)
    const headings = tempDiv.querySelectorAll('h2, h3, h4, h5, h6');
    
    const extractedSections = [];
    headings.forEach((heading, index) => {
      // Tạo id cho heading nếu chưa có
      if (!heading.id) {
        heading.id = `section-${index}`;
      }
      
      // Lấy level của heading (h2 = 2, h3 = 3, etc.)
      const level = parseInt(heading.tagName.substring(1));
      
      extractedSections.push({
        id: heading.id,
        title: heading.textContent,
        level: level
      });
      
      // Khởi tạo ref cho section
      sectionRefs.current[heading.id] = heading.id;
    });
    
    setSections(extractedSections);
  };
  
  // Hàm scroll đến section được chọn
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hàm để tạo HTML an toàn từ nội dung của post
  const createMarkup = (htmlContent) => {
    if (!htmlContent) return { __html: '' };
    
    // Thêm id cho các heading để có thể scroll đến
    let processedContent = htmlContent;
    
    // Tạo tempDiv để xử lý HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(htmlContent);
    
    // Tìm và thêm id cho các heading
    const headings = tempDiv.querySelectorAll('h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `section-${index}`;
      }
    });
    
    // Lấy lại HTML đã được xử lý
    processedContent = tempDiv.innerHTML;
    
    return {
      __html: processedContent
    };
  };

  // Hàm xử lý nội dung để hiển thị đúng định dạng
  const formatContent = (content) => {
    if (!content) return '';
    
    // Nếu content không phải HTML, chuyển đổi xuống dòng thành thẻ <p>
    if (!/<[a-z][\s\S]*>/i.test(content)) {
      return content.split('\n').map((paragraph, index) => 
        paragraph ? `<p key=${index}>${paragraph}</p>` : '<br />'
      ).join('');
    }
    
    return content;
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Header />
        <CircularProgress sx={{ color: '#059669', mt: 10 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
        <Header />
        <Container maxWidth="md" sx={{ pt: 8, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" color="error" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />} 
              onClick={goBack}
              sx={{ mt: 2, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
            >
              Quay lại
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
        <Header />
        <Container maxWidth="md" sx={{ pt: 8, pb: 6 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Không tìm thấy bài viết
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBack />} 
              onClick={goBack}
              sx={{ mt: 2, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
            >
              Quay lại
            </Button>
          </Paper>
        </Container>
        <Footer />
      </Box>
    );
  }

  // Tạo ngày hiển thị định dạng Tiếng Việt
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return 'Chưa xác định';
    }
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width: '99vw' }}>
      <Header />
      <Box sx={{ width: '100%' }}>
        {/* Phần ảnh bìa */}
        <Box 
          sx={{ 
            width: '100%', 
            height: 'auto',
            maxHeight: '60vh',
            display: 'flex',
            justifyContent: 'center',
            mb: 4
          }}
        >
          {post.imageUrl ? (
            <Box
              component="img"
              src={post.imageUrl}
              alt={post.title}
              sx={{
                width: '100%',
                maxWidth: '1200px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          ) : (
            <Box
              component="img"
              src="/images/blog-placeholder.jpg"
              alt="Ảnh mặc định"
              sx={{
                width: '100%',
                maxWidth: '1200px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>

        {/* Phần nội dung */}
        <Container 
          maxWidth="md" 
          sx={{ 
            px: { xs: 2, sm: 3, md: 4 } 
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: 6,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBack />} 
                onClick={goBack}
                sx={{ borderColor: '#059669', color: '#059669', '&:hover': { borderColor: '#047857', color: '#047857' } }}
              >
                Quay lại
              </Button>
              <Typography variant="body2" color="text.secondary">
                Ngày đăng: {formatDate(post.createdAt)}
              </Typography>
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 3, 
                textAlign: 'center',
                color: '#059669',
                background: 'linear-gradient(to right, #059669, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
              }}
            >
              {post.title}
            </Typography>
            
            {/* Phần mục lục - chỉ hiển thị nếu có sections */}
            {sections.length > 0 && (
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 2,
                  bgcolor: '#f5f5f5'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Thông tin bài viết
                </Typography>
                
                <List dense>
                  {sections.map((section, index) => (
                    <ListItem 
                      key={section.id} 
                      button 
                      onClick={() => scrollToSection(section.id)}
                      sx={{ 
                        color: '#0ea5e9',
                        pl: section.level > 2 ? (section.level - 1) * 2 : 0 // Thụt vào cho các tiêu đề cấp thấp hơn
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: '30px' }}>
                        <ArrowRightIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${section.level - 1}.${index + 1} ${section.title}`} 
                        primaryTypographyProps={{
                          fontSize: section.level > 2 ? '0.95rem' : 'inherit'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            {/* Nội dung bài viết */}
            <div 
              className="blog-content" 
              dangerouslySetInnerHTML={createMarkup(formatContent(post.content))}
              style={{
                lineHeight: 1.8,
                fontSize: '1rem',
                color: '#333'
              }}
            />

            {/* Thông tin tác giả hoặc thẻ */}
            {post.userId && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eaeaea' }}>
                <Typography variant="body2" color="text.secondary">
                  Người viết: {post.userId}
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default BlogDetail;
