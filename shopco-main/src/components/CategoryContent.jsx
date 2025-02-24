
import { Box, Grid, Typography, Checkbox, FormControlLabel, Paper, Accordion, AccordionSummary, AccordionDetails, Divider } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ProductCard from "./ProductCard";
import { Search as SearchIcon } from '@mui/icons-material';
import { InputBase, IconButton } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import productService from '../apis/productService';
import categoryService from '../apis/categoryService';

// Thêm constant cho brands
const BRANDS = [
  "L'Oreal", "Bioderma", "Cocoon", "Simple", "La Roche-Posay", "CeraVe", 
  "Cetaphil", "Hada Labo", "Paula's Choice", "Caryophy", "So'Natural", 
  "Rosette", "Klairs", "Skin1004", "Paris", "Garnier", "Obagi Medical", 
  "SVR", "Gamma Chemicals", "Evoluderm", "Avène", "Cerave", "Hatomugi", 
  "Olay", "Vichy", "Embryolisse", "Compliment", "Torriden", "Anessa", 
  "MartiDerm", "Sur.Medic+", "JMsolution", "Meishoku", "Kumargic", "DHC", 
  "Hotosu", "Ipek Klasik", "Silcot", "Mihoo", "Bông Bạch Tuyết", "Emmié", 
  "HALIO", "Vacosi", "Neutrogena", "GoodnDoc", "d'Alba", "Some By Mi", 
  "Tia'm", "oh!oh!", "Laneige", "Care:Nel", "Mediheal", "Beplain", 
  "Naruko", "WonJin", "Banobagi"
];

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

export default function CategoryContent() {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubItem, setSelectedSubItem] = useState('');
    const [expandedCategory, setExpandedCategory] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    // Cập nhật useEffect để xử lý dữ liệu tốt hơn
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const response = await categoryService.getCategories();
                
                if (Array.isArray(response) && response.length > 0) {
                    const processedCategories = processCategoriesData(response);
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
    }, []); // Chỉ chạy một lần khi component mount

    const fetchProductsByCategory = async (categoryId) => {
        try {
            setLoading(true);
            console.log('Fetching products for categoryId:', categoryId);
            const response = await productService.getProducts();

            // FILTER THEO CATEGORY
            const data = response.filter(x => x.categoryId == categoryId);
            
            // Map response to match ProductCard props
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

    // Rename handleSubItem to avoid unused variable warning
    const handleSubItemSelection = async (subItem, categoryId) => {
        setSelectedSubItem(subItem);
        await fetchProductsByCategory(categoryId);
    };

    // Trong phần render products (thay thế phần cũ)
    const renderProducts = () => {
        if (loading) return <Typography>Đang tải...</Typography>;
        if (error) return <Typography color="error">{error}</Typography>;
        if (!products || products.length === 0) {
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
                {products.map((product) => (
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
                            defaultExpanded={!!selectedSubItem}
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
                                {['Da Dầu', 'Da Thường', 'Da Khô','Da Hỗn Hợp', 'Da Nhạy Cảm'].map((type) => (
                                    <FormControlLabel
                                        key={type}
                                        control={
                                            <Checkbox 
                                                checked={selectedSubItem === type}
                                                onChange={() => setSelectedSubItem(type)}
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
                                ))}
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
                                {[
                                    { label: '0-300.000đ', color: '#FFE5BA' },
                                    { label: '300.000-800.000đ', color: '#D4E9C7' },
                                    { label: 'Trên 800.000đ', color: '#FFCCCB' }
                                ].map((price) => (
                                    <Box
                                        key={price.label}
                                        sx={{
                                            mb: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            backgroundColor: price.color,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                opacity: 0.8
                                            }
                                        }}
                                    >
                                        <Typography variant="body2">{price.label}</Typography>
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
                                        {BRANDS.map((brand) => (
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
}