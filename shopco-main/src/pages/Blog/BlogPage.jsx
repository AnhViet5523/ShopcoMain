import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Container, CircularProgress } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import adminService from '../../apis/adminService';
import './Blog.css';

export default function BlogPage() {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllPosts();
        console.log('Blog posts fetched:', data);
        setBlogPosts(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, []);
  
  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <>
    <Box sx={{ bgcolor: "#c2d3a0", minHeight: "100vh", width:'99vw' }}>
      <Header />
      <Container maxWidth="xl" sx={{ my: 4 }}>
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            p: { xs: 2, sm: 4 },
            my: 4
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 4 },
              textAlign: "center",
              borderRadius: "20px",
              width: "100%",
              backgroundColor: "#F5F5F5",
              boxShadow: 2,
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                mb: { xs: 3, sm: 4 },
                fontSize: { xs: "1.5rem", sm: "2rem" },
                color: "#2e7d32"
              }}
            >
              CẨM NANG CHĂM SÓC DA
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress color="success" />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ py: 4 }}>{error}</Typography>
            ) : blogPosts.length === 0 ? (
              <Typography sx={{ py: 4 }}>Chưa có bài viết nào.</Typography>
            ) : (
              <Grid 
                container 
                spacing={3}
                sx={{ 
                  alignItems: "stretch", 
                  justifyContent: "center" 
                }}
              >
                {blogPosts.map((post) => (
                  <Grid 
                    key={post.id} 
                    item 
                    xs={12} 
                    sm={6}
                    md={4}
                    sx={{ 
                      display: "flex"
                    }}
                  >
                    <Box 
                      className="blog-box"
                      onClick={() => handleBlogClick(post.id)}
                      sx={{ 
                        position: "relative", 
                        width: "100%",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "white",
                        boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.3s, box-shadow 0.3s",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0px 5px 15px rgba(0,0,0,0.2)"
                        }
                      }}
                    >
                      <Box
                        sx={{
                          height: "200px",
                          overflow: "hidden"
                        }}
                      >
                        <img
                          src={post.image || '/images/default-blog.webp'}
                          alt={post.title}
                          style={{ 
                            width: "100%", 
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.src = '/images/default-blog.webp';
                          }}
                        />
                      </Box>
                      <Box sx={{ p: 2, flexGrow: 1 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{
                            minHeight: "60px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {post.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {post.summary}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
    </>
  );
}