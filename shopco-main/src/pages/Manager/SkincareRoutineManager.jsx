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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import skincareService from '../../apis/skincareService';
import './Manager.css';

const skinTypes = ['Da dầu', 'Da khô', 'Da thường', 'Da hỗn hợp', 'Da nhạy cảm'];

const SkincareRoutineManager = () => {
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
    { id: 'orderManager', name: 'Đơn hàng', icon: '📋' },
    { id: 'productManager', name: 'Sản phẩm', icon: '📦' },
    { id: 'customerManager', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'supportManager', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucherManager', name: 'Vouchers', icon: '🎫' },
    { id: 'feedbackManager', name: 'Đánh giá sản phẩm', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' },
    { id: 'skincareRoutineManager', name: 'Quy trình chăm sóc da', icon: '💆‍♀️' }
  ];

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    loadData(signal);

    return () => {
      controller.abort();
    };
  }, [selectedSkinType]);

  const loadData = async (signal) => {
    try {
      setLoading(true);
      const response = await skincareService.getRoutineBySkinType(selectedSkinType, signal);
      console.log('Response từ API:', response);
      
      // Xử lý dữ liệu trả về
      let data = null;
      
      // Kiểm tra nếu response là dữ liệu trực tiếp (có routineId, skinType, title, etc.)
      if (response && (response.routineId || response.skinType || response.title)) {
        console.log('Response chứa dữ liệu trực tiếp');
        data = response;
      }
      // Kiểm tra nếu response có trường data
      else if (response && response.data) {
        console.log('Response chứa dữ liệu trong trường data');
        data = response.data;
      }
      
      if (data) {
        console.log('Dữ liệu đã xử lý:', data);
        
        // Xử lý các trường với cả chữ cái đầu viết hoa và viết thường
        setContent({
          Title: data.Title || data.title || '', 
          Content: data.Content || data.content || '', 
          ImageUrl: data.ImageUrl || data.imageUrl || ''
        });

        // Xử lý các trường sản phẩm với cả chữ cái đầu viết hoa và viết thường
        if (data.recommendedProducts || data.RecommendedProducts) {
          setProducts(data.recommendedProducts || data.RecommendedProducts || []);
        } else if (data.Products || data.products) {
          setProducts(data.Products || data.products || []);
        } else {
          setProducts([]);
        }
      } else {
        console.log('Không tìm thấy dữ liệu hợp lệ');
        setSnackbar({
          open: true,
          message: 'Không tìm thấy dữ liệu cho loại da này',
          severity: 'warning'
        });
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Lỗi khi tải dữ liệu:', error);
        setSnackbar({
          open: true,
          message: 'Lỗi khi tải dữ liệu: ' + (error.response?.data || error.message),
          severity: 'error'
        });
      }
    } finally {
      if (signal && !signal.aborted) {
        setLoading(false);
      }
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
          
          <div className="sidebar-title">MANAGER</div>
          
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
                    value={content?.Title || ''}
                    onChange={(e) => setContent({ ...content, Title: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Nội dung"
                    multiline
                    rows={10}
                    value={content?.Content || ''}
                    onChange={(e) => setContent({ ...content, Content: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="URL hình ảnh"
                    value={content?.ImageUrl || ''}
                    onChange={(e) => setContent({ ...content, ImageUrl: e.target.value })}
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

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div className="dashboard-title-bar" style={{ marginBottom: '20px' }}>
                    <h2>Xem trước nội dung</h2>
                  </div>

                  <Box 
                    sx={{ 
                      border: '1px solid #ccc', 
                      p: 3, 
                      borderRadius: '8px', 
                      minHeight: '400px', 
                      bgcolor: 'white', 
                      overflowY: 'auto', 
                      wordWrap: 'break-word'
                    }}
                  >
                    {content?.Content ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: String(content.Content)
                            .replace(/\n/g, '<br>')
                            .replace(/- /g, '• ')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        }} 
                      />
                    ) : (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Nhập nội dung để xem trước
                      </Typography>
                    )}
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

export default SkincareRoutineManager;