import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import skincareService from '../../services/skincareService';
import './Manager.css';

const skinTypes = ['Da dầu', 'Da khô', 'Da thường', 'Da hỗn hợp', 'Da nhạy cảm'];

const SkincareRoutineStaff = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState(skinTypes[0]);
  const [products, setProducts] = useState([]);
  const [content, setContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sidebarItems = [
    { id: 'orderStaff', name: 'Đơn hàng', icon: '📋' },
    { id: 'productStaff', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerStaff', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportStaff', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherStaff', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackStaff', name: 'Đánh giá sản phẩm', icon: '📢' },
    { id: 'blogStaff', name: 'Blog', icon: '📰' },
    { id: 'skincareRoutineStaff', name: 'Quy trình chăm sóc da', icon: '💆‍♀️' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedSkinType]);

  const loadData = async () => {
    try {
      // Tạo controller để hủy request khi component unmount
      const controller = new AbortController();
      const signal = controller.signal;

      // Gọi API để lấy dữ liệu sản phẩm và nội dung
      console.log(`Đang tải dữ liệu cho loại da: ${selectedSkinType}`);
      
      // Sử dụng getRoutineBySkinType thay vì getRoutineContent vì cả hai đều dùng cùng endpoint
      const contentResponse = await skincareService.getRoutineBySkinType(selectedSkinType, signal);
      console.log('Kết quả API getRoutineBySkinType:', contentResponse);
      
      // Xử lý dữ liệu nội dung
      let contentData = null;
      if (contentResponse) {
        // Kiểm tra xem dữ liệu có trực tiếp trong response không
        if (contentResponse.RoutineId || contentResponse.SkinType || contentResponse.Title || contentResponse.Content) {
          contentData = contentResponse;
          console.log('Dữ liệu trực tiếp trong response (viết hoa):', contentData);
        } 
        // Kiểm tra xem dữ liệu có trực tiếp trong response (viết thường) không
        else if (contentResponse.routineId || contentResponse.skinType || contentResponse.title || contentResponse.content) {
          contentData = contentResponse;
          console.log('Dữ liệu trực tiếp trong response (viết thường):', contentData);
        }
        // Kiểm tra xem dữ liệu có trong response.data không
        else if (contentResponse.data) {
          contentData = contentResponse.data;
          console.log('Dữ liệu trong response.data:', contentData);
        }

        // Xử lý trường hợp tên trường viết hoa hoặc viết thường
        if (contentData) {
          // Đảm bảo cả hai phiên bản (viết hoa và viết thường) đều có sẵn
          // Từ viết hoa sang viết thường
          if (contentData.Title && !contentData.title) {
            contentData.title = contentData.Title;
          }
          if (contentData.Content && !contentData.content) {
            contentData.content = contentData.Content;
          }
          if (contentData.ImageUrl && !contentData.imageUrl) {
            contentData.imageUrl = contentData.ImageUrl;
          }
          if (contentData.RoutineId && !contentData.routineId) {
            contentData.routineId = contentData.RoutineId;
          }
          if (contentData.SkinType && !contentData.skinType) {
            contentData.skinType = contentData.SkinType;
          }
          
          // Từ viết thường sang viết hoa
          if (contentData.title && !contentData.Title) {
            contentData.Title = contentData.title;
          }
          if (contentData.content && !contentData.Content) {
            contentData.Content = contentData.content;
          }
          if (contentData.imageUrl && !contentData.ImageUrl) {
            contentData.ImageUrl = contentData.imageUrl;
          }
          if (contentData.routineId && !contentData.RoutineId) {
            contentData.RoutineId = contentData.routineId;
          }
          if (contentData.skinType && !contentData.SkinType) {
            contentData.SkinType = contentData.skinType;
          }
          
          console.log('Dữ liệu nội dung sau khi chuẩn hóa:', contentData);
        }
      }

      // Sau khi có thông tin quy trình, lấy danh sách sản phẩm
      let productsData = [];
      if (contentData && contentData.routineId) {
        try {
          // Sử dụng endpoint products
          const productsResponse = await skincareService.getRoutineProducts(selectedSkinType);
          console.log('Kết quả API getRoutineProducts:', productsResponse);
          
          if (productsResponse) {
            // Kiểm tra xem dữ liệu có trực tiếp trong response không
            if (Array.isArray(productsResponse)) {
              productsData = productsResponse;
            } 
            // Kiểm tra xem dữ liệu có trong response.data không
            else if (productsResponse.data && Array.isArray(productsResponse.data)) {
              productsData = productsResponse.data;
            }
          }
        } catch (productError) {
          console.error('Lỗi khi lấy sản phẩm:', productError);
          // Vẫn tiếp tục với dữ liệu nội dung, không hiển thị lỗi
        }
      }

      // Cập nhật state
      setContent(contentData);
      setProducts(productsData);
      console.log('Dữ liệu đã cập nhật:', { contentData, productsData });

      // Fallback nếu không có dữ liệu
      if (!contentData) {
        setContent({
          skinType: selectedSkinType,
          title: `Quy trình chăm sóc da ${selectedSkinType}`,
          content: "Chúng tôi đang cập nhật quy trình chăm sóc chi tiết cho loại da này. Vui lòng quay lại sau!",
          imageUrl: '/images/default-skincare.jpg'
        });
      }

      return () => {
        controller.abort(); // Hủy request khi component unmount
      };
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      
      // Fallback nếu có lỗi
      setContent({
        skinType: selectedSkinType,
        title: `Quy trình chăm sóc da ${selectedSkinType}`,
        content: "Chúng tôi đang cập nhật quy trình chăm sóc chi tiết cho loại da này. Vui lòng quay lại sau!",
        imageUrl: '/images/default-skincare.jpg'
      });
      
      setSnackbar({
        open: true,
        message: 'Lỗi khi tải dữ liệu: ' + (error.message || 'Không thể kết nối đến máy chủ'),
        severity: 'error'
      });
    }
  };

  const handleSaveProducts = async () => {
    try {
      await skincareService.updateRoutineProducts(selectedSkinType, products);
      setSnackbar({
        open: true,
        message: 'Cập nhật sản phẩm thành công',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi cập nhật sản phẩm: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleSaveContent = async () => {
    try {
      await skincareService.updateRoutineContent(selectedSkinType, content);
      setSnackbar({
        open: true,
        message: 'Cập nhật nội dung thành công',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lỗi khi cập nhật nội dung: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleAddProduct = () => {
    setEditingProduct({
      StepName: '',
      ProductID: '',
      OrderIndex: products.length + 1,
      CustomDescription: ''
    });
    setOpenDialog(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setOpenDialog(true);
  };

  const handleDeleteProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const handleSaveProduct = () => {
    if (editingProduct.id) {
      const index = products.findIndex(p => p.id === editingProduct.id);
      const newProducts = [...products];
      newProducts[index] = editingProduct;
      setProducts(newProducts);
    } else {
      setProducts([...products, { ...editingProduct, id: Date.now() }]);
    }
    setOpenDialog(false);
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo" style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => navigate("/")}>
              <img 
                src="/images/logo.png" 
                alt="Beauty Cosmetics"
                style={{
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate("/")}>
              <div>BEAUTY</div>
              <div>COSMETICS</div>
            </div>
          </div>
          
          <div className="sidebar-title">STAFF</div>
          
          <div className="sidebar-menu">
            {sidebarItems.map((item) => (
              <div key={item.id} className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} style={{ cursor: 'pointer' }}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="dashboard-title-bar">
            <h1>Quản lý quy trình chăm sóc da</h1>
          </div>

          <Tabs
            value={selectedSkinType}
            onChange={(e, newValue) => setSelectedSkinType(newValue)}
            sx={{ mb: 3, bgcolor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            {skinTypes.map((type) => (
              <Tab key={type} label={type} value={type} />
            ))}
          </Tabs>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div className="dashboard-title-bar" style={{ marginBottom: '20px' }}>
                  <h2>Danh sách sản phẩm</h2>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                    sx={{ 
                      backgroundColor: '#0066ff',
                      '&:hover': { backgroundColor: '#0052cc' }
                    }}
                  >
                    Thêm sản phẩm
                  </Button>
                </div>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bước</TableCell>
                        <TableCell>Mã sản phẩm</TableCell>
                        <TableCell>Thứ tự</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product, index) => (
                        <TableRow key={product.id || index}>
                          <TableCell>{product.StepName}</TableCell>
                          <TableCell>{product.ProductID}</TableCell>
                          <TableCell>{product.OrderIndex}</TableCell>
                          <TableCell>{product.CustomDescription}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditProduct(product)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteProduct(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveProducts}
                    sx={{ 
                      backgroundColor: '#0066ff',
                      '&:hover': { backgroundColor: '#0052cc' }
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div className="dashboard-title-bar" style={{ marginBottom: '20px' }}>
                  <h2>Nội dung quy trình</h2>
                </div>

                <TextField
                  fullWidth
                  label="Tiêu đề"
                  value={content?.title || content?.Title || ''}
                  onChange={(e) => setContent({ ...content, title: e.target.value, Title: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Nội dung"
                  multiline
                  rows={4}
                  value={content?.content || content?.Content || ''}
                  onChange={(e) => setContent({ ...content, content: e.target.value, Content: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="URL hình ảnh"
                  value={content?.imageUrl || content?.ImageUrl || ''}
                  onChange={(e) => setContent({ ...content, imageUrl: e.target.value, ImageUrl: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveContent}
                    sx={{ 
                      backgroundColor: '#0066ff',
                      '&:hover': { backgroundColor: '#0052cc' }
                    }}
                  >
                    Lưu nội dung
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>
              {editingProduct?.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Bước"
                value={editingProduct?.StepName || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, StepName: e.target.value })}
                sx={{ mb: 2, mt: 2 }}
              />
              <TextField
                fullWidth
                label="Mã sản phẩm"
                value={editingProduct?.ProductID || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, ProductID: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Thứ tự"
                type="number"
                value={editingProduct?.OrderIndex || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, OrderIndex: parseInt(e.target.value) })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={2}
                value={editingProduct?.CustomDescription || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, CustomDescription: e.target.value })}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
              <Button onClick={handleSaveProduct} variant="contained">
                Lưu
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </Box>
  );
};

export default SkincareRoutineStaff; 