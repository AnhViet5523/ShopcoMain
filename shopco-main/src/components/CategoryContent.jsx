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
                status: product.status
            }));

            console.log('Mapped products:', mappedProducts);
            setProducts(mappedProducts);
            setAllProducts(mappedProducts); 
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

    // Hàm xử lý khi người dùng chọn khoảng giá
    const handlePriceRangeSelect = (priceRange) => {
        setSelectedPriceRange(priceRange);
        const filtered = allProducts.filter(product => 
            product.price >= priceRange.min && product.price < priceRange.max
        );
        setFilteredProducts(filtered);
    };

    // Hàm xử lý khi người dùng chọn thương hiệu
    const handleBrandChange = (brand) => {
        setSelectedBrands((prev) => {
            if (prev.includes(brand)) {
                return prev.filter((b) => b !== brand);
            } else {
                return [...prev, brand];
            }
        });
    };

    // Hàm lọc sản phẩm dựa trên thương hiệu đã chọn
    const getFilteredProducts = () => {
        if (selectedBrands.length === 0) return allProducts;
        return allProducts.filter(product => selectedBrands.includes(product.brand));
    };

    // Hàm xử lý khi người dùng chọn loại da
    const handleSkinTypeChange = async (skinType) => {
        setSelectedSubItem(skinType);
        await fetchProductsBySkinType(skinType);
    };

    const fetchProductsBySkinType = async (skinType) => {
        try {
            setLoading(true);
            const response = await productService.getProductsBySkinType(skinType);
            const _response = response['$values'];

            const mappedProducts = _response.map(product => ({
                id: product.productId,
                name: product.productName,
                price: product.price,
                brand: product.brand,
                capacity: product.capacity,
                image: product.imgURL || '/placeholder.jpg',
                quantity: product.quantity,
                status: product.status
            }));

            console.log('Mapped products by skin type:', mappedProducts);
            // Cập nhật sản phẩm hiển thị theo loại da
            setProducts(mappedProducts);
            setAllProducts(mappedProducts);
        } catch (error) {
            console.error('Error fetching products by skin type:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật phần render loại da
    const renderSkinTypes = () => {
        return skinTypes.map((type) => (
            <FormControlLabel
                key={type}
                control={
                    <Checkbox 
                        checked={selectedSubItem === type}
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
                    '& .MuiTypography-root': {
                        fontSize: '0.9rem'
                    }
                }}
            />
        ));
    };

    // Trong phần render products 
    const renderProducts = () => {
        const productsToDisplay = selectedPriceRange ? filteredProducts : getFilteredProducts();
        
        if (loading) return <Typography>Đang tải...</Typography>;
        if (error) return <Typography color="error">{error}</Typography>;
        if (!productsToDisplay || productsToDisplay.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6">Không tìm thấy sản phẩm</Typography>
                    <Typography color="text.secondary">
                        Vui lòng chọn danh mục khác hoặc thử lại sau
                    </Typography>
                </Box>
            );
        }

        return (
            <Grid container spacing={2}>
                {productsToDisplay.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <ProductCard product={product} />
                    </Grid>
                ))}
            </Grid>
        );
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
                            {/* Chỉ hiển thị selectedSubItem nếu nó thuộc danh sách con của selectedCategory */}
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
                                            '&:hover': { color: 'primary.main' }
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
                                                    '&:hover': { color: 'primary.main' }
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
                                sx={{ px: 0 }}
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
                                            backgroundColor: '#f0f0f0',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: '#e0e0e0'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2">{priceRange.label}</Typography>
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
                                                        '& .MuiFormControlLabel-label': {
                                                            width: '100%'
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