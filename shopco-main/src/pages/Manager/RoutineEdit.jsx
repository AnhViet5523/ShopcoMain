import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem, Grid, 
  CircularProgress, Divider, Card, CardMedia, List, ListItem, 
  ListItemText, ListItemAvatar, Avatar, IconButton, Checkbox, 
  FormControlLabel, Tooltip
} from '@mui/material';
import { ArrowBack, Save, Cancel, Image, CloudUpload, Add, Delete, Search } from '@mui/icons-material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import adminService from '../../apis/adminService';
import axiosClient from '../../apis/axiosClient';
import './Manager.css';

const RoutineEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState({
    routineId: id,
    title: '',
    content: '',
    skinType: '',
    characteristics: [],
    morningSteps: [],
    eveningSteps: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [characteristics, setCharacteristics] = useState('');
  const [morningSteps, setMorningSteps] = useState('');
  const [eveningSteps, setEveningSteps] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // State cho phần sản phẩm phù hợp
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Danh sách các loại da
  const skinTypes = [
    { value: 'Da dầu', label: 'Da dầu' },
    { value: 'Da khô', label: 'Da khô' },
    { value: 'Da thường', label: 'Da thường' },
    { value: 'Da hỗn hợp', label: 'Da hỗn hợp' },
    { value: 'Da nhạy cảm', label: 'Da nhạy cảm' }
  ];

  useEffect(() => {
    // Tải thông tin quy trình khi component được mount
    const fetchRoutineData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminService.getSkinCareRoutineById(id);
        console.log('Dữ liệu quy trình từ API:', response);
        
        if (response) {
          // Xử lý dữ liệu từ API
          const routineData = {
            routineId: response.routineId || id,
            title: response.title || '',
            content: response.content || '',
            skinType: response.skinType || '',
            characteristics: [],
            morningSteps: [],
            eveningSteps: []
          };
          
          // Lưu URL hình ảnh nếu có
          if (response.imageUrl) {
            setImageUrl(response.imageUrl);
            setImagePreview(response.imageUrl);
          }
          
          // Phân tích nội dung để trích xuất đặc điểm và các bước chăm sóc
          parseContent(response.content, routineData);
          
          // Cập nhật state để hiển thị trong form
          setRoutine(routineData);
          setCharacteristics(routineData.characteristics.join('\n'));
          setMorningSteps(routineData.morningSteps.join('\n'));
          setEveningSteps(routineData.eveningSteps.join('\n'));
          
          // Tải các sản phẩm phù hợp
          if (response.routineId) {
            fetchSuitableProducts(response.routineId);
          }
        } else {
          setError('Không tìm thấy dữ liệu quy trình chăm sóc da');
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu quy trình:', err);
        setError(`Không thể tải dữ liệu quy trình. Lỗi: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    // Chỉ tải dữ liệu nếu có ID (đang chỉnh sửa quy trình đã tồn tại)
    if (id && id !== "create" && id !== "Create") {
      fetchRoutineData();
    } else {
      // Đang tạo mới quy trình, không cần tải dữ liệu
      setLoading(false);
    }
    
    // Tải danh sách tất cả sản phẩm
    fetchAllProducts();
  }, [id]);

  // Lấy danh sách tất cả sản phẩm
  const fetchAllProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axiosClient.get('/api/Products');
      console.log('Danh sách sản phẩm:', response);
      
      // Xử lý response dựa trên cấu trúc dữ liệu API trả về
      const productsList = Array.isArray(response) ? response : 
                         (response && response.$values ? response.$values : []);
      
      setProducts(productsList);
    } catch (err) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Lấy sản phẩm được gắn với quy trình
  const fetchSuitableProducts = async (routineId) => {
    try {
      const response = await axiosClient.get(`/api/SkincareRoutineProducts/ByRoutine/${routineId}`);
      console.log('Sản phẩm của quy trình:', response);
      
      // Xử lý response dựa trên cấu trúc dữ liệu API trả về
      const routineProducts = Array.isArray(response) ? response : 
                            (response && response.$values ? response.$values : []);
      
      // Lưu ID của các sản phẩm đã được chọn
      const productIds = routineProducts.map(rp => rp.productId);
      setSelectedProducts(productIds);
    } catch (err) {
      console.error(`Lỗi khi tải sản phẩm cho quy trình ID=${routineId}:`, err);
    }
  };
  
  // Tìm sản phẩm phù hợp với loại da
  const fetchProductsBySkinType = async () => {
    try {
      if (!routine.skinType) {
        alert('Vui lòng chọn loại da trước');
        return;
      }
      
      setLoadingProducts(true);
      
      // Lọc sản phẩm dựa trên loại da
      const response = await axiosClient.get('/api/Products');
      const allProducts = Array.isArray(response) ? response : 
                         (response && response.$values ? response.$values : []);
      
      // Lọc sản phẩm theo loại da (giả định rằng sản phẩm có trường skinType)
      const filteredProducts = allProducts.filter(product => {
        const productSkinType = product.skinType || product.SkinType || '';
        return productSkinType.toLowerCase().includes(routine.skinType.toLowerCase()) ||
               routine.skinType.toLowerCase().includes(productSkinType.toLowerCase());
      });
      
      console.log('Sản phẩm phù hợp với loại da:', filteredProducts);
      setProducts(filteredProducts);
    } catch (err) {
      console.error('Lỗi khi tìm sản phẩm theo loại da:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Hàm phân tích nội dung để trích xuất đặc điểm và các bước chăm sóc
  const parseContent = (content, routineData) => {
    if (!content) return;
    
    try {
      // Phân tích nội dung thành các phần
      const parts = content.split(/\r?\n\r?\n/);
      
      // Tìm phần đặc điểm
      const characteristicPart = parts.find(p => 
        p.includes("Đặc điểm") || p.includes("đặc điểm") || p.includes("ĐẶC ĐIỂM"));
        
      if (characteristicPart) {
        const charLines = characteristicPart.split(/\r?\n/)
          .filter(l => l.trim().startsWith("-"));
        routineData.characteristics = charLines.map(l => l.trim().substring(1).trim());
      }
      
      // Tìm phần buổi sáng
      const morningPart = parts.find(p => 
        p.includes("Buổi sáng") || p.includes("buổi sáng") || p.includes("BUỔI SÁNG"));
        
      if (morningPart) {
        const morningLines = morningPart.split(/\r?\n/)
          .filter(l => l.trim().startsWith("-"));
        routineData.morningSteps = morningLines.map(l => l.trim().substring(1).trim());
      }
      
      // Tìm phần buổi tối
      const eveningPart = parts.find(p => 
        p.includes("Buổi tối") || p.includes("buổi tối") || p.includes("BUỔI TỐI"));
        
      if (eveningPart) {
        const eveningLines = eveningPart.split(/\r?\n/)
          .filter(l => l.trim().startsWith("-"));
        routineData.eveningSteps = eveningLines.map(l => l.trim().substring(1).trim());
      }
    } catch (err) {
      console.error('Lỗi khi phân tích nội dung:', err);
    }
  };

  // Hàm tạo nội dung từ các thành phần
  const generateContent = () => {
    // Chuyển đổi danh sách đặc điểm thành chuỗi
    const charItems = characteristics.split('\n')
      .filter(item => item.trim())
      .map(item => `- ${item.trim()}`)
      .join('\n');
    
    // Chuyển đổi danh sách bước buổi sáng thành chuỗi
    const morningItems = morningSteps.split('\n')
      .filter(item => item.trim())
      .map(item => `- ${item.trim()}`)
      .join('\n');
    
    // Chuyển đổi danh sách bước buổi tối thành chuỗi
    const eveningItems = eveningSteps.split('\n')
      .filter(item => item.trim())
      .map(item => `- ${item.trim()}`)
      .join('\n');
    
    // Tạo nội dung đầy đủ
    return `Đặc điểm:\n${charItems}\n\nBuổi sáng: Tươi tắn, không bóng dầu\n${morningItems}\n\nBuổi tối: Làm sạch sâu, phục hồi da\n${eveningItems}`;
  };

  // Xử lý khi thay đổi input
  const handleInputChange = (field, value) => {
    setRoutine(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý khi thay đổi URL hình ảnh
  const handleImageUrlChange = (event) => {
    const url = event.target.value;
    setImageUrl(url);
    
    // Cập nhật preview nếu URL hợp lệ
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setImagePreview(url);
    }
  };

  // Xử lý lưu hình ảnh
  const handleSaveImage = async () => {
    try {
      setUploadingImage(true);
      
      if (!imageUrl) {
        alert('Vui lòng nhập URL hình ảnh');
        setUploadingImage(false);
        return;
      }
      
      // Chỉ cập nhật ảnh nếu đang chỉnh sửa quy trình đã tồn tại
      if (id && id !== "create" && id !== "Create") {
        // Gọi API cập nhật ảnh
        await adminService.updateSkincareRoutineImage(id, imageUrl);
        alert('Cập nhật hình ảnh thành công!');
      } else {
        // Nếu đang tạo mới, chỉ lưu URL để sử dụng khi lưu quy trình
        alert('URL hình ảnh đã được lưu và sẽ được áp dụng khi lưu quy trình');
      }
    } catch (err) {
      console.error('Lỗi khi lưu hình ảnh:', err);
      alert(`Không thể lưu hình ảnh. Lỗi: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Xử lý khi chọn/bỏ chọn sản phẩm
  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Xử lý khi lưu quy trình và sản phẩm
  const handleSave = async () => {
    try {
      console.log('--------BEGIN SAVE ROUTINE--------');
      console.log('RoutineId:', id);
      console.log('Current routine state:', routine);
      console.log('Content to save:', generateContent());
      console.log('Image URL to save:', imageUrl);
      console.log('Selected products:', selectedProducts);
      setSaving(true);
      setSaveError(null);
      
      // Kiểm tra dữ liệu đầu vào
      if (!routine.title) {
        setSaveError('Vui lòng nhập tiêu đề quy trình');
        setSaving(false);
        return;
      }
      
      if (!routine.skinType) {
        setSaveError('Vui lòng chọn loại da');
        setSaving(false);
        return;
      }
      
      // Tạo nội dung từ các thành phần
      const content = generateContent();
      
      // Dữ liệu gửi đi
      const routineData = {
        routineId: id && id !== "create" && id !== "Create" ? parseInt(id) : 0,
        title: routine.title,
        content: content,
        skinType: routine.skinType,
        userId: routine.userId || 1,
        imageUrl: imageUrl || ''
      };
      
      console.log('Đang cập nhật/tạo quy trình với dữ liệu:', routineData);
      
      let response;
      let routineId;
      
      if (id && id !== "create" && id !== "Create") {
        // Gọi API cập nhật
        response = await adminService.updateSkincareRoutine(id, routineData);
        console.log('Kết quả cập nhật:', response);
        routineId = id;
        
        // Xóa tất cả sản phẩm hiện tại
        await axiosClient.delete(`/api/SkincareRoutineProducts/ByRoutine/${routineId}`);
      } else {
        // Gọi API tạo mới
        response = await adminService.createSkincareRoutine(routineData);
        console.log('Kết quả tạo mới:', response);
        routineId = response.routineId;
      }
      
      // Thêm các sản phẩm đã chọn vào quy trình
      if (routineId && selectedProducts.length > 0) {
        for (let i = 0; i < selectedProducts.length; i++) {
          const productId = selectedProducts[i];
          const routineProductData = {
            routineId: routineId,
            productId: productId,
            displayOrder: i + 1 // Thứ tự hiển thị
          };
          
          await axiosClient.post('/api/SkincareRoutineProducts', routineProductData);
        }
        console.log(`Đã thêm ${selectedProducts.length} sản phẩm vào quy trình`);
      }
      
      alert(id && id !== "create" && id !== "Create" 
        ? 'Cập nhật quy trình chăm sóc da thành công!'
        : 'Tạo quy trình chăm sóc da mới thành công!');
      
      // Chuyển về trang danh sách quy trình
      navigate('/routine');
    } catch (err) {
      console.error('Lỗi khi lưu quy trình:', err);
      setSaveError(`Không thể lưu quy trình. Lỗi: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Xử lý hủy chỉnh sửa
  const handleCancel = () => {
    navigate('/routine');
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width: '99vw' }}>
        <Header />
        <Container maxWidth="md" sx={{ pt: 4, pb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#059669' }} />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width: '99vw' }}>
      <Header />
      <Container maxWidth="md" sx={{ pt: 4, pb: 6 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleCancel}
          sx={{ 
            mb: 2, 
            color: '#059669', 
            borderColor: '#059669',
            '&:hover': { 
              borderColor: '#047857', 
              color: '#047857' 
            } 
          }}
        >
          Quay lại
        </Button>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
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
            {id && id !== "create" && id !== "Create" 
              ? "Chỉnh Sửa Quy Trình Chăm Sóc Da" 
              : "Tạo Quy Trình Chăm Sóc Da Mới"
            }
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          {saveError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {saveError}
            </Typography>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tiêu đề quy trình"
                variant="outlined"
                value={routine.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="skin-type-label">Loại da</InputLabel>
                <Select
                  labelId="skin-type-label"
                  value={routine.skinType}
                  label="Loại da"
                  onChange={(e) => handleInputChange('skinType', e.target.value)}
                >
                  {skinTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 'bold' }}>
                Hình ảnh minh họa
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                {/* Hiển thị hình ảnh */}
                <Box sx={{ 
                  width: { xs: '100%', md: '40%' }, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center' 
                }}>
                  <Card 
                    sx={{ 
                      width: '100%', 
                      height: 240, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    {imagePreview ? (
                      <CardMedia
                        component="img"
                        image={imagePreview}
                        alt="Hình ảnh minh họa quy trình"
                        sx={{ height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Image sx={{ fontSize: 80, color: '#d0d0d0' }} />
                    )}
                  </Card>
                </Box>
                
                {/* Nhập URL hình ảnh */}
                <Box sx={{ width: { xs: '100%', md: '60%' } }}>
                  <TextField
                    fullWidth
                    label="URL hình ảnh"
                    variant="outlined"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    margin="normal"
                    placeholder="https://example.com/image.jpg"
                    helperText="Nhập URL hình ảnh từ Internet"
                  />
                  
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={handleSaveImage}
                    disabled={uploadingImage || !imageUrl}
                    sx={{ 
                      mt: 1, 
                      bgcolor: '#059669', 
                      '&:hover': { bgcolor: '#047857' },
                      '&:disabled': { bgcolor: '#cccccc' }
                    }}
                  >
                    {uploadingImage ? 'Đang lưu...' : 'Lưu hình ảnh'}
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 'bold' }}>
                Đặc điểm da
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                Nhập mỗi đặc điểm trên một dòng
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                value={characteristics}
                onChange={(e) => setCharacteristics(e.target.value)}
                placeholder="Ví dụ: Lỗ chân lông to, da bóng nhờn, dễ nổi mụn."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 'bold' }}>
                Các bước chăm sóc buổi sáng
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                Nhập mỗi bước trên một dòng
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={7}
                variant="outlined"
                value={morningSteps}
                onChange={(e) => setMorningSteps(e.target.value)}
                placeholder="Ví dụ: Sữa rửa mặt – Kiểm soát dầu thừa, làm sạch sâu."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 'bold' }}>
                Các bước chăm sóc buổi tối
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                Nhập mỗi bước trên một dòng
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={7}
                variant="outlined"
                value={eveningSteps}
                onChange={(e) => setEveningSteps(e.target.value)}
                placeholder="Ví dụ: Tẩy trang – Loại bỏ bã nhờn, bụi bẩn."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#059669', fontWeight: 'bold' }}>
                Các sản phẩm phù hợp
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
                Chọn các sản phẩm phù hợp cho quy trình chăm sóc da này
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  label="Tìm kiếm sản phẩm"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flex: 1, mr: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={fetchProductsBySkinType}
                  sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
                >
                  Tìm theo loại da
                </Button>
              </Box>
              
              <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                {loadingProducts ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#059669' }} />
                  </Box>
                ) : products.length === 0 ? (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    Không tìm thấy sản phẩm nào
                  </Typography>
                ) : (
                  <List>
                    {products
                      .filter(product => {
                        // Lọc theo từ khóa tìm kiếm
                        const productName = product.name || product.productName || '';
                        const productBrand = product.brand || '';
                        return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              productBrand.toLowerCase().includes(searchTerm.toLowerCase());
                      })
                      .map((product) => {
                        const productId = product.productId || product.id;
                        const productName = product.name || product.productName;
                        const productImage = product.imgURL || product.imgUrl || '/images/default-product.jpg';
                        const productBrand = product.brand || 'Không có thương hiệu';
                        const isSelected = selectedProducts.includes(productId);
                        
                        return (
                          <ListItem
                            key={productId}
                            sx={{
                              border: '1px solid #e0e0e0',
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: isSelected ? 'rgba(5, 150, 105, 0.08)' : 'white'
                            }}
                            secondaryAction={
                              <Checkbox
                                edge="end"
                                checked={isSelected}
                                onChange={() => handleProductSelection(productId)}
                                sx={{
                                  color: '#059669',
                                  '&.Mui-checked': { color: '#059669' }
                                }}
                              />
                            }
                          >
                            <ListItemAvatar>
                              <Avatar 
                                src={productImage}
                                variant="rounded"
                                sx={{ width: 50, height: 50, mr: 1 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={productName}
                              secondary={`Thương hiệu: ${productBrand}`}
                            />
                          </ListItem>
                        );
                      })}
                  </List>
                )}
              </Box>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Đã chọn {selectedProducts.length} sản phẩm
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
            >
              {saving ? 'Đang lưu...' : (id && id !== "create" && id !== "Create" ? 'Lưu thay đổi' : 'Tạo quy trình')}
            </Button>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default RoutineEdit; 