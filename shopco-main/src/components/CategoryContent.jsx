import { Box, Grid, Typography, Checkbox, FormControlLabel, Paper, Accordion, AccordionSummary, AccordionDetails, Divider } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProductCard from "./ProductCard";
import { Search as SearchIcon } from '@mui/icons-material';
import { InputBase, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';
import productService from '../apis/productService';
import categoryService from '../apis/categoryService';

// Thêm constant cho thứ tự danh mục
const CATEGORY_ORDER = [
    "Làm Sạch Da",
    "Đặc Trị", 
    "Dưỡng Ẩm",
    "Bộ Chăm Sóc Da Mặt",
    "Chống Nắng Da Mặt",
    "Dưỡng Mắt",
    "Dưỡng Môi",
    "Mặt Nạ",
    "Vấn Đề Về Da",
    "Dụng Cụ/Phụ Kiện Chăm Sóc Da"
];

const accordionStyles = {
    '& .MuiAccordion-root': {
        borderBottom: '1px solid #eee',
        '&:last-child': {
            borderBottom: 'none'
        }
    },
    '& .MuiAccordionSummary-root': {
        minHeight: '48px',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
        }
    }
};

// Thêm hàm helper để xử lý dữ liệu categories
const processCategoriesData = (rawCategories) => {
    const groupedCategories = {};
    
    // Khởi tạo object theo thứ tự định sẵn
    CATEGORY_ORDER.forEach(type => {
        groupedCategories[type] = [];
    });

    // Xử lý và nhóm categories
    rawCategories.forEach(category => {
        if (category.categoryType && groupedCategories.hasOwnProperty(category.categoryType)) {
            // Kiểm tra trùng lặp trước khi thêm
            const existingCategory = groupedCategories[category.categoryType].find(
                existing => existing.categoryName === category.categoryName
            );
            
            if (!existingCategory) {
                groupedCategories[category.categoryType].push(category);
            }
        }
    });

    // Lọc bỏ các category type không có dữ liệu
    return Object.fromEntries(
        Object.entries(groupedCategories).filter(([_, categories]) => categories.length > 0)
    );
};

const PRICE_RANGES = [
    { label: '0-300.000đ', min: 0, max: 300000 },
    { label: '300.000-800.000đ', min: 300000, max: 800000 },
    { label: 'Trên 800.000đ', min: 800000, max: Infinity }
];

const CategoryContent = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubItem, setSelectedSubItem] = useState('');
    const [expandedCategory, setExpandedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [allBrands, setAllBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [skinTypes, setSkinTypes] = useState([]);
    const [selectedSkinType, setSelectedSkinType] = useState('');
    const [categoryProducts, setCategoryProducts] = useState([]);

    // Cập nhật useEffect để xử lý dữ liệu tốt hơn
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getCategories();
                const _response = response['$values'];
                
                // Thêm log để kiểm tra dữ liệu nhận được
                console.log('Categories response:', _response);
                
                if (Array.isArray(_response) && _response.length > 0) {
                    const processedCategories = processCategoriesData(_response);
                    setCategories(processedCategories);
                    
                    // Tự động chọn category đầu tiên nếu chưa có selection
                    if (!selectedCategory) {
                        const firstCategoryType = Object.keys(processedCategories)[0];
                        if (firstCategoryType) {
                            setSelectedCategory(firstCategoryType);
                            const firstCategory = processedCategories[firstCategoryType][0];
                            if (firstCategory) {
                                fetchProductsByCategory(firstCategory.categoryId);
                            }
                        }
                    }
                } else {
                    console.warn('No categories data received');
                    setCategories({});
                }
            } catch (error) {
                console.error('Error loading categories:', error);
                setError('Failed to load categories');
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
        console.log("Cate: " + categories)
    }, []); 

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await productService.getAllProducts();
                
                // Xử lý dữ liệu trả về
                let _products = [];
                if (response && response.$values) {
                    _products = response.$values;
                } else if (Array.isArray(response)) {
                    _products = response;
                } else if (response && response.data) {
                    _products = Array.isArray(response.data) ? response.data : [response.data];
                }
                
                // Lấy các thương hiệu duy nhất từ tất cả sản phẩm
                if (_products && _products.length > 0) {
                    const uniqueBrands = [...new Set(_products.filter(p => p.brand).map(p => p.brand))];
                    setBrands(uniqueBrands);
                    console.log('Tất cả thương hiệu từ API:', uniqueBrands.length, 'thương hiệu');

                    // Lấy các loại da duy nhất từ API
                    const uniqueSkinTypes = [...new Set(_products.filter(p => p.skinType).map(p => p.skinType))];
                    
                    // Nếu không có loại da từ API, sử dụng danh sách chuẩn
                    if (uniqueSkinTypes.length === 0) {
                        const standardSkinTypes = ["Da Dầu", "Da Khô", "Da Thường", "Da Hỗn Hợp", "Da Nhạy Cảm"];
                        setSkinTypes(standardSkinTypes);
                        console.log('Sử dụng danh sách loại da chuẩn:', standardSkinTypes);
                    } else {
                        setSkinTypes(uniqueSkinTypes);
                        console.log('Danh sách loại da từ API:', uniqueSkinTypes);
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Error loading products:', error);
                setLoading(false);
                
                // Nếu có lỗi, vẫn sử dụng danh sách loại da chuẩn
                const standardSkinTypes = ["Da Dầu", "Da Khô", "Da Thường", "Da Hỗn Hợp", "Da Nhạy Cảm"];
                setSkinTypes(standardSkinTypes);
                console.log('Sử dụng danh sách loại da chuẩn do lỗi:', standardSkinTypes);
            }
        };

        loadProducts();
    }, []);

    // Khởi tạo 5 loại da chuẩn
    useEffect(() => {
        // Danh sách 5 loại da chuẩn
        const standardSkinTypes = ["Da Dầu", "Da Khô", "Da Thường", "Da Hỗn Hợp", "Da Nhạy Cảm"];
        setSkinTypes(standardSkinTypes);
        console.log('Sử dụng 5 loại da chuẩn:', standardSkinTypes);
    }, []);

    // Sửa lại hàm fetchProductsByCategory để cập nhật brands nếu rỗng
    const fetchProductsByCategory = async (categoryId) => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts();
            
            // Xử lý dữ liệu trả về
            let _products = [];
            if (response && response.$values) {
                _products = response.$values;
            } else if (Array.isArray(response)) {
                _products = response;
            } else if (response && response.data) {
                _products = Array.isArray(response.data) ? response.data : [response.data];
            }
            
            // Lấy tất cả thương hiệu từ API nếu brands đang rỗng
            if (brands.length === 0 && _products && _products.length > 0) {
                const allUniqueBrands = [...new Set(_products.filter(p => p.brand).map(p => p.brand))];
                setBrands(allUniqueBrands);
                console.log('Cập nhật tất cả thương hiệu từ API:', allUniqueBrands.length, 'thương hiệu');
            }
            
            // Lọc sản phẩm theo categoryId
            const data = _products.filter(x => x.categoryId == categoryId);            
            
            const mappedProducts = data.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                skinType: product.skinType,
                categoryId: product.categoryId,
                description: product.description,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status
            }));
            
            console.log('Sản phẩm trong category:', mappedProducts.length);
            
            // Lưu danh sách sản phẩm của category
            setProducts(mappedProducts);
            setCategoryProducts(mappedProducts);
            
            // KHÔNG ghi đè danh sách thương hiệu, chỉ log để debug
            const categoryBrands = [...new Set(mappedProducts.filter(p => p.brand).map(p => p.brand))];
            console.log('Thương hiệu trong category hiện tại:', categoryBrands.length, 'thương hiệu');
            console.log('Tổng số thương hiệu hiển thị:', brands.length, 'thương hiệu');
            
            // Reset các bộ lọc khi chuyển danh mục
            setSelectedBrands([]);
            setSelectedSkinType('');
            setSelectedPriceRange(null);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products by category:', error);
            setLoading(false);
        }
    };

    const handleCategory = async (categoryType, category) => {
        try {
            // Nếu không có category, chỉ mở/đóng accordion
            if (!category) {
                setExpandedCategory(expandedCategory === categoryType ? null : categoryType);
                return;
            }
            
            // Cập nhật state
            setSelectedCategory(categoryType);
            setSelectedSubItem(category.categoryName);
            setExpandedCategory(categoryType);
            
            // Lấy sản phẩm theo category
            await fetchProductsByCategory(category.categoryId);
            
            // Reset các bộ lọc khi chuyển danh mục
            setSelectedBrands([]);
            setSelectedSkinType('');
            setSelectedPriceRange(null);
        } catch (error) {
            console.error('Lỗi khi xử lý danh mục:', error);
        }
    };

    const handleSubItemSelection = async (subItem, categoryId) => {
        setSelectedSubItem(subItem);
        await fetchProductsByCategory(categoryId);
        
        // Reset các bộ lọc khi chuyển danh mục con
        setSelectedBrands([]);
        setSelectedSkinType('');
        setSelectedPriceRange(null);
    };

    // Hàm lọc sản phẩm theo khoảng giá
    const filterProductsByPrice = (products) => {
        if (!selectedPriceRange) return products;
        return products.filter(product => 
            product.price >= selectedPriceRange.min && product.price < selectedPriceRange.max
        );
    };
   
    // Hàm lọc sản phẩm dựa trên thương hiệu đã chọn - thêm lại hàm này
    const getFilteredProducts = () => {
        // Nếu không có thương hiệu được chọn, trả về tất cả sản phẩm
        if (selectedBrands.length === 0) return products;
        return products.filter(product => selectedBrands.includes(product.brand));
    };

    // Sửa lại hàm handleBrandChange để xử lý khi người dùng chọn thương hiệu
    const handleBrandChange = async (brand) => {
        try {
            // Cập nhật danh sách thương hiệu đã chọn
            const newSelectedBrands = selectedBrands.includes(brand)
                ? selectedBrands.filter(b => b !== brand)
                : [...selectedBrands, brand];
            
            console.log('Các thương hiệu đã chọn:', newSelectedBrands);
            
            // Cập nhật state
            setSelectedBrands(newSelectedBrands);
            
            // Áp dụng tất cả các bộ lọc
            await applyAllFilters(newSelectedBrands, selectedSkinType, selectedPriceRange);
        } catch (error) {
            console.error('Lỗi khi xử lý thương hiệu:', error);
        }
    };
    
    // Cập nhật hàm xử lý khi người dùng chọn khoảng giá
    const handlePriceRangeSelect = async (priceRange) => {
        // Nếu người dùng chọn lại khoảng giá đã chọn, hủy lọc
        const newPriceRange = selectedPriceRange && selectedPriceRange.label === priceRange.label 
            ? null 
            : priceRange;
        
        // Cập nhật state
        setSelectedPriceRange(newPriceRange);
        
        // Áp dụng tất cả các bộ lọc
        await applyAllFilters(selectedBrands, selectedSkinType, newPriceRange);
    };
    
    // Cập nhật hàm lấy sản phẩm theo khoảng giá
    const fetchProductsByPrice = async (priceParam) => {
        try {
            setLoading(true);
            // Thay vì gọi API riêng, lọc từ danh sách sản phẩm đã có
            const response = await productService.getAllProducts();
            const _response = response['$values'];
            
            // Phân tích tham số giá
            const [minStr, maxStr] = priceParam.split('-');
            const min = parseInt(minStr);
            const max = maxStr === 'max' ? Infinity : parseInt(maxStr);
            
            // Lọc sản phẩm theo khoảng giá
            const filteredProducts = _response.filter(product => 
                product.price >= min && (max === Infinity || product.price <= max)
            );
            
            const mappedProducts = filteredProducts.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status
            }));

            console.log('Sản phẩm theo khoảng giá:', mappedProducts);
            setProducts(mappedProducts);
            setAllProducts(mappedProducts);
            setFilteredProducts(mappedProducts);
            setSelectedSubItem(`Giá: ${priceParam.replace('max', 'trở lên')}`); // Cập nhật tiêu đề phụ
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm theo giá:', error);
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Sửa lại hàm applyAllFilters để lọc trên tất cả sản phẩm từ API
    const applyAllFilters = async (brands = selectedBrands, skinType = selectedSkinType, priceRange = selectedPriceRange) => {
        try {
            setLoading(true);
            
            // Kiểm tra xem có bộ lọc nào được áp dụng không
            const hasFilters = brands.length > 0 || skinType || priceRange;
            
            // Nếu không có bộ lọc nào, hiển thị lại danh sách sản phẩm của danh mục
            if (!hasFilters) {
                setProducts(categoryProducts);
                setAllProducts(categoryProducts);
                updateFilterTitle(brands, skinType, priceRange);
                setLoading(false);
                return;
            }
            
            // Lấy tất cả sản phẩm từ API để có dữ liệu đầy đủ
            let allProductsData = [];
            const response = await productService.getAllProducts();
            
            // Xử lý dữ liệu trả về
            if (response && response.$values) {
                allProductsData = response.$values;
            } else if (Array.isArray(response)) {
                allProductsData = response;
            } else if (response && response.data) {
                allProductsData = Array.isArray(response.data) ? response.data : [response.data];
            }
            
            // Cập nhật danh sách thương hiệu nếu đang rỗng
            if (brands.length === 0 && allProductsData && allProductsData.length > 0) {
                const allUniqueBrands = [...new Set(allProductsData.filter(p => p.brand).map(p => p.brand))];
                setBrands(allUniqueBrands);
                console.log('Cập nhật tất cả thương hiệu từ API trong applyAllFilters:', allUniqueBrands.length, 'thương hiệu');
            }
            
            if (!allProductsData || allProductsData.length === 0) {
                console.error('Không thể lấy dữ liệu sản phẩm');
                setLoading(false);
                return;
            }
            
            // Bắt đầu với tất cả sản phẩm từ API
            let filteredData = [...allProductsData];
            console.log('Bắt đầu lọc với', filteredData.length, 'sản phẩm');
            
            // Lọc theo thương hiệu nếu có
            if (brands.length > 0) {
                console.log('Lọc theo', brands.length, 'thương hiệu:', brands.join(', '));
                
                // Lọc sản phẩm theo thương hiệu
                filteredData = filteredData.filter(product => {
                    if (!product.brand) return false;
                    return brands.includes(product.brand);
                });
                
                console.log('Sau khi lọc theo thương hiệu:', filteredData.length, 'sản phẩm');
                
                if (filteredData.length === 0) {
                    console.warn(`Không có sản phẩm nào thuộc các thương hiệu đã chọn`);
                }
            } 
            // Nếu không có thương hiệu được chọn, lọc theo danh mục hiện tại
            else {
                const selectedCategoryId = categoryProducts.length > 0 ? categoryProducts[0].categoryId : null;
                if (selectedCategoryId) {
                    filteredData = filteredData.filter(product => product.categoryId == selectedCategoryId);
                    console.log('Sau khi lọc theo danh mục:', filteredData.length, 'sản phẩm');
                }
            }
            
            // Tiếp theo lọc theo loại da nếu có
            if (skinType) {
                console.log('Lọc theo loại da:', skinType);
                
                if (skinType === "Da Thường") {
                    const allSkinTypes = [...new Set(filteredData.filter(p => p.skinType).map(p => p.skinType))];
                    console.log('Các loại da hiện có:', allSkinTypes);
                    
                    filteredData = filteredData.filter(product => {
                        if (!product.skinType) return false;
                        
                        const normalizedSkinType = product.skinType.toLowerCase().trim();
                        return normalizedSkinType === "da thường" || 
                               normalizedSkinType === "da thuong" || 
                               normalizedSkinType === "normal skin" || 
                               normalizedSkinType === "normal" || 
                               normalizedSkinType.includes("thường") || 
                               normalizedSkinType.includes("thuong");
                    });
                } else {
                    filteredData = filteredData.filter(product => {
                        if (!product.skinType) return false;
                        return product.skinType.toLowerCase().trim() === skinType.toLowerCase().trim();
                    });
                }
                
                console.log('Sau khi lọc theo loại da:', filteredData.length, 'sản phẩm');
            }
            
            // Cuối cùng lọc theo khoảng giá nếu có
            if (priceRange) {
                console.log('Lọc theo khoảng giá:', priceRange.min, 'đến', 
                          priceRange.max === Infinity ? 'không giới hạn' : priceRange.max);
                
                filteredData = filteredData.filter(product => {
                    const price = Number(product.price);
                    return price >= priceRange.min && 
                          (priceRange.max === Infinity || price <= priceRange.max);
                });
                
                console.log('Sau khi lọc theo giá:', filteredData.length, 'sản phẩm');
            }
            
            // Map dữ liệu kết quả
            const mappedProducts = filteredData.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                skinType: product.skinType,
                categoryId: product.categoryId,
                description: product.description,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status
            }));
            
            // Cập nhật danh sách sản phẩm
            setProducts(mappedProducts);
            setAllProducts(mappedProducts);
            
            // Cập nhật tiêu đề hiển thị
            updateFilterTitle(brands, skinType, priceRange);
            
            console.log('Kết quả lọc cuối cùng:', mappedProducts.length, 'sản phẩm');
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
            setLoading(false);
        }
    };
    
    // Cập nhật hàm updateFilterTitle để hiển thị tất cả các bộ lọc đã chọn
    const updateFilterTitle = (brands = selectedBrands, skinType = selectedSkinType, priceRange = selectedPriceRange) => {
        const filters = [];
        
        if (skinType) {
            filters.push(skinType);
        }
        
        if (brands.length > 0) {
            if (brands.length === 1) {
                filters.push(brands[0]);
            } else {
                filters.push(`${brands.length} thương hiệu`);
            }
        }
        
        if (priceRange) {
            filters.push(priceRange.label);
        }
        
        if (filters.length > 0) {
            setSelectedSubItem(filters.join(' - '));
        } else {
            // Quay lại tên danh mục nếu không có bộ lọc nào
            if (selectedCategory && categories[selectedCategory]?.[0]) {
                setSelectedSubItem(categories[selectedCategory][0].categoryName);
            } else {
                setSelectedSubItem('');
            }
        }
    };

    // Cập nhật hàm xử lý khi người dùng chọn loại da
    const handleSkinTypeChange = async (skinType) => {
        try {
            // Nếu đang chọn lại loại da đã chọn, hủy lọc loại da
            const newSkinType = selectedSkinType === skinType ? '' : skinType;
            
            // Cập nhật state
            setSelectedSkinType(newSkinType);
            console.log('Đã chọn loại da:', newSkinType || 'Không chọn');
            
            // Áp dụng tất cả các bộ lọc
            await applyAllFilters(selectedBrands, newSkinType, selectedPriceRange);
        } catch (error) {
            console.error('Lỗi khi xử lý loại da:', error);
        }
    };

    // Cập nhật phần render loại da để giống code tham khảo
    const renderSkinTypes = () => {
        return skinTypes.map((type) => (
            <FormControlLabel
                key={type}
                control={
                    <Checkbox 
                        checked={selectedSkinType === type}
                        onChange={() => handleSkinTypeChange(type)}
                        sx={{ 
                            '&.Mui-checked': {
                                color: 'primary.main',
                            }
                        }}
                    />
                }
                label={type}
                sx={{ 
                    display: 'block',
                    mb: 1,
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                    '& .MuiTypography-root': {
                        fontSize: '0.9rem'
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'translateX(4px)'
                    }
                }}
            />
        ));
    };

    // Trong phần render products 
    const renderProducts = () => {
        if (loading) return <Typography>Đang tải...</Typography>;
        if (error) return <Typography color="error">{error}</Typography>;
        if (!products || products.length === 0) {
            return (
                 <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    p: 3
                }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'primary.main',
                            fontWeight: 'bold',
                            mb: 1 
                        }}
                    >
                        Không tìm thấy sản phẩm
                    </Typography>
                    <Typography 
                        sx={{ 
                            color: 'text.primary',
                            fontSize: '1rem'
                        }}
                    >
                         Vui lòng chọn lại các danh mục khác
                    </Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                {products.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        );
    };

    // Cập nhật hàm lấy sản phẩm theo loại da
    const fetchProductsBySkinType = async (skinType) => {
        try {
            setLoading(true);
            const response = await productService.getAllProducts();
            
            // Xử lý dữ liệu trả về
            let _products = [];
            if (response && response.$values) {
                _products = response.$values;
            } else if (Array.isArray(response)) {
                _products = response;
            } else if (response && response.data) {
                _products = Array.isArray(response.data) ? response.data : [response.data];
            }
            
            // Lọc sản phẩm theo skinType
            const filteredProducts = _products.filter(product => 
                product.skinType && product.skinType.toLowerCase() === skinType.toLowerCase()
            );

            const mappedProducts = filteredProducts.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status
            }));

            console.log('Sản phẩm theo loại da:', mappedProducts);
            setProducts(mappedProducts);
            setAllProducts(mappedProducts);
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm theo loại da:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm để tạo tiêu đề dựa trên các bộ lọc đã chọn
    const renderFilterTitle = () => {
        const filters = [];
        
        if (selectedSkinType) {
            filters.push(selectedSkinType);
        }
        
        if (selectedBrands.length > 0) {
            if (selectedBrands.length === 1) {
                filters.push(selectedBrands[0]);
            } else {
                filters.push(`${selectedBrands.length} thương hiệu`);
            }
        }
        
        if (selectedPriceRange) {
            filters.push(selectedPriceRange.label);
        }
        
        return filters.join(' - ') || 'Tất cả sản phẩm';
    };

    return (
        <Box sx={{ px: 4, py: 3 }}>
            <Grid container spacing={3}>
                {/* Sidebar bên trái */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={0} sx={{ 
                        p: 2, 
                        border: '1px solid #eee',
                        borderRadius: 2
                    }}>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                mb: 2, 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {/* Kiểm tra xem có bộ lọc nào đang được áp dụng không */}
                            {(selectedBrands.length === 0 && !selectedSkinType && !selectedPriceRange) ? (
                                // Nếu không có bộ lọc, hiển thị danh mục và tên danh mục con
                                <>                                    
                                    {selectedCategory}
                                    {selectedCategory && selectedSubItem && (
                                        <>
                                            <Typography 
                                                component="span" 
                                                sx={{ 
                                                    fontSize: '1em',
                                                    fontWeight: 'normal',
                                                }}
                                            >
                                                {'=>'}
                                            </Typography>
                                            <Typography 
                                                component="span" 
                                                sx={{ 
                                                    fontSize: '1em',
                                                    fontWeight: 'normal',
                                                }}
                                            >
                                                {selectedSubItem}
                                            </Typography>
                                        </>
                                    )}
                                </>
                            ) : (
                                // Nếu có bộ lọc, chỉ hiển thị các bộ lọc đã chọn
                                <Typography 
                                    component="span" 
                                    sx={{ 
                                        fontSize: '1em',
                                        fontWeight: 'normal',
                                    }}
                                >
                                    {renderFilterTitle()}
                                </Typography>
                            )}
                        </Typography>

                        {/* Thay thế Typography bằng ô Search */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #eee',
                                borderRadius: 2,
                                mb: 3,
                                '&:hover': {
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                },
                                '&:focus-within': {
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                }
                            }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Bạn đang tìm kiếm..."
                                inputProps={{ 'aria-label': 'tìm kiếm sản phẩm' }}
                            />
                            <IconButton 
                                type="button" 
                                sx={{ 
                                    p: '10px',
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.lighter'
                                    }
                                }} 
                                aria-label="search"
                            >
                                <SearchIcon />
                            </IconButton>
                        </Paper>

                        {/* Danh mục chính */}
                        <Box sx={{ mb: 2 }}>
                            {Object.entries(categories).map(([categoryType, categoryList]) => (
                                <Accordion
                                    key={categoryType}
                                    expanded={expandedCategory === categoryType}
                                    onChange={() => handleCategory(categoryType)}
                                    elevation={0}
                                    sx={{
                                        '&:before': { display: 'none' },
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                        borderBottom: '1px solid #eee'
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            p: 0,
                                            minHeight: '48px',
                                            '& .MuiAccordionSummary-content': {
                                                margin: '8px 0',
                                            },
                                            color: selectedCategory === categoryType ? 'primary.main' : 'inherit',
                                            '&:hover': { 
                                                color: 'primary.main',
                                                backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                            }
                                        }}
                                    >
                                        <Typography>{categoryType}</Typography>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ p: 0, pl: 2 }}>
                                        {categoryList.map((category) => (
                                            <Typography
                                                key={category.categoryId}
                                                sx={{
                                                    py: 1,
                                                    cursor: 'pointer',
                                                    color: selectedSubItem === category.categoryName ? 'primary.main' : 'inherit',                               
                                                    borderRadius: 1,
                                                    px: 1,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': { 
                                                        color: 'primary.main',
                                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                        transform: 'translateX(4px)'
                                                    }
                                                }}
                                                onClick={() => handleCategory(categoryType, category)}
                                            >
                                                {category.categoryName}
                                            </Typography>
                                        ))}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Loại Da */}
                        <Accordion 
                            defaultExpanded 
                            elevation={0}
                            sx={{ 
                                '&:before': { display: 'none' },
                                backgroundColor: 'transparent'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}             
                                sx={{ 
                                    px: 0,
                                    borderRadius: 1,
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                        color: 'primary.main'
                                    }
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Loại Da</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0 }}>
                                {renderSkinTypes()}
                            </AccordionDetails>
                        </Accordion>

                        {/* Khoảng Giá */}
                        <Accordion 
                            defaultExpanded 
                            elevation={0}
                            sx={{ 
                                '&:before': { display: 'none' },
                                backgroundColor: 'transparent'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ px: 0 }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Khoảng Giá</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0 }}>
                                {PRICE_RANGES.map((priceRange) => (
                                    <Box
                                        key={priceRange.label}
                                        onClick={() => handlePriceRangeSelect(priceRange)}
                                        sx={{
                                            mb: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            backgroundColor: selectedPriceRange && selectedPriceRange.label === priceRange.label 
                                                ? 'primary.lighter' 
                                                : '#f0f0f0',
                                            cursor: 'pointer',
                                            border: selectedPriceRange && selectedPriceRange.label === priceRange.label 
                                                ? '1px solid' 
                                                : 'none',
                                            borderColor: 'primary.main',
                                            '&:hover': {
                                                backgroundColor: selectedPriceRange && selectedPriceRange.label === priceRange.label 
                                                    ? 'primary.lighter' 
                                                    : '#e0e0e0'
                                            }
                                        }}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                color: selectedPriceRange && selectedPriceRange.label === priceRange.label 
                                                    ? 'primary.main' 
                                                    : 'inherit',
                                                fontWeight: selectedPriceRange && selectedPriceRange.label === priceRange.label 
                                                    ? 600 
                                                    : 400
                                            }}
                                        >
                                            {priceRange.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>

                        {/* Thương Hiệu */}
                        <Accordion 
                            defaultExpanded 
                            elevation={0}
                            sx={{ 
                                '&:before': { display: 'none' },
                                backgroundColor: 'transparent'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ px: 0 }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Thương Hiệu</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 0 }}>
                                <Box 
                                    sx={{ 
                                        maxHeight: '300px', 
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#f1f1f1',
                                            borderRadius: '4px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#888',
                                            borderRadius: '4px',
                                            '&:hover': {
                                                background: '#555',
                                            },
                                        },
                                    }}
                                >
                                    <Grid container spacing={1}>
                                        {brands.map((brand) => (
                                            <Grid item xs={6} key={brand}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox 
                                                            size="small"
                                                            sx={{ 
                                                                '&.Mui-checked': {
                                                                    color: 'primary.main',
                                                                }
                                                            }}
                                                            checked={selectedBrands.includes(brand)}
                                                            onChange={() => handleBrandChange(brand)}
                                                        />
                                                    }
                                                    label={
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                fontSize: '0.85rem',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >
                                                            {brand}
                                                        </Typography>
                                                    }
                                                    sx={{ 
                                                        margin: 0,
                                                        padding: '2px 4px',
                                                        borderRadius: 1,
                                                        transition: 'all 0.2s ease',
                                                        '& .MuiFormControlLabel-label': {
                                                            width: '100%'
                                                        },
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Paper>
                </Grid>

                {/* Cập nhật phần hiển thị sản phẩm */}
                <Grid item xs={12} md={9}>
                    {renderProducts()}
                </Grid>
            </Grid>
        </Box>
    );
};

export default CategoryContent;