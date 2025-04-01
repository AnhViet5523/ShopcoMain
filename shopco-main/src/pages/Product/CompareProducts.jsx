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
  Breadcrumbs
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
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
          
          // Tải hình ảnh cho tất cả sản phẩm trong modal
          filteredProducts.forEach(product => {
            if(product.productId) {
              fetchProductImages(product.productId);
            }
          });
        } else {
          // Nếu không tìm thấy categoryId, lấy tất cả sản phẩm
          const allProducts = await productService.getAllProducts();
          const filteredProducts = allProducts.filter(
            p => !comparedProducts.some(cp => cp.productId === p.productId)
          );
          setAvailableProducts(filteredProducts);
          
          // Tải hình ảnh cho tất cả sản phẩm trong modal
          filteredProducts.forEach(product => {
            if(product.productId) {
              fetchProductImages(product.productId);
            }
          });
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

    // Fallback: sử dụng ảnh từ imageUrl nếu có
    if (product.imageUrl) {
      return product.imageUrl;
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        bgcolor: "#f9f9f9", 
        borderBottom: '1px solid #eaeaea',
        py: 1,
        width: '99vw'
      }}>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb" sx={{ my: 2 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Trang chủ
            </Link>
            <Typography color="text.primary">So sánh sản phẩm</Typography>
          </Breadcrumbs>
        </Container>
      </Box>
      
      <Box sx={{ backgroundColor: '#ffffff', py: 4, minHeight: 'calc(100vh - 200px)', width: '99vw' }}>
        <Container maxWidth="lg">
          {/* Bỏ Paper đầu tiên, chuyển thẳng sang bảng so sánh */}

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
                          flex: '0 0 auto',
                          height: '120px',
                          alignItems: 'center'
                        }}>
                          {imagesLoading ? (
                            <CircularProgress size={24} />
                          ) : (
                            <img 
                              src={getImageUrl(product)} 
                              alt={product.productName}
                              style={{ height: '120px', maxWidth: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/default-product.jpg';
                              }}
                            />
                          )}
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

          {/* Bảng so sánh mới theo mẫu hình */}
          <Paper elevation={1} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<CloseIcon />}
                onClick={handleClearComparison}
              >
                Xóa so sánh
              </Button>
            </Box>
            
            <Box sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              overflow: 'hidden',
              mb: 2
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {/* Hàng đầu tiên: tên sản phẩm và hình ảnh */}
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ 
                      width: '20%', 
                      padding: '16px', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #e0e0e0', 
                      borderRight: '1px solid #e0e0e0' 
                    }}>
                      <Typography variant="body1" fontWeight="bold">Sản phẩm</Typography>
                    </th>
                    {comparedProducts.map((product, idx) => (
                      <th key={`header-${product.productId}`} style={{ 
                        width: comparedProducts.length === 1 ? '40%' : `${80 / comparedProducts.length}%`,
                        padding: '16px',
                        borderBottom: '1px solid #e0e0e0',
                        borderRight: idx < comparedProducts.length - 1 ? '1px solid #e0e0e0' : 'none',
                        textAlign: 'center'
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center'
                        }}>
                          <Box sx={{ 
                            height: 120, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1,
                            position: 'relative',
                            width: '100%'
                          }}>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveProduct(idx);
                              }}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                minWidth: '60px',
                                py: 0.5
                              }}
                            >
                              Xóa
                            </Button>
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
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'bold',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            maxHeight: '3em'
                          }}>
                            {product.productName}
                          </Typography>
                          <Typography color="error" fontWeight="bold" sx={{ mt: 1 }}>
                            {product.price?.toLocaleString()}đ
                          </Typography>
                        </Box>
                      </th>
                    ))}
                    
                    {/* Nếu chỉ có 1 sản phẩm, hiển thị ô thêm sản phẩm */}
                    {comparedProducts.length === 1 && (
                      <th style={{ 
                        width: '40%',
                        padding: '16px',
                        borderBottom: '1px solid #e0e0e0',
                        textAlign: 'center'
                      }}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%'
                        }}>
                          <Box sx={{ 
                            height: 120, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            mb: 1
                          }}>
                            <MoreHorizIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                          </Box>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Thêm sản phẩm để so sánh
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={handleOpenAddProductModal}
                            sx={{ mb: 1 }}
                          >
                            Thêm sản phẩm
                          </Button>
                        </Box>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* TIÊU ĐỀ: THÔNG TIN CƠ BẢN */}
                  <tr>
                    <td colSpan={comparedProducts.length === 1 ? 3 : comparedProducts.length + 1} style={{ 
                      padding: '12px 16px',
                      borderBottom: '1px solid #e0e0e0',
                      backgroundColor: '#f5f5f5',
                      fontWeight: 'bold'
                    }}>
                      <Typography variant="subtitle1" fontWeight="bold">Thông tin cơ bản</Typography>
                    </td>
                  </tr>
                  
                  {/* Các hàng thông số kỹ thuật */}
                  {comparisonFields.map((field) => (
                    <tr key={field.label}>
                      <td style={{ 
                        padding: '12px 16px',
                        borderBottom: '1px solid #e0e0e0',
                        borderRight: '1px solid #e0e0e0',
                        backgroundColor: '#fafafa'
                      }}>
                        <Typography variant="body2" fontWeight="bold">{field.label}</Typography>
                      </td>
                      {comparedProducts.map((product, idx) => (
                        <td key={`${field.label}-${product.productId}`} style={{ 
                          padding: '12px 16px',
                          borderBottom: '1px solid #e0e0e0',
                          borderRight: idx < comparedProducts.length - 1 ? '1px solid #e0e0e0' : 'none',
                          textAlign: 'center'
                        }}>
                          {field.renderComponent ? field.renderComponent(product) : (
                            <Typography variant="body2">
                              {field.format(product[field.key])}
                            </Typography>
                          )}
                        </td>
                      ))}
                      
                      {/* Nếu chỉ có 1 sản phẩm, hiển thị ô trống */}
                      {comparedProducts.length === 1 && (
                        <td style={{ 
                          padding: '12px 16px',
                          borderBottom: '1px solid #e0e0e0',
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" color="text.disabled">
                            -
                          </Typography>
                        </td>
                      )}
                    </tr>
                  ))}
                  
                  {/* Lặp lại cho các nhóm thông tin chi tiết */}
                  {detailedFields.map((field) => (
                    <React.Fragment key={field.label}>
                      {/* Tiêu đề cho mỗi mục thông tin chi tiết */}
                      <tr>
                        <td colSpan={comparedProducts.length === 1 ? 3 : comparedProducts.length + 1} style={{ 
                          padding: '12px 16px',
                          borderBottom: '1px solid #e0e0e0',
                          backgroundColor: '#f5f5f5',
                          fontWeight: 'bold'
                        }}>
                          <Typography variant="subtitle1" fontWeight="bold">{field.label}</Typography>
                        </td>
                      </tr>
                      
                      {/* Nội dung cho mỗi mục chi tiết */}
                      {!field.renderComponent ? (
                        <tr>
                          <td style={{ 
                            padding: '12px 16px',
                            borderBottom: '1px solid #e0e0e0',
                            borderRight: '1px solid #e0e0e0',
                            backgroundColor: '#fafafa',
                            width: '20%'
                          }}>
                            <Typography variant="body2" fontWeight="bold">Chi tiết</Typography>
                          </td>
                          {comparedProducts.map((product, idx) => (
                            <td key={`${field.label}-${product.productId}`} style={{ 
                              padding: '16px',
                              borderBottom: '1px solid #e0e0e0',
                              borderRight: idx < comparedProducts.length - 1 ? '1px solid #e0e0e0' : 'none',
                              verticalAlign: 'top'
                            }}>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                {field.format(product[field.key])}
                              </Typography>
                            </td>
                          ))}
                          
                          {/* Nếu chỉ có 1 sản phẩm, hiển thị ô trống */}
                          {comparedProducts.length === 1 && (
                            <td style={{ 
                              padding: '16px',
                              borderBottom: '1px solid #e0e0e0',
                              textAlign: 'center',
                              verticalAlign: 'middle'
                            }}>
                              <Typography variant="body2" color="text.disabled">
                                -
                              </Typography>
                            </td>
                          )}
                        </tr>
                      ) : (
                        <tr>
                          <td style={{ 
                            padding: '12px 16px',
                            borderBottom: '1px solid #e0e0e0',
                            borderRight: '1px solid #e0e0e0',
                            backgroundColor: '#fafafa',
                            width: '20%'
                          }}>
                            <Typography variant="body2" fontWeight="bold">Chi tiết</Typography>
                          </td>
                          <td colSpan={comparedProducts.length === 1 ? 2 : comparedProducts.length} style={{ 
                            padding: '16px',
                            borderBottom: '1px solid #e0e0e0'
                          }}>
                            <Grid container spacing={2}>
                              {comparedProducts.map((product) => (
                                <Grid item xs={12} md={comparedProducts.length === 1 ? 6 : 12 / comparedProducts.length} key={product.productId}>
                                  {field.renderComponent(product)}
                                </Grid>
                              ))}
                              
                              {/* Nếu chỉ có 1 sản phẩm, hiển thị ô trống */}
                              {comparedProducts.length === 1 && (
                                <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
                                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    Thêm sản phẩm để so sánh
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>

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