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
                const response = await productService.getProducts();
                const products = response['$values'];

                // Lấy các thương hiệu duy nhất
                if (Array.isArray(products)) {
                    const uniqueBrands = [...new Set(products.map(product => product.brand))];
                    setBrands(uniqueBrands);

                    // Lấy các loại da duy nhất
                    const uniqueSkinTypes = [...new Set(products.map(product => product.skinType))];
                    setSkinTypes(uniqueSkinTypes);
                } else {
                    console.error('API response is not an array:', response);
                }
            } catch (error) {
                console.error('Error loading products:', error);
            }
        };

        loadProducts();
    }, []);

    const fetchProductsByCategory = async (categoryId) => {
        try {
            setLoading(true);
            const response = await productService.getProducts();
            const _response = response['$values'];           
            
            const data = _response.filter(x => x.categoryId == categoryId);            
            
            const mappedProducts = data.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status,
                skinType: product.skinType
            }));

            console.log('Mapped products:', mappedProducts);
            setProducts(mappedProducts);
            setAllProducts(mappedProducts); 
            setCategoryProducts(mappedProducts);
            
            // Reset các bộ lọc khi chuyển danh mục
            setSelectedBrands([]);
            setSelectedSkinType('');
            setSelectedPriceRange(null);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCategory = async (categoryType, category) => {
        try {
            setSelectedCategory(categoryType);
            if (category) {
                setSelectedSubItem(category.categoryName);
                await fetchProductsByCategory(category.categoryId);
            } else {
                // Nếu không có category cụ thể, lấy category đầu tiên trong nhóm
                const firstCategory = categories[categoryType][0];
                if (firstCategory) {
                    setSelectedSubItem(firstCategory.categoryName);
                    await fetchProductsByCategory(firstCategory.categoryId);
                }
            }
            setExpandedCategory(categoryType);
        } catch (error) {
            console.error('Error handling category:', error);
            setError('Failed to load products');
        }
    };

    const handleSubItemSelection = async (subItem, categoryId) => {
        setSelectedSubItem(subItem);
        await fetchProductsByCategory(categoryId);
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

    // Cập nhật hàm xử lý khi người dùng chọn thương hiệu
    const handleBrandChange = async (brand) => {
        // Cập nhật danh sách thương hiệu đã chọn
        const newSelectedBrands = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];
        
        console.log('Các thương hiệu đã chọn:', newSelectedBrands);
        
        // Cập nhật state
        setSelectedBrands(newSelectedBrands);
        
        // Áp dụng tất cả các bộ lọc
        await applyAllFilters(newSelectedBrands, selectedSkinType, selectedPriceRange);
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
            const response = await productService.getProducts();
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

    // Cải thiện hàm lọc theo tất cả các điều kiện
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
                return;
            }
            
            // Lấy tất cả sản phẩm từ API để có dữ liệu đầy đủ
            const response = await productService.getProducts();
            if (!response || !response['$values']) {
                console.error('Không thể lấy dữ liệu sản phẩm');
                return;
            }
            
            const allProductsData = response['$values'];
            let filteredData = [...allProductsData];
            
            console.log('Bắt đầu lọc với', filteredData.length, 'sản phẩm');
            
            // Lọc theo thương hiệu
            if (brands.length > 0) {
                console.log('Lọc theo', brands.length, 'thương hiệu:', brands.join(', '));
                filteredData = filteredData.filter(product => brands.includes(product.brand));
                console.log('Sau khi lọc theo thương hiệu:', filteredData.length, 'sản phẩm');
            }
            
            // Lọc theo loại da
            if (skinType) {
                console.log('Lọc theo loại da:', skinType);
                filteredData = filteredData.filter(product => product.skinType === skinType);
                console.log('Sau khi lọc theo loại da:', filteredData.length, 'sản phẩm');
            }
            
            // Lọc theo khoảng giá
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
            
            // Map dữ liệu
            const mappedProducts = filteredData.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status,
                skinType: product.skinType
            }));
            
            // Cập nhật danh sách sản phẩm
            setProducts(mappedProducts);
            setAllProducts(mappedProducts);
            
            // Cập nhật tiêu đề hiển thị
            updateFilterTitle(brands, skinType, priceRange);
            
            console.log('Kết quả lọc cuối cùng:', mappedProducts.length, 'sản phẩm');
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
        } finally {
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
            
            // Áp dụng tất cả các bộ lọc
            await applyAllFilters(selectedBrands, newSkinType, selectedPriceRange);
        } catch (error) {
            console.error('Lỗi khi xử lý loại da:', error);
        }
    };

    // Cập nhật phần render loại da - cần thay đổi để sử dụng selectedSkinType trực tiếp
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
                        Vui lòng thay đổi bộ lọc hoặc chọn danh mục khác
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
            // Thay vì gọi API riêng, lọc từ danh sách sản phẩm đã có
            const response = await productService.getProducts();
            const _response = response['$values'];

            // Lọc sản phẩm theo loại da
            const filteredProducts = _response.filter(product => product.skinType === skinType);

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