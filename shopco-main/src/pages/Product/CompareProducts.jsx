import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Rating,
  IconButton,
  Modal,
  Avatar,
  Divider,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import productService from '../../apis/productService';
import productImageService from '../../apis/productImageService';
import axiosClient from '../../apis/axiosClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';

export default function CompareProducts() {
  const [comparedProducts, setComparedProducts] = useState([]);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productReviews, setProductReviews] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState({});
  const [usernames, setUsernames] = useState({});
  const [productImages, setProductImages] = useState({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy sản phẩm đã so sánh từ localStorage
    const storedProducts = JSON.parse(localStorage.getItem('comparedProducts') || '[]');
    setComparedProducts(storedProducts);
    
    // Lấy đánh giá chi tiết cho các sản phẩm
    if(storedProducts.length > 0) {
      storedProducts.forEach(product => {
        if(product.productId) {
          fetchProductReviews(product.productId);
          fetchProductImages(product.productId);
        }
      });
    }
  }, []);

  // Hàm lấy thông tin username dựa trên userId
  const fetchUserInfo = async (userId) => {
    if (usernames[userId]) return; // Đã có thông tin username

    try {
      const response = await axiosClient.get(`/api/Users/${userId}`);
      if (response) {
        setUsernames(prev => ({
          ...prev,
          [userId]: response.userName || response.fullName || response.email || `Người dùng ${userId}`
        }));
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
      // Lưu tên mặc định nếu không lấy được thông tin
      setUsernames(prev => ({
        ...prev,
        [userId]: `Người dùng ${userId}`
      }));
    }
  };

  // Hàm lấy đánh giá chi tiết của sản phẩm
  const fetchProductReviews = async (productId) => {
    setReviewsLoading(prevState => ({...prevState, [productId]: true}));
    try {
      // Sử dụng productService để lấy đánh giá
      const reviews = await productService.getProductReviews(productId);
      
      // Cập nhật state với đánh giá mới
      setProductReviews(prevReviews => ({
        ...prevReviews,
        [productId]: reviews
      }));
      
      // Lấy thông tin username cho mỗi người đánh giá
      if (reviews && reviews.length > 0) {
        reviews.forEach(review => {
          if (review.userId) {
            fetchUserInfo(review.userId);
          }
        });
      }
      
      // Cập nhật thông tin đánh giá trung bình
      const ratingInfo = await productService.getProductAverageRating(productId);
      
      // Cập nhật thông tin sản phẩm với rating mới
      setComparedProducts(prevProducts => {
        const updatedProducts = prevProducts.map(p => {
          if (p.productId === productId) {
            return {
              ...p,
              rating: ratingInfo.averageRating,
              totalReviews: ratingInfo.totalReviews
            };
          }
          return p;
        });
        
        // Cập nhật localStorage
        localStorage.setItem('comparedProducts', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
    } catch (error) {
      console.error(`Lỗi khi lấy đánh giá cho sản phẩm ${productId}:`, error);
    } finally {
      setReviewsLoading(prevState => ({...prevState, [productId]: false}));
    }
  };

  // Hàm lấy ảnh cho sản phẩm
  const fetchProductImages = async (productId) => {
    try {
      setImagesLoading(true);
      const images = await productImageService.getProductImages(productId);
      
      // Kiểm tra xem kết quả trả về có phải là mảng hay không
      let productImageArray = [];
      if (Array.isArray(images)) {
        productImageArray = images;
      } else if (images && images.$values && Array.isArray(images.$values)) {
        productImageArray = images.$values;
      } else if (images) {
        // Nếu chỉ có một hình ảnh, đặt nó vào mảng
        productImageArray = [images];
      }
      
      // Sắp xếp ảnh theo displayOrder với 0 (ảnh chính) hiển thị đầu tiên
      productImageArray.sort((a, b) => a.displayOrder - b.displayOrder);
      
      setProductImages(prev => ({
        ...prev,
        [productId]: productImageArray
      }));
    } catch (error) {
      console.error(`Lỗi khi lấy ảnh cho sản phẩm ${productId}:`, error);
    } finally {
      setImagesLoading(false);
    }
  };

  const handleRemoveProduct = (indexToRemove) => {
    const updatedProducts = comparedProducts.filter((_, index) => index !== indexToRemove);
    setComparedProducts(updatedProducts);
    
    // Cập nhật localStorage
    localStorage.setItem('comparedProducts', JSON.stringify(updatedProducts));
  };

  const handleClearComparison = () => {
    setComparedProducts([]);
    localStorage.removeItem('comparedProducts');
    navigate('/');
  };

  // Nếu không có sản phẩm nào, quay về trang chủ
  if (comparedProducts.length === 0) {
    navigate('/');
    return null;
  }

  const handleOpenAddProductModal = async () => {
    try {
      setLoading(true);
      setIsAddProductModalOpen(true);
      
      if (comparedProducts.length > 0) {
        const currentProduct = comparedProducts[0];
        const categoryId = currentProduct.categoryId;
        
        if (categoryId) {
          // Lấy sản phẩm cùng danh mục
          const similarProducts = await productService.getProductsByCategory(categoryId);
          
          // Loại bỏ sản phẩm đã có trong danh sách so sánh
          const filteredProducts = similarProducts.filter(
            p => !comparedProducts.some(cp => cp.productId === p.productId)
          );
          
          setAvailableProducts(filteredProducts);
        } else {
          // Nếu không tìm thấy categoryId, lấy tất cả sản phẩm
          const allProducts = await productService.getAllProducts();
          const filteredProducts = allProducts.filter(
            p => !comparedProducts.some(cp => cp.productId === p.productId)
          );
          setAvailableProducts(filteredProducts);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách sản phẩm:', error);
      alert('Không thể tải danh sách sản phẩm để so sánh');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAddProductModal = () => {
    setIsAddProductModalOpen(false);
  };

  const handleAddProductToCompare = (productToAdd) => {
    const updatedProducts = [...comparedProducts, productToAdd];
    setComparedProducts(updatedProducts);
    localStorage.setItem('comparedProducts', JSON.stringify(updatedProducts));
    setIsAddProductModalOpen(false);
  };

  // Helper function to get image URL
  const getImageUrl = (product) => {
    if (!product || !product.productId) return '/images/default-product.jpg';
    
    // Kiểm tra xem có ảnh từ productImageService không
    const productImageArray = productImages[product.productId];
    if (productImageArray && productImageArray.length > 0) {
      // Lấy ảnh đầu tiên (thường là ảnh chính với displayOrder = 0)
      const mainImage = productImageArray[0];
      if (mainImage && mainImage.imgUrl) {
        return mainImage.imgUrl;
      }
    }
    
    // Fallback: sử dụng ảnh từ product object
    if (product.imgURL) {
      return product.imgURL;
    }
    
    // Fallback: sử dụng ảnh mặc định
    return '/images/default-product.jpg';
  };

  // Danh sách các mục để so sánh
  const comparisonFields = [
    { 
      label: 'Giá', 
      key: 'price',
      format: (value) => `${value?.toLocaleString()}đ`
    },
    {
      label: 'Đánh giá',
      key: 'rating',
      renderComponent: (product) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating 
            value={product.rating || 0} 
            precision={0.5} 
            readOnly 
            size="small"
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({product.totalReviews || (productReviews[product.productId]?.length || 0)} đánh giá)
          </Typography>
        </Box>
      )
    },
    { 
      label: 'Thương hiệu', 
      key: 'brand',
      format: (value) => value || 'Chưa có thông tin'
    },
    { 
      label: 'Xuất xứ', 
      key: 'origin',
      format: (value) => value || 'Chưa có thông tin'
    },
    { 
      label: 'Loại da', 
      key: 'skinType',
      format: (value) => value || 'Chưa có thông tin'
    },
    { 
      label: 'Dung tích', 
      key: 'capacity',
      format: (value) => value || 'Chưa có thông tin'
    },
    { 
      label: 'Trạng thái', 
      key: 'status',
      format: (value) => value === 'Available' ? 'Còn hàng' : 'Hết hàng'
    }
  ];

  const detailedFields = [
    { 
      label: 'Thành phần', 
      key: 'ingredients',
      format: (value) => value || 'Chưa có thông tin chi tiết'
    },
    { 
      label: 'Mô tả', 
      key: 'description',
      format: (value) => value || 'Chưa có mô tả'
    },
    { 
      label: 'Cách dùng', 
      key: 'usageInstructions',
      format: (value) => value || 'Chưa có hướng dẫn sử dụng'
    },
    {
      label: 'Đánh giá chi tiết',
      key: 'reviews',
      renderComponent: (product) => (
        <Box>
          {reviewsLoading[product.productId] ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : productReviews[product.productId] && productReviews[product.productId].length > 0 ? (
            productReviews[product.productId].slice(0, 3).map((review, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                    {usernames[review.userId] ? usernames[review.userId].charAt(0).toUpperCase() : 
                     (review.userName ? review.userName.charAt(0).toUpperCase() : 'U')}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {usernames[review.userId] || review.userName || `Người dùng ${review.userId}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {review.reviewComment}
                </Typography>
                {review.staffResponse && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #f0f0f0' }}>
                    <Typography variant="caption" fontWeight="bold">
                      Phản hồi từ cửa hàng:
                    </Typography>
                    <Typography variant="body2">
                      {review.staffResponse}
                    </Typography>
                  </Box>
                )}
                {index < productReviews[product.productId].slice(0, 3).length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Paper>
            ))
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {!productReviews[product.productId] ? 'Đang tải đánh giá...' : 'Chưa có đánh giá nào'}
              </Typography>
              {!productReviews[product.productId] && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => fetchProductReviews(product.productId)}
                >
                  Tải đánh giá
                </Button>
              )}
            </Box>
          )}
          
          {productReviews[product.productId] && productReviews[product.productId].length > 3 && (
            <Button 
              variant="text" 
              size="small"
              onClick={() => navigate(`/product/${product.productId}`, { state: { scrollToReviews: true } })}
            >
              Xem tất cả {productReviews[product.productId].length} đánh giá
            </Button>
          )}
        </Box>
      )
    }
  ];

  return (
    <>
      <Header />
      <Box sx={{ 
        borderBottom: '1px solid #eaeaea',
        py: 0,
        background: '#f9f9f9',
        width: '99vw'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
              <Typography variant="body2" component="span">
                Trang chủ
              </Typography>
            </Link>
            <Typography variant="body2" component="span" sx={{ mx: 1 }}>/</Typography>
            <Typography variant="body2" component="span" color="text.secondary">
              Tài khoản
            </Typography>
          </Box>
        </Container>
      </Box>
      
      <Box sx={{ backgroundColor: '#ffffff', py: 4, minHeight: 'calc(100vh - 200px)', width: '99vw' }}>
        <Container maxWidth="lg">
          <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">So sánh sản phẩm</Typography>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<CloseIcon />}
                onClick={handleClearComparison}
              >
                Xóa so sánh
              </Button>
            </Box>

            {comparedProducts.length === 1 && (
              <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                So Sánh {comparedProducts[0].productName} | Chính hãng VN/A
              </Typography>
            )}

            {/* Thông tin tổng quan */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {comparedProducts.map((product, index) => (
                <Grid item xs={12} md={comparedProducts.length === 1 ? 6 : 12 / comparedProducts.length} key={product.productId}>
                  {comparedProducts.length === 1 ? (
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      textAlign: 'center',
                      position: 'relative',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                      
                      <Box sx={{ 
                        height: 200, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        {imagesLoading ? (
                          <CircularProgress size={40} />
                        ) : (
                          <img 
                            src={getImageUrl(product)} 
                            alt={product.productName} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 1, fontWeight: 'bold' }}>
                        {product.productName}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Rating 
                          value={product.rating || 0} 
                          precision={0.5} 
                          readOnly 
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          ({product.totalReviews || (productReviews[product.productId]?.length || 0)})
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" color="error" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {product.price?.toLocaleString()}đ
                      </Typography>
                      
                      {product.originalPrice && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            textDecoration: 'line-through', 
                            color: 'text.secondary' 
                          }}
                        >
                          {product.originalPrice?.toLocaleString()}đ
                        </Typography>
                      )}
                      
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 2 }}
                        startIcon={<ShoppingCartIcon />}
                        component={Link}
                        to={`/product/${product.productId}`}
                      >
                        Mua ngay
                      </Button>
                    </Paper>
                  ) : (
                    <Paper elevation={3} sx={{ 
                      p: 3, 
                      position: 'relative', 
                      height: '100%',
                      borderRadius: 2,
                      boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        sx={{ position: 'absolute', top: 10, right: 10 }}
                        onClick={() => handleRemoveProduct(index)}
                      >
                        Xóa
                      </Button>

                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Box sx={{ 
                          height: 150, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mb: 2
                        }}>
                          {imagesLoading ? (
                            <CircularProgress size={30} />
                          ) : (
                            <img 
                              src={getImageUrl(product)} 
                              alt={product.productName} 
                              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                            />
                          )}
                        </Box>
                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                          {product.productName}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 1 }}>
                          <Rating 
                            value={product.rating || 0} 
                            precision={0.5} 
                            readOnly 
                            size="small"
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({product.totalReviews || (productReviews[product.productId]?.length || 0)})
                          </Typography>
                        </Box>
                        
                        <Typography variant="body1" color="error" sx={{ fontWeight: 'bold' }}>
                          {product.price?.toLocaleString()}đ
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mt: 2 }}
                          size="small"
                          component={Link}
                          to={`/product/${product.productId}`}
                        >
                          Mua ngay
                        </Button>
                      </Box>
                    </Paper>
                  )}
                </Grid>
              ))}

              {/* Nếu chỉ có 1 sản phẩm, hiển thị ô thêm sản phẩm */}
              {comparedProducts.length === 1 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ 
                    border: '2px dashed #e0e0e0', 
                    borderRadius: 2,
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minHeight: 300,
                    backgroundColor: 'rgba(0,0,0,0.01)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.03)',
                      borderColor: '#bdbdbd'
                    }
                  }}
                    onClick={handleOpenAddProductModal}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <MoreHorizIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
                        Thêm sản phẩm để so sánh
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        Nhấn vào đây để chọn thêm sản phẩm khác
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Modal thêm sản phẩm so sánh */}
          <Modal
            open={isAddProductModalOpen}
            onClose={handleCloseAddProductModal}
            aria-labelledby="modal-add-product"
          >
            <Box sx={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '70%' },
              maxWidth: 800,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 1,
              overflow: 'auto'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Chọn sản phẩm để so sánh</Typography>
                <IconButton onClick={handleCloseAddProductModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Đang tải sản phẩm...</Typography>
                </Box>
              ) : availableProducts.length > 0 ? (
                <Grid container spacing={2}>
                  {availableProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.productId}>
                      <Paper 
                        elevation={2}
                        sx={{ 
                          p: 2, 
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 4
                          },
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onClick={() => {
                          // Tự động lấy ảnh cho sản phẩm được thêm vào
                          fetchProductImages(product.productId);
                          handleAddProductToCompare(product);
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mb: 2,
                          flex: '0 0 auto'
                        }}>
                          <img 
                            src={getImageUrl(product)} 
                            alt={product.productName}
                            style={{ height: '120px', maxWidth: '100%', objectFit: 'contain' }}
                          />
                        </Box>
                        <Box sx={{ flex: '1 1 auto' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 'bold',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              height: '48px'
                            }}
                          >
                            {product.productName}
                          </Typography>
                          <Typography color="error" fontWeight="bold">
                            {product.price?.toLocaleString()}đ
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Rating value={product.rating || 4} size="small" readOnly precision={0.5} />
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              ({product.reviews?.length || 0})
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography>Không tìm thấy sản phẩm phù hợp để so sánh</Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/')}
                  >
                    Tìm sản phẩm khác
                  </Button>
                </Box>
              )}
            </Box>
          </Modal>

          {/* So sánh thông tin cơ bản */}
          <Paper elevation={1} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 1, fontWeight: 'bold' }}>
              Thông tin cơ bản
            </Typography>
            {comparisonFields.map((field) => (
              <Grid container key={field.label} sx={{ borderBottom: '1px solid #f0f0f0', py: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body1" fontWeight="bold" sx={{ py: 1 }}>{field.label}</Typography>
                </Grid>
                <Grid item xs={12} md={8} container spacing={2}>
                  {comparedProducts.map((product) => (
                    <Grid item xs={comparedProducts.length === 1 ? 6 : 12 / comparedProducts.length} key={product.productId}>
                      {field.renderComponent ? field.renderComponent(product) : (
                        <Typography variant="body2" sx={{ py: 1 }}>
                          {field.format(product[field.key])}
                        </Typography>
                      )}
                    </Grid>
                  ))}
                  
                  {/* Nếu chỉ có 1 sản phẩm, hiển thị ô trống */}
                  {comparedProducts.length === 1 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                        -
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            ))}
          </Paper>

          {/* So sánh thông tin chi tiết */}
          {detailedFields.map((field) => (
            <Paper key={field.label} elevation={1} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 1, fontWeight: 'bold' }}>
                {field.label}
              </Typography>
              <Grid container spacing={2}>
                {comparedProducts.map((product) => (
                  <Grid item xs={12} md={comparedProducts.length === 1 ? 6 : 12 / comparedProducts.length} key={product.productId}>
                    {field.renderComponent ? field.renderComponent(product) : (
                      <Typography variant="body2">
                        {field.format(product[field.key])}
                      </Typography>
                    )}
                  </Grid>
                ))}
                
                {/* Nếu chỉ có 1 sản phẩm, hiển thị ô trống */}
                {comparedProducts.length === 1 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.disabled">
                      -
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          ))}

          <Box sx={{ textAlign: 'center', mt: 4, mb: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/')}
              sx={{ mr: 2, px: 3, py: 1 }}
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(-1)}
              sx={{ px: 3, py: 1 }}
            >
              Quay lại trang sản phẩm
            </Button>
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
} 