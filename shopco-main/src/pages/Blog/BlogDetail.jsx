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
      console.log('ID from URL params:', id, 'Type:', typeof id);
      
      // Kiểm tra nếu id là undefined hoặc không phải số
      if (id === undefined || id === null) {
        setError('ID bài viết không được định nghĩa');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Đảm bảo id là một số
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
          throw new Error('Blog ID phải là số');
        }
        
        console.log('Fetching post with numeric ID:', numericId);
        const response = await blogService.getPostById(numericId);
        console.log('Post data received:', response);
        
        // Kiểm tra response
        if (!response) {
          throw new Error('Không nhận được dữ liệu từ server');
        }
        
        // Xử lý dữ liệu từ backend
        const processedPost = {
          id: response.postId || numericId,
          title: response.title || 'Không có tiêu đề',
          content: response.content || 'Không có nội dung',
          imageUrl: response.imageUrl || null,
          createdAt: response.createdAt || new Date().toISOString(),
          userId: response.userId || 1
        };
        
        setPost(processedPost);
        
        // Tự động tạo các section từ nội dung
        if (processedPost.content) {
          generateSectionsFromContent(processedPost.content);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(`Không thể tải bài viết. Lỗi: ${error.message}`);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Hàm phân tích nội dung để tạo mục lục
  const generateSectionsFromContent = (content) => {
    if (!content) {
      console.warn('Content is empty, cannot generate sections');
      return;
    }
    
    try {
      // Tìm các tiêu đề dạng số (1., 1.1., v.v.) trong văn bản
      const headingRegex = /^(\d+(\.\d+)?)\.?\s+(.+)$/gm;
      let match;
      const extractedSections = [];
      let index = 0;
      
      // Tạo bản sao của nội dung để tìm kiếm
      const contentCopy = content.toString();
      
      while ((match = headingRegex.exec(contentCopy)) !== null) {
        const fullHeading = match[0]; // Toàn bộ tiêu đề, ví dụ: "1. Tiêu đề chính"
        const headingNumber = match[1]; // Số, ví dụ: "1" hoặc "1.1"
        const headingText = match[3]; // Phần text của tiêu đề, ví dụ: "Tiêu đề chính"
        const sectionId = `section-${index}`;
        
        // Xác định level dựa trên số lượng dấu chấm trong headingNumber
        const level = (headingNumber.match(/\./g) || []).length + 2; // level 2 = h2, level 3 = h3, etc.
        
        extractedSections.push({
          id: sectionId,
          title: headingText, // Chỉ lấy phần text
          fullTitle: fullHeading, // Lấy cả tiêu đề đầy đủ
          level: level
        });
        
        sectionRefs.current[sectionId] = sectionId;
        index++;
      }
      
      // Nếu tìm thấy các tiêu đề
      if (extractedSections.length > 0) {
        setSections(extractedSections);
        return;
      }
      
      // Nếu không tìm thấy tiêu đề ở trên, thử tìm bằng cách phân tích văn bản thành các đoạn
      const paragraphs = content.split('\n\n');
      if (paragraphs.length > 2) {
        const paragraphSections = [];
        
        for (let i = 0; i < paragraphs.length; i++) {
          if (paragraphs[i].trim().length < 20) continue; // Bỏ qua đoạn quá ngắn
          
          const sectionId = `section-para-${i}`;
          paragraphSections.push({
            id: sectionId,
            title: paragraphs[i].substring(0, 70) + (paragraphs[i].length > 70 ? '...' : ''),
            level: 2
          });
          
          sectionRefs.current[sectionId] = sectionId;
        }
        
        if (paragraphSections.length > 0) {
          setSections(paragraphSections);
        }
      }
    } catch (error) {
      console.error('Error generating sections:', error);
    }
  };
  
  // Hàm scroll đến section được chọn
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hàm để tạo HTML an toàn từ nội dung của post
  const createMarkup = (content) => {
    if (!content) return { __html: '' };
    
    try {
      // Xử lý văn bản thuần thành HTML có cấu trúc
      let htmlContent = content;
      
      // Tìm các tiêu đề có dạng số
      htmlContent = htmlContent.replace(
        /^(\d+(\.\d+)?)\.?\s+(.+)$/gm, 
        (match, number, dot, text) => {
          const level = (number.match(/\./g) || []).length + 2; // level 2 = h2, level 3 = h3, etc.
          const sectionId = `section-${sections.findIndex(s => s.fullTitle === match) || Math.random().toString(36).substr(2, 9)}`;
          return `<h${level} id="${sectionId}">${match}</h${level}>`;
        }
      );
      
      // Chuyển đổi đoạn văn và xuống dòng
      htmlContent = htmlContent.split('\n\n').map((paragraph, index) => {
        if (!paragraph.trim()) return '';
        if (paragraph.startsWith('<h')) return paragraph; // Nếu đã là tiêu đề thì giữ nguyên
        return `<p id="paragraph-${index}">${paragraph.replace(/\n/g, '<br>')}</p>`;
      }).join('');
      
      return { __html: DOMPurify.sanitize(htmlContent) };
    } catch (error) {
      console.error('Error creating markup:', error);
      
      // Nếu có lỗi, trả về nội dung dạng văn bản đơn giản
      return { 
        __html: DOMPurify.sanitize(`<p>${content.replace(/\n/g, '<br>')}</p>`)
      };
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const fetchPost = async () => {
      // Kiểm tra lại ID khi retry
      if (!id || isNaN(parseInt(id))) {
        setError('ID bài viết không hợp lệ hoặc không phải là số');
        setLoading(false);
        return;
      }
      
      try {
        const response = await blogService.getPostById(parseInt(id));
        
        if (!response) {
          throw new Error('Không nhận được dữ liệu từ server');
        }
        
        // Xử lý dữ liệu
        const processedPost = {
          id: parseInt(id),
          title: response.title || 'Không có tiêu đề',
          content: response.content || 'Không có nội dung',
          imageUrl: response.imageUrl || null,
          createdAt: response.createdAt || new Date().toISOString(),
          userId: response.userId || 1
        };
        
        setPost(processedPost);
        
        if (processedPost.content) {
          generateSectionsFromContent(processedPost.content);
        }
        setLoading(false);
      } catch (error) {
        setError(`Không thể tải bài viết. Lỗi: ${error.message}`);
        setLoading(false);
      }
    };
    fetchPost();
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
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<ArrowBack />} 
                onClick={goBack}
                sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
              >
                Quay lại
              </Button>
              <Button 
                variant="outlined"
                onClick={handleRetry}
                sx={{ borderColor: '#059669', color: '#059669', '&:hover': { borderColor: '#047857', color: '#047857' } }}
              >
                Thử lại
              </Button>
            </Box>
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
              onError={(e) => {
                console.log('Image failed to load, using fallback');
                e.target.src = '/images/blog-placeholder.jpg';
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
              {post.title || 'Không có tiêu đề'}
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
                  Mục lục bài viết
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
                        primary={section.fullTitle || section.title} 
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
              dangerouslySetInnerHTML={createMarkup(post.content)}
              style={{
                lineHeight: 1.8,
                fontSize: '1rem',
                color: '#333'
              }}
            />

            {/* Thông tin tác giả nếu có */}
            {post.userId && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eaeaea' }}>
                <Typography variant="body2" color="text.secondary">
                  Người viết: ID {post.userId}
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
