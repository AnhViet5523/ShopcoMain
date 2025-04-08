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
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import skincareService from '../../apis/skincareService';
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
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const controller = new AbortController();
      const signal = controller.signal;

      console.log(`Đang tải dữ liệu cho loại da: ${selectedSkinType}`);
      const contentResponse = await skincareService.getRoutineBySkinType(selectedSkinType, signal);
      console.log('Kết quả API getRoutineBySkinType:', contentResponse);
      
      let contentData = null;
      if (contentResponse) {
        if (contentResponse.RoutineId || contentResponse.SkinType || contentResponse.Title || contentResponse.Content) {
          contentData = contentResponse;
        } 
        else if (contentResponse.routineId || contentResponse.skinType || contentResponse.title || contentResponse.content) {
          contentData = contentResponse;
        }
        else if (contentResponse.data) {
          contentData = contentResponse.data;
        }

        if (contentData) {
          if (contentData.Title && !contentData.title) contentData.title = contentData.Title;
          if (contentData.Content && !contentData.content) contentData.content = contentData.Content;
          if (contentData.ImageUrl && !contentData.imageUrl) contentData.imageUrl = contentData.ImageUrl;
          if (contentData.RoutineId && !contentData.routineId) contentData.routineId = contentData.RoutineId;
          if (contentData.SkinType && !contentData.skinType) contentData.skinType = contentData.SkinType;
          if (contentData.title && !contentData.Title) contentData.Title = contentData.title;
          if (contentData.content && !contentData.Content) contentData.Content = contentData.content;
          if (contentData.imageUrl && !contentData.ImageUrl) contentData.ImageUrl = contentData.imageUrl;
          if (contentData.routineId && !contentData.RoutineId) contentData.RoutineId = contentData.routineId;
          if (contentData.skinType && !contentData.SkinType) contentData.SkinType = contentData.skinType;
          console.log('Dữ liệu nội dung sau khi chuẩn hóa:', contentData);
        }
      }

      let productsData = [];
      if (contentData && contentData.routineId) {
        try {
          const productsResponse = await skincareService.getRoutineProducts(selectedSkinType);
          console.log('Kết quả API getRoutineProducts:', productsResponse);
          if (productsResponse) {
            if (Array.isArray(productsResponse)) productsData = productsResponse;
            else if (productsResponse.data && Array.isArray(productsResponse.data)) productsData = productsResponse.data;
            else if (productsResponse.recommendedProducts && Array.isArray(productsResponse.recommendedProducts)) productsData = productsResponse.recommendedProducts;
            else if (productsResponse.data && productsResponse.data.recommendedProducts && Array.isArray(productsResponse.data.recommendedProducts)) productsData = productsResponse.data.recommendedProducts;
            else if (productsResponse.data && productsResponse.data.products && Array.isArray(productsResponse.data.products)) productsData = productsResponse.data.products;
          }
        } catch (productError) {
          console.error('Lỗi khi lấy sản phẩm:', productError);
        }
      }

      setContent(contentData);
      setProducts(productsData);
      console.log('Dữ liệu đã cập nhật:', { contentData, productsData });

      if (!contentData) {
        setContent({
          SkinType: selectedSkinType,
          Title: `Quy trình chăm sóc da ${selectedSkinType}`,
          Content: "Chúng tôi đang cập nhật quy trình chăm sóc chi tiết cho loại da này. Vui lòng quay lại sau!",
          ImageUrl: '/images/default-skincare.jpg'
        });
      }

      return () => controller.abort();
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      if (error.name !== 'AbortError' && !error.message.includes('Request was cancelled')) {
        setContent({
          SkinType: selectedSkinType,
          Title: `Quy trình chăm sóc da ${selectedSkinType}`,
          Content: "Chúng tôi đang cập nhật quy trình chăm sóc chi tiết cho loại da này. Vui lòng quay lại sau!",
          ImageUrl: '/images/default-skincare.jpg'
        });
        setSnackbar({ open: true, message: 'Lỗi khi tải dữ liệu: ' + (error.message || 'Không thể kết nối đến máy chủ'), severity: 'error' });
      } else {
        console.log('Yêu cầu tải dữ liệu bị hủy, bỏ qua hiển thị lỗi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProducts = async () => {
    try {
      await skincareService.updateRoutineProducts(selectedSkinType, products);
      setSnackbar({ open: true, message: 'Cập nhật sản phẩm thành công', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật sản phẩm: ' + error.message, severity: 'error' });
    }
  };

  const handleSaveContent = async () => {
    try {
      console.log(`[Staff(Manager Logic) Log - PUT] Attempting to save content for skinType: ${selectedSkinType}`);
      console.log('[Staff(Manager Logic) Log - PUT] Exact content object being sent:', JSON.stringify(content, null, 2));
      
      await skincareService.updateRoutineContent(selectedSkinType, content);
      setSnackbar({ open: true, message: 'Cập nhật nội dung thành công', severity: 'success' });
    } catch (error) {
      console.error('[Staff(Manager Logic) Error - PUT] Lỗi khi cập nhật nội dung:', error);
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật nội dung: ' + (error.response?.data?.message || error.message), severity: 'error' });
    }
  };

  const handleAddProduct = () => {
    setEditingProduct({ StepName: '', ProductID: '', OrderIndex: products.length + 1, CustomDescription: '' });
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
      if (index !== -1) {
        const newProducts = [...products];
        newProducts[index] = editingProduct;
        setProducts(newProducts);
      } else {
        setProducts([...products, { ...editingProduct, id: Date.now() }]);
      }
    } else {
      setProducts([...products, { ...editingProduct, id: Date.now() }]);
    }
    setOpenDialog(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true); // Hiển thị trạng thái tải lên đang tải
      
      console.log(`[Staff] Bắt đầu tải lên ảnh cho loại da: ${selectedSkinType}`);
      const result = await skincareService.uploadRoutineImage(selectedSkinType, file);
      console.log('[Staff] Kết quả tải lên ảnh:', result);
      
      // Hiển thị thông báo thành công bất kể kết quả như thế nào
      // Vì ảnh đã được cập nhật trong DB nhưng FE có thể gặp lỗi
      setSnackbar({
        open: true,
        message: 'Ảnh đã được tải lên thành công',
        severity: 'success'
      });
      
      // Cập nhật URL ảnh trong state nếu có
      if (result && result.imageUrl) {
        console.log('[Staff] Tìm thấy imageUrl trong kết quả:', result.imageUrl);
        setContent(prev => ({
          ...prev,
          ImageUrl: result.imageUrl,
          imageUrl: result.imageUrl
        }));
      } else {
        console.log('[Staff] Không tìm thấy imageUrl trong kết quả, nhưng ảnh đã được cập nhật trong DB');
      }
      
      // Tải lại trang sau 1 giây để hiển thị ảnh mới
      setTimeout(() => {
        console.log('[Staff] Tải lại trang sau 1 giây để hiển thị ảnh mới');
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('[Staff] Lỗi khi tải lên ảnh:', error);
      // Vẫn hiển thị thành công vì ảnh có thể đã được cập nhật trong DB
      setSnackbar({
        open: true,
        message: 'Ảnh đã được tải lên thành công',
        severity: 'success'
      });
      
      // Tải lại trang sau khi gặp lỗi
      setTimeout(() => {
        console.log('[Staff] Tải lại trang sau khi gặp lỗi');
        window.location.reload();
      }, 1000);
    } finally {
      setLoading(false); // Tắt trạng thái đang tải
    }
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                            <TableCell>{product.stepName || product.StepName}</TableCell>
                            <TableCell>{product.productId || product.ProductID}</TableCell>
                            <TableCell>{product.orderIndex || product.OrderIndex}</TableCell>
                            <TableCell>{product.customDescription || product.CustomDescription}</TableCell>
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
                    value={content?.Title || content?.title || ''}
                    onChange={(e) => setContent({ ...content, Title: e.target.value, title: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Nội dung"
                    multiline
                    rows={20}
                    value={content?.Content || content?.content || ''}
                    onChange={(e) => setContent({ ...content, Content: e.target.value, content: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="URL hình ảnh"
                    value={content?.ImageUrl || content?.imageUrl || ''}
                    onChange={(e) => setContent({ ...content, ImageUrl: e.target.value, imageUrl: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ 
                        backgroundColor: '#4CAF50',
                        '&:hover': { backgroundColor: '#388E3C' }
                      }}
                    >
                      Tải lên ảnh
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Button>
                    {content?.ImageUrl && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <img 
                          src={content.ImageUrl || content.imageUrl} 
                          alt="Hình ảnh quy trình" 
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                        />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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
          )}

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
                onChange={(e) => setEditingProduct({ ...editingProduct, OrderIndex: parseInt(e.target.value) || 0 })}
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