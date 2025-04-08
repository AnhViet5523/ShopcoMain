import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Box, Button, Container, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, IconButton, Grid, InputAdornment, Tabs, Tab, Card, CardContent,
  CardMedia, CardActions, Divider, CircularProgress, FormControlLabel, Switch,
  Chip, DialogContentText, useMediaQuery, Tooltip, Pagination, FormGroup,
  Checkbox, Badge, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import { FaFilter, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './Manager.css';
import productService from '../../apis/productService';
import categoryService from '../../apis/categoryService';
import adminService from '../../apis/adminService';
import productImageService from '../../apis/productImageService';
import { MdClose } from 'react-icons/md';


const Product = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [products, setProducts] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [originalProducts, setOriginalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phân trang
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Thêm state cho dialog và form thêm sản phẩm
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productCode: '',
    productName: '',
    categoryId: '',
    quantity: '',
    capacity: '',
    price: '',
    brand: '',
    origin: '',
    status: 'Available',
    imgURL: '',
    skinType: '',
    description: '',
    ingredients: '',
    usageInstructions: '',
    manufactureDate: null,
    importDate: null
  });

  // Thêm state cho prefixMessage
  const [prefixMessage, setPrefixMessage] = useState('');

  // Thêm biến lưu trữ mapping giữa tên danh mục và ID
  const [categoryMapping, setCategoryMapping] = useState({});

  // Thêm state cho dialog chi tiết sản phẩm
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Thêm state cho dialog xem tất cả ảnh
  const [openImageGallery, setOpenImageGallery] = useState(false);

  // Thêm state cho dialog xác nhận nhập kho
  const [openConfirmImport, setOpenConfirmImport] = useState(false);

  // Thêm state cho lưu trữ ảnh sản phẩm
  const [productImages, setProductImages] = useState([]);

  // Thêm state cho việc chỉnh sửa sản phẩm
  const [editingProductId, setEditingProductId] = useState(null);

  // Thêm state cho chức năng sửa ảnh
  const [openEditImageDialog, setOpenEditImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [reorderedImages, setReorderedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reorderChanged, setReorderChanged] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Thêm state cho chức năng nhập kho
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importQuantity, setImportQuantity] = useState(0);
  const [importingProductId, setImportingProductId] = useState(null);
  const [importingProduct, setImportingProduct] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Thêm state này ở cùng vị trí với các state khác
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [previewImage, setPreviewImage] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thêm state cho việc quản lý nhiều ảnh
  const [productImageFiles, setProductImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [previewUrl, setPreviewUrl] = useState(null); // Thêm state để lưu URL xem trước của ảnh

  const sidebarItems = [
    { id: 'ViewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'Product', name: 'Sản phẩm', icon: '📦' },
    { id: 'ViewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'ViewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'Voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'Feedback', name: 'Đánh giá sản phẩm', icon: '📢' },
    { id: 'BlogManager', name: 'Blog', icon: '📰' },
    { id: 'SkincareRoutineManager', name: 'Quy trình chăm sóc da', icon: '💆‍♀️' }
  ];

  const tabs = ['Tất cả', 'Hàng mới nhập', 'Hàng sắp hết'];

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      console.log('Bắt đầu lấy danh sách danh mục...');
      const response = await categoryService.getCategories();
      console.log('Phản hồi API danh mục:', response);
      
      const map = {};
      const idMapping = {}; // Thêm mapping cho ID
      
      // Kiểm tra cấu trúc response
      if (Array.isArray(response)) {
        // Nếu response là mảng trực tiếp
        console.log(`Xử lý ${response.length} danh mục từ mảng`);
        response.forEach(category => {
          if (category && category.categoryId !== undefined) {
            map[category.categoryId] = {
              categoryType: category.categoryType || 'Unknown',
              categoryName: category.categoryName || 'Unknown'
            };
            
            // Tạo mapping ngược từ tên đến ID
            const key = `${category.categoryType || 'Unknown'} - ${category.categoryName || 'Unknown'}`;
            idMapping[key] = category.categoryId;
          }
        });
      } else if (response && response.$values && Array.isArray(response.$values)) {
        // Nếu response có cấu trúc $values
        console.log(`Xử lý ${response.$values.length} danh mục từ $values`);
        response.$values.forEach(category => {
          if (category && category.categoryId !== undefined) {
            map[category.categoryId] = {
              categoryType: category.categoryType || 'Unknown',
              categoryName: category.categoryName || 'Unknown'
            };
            
            // Tạo mapping ngược từ tên đến ID
            const key = `${category.categoryType || 'Unknown'} - ${category.categoryName || 'Unknown'}`;
            idMapping[key] = category.categoryId;
          }
        });
      } else if (response && typeof response === 'object') {
        // Nếu response là một object nhưng không có $values hoặc không phải mảng
        console.log('Xử lý danh mục từ object');
        Object.entries(response).forEach(([key, categories]) => {
          if (Array.isArray(categories)) {
            categories.forEach(category => {
              if (category && category.categoryId !== undefined) {
                map[category.categoryId] = {
                  categoryType: key,
                  categoryName: category.categoryName || 'Unknown'
                };
                
                // Tạo mapping ngược từ tên đến ID
                const mapKey = `${key} - ${category.categoryName || 'Unknown'}`;
                idMapping[mapKey] = category.categoryId;
              }
            });
          }
        });
      }
      
      if (Object.keys(map).length === 0) {
        console.warn('Không có danh mục nào được xử lý');
      } else {
        console.log(`Đã xử lý ${Object.keys(map).length} danh mục`);
      }
      
      setCategoryMapping(idMapping); // Lưu mapping vào state
      console.log('Category mapping:', map);
      console.log('ID mapping:', idMapping);
      return map;
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      return {};
    }
  };

  // Xử lý sản phẩm với danh mục đã biết
  const processProducts = (productsArray, categories) => {
    console.log('Bắt đầu xử lý sản phẩm với danh mục:', { productsArray, categories });
    
    if (!productsArray || productsArray.length === 0) {
      console.warn('Không có sản phẩm để xử lý');
      return [];
    }
    
    // Kiểm tra cấu trúc của sản phẩm đầu tiên để hiểu cấu trúc dữ liệu
    const firstProduct = productsArray[0];
    console.log('Cấu trúc sản phẩm đầu tiên:', firstProduct);
    
    return productsArray.map(product => {
      // Lấy ID sản phẩm, hỗ trợ nhiều cách đặt tên
      const productId = product.productId || product.ProductID || product.productID || product.id;
      
      // Lấy ID danh mục, hỗ trợ nhiều cách đặt tên
      const categoryId = product.categoryId || product.CategoryID || product.categoryID;
      
      // Lấy thông tin danh mục từ mapping
      const categoryInfo = categories[categoryId] || { categoryType: 'Unknown', categoryName: 'Unknown' };
      
      return {
        ProductID: productId,
        ProductCode: product.productCode || product.ProductCode || '',
        categoryType: categoryInfo.categoryType,
        categoryName: categoryInfo.categoryName,
        categoryDisplay: `${categoryInfo.categoryType} - ${categoryInfo.categoryName}`,
        ProductName: product.productName || product.ProductName || product.name || '',
        Quantity: product.quantity || product.Quantity || 0,
        Capacity: product.capacity || product.Capacity || '',
        Price: product.price || product.Price || 0,
        Brand: product.brand || product.Brand || '',
        Origin: product.origin || product.Origin || '',
        Status: product.status || product.Status || 'Unknown',
        ImgURL: product.imgURL || product.ImgURL || product.imgUrl || product.image || '',
        SkinType: product.skinType || product.SkinType || '',
        Description: product.description || product.Description || '',
        Ingredients: product.ingredients || product.Ingredients || '',
        UsageInstructions: product.usageInstructions || product.UsageInstructions || '',
        ManufactureDate: product.manufactureDate || product.ManufactureDate || null,
        ImportDate: product.importDate || product.ImportDate || null
      };
    });
  };

  // Lấy danh sách sản phẩm
  const fetchProducts = async (categories = null) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Bắt đầu lấy danh sách sản phẩm...');
      
      // Nếu chưa có danh mục, lấy danh mục trước
      const categoryData = categories || await fetchCategories();
      console.log('Dữ liệu danh mục:', categoryData);
      
      // Lấy sản phẩm với phân trang (nếu API hỗ trợ)
      // Nếu API không hỗ trợ phân trang, lấy tất cả và xử lý phân trang ở client
      console.log('Gọi API lấy tất cả sản phẩm...');
      const response = await productService.getAllProducts();
      console.log('Phản hồi API sản phẩm:', response);
      
      // Xử lý dữ liệu sản phẩm từ nhiều định dạng có thể có
      let productsArray = [];
      if (response && response.$values) {
        productsArray = response.$values;
      } else if (Array.isArray(response)) {
        productsArray = response;
      } else if (response && typeof response === 'object') {
        // Nếu response là một object nhưng không có $values, thử xem nó có phải là một sản phẩm không
        if (response.productId || response.ProductID) {
          productsArray = [response];
        }
      }
      
      console.log(`Đã nhận được ${productsArray.length} sản phẩm từ API`);
      
      if (productsArray.length === 0) {
        console.warn('Không có sản phẩm nào được trả về từ API');
        setProducts([]);
        setOriginalProducts([]);
        setLoading(false);
        return;
      }
      
      // Xử lý sản phẩm với danh mục
      const processedProducts = processProducts(productsArray, categoryData);
      console.log('Sản phẩm đã xử lý:', processedProducts);
      
      // Sắp xếp sản phẩm theo ngày nhập kho (mới nhất lên đầu)
      // Đảm bảo sử dụng Date object để so sánh và xử lý các trường hợp đặc biệt
      const sortedProducts = [...processedProducts].sort((a, b) => {
        // Nếu không có ImportDate, sản phẩm đó xếp sau
        if (!a.ImportDate) return 1;
        if (!b.ImportDate) return -1;
        
        // Chuyển đổi thành đối tượng Date để so sánh
        const dateA = new Date(a.ImportDate);
        const dateB = new Date(b.ImportDate);
        
        // Kiểm tra ngày hợp lệ
        const isValidDateA = !isNaN(dateA.getTime());
        const isValidDateB = !isNaN(dateB.getTime());
        
        if (!isValidDateA) return 1;
        if (!isValidDateB) return -1;
        
        // So sánh theo thời gian (mới nhất trước)
        const dateCompare = dateB.getTime() - dateA.getTime();
        
        // Nếu cùng ngày nhập, sắp xếp theo ID (ID cao hơn = mới hơn)
        if (dateCompare === 0) {
          return b.ProductID - a.ProductID;
        }
        
        return dateCompare;
      });
      
      console.log('Sản phẩm đã sắp xếp theo ngày nhập kho:', sortedProducts.map(p => ({ 
        id: p.ProductID,
        code: p.ProductCode, 
        name: p.ProductName, 
        importDate: p.ImportDate 
      })));
      
      setProducts(sortedProducts);
      setOriginalProducts(sortedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      setError('Đã xảy ra lỗi khi tải dữ liệu sản phẩm: ' + error.message);
      setLoading(false);
    }
  };

  // Gọi lần đầu khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (!searchTerm.trim()) {
      setProducts(originalProducts);
      // Reset thông báo số lượng lọc khi xóa tìm kiếm
      setFilteredCount(0);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filteredProducts = originalProducts.filter(product => {
      const productName = (product.ProductName || '').toLowerCase();
      const productCode = (product.ProductCode || '').toLowerCase();
      const brand = (product.Brand || '').toLowerCase();
      const categoryType = (product.categoryType || '').toLowerCase();
      const categoryName = (product.categoryName || '').toLowerCase();

      return productName.includes(searchTermLower) ||
             productCode.includes(searchTermLower) ||
             brand.includes(searchTermLower) ||
             categoryType.includes(searchTermLower) ||
             categoryName.includes(searchTermLower);
    });

    setProducts(filteredProducts);
    // Cập nhật thông báo số lượng lọc khi tìm kiếm
    setFilteredCount(filteredProducts.length !== originalProducts.length ? filteredProducts.length : 0);
  }, [searchTerm, originalProducts]);

  // Sử dụng useMemo để tính toán sản phẩm hiển thị theo tab và phân trang
  const displayedProducts = useMemo(() => {
    console.log('Tính toán sản phẩm hiển thị với:', { 
      productsLength: products.length, 
      activeTab, 
      page, 
      pageSize 
    });
    
    let filtered = products;
    
    // Lọc theo tab
    if (activeTab === 'Hàng sắp hết') {
      filtered = products.filter(product => product.Quantity < 10);
      console.log(`Lọc sản phẩm sắp hết: ${filtered.length} sản phẩm`);
    } else if (activeTab === 'Hàng mới nhập') {
      // Lấy ngày hiện tại
      const currentDate = new Date();
      
      // Tính toán ngày 7 ngày trước
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7);
      
      // Lọc sản phẩm có ngày nhập kho trong vòng 7 ngày
      filtered = products.filter(product => {
        if (!product.ImportDate) return false;
        
        // Chuyển ngày nhập kho thành đối tượng Date
        const importDate = new Date(product.ImportDate);
        if (isNaN(importDate.getTime())) return false;
        
        // So sánh ngày nhập kho với 7 ngày trước
        return importDate >= sevenDaysAgo;
      });
      
      // Sắp xếp sản phẩm mới nhập theo ngày nhập kho mới nhất và ID cao nhất
      filtered.sort((a, b) => {
        if (!a.ImportDate) return 1;
        if (!b.ImportDate) return -1;
        
        const dateA = new Date(a.ImportDate);
        const dateB = new Date(b.ImportDate);
        
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        // So sánh theo timestamp để đảm bảo chính xác đến mili giây
        const dateCompare = dateB.getTime() - dateA.getTime();
        
        // Nếu cùng ngày nhập, sắp xếp theo ID (ID cao hơn = mới hơn)
        if (dateCompare === 0) {
          return b.ProductID - a.ProductID;
        }
        
        return dateCompare;
      });
      
      console.log(`Lọc sản phẩm mới nhập: ${filtered.length} sản phẩm`);
      console.log('Sản phẩm trong tab Hàng mới nhập (sắp xếp theo ngày nhập):', filtered.map(p => ({
        code: p.ProductCode,
        name: p.ProductName,
        importDate: p.ImportDate,
        importDateObj: new Date(p.ImportDate),
        id: p.ProductID
      })));
    }
    
    // Phân trang ở client (nếu API không hỗ trợ phân trang)
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const result = filtered.slice(startIndex, endIndex);
    console.log(`Phân trang: hiển thị ${result.length} sản phẩm từ ${startIndex} đến ${endIndex-1}`);
    
    return result;
  }, [products, activeTab, page, pageSize]);

  // Xử lý thay đổi trang
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleEdit = (productId) => {
    const productToEdit = products.find(p => p.ProductID === productId);
    if (productToEdit) {
      setNewProduct({
        productCode: productToEdit.ProductCode || '',
        productName: productToEdit.ProductName || '',
        categoryId: productToEdit.categoryId || '',
        quantity: productToEdit.Quantity || '',
        capacity: productToEdit.Capacity || '',
        price: productToEdit.Price || '',
        brand: productToEdit.Brand || '',
        origin: productToEdit.Origin || '',
        status: productToEdit.Status || 'Available',
        imgURL: productToEdit.ImgURL || '',
        skinType: productToEdit.SkinType || '',
        description: productToEdit.Description || '',
        ingredients: productToEdit.Ingredients || '',
        usageInstructions: productToEdit.UsageInstructions || '',
        manufactureDate: productToEdit.ManufactureDate || null,
        importDate: productToEdit.ImportDate || null
      });
      setEditingProductId(productId);
      setOpenAddDialog(true);
    }
  };

  const handleSubmitEdit = async () => {
    // Kiểm tra các trường bắt buộc
    if (!newProduct.productName) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!newProduct.quantity || isNaN(parseInt(newProduct.quantity))) {
      alert('Vui lòng nhập số lượng sản phẩm (phải là số)');
      return;
    }
    if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
      alert('Vui lòng nhập giá sản phẩm (phải là số)');
      return;
    }
    
    // Lấy thông tin sản phẩm gốc
    const originalProduct = products.find(p => p.ProductID === editingProductId);
    
    try {
      // Log thông tin sản phẩm gốc để debug
      console.log('Sản phẩm gốc trước khi cập nhật:', originalProduct);
      
      // Lấy ngày hiện tại cho ngày nhập kho mới
      const currentDate = new Date().toISOString();

      // Xây dựng dữ liệu cập nhật từ sản phẩm gốc, đảm bảo tất cả trường bắt buộc được giữ lại
      const productData = {
        productName: newProduct.productName,
        // Đảm bảo CategoryId luôn có giá trị hợp lệ
        categoryId: newProduct.categoryId ? parseInt(newProduct.categoryId) : (originalProduct.CategoryID || 1),
        quantity: parseInt(newProduct.quantity),
        capacity: newProduct.capacity || originalProduct.Capacity || "50g",
        price: parseFloat(newProduct.price),
        brand: newProduct.brand || originalProduct.Brand || "",
        origin: newProduct.origin || originalProduct.Origin || "",
        status: newProduct.status || originalProduct.Status || "Available",
        imgUrl: newProduct.imgURL || originalProduct.ImgURL || "",
        skinType: newProduct.skinType || originalProduct.SkinType || "",
        description: newProduct.description || originalProduct.Description || "",
        ingredients: newProduct.ingredients || originalProduct.Ingredients || "",
        usageInstructions: newProduct.usageInstructions || originalProduct.UsageInstructions || "",
        manufactureDate: originalProduct.ManufactureDate || currentDate,
        importDate: currentDate
      };

      console.log('Dữ liệu sản phẩm cập nhật được gửi đi:', productData);
      
      const response = await adminService.updateProduct(editingProductId, productData);
      
      console.log('Phản hồi từ API cập nhật sản phẩm:', response);
      
      // Cập nhật UI
      await fetchProducts();
      
      // Đóng hộp thoại
      setOpenAddDialog(false);
      
      // Xóa dữ liệu form
      setNewProduct({});
      
      setEditingProductId(null);
      
      // Thông báo thành công
      alert('Cập nhật sản phẩm thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      if (error.response) {
        // Xử lý lỗi ràng buộc khóa ngoại từ danh mục không tồn tại
        if (error.response.status === 500 && 
            error.response.data && 
            error.response.data.details && 
            error.response.data.details.toLowerCase().includes('foreign key')) {
          alert('Lỗi: Danh mục sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng chọn danh mục khác.');
          return;
        }
      
        const errorData = error.response.data;
        const errorMessage = errorData && (errorData.error || errorData.message || JSON.stringify(errorData));
        alert(`Lỗi: ${errorMessage || 'Không thể cập nhật sản phẩm'}`);
      } else {
        alert(`Lỗi: ${error.message || 'Không thể cập nhật sản phẩm'}`);
      }
    }
  };

  const handleDelete = async (productId) => {
    try {
      // Hiển thị xác nhận trước khi thay đổi trạng thái
      if (window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái sản phẩm này?')) {
        // Gọi API để thay đổi trạng thái với ngày nhập kho mới
        const currentDate = new Date().toISOString();
        const response = await adminService.toggleProductStatus(productId, currentDate);
        
        // Hiển thị thông báo thành công với trạng thái mới
        alert(`Đã thay đổi trạng thái sản phẩm thành công! Trạng thái mới: ${response.newStatus}`);
        
        // Tải lại danh sách sản phẩm để cập nhật UI
        await fetchProducts();
        
        // Chuyển đến tab Hàng mới nhập để xem sản phẩm vừa cập nhật
        setActiveTab('Hàng mới nhập');
        setPage(1); // Đặt về trang đầu tiên
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái sản phẩm:', error);
      alert(`Không thể thay đổi trạng thái sản phẩm: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  const handleFilterClick = () => {
    setOpenFilterDialog(true);
  };

  const handleFilterApply = () => {
    console.log('Selected Category:', selectedCategory);
    console.log('Selected SkinType:', selectedSkinType);
    
    // Nếu không có bộ lọc nào được chọn, reset về danh sách gốc
    if (!selectedCategory && !selectedSkinType) {
      setProducts(originalProducts);
      setFilteredCount(0);
      setOpenFilterDialog(false);
      return;
    }
    
    // Luôn lọc từ danh sách gốc để tránh lọc trên dữ liệu đã lọc
    const filtered = originalProducts.filter(product => {
      // Lọc theo Danh mục
      let categoryMatch = true;
      if (selectedCategory) {
        // Chuyển sang số để so sánh
        const selectedCategoryId = parseInt(selectedCategory);
        
        // Lấy ra ID danh mục của sản phẩm
        const productCategoryId = product.categoryId || product.CategoryID || product.categoryID;
        
        // Kiểm tra xem ID danh mục có khớp không
        categoryMatch = productCategoryId !== undefined && parseInt(productCategoryId) === selectedCategoryId;
        
        // Thử kiểm tra theo tên danh mục và loại danh mục nếu không tìm thấy theo ID
        if (!categoryMatch && product.categoryDisplay) {
          // Tìm danh mục trong categoryOptions dựa trên selectedCategory
          const selectedCategoryInfo = categoryOptions.find(opt => opt.id === selectedCategory);
          if (selectedCategoryInfo && selectedCategoryInfo.display) {
            categoryMatch = product.categoryDisplay.includes(selectedCategoryInfo.display);
          }
        }
      }
      
      // Lọc theo loại da
      let skinTypeMatch = true;
      if (selectedSkinType) {
        skinTypeMatch = product.SkinType === selectedSkinType;
      }
      
      // Kết quả cuối cùng: chỉ trả về true nếu cả hai điều kiện đều thoả mãn
      return categoryMatch && skinTypeMatch;
    });
    
    console.log(`Đã lọc: ${filtered.length} sản phẩm từ ${originalProducts.length} sản phẩm gốc`);
    
    // Cập nhật số lượng sản phẩm đã lọc
    setFilteredCount(filtered.length);
    
    // Cập nhật danh sách sản phẩm hiển thị
    setProducts(filtered);
    
    // Đặt lại trang về trang đầu tiên sau khi lọc
    setPage(1);
    
    // Đóng dialog
    setOpenFilterDialog(false);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSkinTypeChange = (event) => {
    setSelectedSkinType(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setProducts(originalProducts);
    // Reset thông báo số lượng lọc khi xóa tìm kiếm
    setFilteredCount(0);
  };

  // Cập nhật hàm handleAdd
  const handleAdd = () => {
    setEditingProductId(null);
    // Đặt giá trị mặc định cho các trường khi thêm sản phẩm mới
    setNewProduct({
      productCode: '',
      productName: '',
      categoryId: '',
      quantity: '',
      capacity: '',
      price: '',
      brand: '',
      origin: '',
      status: 'Available', // Đặt trạng thái mặc định là Available
      imgURL: '',
      skinType: '',
      description: '',
      ingredients: '',
      usageInstructions: '',
      manufactureDate: null,
    });
    setOpenAddDialog(true);
    setProductImages([]);
    setPrefixMessage('');
  };
  
  // Thêm hàm để đóng dialog
  const handleDialogClose = () => {
    setOpenAddDialog(false);
    setNewProduct({
      productCode: '',
      productName: '',
      categoryId: '',
      quantity: '',
      capacity: '',
      price: '',
      brand: '',
      origin: '',
      status: 'Available',
      imgURL: '',
      skinType: '',
      description: '',
      ingredients: '',
      usageInstructions: '',
      manufactureDate: null,
      importDate: null
    });
    setEditingProductId(null);
    
    // Reset các state liên quan đến ảnh
    setPreviewImage(null);
    setProductImageFile(null);
    setProductImageFiles([]);
    setPreviewImages([]);
    setMainImageIndex(0);
  };
  
  // Thêm hàm xử lý thay đổi input
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    // Xử lý riêng cho trường giá tiền
    if (name === 'price') {
      handlePriceChange(event);
      return;
    }
    
    // Cập nhật state newProduct với giá trị mới
    setNewProduct({ ...newProduct, [name]: value });

    // Nếu trường được thay đổi là categoryId, cập nhật prefixMessage
    if (name === "categoryId") {
      // Tìm loại danh mục dựa vào categoryId được chọn
      const selectedCategoryKey = Object.keys(categoryMapping).find(
        (key) => categoryMapping[key] === parseInt(value)
      );

      if (selectedCategoryKey) {
        // Lấy thông tin danh mục từ selectedCategoryKey (ví dụ: "Làm Sạch Da - Tẩy Trang Mặt")
        const categoryParts = selectedCategoryKey.split(' - ');
        const categoryType = categoryParts[0]; // "Làm Sạch Da"
        
        let prefix = "";
        
        // Ánh xạ trực tiếp cho các trường hợp theo quy tắc mới
        switch (categoryType) {
          case "Làm Sạch Da":
            prefix = "LSD";
            break;
          case "Đặc Trị":
            prefix = "ĐT";
            break;
          case "Dưỡng Ẩm":
            prefix = "DA";
            break;
          case "Bộ Chăm Sóc Da Mặt":
            prefix = "BCSDM";
            break;
          case "Chống Nắng Da Mặt":
            prefix = "CNDM";
            break;
          case "Dưỡng Mắt":
            prefix = "DM";
            break;
          case "Dụng Cụ/Phụ Kiện Chăm Sóc Da":
            prefix = "PKCSD";
            break;
          case "Vấn Đề Về Da":
            prefix = "VDVD";
            break;
          case "Dưỡng Môi":
            prefix = "DMI";
            break;
          case "Mặt Nạ":
            prefix = "MN";
            break;
          default:
            // Trường hợp không xác định
            prefix = categoryType
              .split(" ")
              .filter((s) => s.trim() !== "")
              .map((s) => removeDiacritics(s.charAt(0)).toUpperCase())
              .join("");
            break;
        }

        setPrefixMessage(
          `Mã sản phẩm sẽ được tạo theo định dạng: ${prefix}XXX (ví dụ: ${prefix}001)`
        );
      }
    }
  };
  
  // Thêm options cho status vào component
  const statusOptions = ['Available', 'Unavailable', 'OutOfStock'];

  // Thêm hàm formatCurrency để định dạng số tiền
  const formatCurrency = (value) => {
    if (!value) return '';
    // Chuyển đổi giá trị thành số và làm tròn
    const number = Math.round(parseFloat(value));
    // Định dạng số với dấu phân cách hàng nghìn
    return number.toLocaleString('vi-VN');
  };

  // Thêm hàm xử lý thay đổi giá tiền
  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, '');
    // Cập nhật giá trị vào state
    setNewProduct(prev => ({
      ...prev,
      price: numericValue
    }));
  };

  // Cập nhật hàm handleSubmitProduct để xử lý nhiều ảnh
  const handleSubmitProduct = async () => {
    setIsSubmitting(true);
    try {
      let validationError = false;
  
      // Kiểm tra các trường bắt buộc
      if (!newProduct.productName || newProduct.productName.trim() === '') {
        alert('Vui lòng nhập tên sản phẩm');
        validationError = true;
      }
      
      if (!newProduct.quantity || newProduct.quantity <= 0) {
        alert('Số lượng sản phẩm phải lớn hơn 0');
        validationError = true;
      }
      
      if (!newProduct.price || newProduct.price <= 0) {
        alert('Giá sản phẩm phải lớn hơn 0');
        validationError = true;
      }
      
      if (!newProduct.categoryId) {
        alert('Vui lòng chọn danh mục sản phẩm');
        validationError = true;
      }
      
      // Kiểm tra ảnh khi thêm mới sản phẩm
      if (!editingProductId && (!productImageFiles || productImageFiles.length < 5)) {
        alert('Vui lòng chọn đủ 5 ảnh cho sản phẩm');
        validationError = true;
      }
  
      if (validationError) {
        setIsSubmitting(false);
        return;
      }
  
      if (editingProductId) {
        // Xử lý chỉnh sửa sản phẩm (không cần upload ảnh)
        await adminService.updateProduct(editingProductId, {
          productName: newProduct.productName,
          description: newProduct.description,
          price: newProduct.price,
          quantity: newProduct.quantity,
          status: newProduct.status || 'Available',
          categoryId: newProduct.categoryId,
          skinType: newProduct.skinType,
          brand: newProduct.brand,
          origin: newProduct.origin,
          volume: newProduct.volume,
          expiry: newProduct.expiry,
          ingredients: newProduct.ingredients,
          usageInstructions: newProduct.usageInstructions
        });
        
        alert('Cập nhật sản phẩm thành công!');
        fetchProducts();
        handleDialogClose();
      } else {
        // Xử lý thêm mới sản phẩm (bao gồm upload ảnh)
        console.log("Submitting new product:", newProduct);
        console.log("Number of images:", productImageFiles ? productImageFiles.length : 0);
        
        // Lấy ngày hiện tại cho ngày nhập kho
        const currentDate = new Date().toISOString();
        
        // Đảm bảo chuẩn bị đủ dữ liệu cho API
        const productData = {
          productName: newProduct.productName,
          categoryId: parseInt(newProduct.categoryId),
          quantity: parseInt(newProduct.quantity),
          capacity: newProduct.capacity || '',
          price: parseFloat(newProduct.price),
          brand: newProduct.brand || '',
          origin: newProduct.origin || '',
          status: 'Available', // Luôn sử dụng trạng thái Available cho sản phẩm mới
          imgUrl: '', // Sẽ được cập nhật sau khi tải lên ảnh
          skinType: newProduct.skinType || '',
          description: newProduct.description || '',
          ingredients: newProduct.ingredients || '',
          usageInstructions: newProduct.usageInstructions || '',
          manufactureDate: newProduct.manufactureDate 
            ? new Date(newProduct.manufactureDate).toISOString() 
            : new Date().toISOString(),
          importDate: currentDate // Thêm ngày nhập kho tự động là ngày hiện tại
        };
        
        console.log('Dữ liệu sản phẩm gửi đi:', productData);
        
        // Thêm sản phẩm
        const response = await adminService.addProduct(productData);
        
        if (response && response.productId) {
          console.log("Product added successfully:", response);
          console.log("Product ID:", response.productId);
          console.log("Number of images to upload:", productImageFiles.length);
          
          // Upload các ảnh sản phẩm sử dụng uploadMultipleProductPhotos từ productImageService
          try {
            console.log("Attempting to upload multiple images using productImageService");
            const uploadResult = await productImageService.uploadMultipleProductPhotos(response.productId, productImageFiles);
            console.log("Multiple image upload result:", uploadResult);
            
            alert('Thêm sản phẩm và tải lên tất cả ảnh thành công!');
          } catch (uploadError) {
            console.error("Error uploading multiple images:", uploadError);
            
            // Thử cách khác: upload từng ảnh một
            console.log("Falling back to uploading images one by one");
            const uploadPromises = productImageFiles.map(async (file, index) => {
              try {
                console.log(`Uploading image ${index+1}/${productImageFiles.length}`);
                const formData = new FormData();
                formData.append('File', file);
                formData.append('IsMainImage', index === mainImageIndex ? 'true' : 'false');
                
                // Log file details for debugging
                console.log(`File ${index} details:`, {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  isMainImage: index === mainImageIndex
                });
                
                const result = await productImageService.addProductImage(response.productId, file);
                console.log(`Image ${index+1} upload result:`, result);
                return { success: true, result };
              } catch (error) {
                console.error(`Error uploading image ${index}:`, error);
                return { success: false, error: error.message };
              }
            });
            
            // Đợi tất cả ảnh được upload xong
            const uploadResults = await Promise.all(uploadPromises);
            console.log("Individual image upload results:", uploadResults);
            
            const successfulUploads = uploadResults.filter(result => result.success).length;
            
            if (successfulUploads === productImageFiles.length) {
              alert('Thêm sản phẩm và tải lên ảnh thành công!');
            } else if (successfulUploads > 0) {
              alert(`Thêm sản phẩm thành công nhưng chỉ tải lên được ${successfulUploads}/${productImageFiles.length} ảnh.`);
            } else {
              alert('Thêm sản phẩm thành công nhưng không tải lên được ảnh nào.');
            }
          }
          
          // Thiết lập ảnh đại diện nếu cần
          if (mainImageIndex >= 0 && mainImageIndex < productImageFiles.length) {
            try {
              console.log(`Setting image at index ${mainImageIndex} as main image`);
              // Cần lấy danh sách ảnh mới để có imageId
              const productImages = await productImageService.getProductImages(response.productId);
              console.log("Retrieved product images:", productImages);
              
              if (productImages && productImages.length > 0) {
                const mainImageId = productImages[mainImageIndex]?.imageID || productImages[0]?.imageID;
                if (mainImageId) {
                  console.log(`Setting image ${mainImageId} as main image`);
                  await productImageService.setMainImage(response.productId, mainImageId);
                  console.log("Main image set successfully");
                }
              }
            } catch (mainImageError) {
              console.error("Error setting main image:", mainImageError);
            }
          }
          
          // Refresh danh sách sản phẩm và đóng dialog
          fetchProducts();
          handleDialogClose();
          goToNewProductsTab();
        } else {
          alert('Thêm sản phẩm thất bại, vui lòng thử lại');
        }
      }
    } catch (error) {
      console.error("Error in handleSubmitProduct:", error);
      
      let errorMessage = 'Đã xảy ra lỗi, vui lòng thử lại';
      
      if (error.response) {
        // Lỗi từ server
        errorMessage = error.response.data?.message || 'Lỗi từ server, vui lòng thử lại';
        console.error("Server error:", error.response.data);
      } else if (error.request) {
        // Lỗi kết nối
        errorMessage = 'Không thể kết nối đến server, vui lòng kiểm tra kết nối';
        console.error("Connection error:", error.request);
      } else {
        // Lỗi khác
        errorMessage = error.message || 'Lỗi không xác định, vui lòng thử lại';
        console.error("Unknown error:", error.message);
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm hàm để chuyển đến tab Hàng mới nhập sau khi thêm sản phẩm
  const goToNewProductsTab = () => {
    // Làm mới danh sách sản phẩm để đảm bảo hiển thị sản phẩm mới nhập
    fetchProducts().then(() => {
      // Sau khi tải lại dữ liệu, chuyển đến tab Hàng mới nhập
      setActiveTab('Hàng mới nhập');
      setPage(1); // Đặt về trang đầu tiên để đảm bảo sản phẩm mới hiển thị ở đầu
    });
  };

  // Tạo danh sách danh mục kết hợp cho bộ lọc
  const categoryOptions = useMemo(() => {
    // Sử dụng data từ API nếu có
    if (Object.keys(categoryMapping).length > 0) {
      return Object.entries(categoryMapping).map(([display, id]) => ({
        id: id,
        display: display
      }));
    }
    
    // Fallback nếu chưa có data từ API
    const uniqueCategories = {};
    originalProducts.forEach(product => {
      const key = `${product.categoryType} - ${product.categoryName}`;
      if (!uniqueCategories[key]) {
        uniqueCategories[key] = {
          id: product.ProductID.toString(), // Sử dụng ID thực tế nếu có
          display: key
        };
      }
    });
    
    return Object.values(uniqueCategories);
  }, [categoryMapping, originalProducts]);
  
  const skinTypes = useMemo(() => {
    return [...new Set(originalProducts.map(product => product.SkinType))];
  }, [originalProducts]);

  // Thêm hàm để xóa bộ lọc
  const handleClearFilters = () => {
    setProducts(originalProducts);
    setFilteredCount(0);
    setSelectedCategory('');
    setSelectedSkinType('');
  };

  // Cập nhật hàm để mở dialog chi tiết và lấy ảnh sản phẩm
  const handleViewDetail = async (product) => {
    setSelectedProduct(product);
    setOpenDetailDialog(true);
    
    try {
      // Lấy thông tin chi tiết sản phẩm từ API để có thông tin ảnh đầy đủ
      const productDetail = await productService.getProductById(product.ProductID);
      console.log('Chi tiết sản phẩm:', productDetail);
      
      // Xử lý hình ảnh sản phẩm
      let images = [];
      if (productDetail.images && productDetail.images.length > 0) {
        images = productDetail.images;
        console.log('Ảnh sản phẩm từ API:', images);
      } else if (productDetail.imgURL) {
        images = [{ imgUrl: productDetail.imgURL }];
      } else if (product.ImgURL) {
        images = [{ imgUrl: product.ImgURL }];
      } else {
        images = [{ imgUrl: '/images/default-product.jpg' }];
      }
      
      setProductImages(images);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      // Nếu có lỗi, vẫn hiển thị ảnh đại diện
      setProductImages([{ imgUrl: product.ImgURL || '/images/default-product.jpg' }]);
    }
  };

  // Hàm để lấy URL ảnh
  const getImageUrl = (image) => {
    if (!image) return '/images/default-product.jpg';
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    // Nếu là đường dẫn đầy đủ (bắt đầu bằng http hoặc https)
    if (typeof image === 'string') {
      if (image.startsWith('http')) return `${image}?t=${timestamp}`;
      return `${image}?t=${timestamp}`;
    }
    
    // Nếu là object có thuộc tính imgUrl
    if (image.imgUrl) {
      if (image.imgUrl.startsWith('http')) return `${image.imgUrl}?t=${timestamp}`;
      return `${image.imgUrl}?t=${timestamp}`;
    }
    
    // Nếu là object có thuộc tính imageUrl
    if (image.imageUrl) {
      if (image.imageUrl.startsWith('http')) return `${image.imageUrl}?t=${timestamp}`;
      return `${image.imageUrl}?t=${timestamp}`;
    }
    
    return `/images/default-product.jpg?t=${timestamp}`;
  };

  // Thêm hàm để đóng dialog chi tiết
  const handleCloseDetail = () => {
    setOpenDetailDialog(false);
    setSelectedProduct(null);
  };

  // Hàm xử lý mở dialog sửa ảnh
  const handleOpenEditImages = async () => {
    try {
      setUploadingImage(true);
      console.log("Mở dialog sửa ảnh cho sản phẩm ID:", selectedProduct.ProductID);
      
      // Lấy lại danh sách ảnh mới nhất từ API
      const response = await productImageService.getProductImages(selectedProduct.ProductID);
      console.log("Phản hồi API ảnh (raw):", response);
      
      // Đảm bảo newImages là một mảng
      let newImages = [];
      if (Array.isArray(response)) {
        console.log("Phản hồi là mảng, sử dụng trực tiếp");
        newImages = response;
      } else if (response && response.$values && Array.isArray(response.$values)) {
        console.log("Phản hồi có thuộc tính $values, sử dụng response.$values");
        newImages = response.$values;
      } else if (response && typeof response === 'object') {
        // Nếu là một object đơn lẻ, đặt vào mảng
        console.log("Phản hồi là một object đơn lẻ, đặt vào mảng");
        newImages = [response];
      }
      
      if (!newImages || newImages.length === 0) {
        console.warn("Không tìm thấy ảnh nào cho sản phẩm này!");
        newImages = [];
      }
      
      console.log("Danh sách ảnh đã xử lý:", newImages);
      
      // Kiểm tra và tìm ảnh đại diện
      let foundMainImage = false;
      
      // Lấy thông tin sản phẩm để xác định ảnh đại diện
      const productDetail = await productService.getProductById(selectedProduct.ProductID);
      console.log("Chi tiết sản phẩm:", productDetail);
      
      const mainImageUrl = productDetail.imgURL || productDetail.ImgURL;
      console.log("URL ảnh đại diện:", mainImageUrl);
      
      // Xử lý từng ảnh để đánh dấu ảnh đại diện
      newImages = newImages.map(img => {
        // Lấy đường dẫn ảnh không bao gồm query string (nếu có)
        const imgUrl = img.imgUrl ? img.imgUrl.split('?')[0] : '';
        console.log(`So sánh ảnh: ${imgUrl} với ảnh đại diện: ${mainImageUrl}`);
        
        // Nếu URL ảnh trùng với URL ảnh đại diện, đánh dấu là ảnh đại diện
        const isMain = mainImageUrl && imgUrl === mainImageUrl.split('?')[0];
        
        if (isMain) {
          console.log(`Ảnh ID ${img.imageID} được xác định là ảnh đại diện`);
          foundMainImage = true;
        }
        
        return { ...img, isMainImage: isMain };
      });
      
      // Nếu không tìm thấy ảnh đại diện và có ít nhất một ảnh, đặt ảnh đầu tiên làm ảnh đại diện
      if (!foundMainImage && newImages.length > 0) {
        console.log(`Không tìm thấy ảnh đại diện, đặt ảnh đầu tiên (ID: ${newImages[0].imageID}) làm ảnh đại diện`);
        newImages[0].isMainImage = true;
      }
      
      console.log("Danh sách ảnh cuối cùng:", newImages);
      
      // Cập nhật state
      setReorderedImages(newImages);
      setSelectedImage(null);
      setReorderChanged(false); // Đặt lại trạng thái thay đổi khi mở dialog
      setOpenEditImageDialog(true);
    } catch (error) {
      console.error('Lỗi khi lấy ảnh sản phẩm:', error);
      alert(`Không thể lấy danh sách ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý khi chọn file ảnh mới
  const handleImageFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewImageFile(file);
      
      // Tạo URL xem trước cho ảnh được chọn
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      // Khi người dùng chọn file ảnh mới, đánh dấu là có thay đổi để nút Lưu được kích hoạt
      setReorderChanged(true);
    }
  };

  // Hàm xử lý cập nhật ảnh
  const handleUpdateImage = async (imageId) => {
    if (!newImageFile) {
      alert('Vui lòng chọn file ảnh');
      return;
    }
    
    try {
      setUploadingImage(true);
      
      // Kiểm tra xem reorderedImages có phải là mảng không
      if (!reorderedImages || !Array.isArray(reorderedImages)) {
        console.error("reorderedImages không phải là mảng:", reorderedImages);
        alert("Không thể cập nhật ảnh do dữ liệu không hợp lệ");
        return;
      }
      
      const image = reorderedImages.find(img => img.imageID === imageId);
      if (!image) {
        console.error("Không tìm thấy ảnh với ID:", imageId);
        alert("Không tìm thấy ảnh cần cập nhật");
        return;
      }
      
      await productImageService.updateProductImage(imageId, newImageFile, image.displayOrder || 0);
      alert('Cập nhật ảnh thành công');
      
      // Đóng dialog chỉnh sửa ảnh
      setOpenEditImageDialog(false);
      
      // Cập nhật lại thông tin sản phẩm
      const productDetail = await productService.getProductById(selectedProduct.ProductID);
      setSelectedProduct({
        ...selectedProduct,
        ImgURL: productDetail.imgURL || productDetail.ImgURL,
        images: productDetail.images || []
      });

      // Xóa URL xem trước khi đã cập nhật ảnh thành công
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      setNewImageFile(null);
      setSelectedImage(null);
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh:', error);
      alert(`Không thể cập nhật ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý sắp xếp lại thứ tự hiển thị của các ảnh và cập nhật ảnh mới
  const handleReorderImages = async () => {
    try {
      // Kiểm tra xem reorderedImages có phải là mảng không
      if (!reorderedImages || !Array.isArray(reorderedImages) || reorderedImages.length === 0) {
        console.error("reorderedImages không phải là mảng hoặc rỗng:", reorderedImages);
        alert("Không thể sắp xếp lại ảnh do dữ liệu không hợp lệ");
        return;
      }
      
      setUploadingImage(true);
      
      // Nếu có ảnh được chọn để cập nhật
      if (selectedImage && newImageFile) {
        const image = reorderedImages.find(img => img.imageID === selectedImage);
        if (image) {
          await productImageService.updateProductImage(selectedImage, newImageFile, image.displayOrder || 0);
          console.log("Đã cập nhật ảnh:", selectedImage);
        }
      }
      
      // Đảm bảo reorderedImages có displayOrder từ 0 đến length-1
      const sortedImages = [...reorderedImages].sort((a, b) => 
        (a.displayOrder === undefined ? 0 : a.displayOrder) - 
        (b.displayOrder === undefined ? 0 : b.displayOrder)
      );
      
      const updatedImages = sortedImages.map((img, index) => ({
        ...img,
        displayOrder: index
      }));

      // Tìm ảnh đại diện đã chọn
      const mainImage = reorderedImages.find(img => img.isMainImage);
      if (mainImage) {
        try {
          // Cập nhật ảnh đại diện cho sản phẩm
          // Đổi từ productService.updateMainImage sang productImageService.setMainImage
          console.log(`Cập nhật ảnh đại diện, sản phẩm ID: ${selectedProduct.ProductID}, ảnh ID: ${mainImage.imageID}`);
          await productImageService.setMainImage(selectedProduct.ProductID, mainImage.imageID);
          console.log("Đã đặt ảnh đại diện:", mainImage.imageID);
        } catch (error) {
          console.error('Lỗi khi đặt ảnh đại diện:', error);
          // Tiếp tục xử lý các phần khác, không dừng lại
        }
      }

      await productImageService.reorderProductImages(updatedImages);
      alert('Cập nhật thành công');
      
      // Reset trạng thái thay đổi
      setReorderChanged(false);
      
      // Đóng dialog chỉnh sửa ảnh
      setOpenEditImageDialog(false);
      setOpenImageGallery(false);
      
      // Đợi một chút để đảm bảo server đã xử lý xong
      setTimeout(async () => {
        try {
          // Cập nhật lại thông tin sản phẩm
          const productDetail = await productService.getProductById(selectedProduct.ProductID);
          
          
          // Xử lý hình ảnh sản phẩm
          let images = [];
          if (productDetail.images && productDetail.images.length > 0) {
            images = productDetail.images;
          } else if (productDetail.imgURL) {
            images = [{ imgUrl: productDetail.imgURL }];
          } else if (selectedProduct.ImgURL) {
            images = [{ imgUrl: selectedProduct.ImgURL }];
          } else {
            images = [{ imgUrl: '/images/default-product.jpg' }];
          }
          
          // Cập nhật state
          setProductImages(images);
          setSelectedProduct({
            ...selectedProduct,
            ImgURL: productDetail.imgURL || productDetail.ImgURL,
            images: images
          });
          
          // Reset các state
          setNewImageFile(null);
          setSelectedImage(null);
        } catch (error) {
          console.error('Lỗi khi tải lại thông tin sản phẩm:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh:', error);
      alert(`Không thể cập nhật ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý xóa ảnh
  const handleDeleteImage = async (imageId) => {
    try {
      // Trước khi xóa, kiểm tra xem sản phẩm còn bao nhiêu ảnh
      const productImages = await productImageService.getProductImages(selectedProduct.ProductID);
      
      // Xử lý response để lấy mảng ảnh
      let allImages = [];
      if (Array.isArray(productImages)) {
        allImages = productImages;
      } else if (productImages && productImages.$values && Array.isArray(productImages.$values)) {
        allImages = productImages.$values;
      } else if (productImages && typeof productImages === 'object') {
        allImages = [productImages];
      }
      
      console.log(`Sản phẩm hiện có ${allImages.length} ảnh`);
      
      // Kiểm tra nếu chỉ còn 5 ảnh thì không cho xóa
      if (allImages.length <= 5) {
        alert('Không thể xóa ảnh vì sản phẩm cần có tối thiểu 5 ảnh. Hãy thêm ảnh mới trước khi xóa ảnh này.');
        return;
      }
      
      // Nếu có nhiều hơn 5 ảnh, tiến hành xác nhận và xóa
      if (window.confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
        setUploadingImage(true);
        await productImageService.deleteProductImage(imageId);
        alert('Đã xóa ảnh thành công!');
        
        // Cập nhật lại thông tin sản phẩm
        const productDetail = await productService.getProductById(selectedProduct.ProductID);
        setSelectedProduct(productDetail);
        
        // Cập nhật lại danh sách ảnh
        const refreshedImages = await productImageService.getProductImages(selectedProduct.ProductID);
        setReorderedImages(refreshedImages);
        
        // Đóng dialog chỉnh sửa ảnh
        setOpenEditImageDialog(false);
        setOpenImageGallery(false);
        
        // Cập nhật lại trang sản phẩm
        await fetchProducts(categoryMapping);
      }
    } catch (error) {
      console.error('Lỗi khi xóa ảnh:', error);
      alert('Không thể xóa ảnh. Vui lòng thử lại sau.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý thêm ảnh mới
  const handleAddNewImage = async () => {
    if (!newImageFile) {
      alert('Vui lòng chọn file ảnh');
      return;
    }
    
    try {
      setUploadingImage(true);
      await productImageService.addProductImage(selectedProduct.ProductID, newImageFile);
      alert('Thêm ảnh thành công');
      
      // Đóng dialog chỉnh sửa ảnh
      setOpenEditImageDialog(false);
      setOpenImageGallery(false);
      
      // Xóa URL xem trước khi đã thêm ảnh thành công
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      setNewImageFile(null);
    } catch (error) {
      console.error('Lỗi khi thêm ảnh:', error);
      alert(`Không thể thêm ảnh: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Hàm xử lý khi đặt ảnh làm ảnh đại diện
  const handleSetAsMainImage = async (imageId) => {
    if (!reorderedImages || !Array.isArray(reorderedImages) || reorderedImages.length === 0) {
      console.error("reorderedImages không phải là mảng hoặc rỗng:", reorderedImages);
      return;
    }

    console.log(`Đặt ảnh ID ${imageId} làm ảnh đại diện`);

    try {
      // Gọi API để cập nhật ảnh đại diện
      await productImageService.setMainImage(selectedProduct.ProductID, imageId);
      console.log(`Đã cập nhật ảnh đại diện ID ${imageId} trên server`);

      // Cập nhật state reorderedImages để đảm bảo chỉ có một ảnh là ảnh đại diện
      const updatedImages = reorderedImages.map(img => {
        const isMainImage = img.imageID === imageId;
        // Ghi log để debug
        if (isMainImage) {
          console.log(`Ảnh ID ${img.imageID} được đặt làm ảnh đại diện`);
        } else if (img.isMainImage) {
          console.log(`Ảnh ID ${img.imageID} không còn là ảnh đại diện`);
        }
        // Cập nhật cả isMainImage và displayOrder
        return {
          ...img,
          isMainImage: isMainImage,
          displayOrder: isMainImage ? 0 : (img.displayOrder === 0 ? 1 : img.displayOrder)
        };
      });

      console.log("Danh sách ảnh sau khi cập nhật ảnh đại diện:", updatedImages);
      setReorderedImages(updatedImages);
      alert('Đã đặt ảnh đại diện thành công');
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh đại diện:', error);
      alert(`Không thể cập nhật ảnh đại diện: ${error.message || 'Lỗi không xác định'}`);
    }
  };

  // Hàm mở dialog nhập kho
  const handleOpenImportDialog = (product) => {
    setImportingProductId(product.ProductID);
    setImportingProduct(product);
    setImportQuantity(0);
    setOpenImportDialog(true);
  };

  // Hàm đóng dialog nhập kho
  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    setImportQuantity(0);
    setImportingProductId(null);
    setImportingProduct(null);
  };

  // Hàm xử lý thay đổi số lượng nhập kho
  const handleImportQuantityChange = (e) => {
    const value = e.target.value;
    
    // Chỉ cho phép nhập số nguyên dương
    if (value === '' || /^\d+$/.test(value)) {
      const quantity = parseInt(value) || 0;
      setImportQuantity(quantity);
    }
  };

  // Hàm mở dialog xác nhận nhập kho
  const handleOpenConfirmImport = () => {
    // Kiểm tra số lượng phải là số nguyên dương
    if (!importingProduct || !Number.isInteger(importQuantity) || importQuantity <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ (phải là số nguyên và lớn hơn 0)');
      return;
    }
    setOpenConfirmImport(true);
  };

  // Hàm đóng dialog xác nhận nhập kho
  const handleCloseConfirmImport = () => {
    setOpenConfirmImport(false);
  };

  // Hàm xử lý việc nhập kho sản phẩm
  const handleImportStock = async () => {
    try {
      setIsImporting(true);

      // Lấy ngày hiện tại cho ngày nhập kho mới
      const currentDate = new Date().toISOString();

      // Gọi API nhập kho với ngày hiện tại
      await adminService.importProductStock(importingProduct.ProductID, importQuantity, currentDate);
      
      // Đóng dialog
      handleCloseConfirmImport();
      handleCloseImportDialog();
      
      // Hiển thị thông báo thành công
      alert("Nhập kho thành công!");
      
      // Fetch lại danh sách sản phẩm để cập nhật UI
      await fetchProducts();
      
      // Chuyển đến tab Hàng mới nhập để xem sản phẩm vừa nhập
      setActiveTab('Hàng mới nhập');
      setPage(1); // Đặt về trang đầu tiên
    } catch (error) {
      console.error('Lỗi khi nhập kho:', error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi nhập kho. Vui lòng thử lại!");
    } finally {
      setIsImporting(false);
    }
  };

  // Thêm hàm xử lý thay đổi ngày
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };
  
  // Thêm hàm để xóa dấu trong tiếng Việt
  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Chức năng kéo và thả để sắp xếp lại ảnh
  // Hàm này sẽ được gọi khi bắt đầu kéo một mục
  const handleDragStart = (e, image) => {
    setDraggedItem(image);
    e.dataTransfer.effectAllowed = 'move';
    // Cần phải thiết lập dữ liệu để Firefox hoạt động
    e.dataTransfer.setData('text/plain', '');
  };

  // Hàm này sẽ được gọi khi kéo qua một mục
  const handleDragOver = (e, overImage) => {
    e.preventDefault(); // Cần thiết để cho phép thả
    if (draggedItem === null || draggedItem === overImage) return;
    
    // Tạo một bản sao của mảng ảnh được sắp xếp lại
    const newOrder = [...reorderedImages];
    
    // Tìm chỉ mục của mục đang được kéo và mục đang được kéo qua
    const draggedIndex = newOrder.findIndex(img => img.imageId === draggedItem.imageId);
    const overIndex = newOrder.findIndex(img => img.imageId === overImage.imageId);
    
    if (draggedIndex === -1 || overIndex === -1) return;
    
    // Di chuyển mục đang được kéo đến vị trí mới
    newOrder.splice(draggedIndex, 1); // Xóa mục đang được kéo khỏi mảng
    newOrder.splice(overIndex, 0, draggedItem); // Chèn mục đang được kéo tại vị trí mới
    
    // Cập nhật displayOrder cho tất cả các mục
    const updatedOrder = newOrder.map((img, idx) => ({
      ...img,
      displayOrder: idx
    }));
    
    // Cập nhật state
    setReorderedImages(updatedOrder);
    setReorderChanged(true);
  };

  // Cập nhật handleDragEnd để đặt trạng thái kéo thả
  const handleDragEnd = () => {
    setDraggedItem(null); // Reset trạng thái kéo
    // Giữ nguyên reorderChanged để biết đã có thay đổi
  };

  // Xử lý việc thả
  const handleDrop = (e, targetImage) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    // Logic để sắp xếp lại đã được xử lý trong handleDragOver
    setDraggedItem(null);
    // Đánh dấu là đã có thay đổi thứ tự
    setReorderChanged(true);
  };

  // Xử lý thay đổi ảnh sản phẩm
  const handleProductImageChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("Selected file:", file);
    
    // Kiểm tra kích thước tệp (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }
    
    // Kiểm tra định dạng tệp
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Định dạng ảnh không hỗ trợ. Vui lòng sử dụng JPG, PNG, hoặc GIF');
      return;
    }
    
    setProductImageFile(file);
    
    // Tạo URL đối tượng cho xem trước
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    // Cập nhật danh sách ảnh xem trước và tệp
    if (previewImages.length < 5) {
      setPreviewImages(prev => [...prev, previewUrl]);
      setProductImageFiles(prev => [...prev, file]);
      
      // Đặt ảnh đầu tiên làm ảnh chính nếu chưa có ảnh nào
      if (previewImages.length === 0) {
        setMainImageIndex(0);
      }
    } else {
      alert('Chỉ được phép tối đa 5 ảnh');
    }
  };
  
  // Xử lý khi tải lên nhiều ảnh cùng lúc
  const handleMultipleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (!files.length) {
      console.log("No files selected");
      return;
    }
    
    console.log("Selected files:", files);
    
    // Tính toán có bao nhiêu ảnh có thể thêm vào
    const remainingSlots = 5 - previewImages.length;
    if (remainingSlots <= 0) {
      alert('Đã đạt giới hạn tối đa 5 ảnh');
      return;
    }
    
    // Giới hạn số lượng tệp được chọn
    const filesToProcess = files.slice(0, remainingSlots);
    
    // Kiểm tra kích thước và định dạng của từng tệp
    const validFiles = filesToProcess.filter(file => {
      // Kiểm tra kích thước tệp (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds 5MB size limit`);
        return false;
      }
      
      // Kiểm tra định dạng tệp
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        console.warn(`File ${file.name} is not a supported image format`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length < filesToProcess.length) {
      alert(`${filesToProcess.length - validFiles.length} ảnh không hợp lệ đã bị loại bỏ (định dạng không được hỗ trợ hoặc kích thước quá lớn)`);
    }
    
    if (validFiles.length === 0) {
      return;
    }
    
    // Tạo URL đối tượng cho xem trước
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    // Cập nhật state
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    setProductImageFiles(prev => [...prev, ...validFiles]);
    
    // Nếu đây là những ảnh đầu tiên, đặt ảnh đầu tiên làm ảnh chính
    if (previewImages.length === 0 && newPreviewUrls.length > 0) {
      setMainImageIndex(0);
      setPreviewImage(newPreviewUrls[0]);
    }
  };
  
  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (index) => {
    // Tạo bản sao của các mảng
    const updatedPreviews = [...previewImages];
    const updatedFiles = [...productImageFiles];
    
    // Xóa ảnh tại chỉ mục đã chỉ định
    updatedPreviews.splice(index, 1);
    updatedFiles.splice(index, 1);
    
    // Cập nhật state
    setPreviewImages(updatedPreviews);
    setProductImageFiles(updatedFiles);
    
    // Xử lý trường hợp xóa ảnh chính
    if (index === mainImageIndex) {
      // Nếu còn ảnh, đặt ảnh đầu tiên làm ảnh chính
      if (updatedPreviews.length > 0) {
        setMainImageIndex(0);
        setPreviewImage(updatedPreviews[0]);
      } else {
        // Nếu không còn ảnh nào
        setMainImageIndex(-1);
        setPreviewImage(null);
      }
    } 
    // Nếu xóa ảnh ở vị trí trước ảnh chính, cần điều chỉnh chỉ mục
    else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };
  
  // Đặt ảnh làm ảnh chính
  const handleSetMainImage = (index) => {
    if (index >= 0 && index < previewImages.length) {
      setMainImageIndex(index);
      setPreviewImage(previewImages[index]);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
      <div className="manager-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo-container">
            <div className="logo" style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => navigate('/')}>
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
            <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div>BEAUTY</div>
              <div>COSMETICS</div>
            </div>
          </div>
          
          <div className="sidebar-title">MANAGER</div>
          
          <div className="sidebar-menu">
            {sidebarItems.map((item) => (
              <div key={item.id} className="sidebar-item" onClick={() => navigate(`/${item.id}`)}>
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
            ))}
          </div>
          
          
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="dashboard-header">
            <div className="search-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm, mã sản phẩm, thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              />
              {searchTerm && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
          
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-bar">
            <h1>Sản Phẩm</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Search Bar */}
              <div style={{ 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center',
                marginRight: '5px' 
              }}>

                {searchTerm && (
                  <button
                    onClick={handleClear}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '0',
                      fontSize: '14px'
                    }}
                  >
                    <MdClose />
                  </button>
                )}
              </div>

              {searchTerm && products.length > 0 && (
                <div style={{ 
                  color: '#666', 
                  fontSize: '14px', 
                  backgroundColor: '#e9f5fe', 
                  padding: '5px 10px', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <FaSearch style={{ fontSize: '12px' }} />
                  <span>Tìm thấy: {products.length} sản phẩm</span>
                </div>
              )}
               <button className="btn-filter" onClick={handleFilterClick} style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: '5px',
                 padding: '8px 16px',
                 backgroundColor: filteredCount > 0 ? '#e9f5fe' : '#f8f9fa',
                 border: '1px solid #ddd',
                 borderRadius: '5px',
                 cursor: 'pointer',
                 transition: 'all 0.2s'
               }}>
                <FaFilter style={{ color: filteredCount > 0 ? '#007bff' : '#6c757d' }} /> 
                <span style={{ color: filteredCount > 0 ? '#007bff' : '#6c757d' }}>Lọc</span>
                {filteredCount > 0 && 
                  <span style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '20px', 
                    height: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {filteredCount}
                  </span>
                }
              </button>
              {filteredCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    color: '#6c757d',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <MdClose />
                  Xóa bộ lọc
                </button>
              )}
              <button
                onClick={handleAdd}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                + Thêm sản phẩm
              </button>
             
            </div>
          </div>
          
          {/* Tabs */}
          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <div 
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </div>
            ))}
          </div>
          
          {/* Table */}
          <div className="dashboard-table" style={{ overflowX: 'auto' }}>
            <table style={{ 
              tableLayout: 'fixed', 
              width: '100%', 
              borderCollapse: 'separate', 
              borderSpacing: '0',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', height: '50px' }}>
                  <th style={{ width: '50px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>ID</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>MÃ SP</th>
                  <th style={{ width: '100px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>PHÂN LOẠI</th>
                  <th style={{ width: '120px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TÊN SP</th>
                  <th style={{ width: '60px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>SL</th>
                  <th style={{ width: '70px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>DUNG TÍCH</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>GIÁ</th>
                  <th style={{ width: '90px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THƯƠNG HIỆU</th>
                  <th style={{ width: '90px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>NGÀY NHẬP</th>
                  <th style={{ width: '80px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>TRẠNG THÁI</th>
                  <th style={{ width: '150px', padding: '8px 4px', borderBottom: '2px solid #dee2e6', fontWeight: 'bold', color: '#495057', textAlign: 'center' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td 
                      colSpan="11" 
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#6c757d', 
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <CircularProgress size={24} />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td 
                      colSpan="11" 
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#dc3545', 
                        fontSize: '16px',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      {error}
                    </td>
                  </tr>
                ) : displayedProducts.length > 0 ? (
                  displayedProducts.map((product, index) => (
                    <tr 
                      key={product.ProductID} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                        transition: 'all 0.2s',
                        ':hover': { backgroundColor: '#f1f3f5' }
                      }}
                    >
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.ProductID}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.ProductCode}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'left' }}>{product.categoryDisplay}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'left', fontWeight: '500' }}>{product.ProductName}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Quantity}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Capacity}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Price ? `${product.Price.toLocaleString()}đ` : ''}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Brand}</td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>
                        {product.ImportDate ? new Date(product.ImportDate).toLocaleDateString('vi-VN') : ''}
                      </td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '100px', padding: '8px 4px', borderBottom: '1px solid #dee2e6', fontSize: '13px', textAlign: 'center' }}>{product.Status}</td>
                      <td style={{ 
                        whiteSpace: 'normal', 
                        overflow: 'visible', 
                        padding: '8px 4px', 
                        borderBottom: '1px solid #dee2e6', 
                        textAlign: 'center',
                        minWidth: '220px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '4px', 
                          justifyContent: 'center'
                        }}>
                          <button
                            onClick={() => handleViewDetail(product)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginBottom: '4px',
                              transition: 'background-color 0.2s',
                              minWidth: '60px'
                            }}
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleOpenImportDialog(product)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginBottom: '4px',
                              transition: 'background-color 0.2s',
                              minWidth: '60px'
                            }}
                          >
                            Nhập kho
                          </button>
                          <button
                            onClick={() => handleDelete(product.ProductID)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              marginBottom: '4px',
                              transition: 'background-color 0.2s',
                              minWidth: '85px'
                            }}
                          >
                            Đổi trạng thái
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan="11" 
                      className="empty-data-message"
                      style={{ 
                        padding: '30px', 
                        textAlign: 'center', 
                        color: '#6c757d', 
                        fontSize: '16px',
                        fontStyle: 'italic',
                        backgroundColor: '#f8f9fa',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Phân trang */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '20px',
              marginBottom: '20px'
            }}>
              <Pagination
                count={Math.ceil(products.length / pageSize)}
                page={page}
                onChange={handlePageChange}
                variant="outlined"
                color="primary"
                showFirstButton
                showLastButton
                size="large"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '10px',
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle style={{ borderBottom: '1px solid #eee', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaFilter style={{ color: '#6c757d' }} />
              <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#333' }}>Bộ lọc sản phẩm</span>
            </div>
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setOpenFilterDialog(false)}
              aria-label="close"
              size="small"
            >
              <MdClose />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>Danh mục sản phẩm</div>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              displayEmpty
              fullWidth
              style={{ marginBottom: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>Tất cả danh mục</em>
              </MenuItem>
              {categoryOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.display}
                </MenuItem>
              ))}
            </Select>
            
            <div style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>Loại da</div>
            <Select
              value={selectedSkinType}
              onChange={handleSkinTypeChange}
              displayEmpty
              fullWidth
              style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
            >
              <MenuItem value="">
                <em>Tất cả loại da</em>
              </MenuItem>
              {skinTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </div>
          
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Bộ lọc đã chọn:</div>
            {!selectedCategory && !selectedSkinType ? (
              <div style={{ fontStyle: 'italic', color: '#6c757d' }}>Chưa chọn bộ lọc nào</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {selectedCategory && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ backgroundColor: '#e9ecef', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                      Danh mục: {categoryOptions.find(c => c.id === selectedCategory)?.display || selectedCategory}
                    </span>
                  </div>
                )}
                {selectedSkinType && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ backgroundColor: '#e9ecef', padding: '3px 8px', borderRadius: '4px', fontSize: '13px' }}>
                      Loại da: {selectedSkinType}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </DialogContent>
        <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
          <Button 
            onClick={handleClearFilters} 
            color="inherit"
            style={{ marginRight: 'auto' }}
            disabled={!selectedCategory && !selectedSkinType}
          >
            Xóa bộ lọc
          </Button>
          <Button onClick={() => setOpenFilterDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleFilterApply} 
            variant="contained" 
            color="primary"
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết sản phẩm */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              Chi tiết sản phẩm: {selectedProduct.ProductName}
            </DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong>ID:</strong> {selectedProduct.ProductID}
                  </div>
                  <div>
                    <strong>Mã sản phẩm:</strong> {selectedProduct.ProductCode}
                  </div>
                  <div>
                    <strong>Tên sản phẩm:</strong> {selectedProduct.ProductName}
                  </div>
                  <div>
                    <strong>Danh mục:</strong> {selectedProduct.categoryDisplay}
                  </div>
                  <div>
                    <strong>Số lượng:</strong> {selectedProduct.Quantity}
                  </div>
                  <div>
                    <strong>Dung tích:</strong> {selectedProduct.Capacity}
                  </div>
                  <div>
                    <strong>Giá:</strong> {selectedProduct.Price ? `${selectedProduct.Price.toLocaleString()}đ` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <strong>Thương hiệu:</strong> {selectedProduct.Brand}
                  </div>
                  <div>
                    <strong>Xuất xứ:</strong> {selectedProduct.Origin}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong> {selectedProduct.Status}
                  </div>
                  <div>
                    <strong>Loại da:</strong> {selectedProduct.SkinType}
                  </div>
                  <div>
                    <strong>Ngày sản xuất:</strong> {selectedProduct.ManufactureDate}
                  </div>
                  <div>
                    <strong>Ngày nhập kho:</strong> {selectedProduct.ImportDate ? new Date(selectedProduct.ImportDate).toLocaleDateString('vi-VN') : 'Không có thông tin'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Mô tả sản phẩm:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginTop: '4px',
                    minHeight: '60px'
                  }}>
                    {selectedProduct.Description || 'Không có mô tả'}
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <strong>Thành phần:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginTop: '4px',
                    minHeight: '60px'
                  }}>
                    {selectedProduct.Ingredients || 'Không có thông tin thành phần'}
                  </div>
                </div>
                <div>
                  <strong>Hướng dẫn sử dụng:</strong>
                  <div style={{ 
                    padding: '8px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px', 
                    marginTop: '4px',
                    minHeight: '60px'
                  }}>
                    {selectedProduct.UsageInstructions || 'Không có hướng dẫn sử dụng'}
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail} color="primary">
                Đóng
              </Button>
              <Button 
                onClick={() => {
                  // Mở dialog xem tất cả ảnh
                  setOpenImageGallery(true);
                }}
                color="info"
                style={{ marginRight: '8px' }}
              >
                Xem tất cả ảnh
              </Button>
              <Button 
                onClick={() => {
                  handleCloseDetail();
                  handleEdit(selectedProduct.ProductID);
                }} 
                color="primary" 
                variant="contained"
              >
                Chỉnh sửa
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog thêm sản phẩm */}
      <Dialog open={openAddDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingProductId ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Mã sản phẩm"
                  name="productCode"
                  value={newProduct.productCode || prefixMessage || 'Sẽ được tạo tự động theo danh mục'}
                  fullWidth
                  disabled
                  helperText={prefixMessage || "Mã sản phẩm sẽ được tạo tự động dựa trên danh mục"}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Tên sản phẩm *"
                  name="productName"
                  value={newProduct.productName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  error={!newProduct.productName}
                  helperText={!newProduct.productName ? "Tên sản phẩm là bắt buộc" : ""}
                  margin="normal"
                  placeholder="Nhập tên sản phẩm"
                />
              </Grid>
              <Grid item xs={12}>
                {/* Chỉ hiển thị thông tin danh mục ban đầu khi đã thay đổi danh mục */}
                {editingProductId && newProduct.categoryId !== products.find(p => p.ProductID === editingProductId)?.categoryId && (
                  <Box sx={{ mb: 1, p: 1, bgcolor: '#fff8e1', borderRadius: '4px', border: '1px solid #ffe0b2' }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: '#ed6c02' }}>
                      <span style={{ marginRight: '5px' }}>⚠️</span>
                      Bạn đang thay đổi danh mục từ 
                      <strong style={{ margin: '0 5px', color: '#2e7d32' }}>
                        {products.find(p => p.ProductID === editingProductId)?.categoryDisplay || 'Không xác định'}
                      </strong>
                      sang
                      <strong style={{ margin: '0 5px', color: '#ed6c02' }}>
                        {categoryOptions.find(c => c.id === newProduct.categoryId)?.display || 'Không xác định'}
                      </strong>
                    </Typography>
                  </Box>
                )}
                <Select
                  name="categoryId"
                  displayEmpty
                  fullWidth
                  value={newProduct.categoryId || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const oldValue = newProduct.categoryId;
                    // Chỉ hiện xác nhận khi thực sự thay đổi danh mục và đang ở chế độ chỉnh sửa
                    const originalCategoryId = editingProductId ? 
                      products.find(p => p.ProductID === editingProductId)?.categoryId : null;
                    
                    if (editingProductId && originalCategoryId && newValue !== originalCategoryId) {
                      // Hiển thị thông báo khi thay đổi từ danh mục ban đầu
                      const oldCategory = categoryOptions.find(c => c.id === originalCategoryId)?.display || 'Không xác định';
                      const newCategory = categoryOptions.find(c => c.id === newValue)?.display || 'Không xác định';
                      if (window.confirm(`Bạn có chắc muốn thay đổi danh mục từ "${oldCategory}" sang "${newCategory}" không?`)) {
                        handleInputChange(e);
                      }
                    } else {
                      // Trường hợp chỉ cập nhật giá trị bình thường (thêm mới hoặc không thay đổi từ danh mục ban đầu)
                      handleInputChange(e);
                    }
                  }}
                  label="Danh Mục"
                  error={!newProduct.categoryId && !editingProductId}
                  sx={{
                    '& .MuiSelect-select': {
                      fontWeight: editingProductId && 
                        newProduct.categoryId !== products.find(p => p.ProductID === editingProductId)?.categoryId 
                        ? 'bold' : 'normal',
                      color: editingProductId && 
                        newProduct.categoryId !== products.find(p => p.ProductID === editingProductId)?.categoryId 
                        ? '#ed6c02' : 'inherit'
                    }
                  }}
                >
                  <MenuItem value=""><em>Chọn danh mục</em></MenuItem>
                  {categoryOptions.map((category) => {
                    // Xác định xem đây có phải là danh mục ban đầu khi đang chỉnh sửa
                    const isOriginalCategory = editingProductId && 
                      products.find(p => p.ProductID === editingProductId)?.categoryId === category.id;
                    
                    return (
                      <MenuItem 
                        key={category.display} 
                        value={category.id}
                        sx={{
                          bgcolor: isOriginalCategory ? '#f0f7ff' : 'inherit',
                          fontWeight: isOriginalCategory ? 'bold' : 'normal'
                        }}
                      >
                        {category.display}
                        {isOriginalCategory && 
                          <span style={{ marginLeft: '10px', color: '#4caf50', fontSize: '0.8rem' }}>(Danh mục ban đầu)</span>
                        }
                      </MenuItem>
                    );
                  })}
                </Select>
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: '#666' }}>
                  {editingProductId 
                    ? "Bạn có thể giữ nguyên hoặc thay đổi danh mục nếu cần"
                    : "Chọn danh mục sản phẩm"}
                </Typography>
                {!newProduct.categoryId && !editingProductId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    Danh mục là bắt buộc khi thêm sản phẩm mới
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="quantity"
                  label="Số Lượng"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  disabled={editingProductId !== null}
                  helperText={editingProductId !== null ? "Số lượng chỉ có thể thay đổi thông qua chức năng nhập kho" : ""}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="price"
                  label="Giá Tiền *"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formatCurrency(newProduct.price)}
                  onChange={handlePriceChange}
                  required
                  error={!newProduct.price || isNaN(parseFloat(newProduct.price))}
                  helperText={!newProduct.price || isNaN(parseFloat(newProduct.price)) ? "Giá phải là số" : "Đơn vị: VND"}
                  InputProps={{
                    endAdornment: <span style={{ color: '#666' }}>VND</span>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="capacity"
                  label="Dung Tích"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newProduct.capacity}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 50g, 100ml"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="brand"
                  label="Thương Hiệu"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newProduct.brand}
                  onChange={handleInputChange}
                  placeholder="Nhập tên thương hiệu"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="origin"
                  label="Xuất Xứ"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newProduct.origin}
                  onChange={handleInputChange}
                  placeholder="Nhập xuất xứ sản phẩm"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  name="skinType"
                  label="Loại Da"
                  fullWidth
                  variant="outlined"
                  value={newProduct.skinType}
                  onChange={handleInputChange}
                  style={{ marginTop: '16px' }}
                >
                  <MenuItem value=""><em>Chọn loại da</em></MenuItem>
                  {skinTypes.map((skinType, index) => (
                    <MenuItem key={index} value={skinType}>{skinType}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker 
                    label="Ngày Sản Xuất"
                    value={newProduct.manufactureDate ? dayjs(newProduct.manufactureDate) : null}
                    onChange={(value) => {
                      setNewProduct(prev => ({
                        ...prev,
                        manufactureDate: value ? value.format('YYYY-MM-DD') : null
                      }));
                    }}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        margin: 'dense',
                        variant: 'outlined' 
                      } 
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="ImportDate"
                  label="Ngày Nhập Kho"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={newProduct.ImportDate}
                  onChange={handleDateChange}
                  InputLabelProps={{ shrink: true }}
                  disabled={true}
                  helperText="Ngày nhập kho sẽ tự động lấy ngày hiện tại khi tạo sản phẩm mới"
                />
              </Grid>
            </Grid>
            
            <div style={{ marginTop: '15px' }}>
                <TextField
                    margin="dense"
                    name="description"
                    label="Mô Tả Sản Phẩm"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả chi tiết về sản phẩm"
                />
                <TextField
                    margin="dense"
                    name="ingredients"
                    label="Thành Phần"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={newProduct.ingredients}
                    onChange={handleInputChange}
                    placeholder="Liệt kê các thành phần của sản phẩm"
                />
                <TextField
                    margin="dense"
                    name="usageInstructions"
                    label="Hướng Dẫn Sử Dụng"
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    value={newProduct.usageInstructions}
                    onChange={handleInputChange}
                    placeholder="Nhập hướng dẫn sử dụng sản phẩm"
                />

                {/* Phần thêm ảnh chỉ hiển thị khi thêm sản phẩm mới, không hiển thị khi chỉnh sửa */}
                {!editingProductId && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>
                      Hình ảnh sản phẩm (Yêu cầu 5 ảnh)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid #dee2e6', borderRadius: '8px', p: 2, bgcolor: '#f8f9fa' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Phần xem trước ảnh */}
                        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {previewImages.length > 0 ? (
                            previewImages.map((preview, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  border: mainImageIndex === index ? '2px solid #1976d2' : '1px solid #ddd',
                                  p: 1,
                                  cursor: 'pointer',
                                  borderRadius: '4px',
                                  position: 'relative'
                                }}
                                onClick={() => handleSetMainImage(index)}
                              >
                                <img
                                  src={preview}
                                  alt={`Ảnh ${index + 1}`}
                                  style={{ 
                                    width: '100%', 
                                    height: '80px', 
                                    objectFit: 'cover' 
                                  }}
                                />
                                {mainImageIndex === index && (
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      bgcolor: '#4CAF50',
                                      color: 'white',
                                      p: '2px 4px',
                                      fontSize: '10px',
                                      borderRadius: '0 0 4px 0'
                                    }}
                                  >
                                    Chính
                                  </Box>
                                )}
                                <IconButton
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bgcolor: 'rgba(255,255,255,0.7)',
                                    width: '24px',
                                    height: '24px'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(index);
                                  }}
                                >
                                  <span style={{ fontSize: '16px' }}>✖</span>
                                </IconButton>
                              </Box>
                            ))
                          ) : (
                            Array(5).fill(null).map((_, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  p: 1, 
                                  border: '1px dashed #ddd', 
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  height: '60px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  Ảnh {index + 1}
                                </Typography>
                              </Box>
                            ))
                          )}
                          <Box sx={{ 
                            textAlign: 'center', 
                            mt: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            gap: 1
                          }}>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              {previewImages.length}/5 ảnh đã chọn
                            </Typography>
                          </Box>
                        </Box>

                        {/* Main Image Display */}
                        <Box sx={{ width: '70%' }}>
                          <Box 
                            sx={{ 
                              width: '100%', 
                              height: '300px', 
                              border: '1px solid #ddd', 
                              borderRadius: '4px', 
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              overflow: 'hidden',
                              position: 'relative',
                              bgcolor: 'white'
                            }}
                          >
                            {previewImage ? (
                              <>
                                <img
                                  src={previewImage}
                                  alt="Ảnh sản phẩm"
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%', 
                                    objectFit: 'contain' 
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    bgcolor: '#4CAF50',
                                    color: 'white',
                                    p: '4px 8px',
                                    fontSize: '12px',
                                    borderRadius: '0 0 0 4px',
                                    zIndex: 1
                                  }}
                                >
                                  Ảnh đại diện
                                </Box>
                              </>
                            ) : (
                              <Typography variant="body1" color="text.secondary">
                                Chọn ảnh từ bên trái hoặc tải lên ảnh mới
                              </Typography>
                            )}
                          </Box>
                          
                          {/* Hướng dẫn sử dụng */}
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: '4px' }}>
                            <Typography variant="body2" fontWeight="medium">
                              Hướng dẫn:
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.875rem' }}>
                              <li>Chọn đúng 5 ảnh sản phẩm</li>
                              <li>Nhấp vào ảnh để đặt làm ảnh đại diện</li>
                              <li>Định dạng: JPG, JPEG, PNG, GIF (tối đa 5MB/ảnh)</li>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Phần upload ảnh */}
                      <Box sx={{ p: 2, bgcolor: 'white', border: '1px dashed #ccc', borderRadius: '4px' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Tải lên ảnh sản phẩm {previewImages.length === 5 && "(Đã đạt giới hạn 5 ảnh)"}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                              variant="contained"
                              component="label"
                              color="primary"
                              disabled={previewImages.length >= 5}
                              startIcon={<span>📁</span>}
                              sx={{ minWidth: '180px' }}
                            >
                              Chọn nhiều ảnh
                              <input
                                type="file"
                                hidden
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleMultipleImagesChange}
                                multiple
                                disabled={previewImages.length >= 5}
                              />
                            </Button>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" color={previewImages.length >= 5 ? "error" : "text.secondary"}>
                                {previewImages.length >= 5 
                                  ? "Đã đạt giới hạn tối đa 5 ảnh" 
                                  : `Còn thiếu ${5 - previewImages.length} ảnh`}
                              </Typography>
                              {previewImages.length > 0 && (
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  Đã chọn {previewImages.length} ảnh
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ 
                            p: 1, 
                            bgcolor: previewImages.length === 5 ? '#e8f5e9' : '#fff3e0', 
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <Box component="span" sx={{ fontSize: '20px' }}>
                              {previewImages.length === 5 ? '✅' : '⚠️'}
                            </Box>
                            <Typography variant="body2">
                              {previewImages.length === 5 
                                ? 'Đã đủ 5 ảnh. Sản phẩm sẵn sàng để thêm!' 
                                : 'Lưu ý: Sản phẩm phải có đủ 5 ảnh để có thể thêm vào hệ thống'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
            </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={editingProductId ? handleSubmitEdit : handleSubmitProduct} 
            color="primary" 
            variant="contained"
            disabled={
              // Luôn kiểm tra tên sản phẩm và trạng thái đang submit
              !newProduct.productName || isSubmitting || 
              // Khi thêm mới: kiểm tra tất cả các trường bắt buộc
              (!editingProductId && (!newProduct.quantity || !newProduct.price || !newProduct.categoryId)) ||
              // Khi chỉnh sửa: chỉ kiểm tra số lượng, giá
              (editingProductId && (!newProduct.quantity || !newProduct.price))
            }
          >
            {isSubmitting ? (
                <span>Đang xử lý...</span>
            ) : (
                editingProductId ? 'Cập nhật' : 'Thêm Sản Phẩm'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog nhập kho */}
      <Dialog open={openImportDialog} onClose={handleCloseImportDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Nhập Kho Sản Phẩm
        </DialogTitle>
        <DialogContent>
          {importingProduct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Sản phẩm:</strong> {importingProduct.ProductName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Mã sản phẩm:</strong> {importingProduct.ProductCode}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Số lượng hiện tại:</strong> {importingProduct.Quantity}
              </Typography>
              <TextField
                margin="dense"
                label="Số lượng nhập thêm"
                type="number"
                fullWidth
                variant="outlined"
                value={importQuantity}
                onChange={handleImportQuantityChange}
                sx={{ mt: 2 }}
                autoFocus
                helperText="Nhập số lượng sản phẩm cần thêm vào kho"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleOpenConfirmImport} 
            color="primary" 
            variant="contained"
            disabled={isImporting || importQuantity <= 0}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem tất cả ảnh */}
      <Dialog open={openImageGallery} onClose={() => setOpenImageGallery(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Tất Cả Ảnh Sản Phẩm</Typography>
            <IconButton onClick={() => setOpenImageGallery(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
            {selectedProduct && (
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {selectedProduct.ProductName}
              </Typography>
            )}
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {productImages && productImages.length > 0 ? (
                productImages.map((image, index) => (
                  <Box 
                    key={index} 
                    sx={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={getImageUrl(image)} 
                      alt={`Ảnh ${index + 1}`} 
                      style={{ 
                        width: '100%', 
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block'
                      }}
                    />
                    {selectedProduct && selectedProduct.ImgURL && getImageUrl(image) === getImageUrl(selectedProduct.ImgURL) && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bgcolor: '#4CAF50',
                          color: 'white',
                          p: '4px 8px',
                          fontSize: '12px',
                          borderRadius: '0 0 4px 0'
                        }}
                      >
                        Ảnh đại diện
                      </Box>
                    )}
                  </Box>
                ))
              ) : (
                <Box sx={{ gridColumn: 'span 3', p: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Không có ảnh nào cho sản phẩm này
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageGallery(false)} color="primary">
            Đóng
          </Button>
          <Button 
            onClick={handleOpenEditImages} 
            color="primary" 
            variant="contained"
          >
            Chỉnh sửa ảnh
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận nhập kho */}
      <Dialog open={openConfirmImport} onClose={handleCloseConfirmImport} maxWidth="xs" fullWidth>
        <DialogTitle>
          Xác nhận nhập kho
        </DialogTitle>
        <DialogContent>
          {importingProduct && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Bạn có chắc chắn muốn nhập thêm <strong>{importQuantity}</strong> sản phẩm vào kho?
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                <strong>Sản phẩm:</strong> {importingProduct.ProductName}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Số lượng hiện tại:</strong> {importingProduct.Quantity}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Số lượng sau khi nhập:</strong> {importingProduct.Quantity + importQuantity}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmImport} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleImportStock} 
            color="primary" 
            variant="contained"
            disabled={isImporting}
          >
            {isImporting ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog sửa ảnh */}
      <Dialog open={openEditImageDialog} onClose={() => setOpenEditImageDialog(false)} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>
              Chỉnh sửa ảnh: {selectedProduct.ProductName}
            </DialogTitle>
            <DialogContent>
              {uploadingImage ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                  <CircularProgress />
                  <span style={{ marginLeft: '10px' }}>Đang xử lý...</span>
                </div>
              ) : (
                <>
                  {/* Hiển thị danh sách ảnh để sửa - Bố cục mới */}
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Danh sách ảnh ({reorderedImages.length}/5)</div>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Phần thumbnails */}
                    <Box sx={{ width: '25%' }}>
                      {reorderedImages && reorderedImages.length > 0 ? (
                        reorderedImages.map((image, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              mb: 1, 
                              border: selectedImage === image.imageID ? '2px solid #1976d2' : image.isMainImage ? '2px solid #4CAF50' : '1px solid #ddd',
                              p: 1,
                              cursor: 'pointer',
                              position: 'relative',
                              borderRadius: '4px'
                            }}
                            onClick={() => setSelectedImage(image.imageID)}
                          >
                            {image.isMainImage && (
                              <div style={{
                                position: 'absolute',
                                top: '0',
                                right: '0',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '2px 6px',
                                fontSize: '10px',
                                borderRadius: '0 0 0 4px',
                                zIndex: 1
                              }}>
                                Ảnh đại diện
                              </div>
                            )}
                            <img
                              src={getImageUrl(image)}
                              alt={`Thumbnail ${index + 1}`}
                              style={{ 
                                width: '100%', 
                                height: '80px', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/default-product.png';
                              }}
                            />
                            <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'center' }}>
                              Thứ tự: {image.displayOrder !== undefined ? image.displayOrder : index}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Box 
                          sx={{ 
                            p: 2, 
                            border: '1px solid #ddd', 
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Không có ảnh
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Phần hiển thị ảnh đang chọn và các tùy chỉnh */}
                    <Box sx={{ width: '75%' }}>
                      {reorderedImages && reorderedImages.length > 0 ? (
                        <>
                          {selectedImage ? (
                            // Hiển thị ảnh đang được chọn
                            <>
                              {(() => {
                                const selectedImageObj = reorderedImages.find(img => img.imageID === selectedImage);
                                return selectedImageObj ? (
                                  <Box>
                                    <Box 
                                      sx={{ 
                                        height: '250px', 
                                        border: selectedImageObj.isMainImage ? '2px solid #4CAF50' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        mb: 2,
                                        p: 1
                                      }}
                                    >
                                      {selectedImageObj.isMainImage && (
                                        <div style={{
                                          position: 'absolute',
                                          top: '0',
                                          right: '0',
                                          backgroundColor: '#4CAF50',
                                          color: 'white',
                                          padding: '4px 8px',
                                          fontSize: '12px',
                                          borderRadius: '0 0 0 4px',
                                          zIndex: 1
                                        }}>
                                          Ảnh đại diện
                                        </div>
                                      )}
                                      <img
                                        src={getImageUrl(selectedImageObj)}
                                        alt="Ảnh đang chỉnh sửa"
                                        style={{ 
                                          maxWidth: '100%', 
                                          maxHeight: '100%', 
                                          objectFit: 'contain' 
                                        }}
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/images/default-product.png';
                                        }}
                                      />
                                    </Box>

                                    {/* Các tùy chỉnh cho ảnh đã chọn */}
                                    <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '4px' }}>
                                      <Typography variant="body1" fontWeight="bold" gutterBottom>
                                        Thông tin ảnh
                                      </Typography>
                                      
                                      <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                          <strong>ID ảnh:</strong> {selectedImageObj.imageID}
                                        </Typography>
                                        <TextField
                                          type="number"
                                          label="Thứ tự hiển thị"
                                          value={selectedImageObj.displayOrder || reorderedImages.indexOf(selectedImageObj)}
                                          onChange={(e) => {
                                            const newDisplayOrder = parseInt(e.target.value);
                                            const newImages = [...reorderedImages];
                                            const imageIndex = newImages.findIndex(img => img.imageID === selectedImage);
                                            
                                            if (imageIndex !== -1) {
                                              // Kiểm tra xem đã có ảnh nào có thứ tự hiển thị này chưa
                                              const existingImageWithOrder = newImages.find(
                                                (img, idx) => idx !== imageIndex && img.displayOrder === newDisplayOrder
                                              );

                                              if (existingImageWithOrder) {
                                                // Nếu có, hoán đổi thứ tự hiển thị giữa hai ảnh
                                                existingImageWithOrder.displayOrder = newImages[imageIndex].displayOrder;
                                              }
                                              
                                              // Cập nhật thứ tự hiển thị cho ảnh hiện tại
                                              newImages[imageIndex].displayOrder = newDisplayOrder;
                                              setReorderedImages(newImages);
                                              setReorderChanged(true);
                                            }
                                          }}
                                          fullWidth
                                          size="small"
                                          margin="normal"
                                          InputProps={{ inputProps: { min: 0, max: 4 } }}
                                        />
                                      </Box>
                                      
                                      <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>
                                          Thay đổi ảnh:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Button
                                            variant="outlined"
                                            component="label"
                                            size="small"
                                          >
                                            Chọn ảnh mới
                                            <input
                                              type="file"
                                              hidden
                                              accept="image/*"
                                              onChange={handleImageFileChange}
                                            />
                                          </Button>
                                          <Typography variant="caption" sx={{ flex: 1, ml: 1 }}>
                                            {newImageFile ? newImageFile.name : 'Chưa chọn file nào'}
                                          </Typography>
                                        </Box>
                                        
                                        {/* Hiển thị xem trước ảnh nếu có */}
                                        {previewUrl && (
                                          <Box 
                                            sx={{ 
                                              mt: 2,
                                              display: 'flex',
                                              justifyContent: 'center',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                            }}
                                          >
                                            <Typography variant="caption" gutterBottom>
                                              Xem trước ảnh:
                                            </Typography>
                                            <Box 
                                              component="img"
                                              src={previewUrl}
                                              alt="Xem trước"
                                              sx={{
                                                maxWidth: '100%', 
                                                maxHeight: '150px',
                                                objectFit: 'contain',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                p: 1
                                              }}
                                            />
                                          </Box>
                                        )}
                                        
                                        {newImageFile && (
                                          <Box 
                                            sx={{ 
                                              mt: 1, 
                                              p: 1, 
                                              bgcolor: '#e8f5e9', 
                                              borderRadius: '4px',
                                              fontSize: '12px'
                                            }}
                                          >
                                            <Typography variant="caption">
                                              Đã chọn: {newImageFile.name}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          color="success"
                                          onClick={() => handleSetAsMainImage(selectedImage)}
                                          disabled={selectedImageObj.isMainImage}
                                          fullWidth
                                        >
                                          {selectedImageObj.isMainImage ? 'Ảnh đại diện' : 'Đặt làm ảnh đại diện'}
                                        </Button>
                                        
                                      </Box>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box 
                                    sx={{ 
                                      height: '250px', 
                                      border: '1px solid #ddd',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Typography variant="body1" color="text.secondary">
                                      Không tìm thấy ảnh đã chọn
                                    </Typography>
                                  </Box>
                                );
                              })()}
                            </>
                          ) : (
                            // Hiển thị thông báo chọn ảnh
                            <Box 
                              sx={{ 
                                height: '250px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                mb: 2
                              }}
                            >
                              <Typography variant="body1" gutterBottom>
                                Hãy chọn một ảnh từ danh sách bên trái để chỉnh sửa
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Hoặc thêm ảnh mới bằng form phía trên
                              </Typography>
                            </Box>
                          )}
                        </>
                      ) : (
                        <Box 
                          sx={{ 
                            height: '250px', 
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            Không có ảnh nào để hiển thị
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditImageDialog(false)} color="primary">
                Đóng
              </Button>
              <Button 
                onClick={handleReorderImages} 
                color="primary" 
                variant="contained"
                disabled={uploadingImage || (!reorderChanged && !newImageFile)}
              >
                Lưu thay đổi
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Product;
