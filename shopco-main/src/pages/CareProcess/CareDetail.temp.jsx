import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import '../CareProcess/DaDau/DaDau.css';
import orderService from '../../apis/orderService';
import skincareService from '../../apis/skincareService';

const CareDetail = () => {
    // Lấy tham số skinType từ URL và chuyển đổi thành dạng phù hợp
    const { skinType: skinTypeParam } = useParams();
    // Chuyển đổi skinType từ URL (dadau) thành dạng có dấu (Da dầu) nếu cần
    const skinType = skinTypeParam; 
    const [products, setProducts] = useState([]);
    const [showRoutine, setShowRoutine] = useState(true);
    const [routineData, setRoutineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const navigate = useNavigate();

    const handleFindProducts = async () => {
        try {
            setLoading(true);
            // Trong thực tế, sẽ gọi API để lấy sản phẩm được đề xuất cho loại da
            // Ví dụ: const response = await productService.getRecommendedProducts(skinType);
            
            // Tạm thời hiển thị sản phẩm đề xuất từ dữ liệu routineData nếu có
            if (routineData && routineData.recommendedProducts) {
                setProducts(routineData.recommendedProducts);
            } else {
                // Nếu không có dữ liệu sản phẩm đề xuất, hiển thị thông báo
                setError('Không tìm thấy sản phẩm đề xuất cho loại da này');
                return;
            }
            
            setShowRoutine(false); // Ẩn quy trình ngay lập tức
            sessionStorage.setItem('showProducts', 'true'); // Lưu trạng thái hiển thị sản phẩm
        } catch (err) {
            console.error('Lỗi khi tìm sản phẩm:', err);
            setError('Không thể tải danh sách sản phẩm đề xuất. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowRoutine = () => {
        setShowRoutine(true); // Hiển thị lại quy trình
        setProducts([]); // Xóa danh sách sản phẩm
        sessionStorage.removeItem('showProducts'); // Xóa trạng thái
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`); // Chuyển hướng đến trang chi tiết sản phẩm
    };

    const handleBuyCombo = async () => {
        try {
            // Lấy thông tin người dùng từ localStorage
            const productIds = products.map(product => product.id);
            
            // Kiểm tra nếu không có sản phẩm
            if (!productIds.length) {
                alert('Không có sản phẩm nào trong combo!');
                return;
            }

            // Kiểm tra xem người dùng đã đăng nhập chưa
            const token = localStorage.getItem('token');
            if (!token) {
                // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
                alert('Vui lòng đăng nhập để mua sản phẩm!');
                navigate('/login');
                return;
            }

            // Tạo đơn hàng với tất cả sản phẩm trong combo
            const orderData = {
                products: productIds.map(id => ({
                    productId: id,
                    quantity: 1 // Mặc định mỗi sản phẩm số lượng là 1
                }))
            };

            // Gọi API để tạo đơn hàng
            const response = await orderService.createOrder(orderData);

            // Kiểm tra phản hồi từ API
            if (response && response.orderId) {
                alert('Đã thêm combo sản phẩm vào giỏ hàng thành công!');
                navigate('/cart'); // Chuyển hướng đến trang giỏ hàng
            } else {
                alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
            }
        } catch (err) {
            console.error('Lỗi khi mua combo:', err);
            alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
        }
    };

    const fetchRoutineData = async () => {
        try {
            setLoading(true);
            let data;
            
            if (skinType) {
                // Lấy dữ liệu quy trình chăm sóc da trực tiếp từ URL parameter
                // API backend đã được cải tiến để xử lý cả tên loại da không dấu
                const response = await skincareService.getRoutineBySkinType(skinType);
                // API trả về trực tiếp đối tượng dữ liệu, không đóng gói trong thuộc tính data
                data = response;
                console.log('Dữ liệu từ API:', data);
                
                // Chỉ kiểm tra xem data có tồn tại hay không
                if (!data) {
                    console.log('Không có dữ liệu trả về:', data);
                    throw new Error(`Không tìm thấy quy trình chăm sóc cho loại da: ${skinType}`);
                }
            } else {
                // Nếu không có loại da, hiển thị lỗi
                throw new Error('Không xác định được loại da');
            }
            
            setRoutineData(data);
            setError(null);
            
            // Lấy dữ liệu sản phẩm đề xuất nếu có
            if (data.recommendedProducts) {
                setRecommendedProducts(data.recommendedProducts);
            }
        } catch (err) {
            console.error('Lỗi khi lấy dữ liệu quy trình chăm sóc da:', err);
            setError(err.message || 'Không thể tải dữ liệu quy trình chăm sóc da. Vui lòng thử lại sau.');
            setRoutineData(null); // Đảm bảo xóa dữ liệu cũ nếu có lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Gọi hàm fetchRoutineData khi component mount hoặc khi skinType thay đổi
        fetchRoutineData();
        
        // Kiểm tra xem có nên hiển thị sản phẩm hay không dựa trên sessionStorage
        const shouldShowProducts = sessionStorage.getItem('showProducts') === 'true';
        if (shouldShowProducts) {
            setShowRoutine(false);
            // Chỉ gọi handleFindProducts nếu có dữ liệu routineData
            if (routineData) {
                handleFindProducts();
            }
        }

        // Cleanup function khi component unmount
        return () => {
            sessionStorage.removeItem('showProducts');
        };
    }, [skinType]); // Chỉ gọi lại khi skinType thay đổi

    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', width: "99vw", overflowX: "hidden" }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            {loading ? (
                                <CircularProgress color="warning" />
                            ) : error ? (
                                <img 
                                    src='/images/default-skincare.jpg' 
                                    alt='Quy trình chăm sóc da' 
                                    className="skincare-image"
                                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                                />
                            ) : (
                                <img 
                                    src={routineData?.imageUrl || '/images/default-skincare.jpg'} 
                                    alt={routineData?.title || 'Quy trình chăm sóc da'} 
                                    className="skincare-image"
                                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                                />
                            )}
                        </Box>
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ pl: { md: 4 }, pr: { md: 2 }, py: 2 }} className="content-container">
                            <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                                🌿 {routineData?.title || 'Quy trình chăm sóc da'} 🌿
                            </Typography>
                        
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                    <CircularProgress color="warning" />
                                </Box>
                            ) : error ? (
                                <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
                                    {error}
                                </Typography>
                            ) : showRoutine ? (
                                <Box className="routine-container">
                                    {routineData ? (
                                        <div dangerouslySetInnerHTML={{ __html: routineData.content ? routineData.content.replace(/\n/g, '<br>') : '' }} className="routine-content" />
                                    ) : (
                                        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
                                            Không tìm thấy quy trình chăm sóc cho loại da: {skinType}
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <Box className="products-container">
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="list-black">
                                        {products.map((product) => (
                                            <div key={product.id} className="product-item" onClick={() => handleProductClick(product.id)}>
                                                <span className="product-title">{product.title}</span> <span className="product-name">{product.name}</span>
                                            </div>
                                        ))}
                                    </Typography>
                                </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                                <Button 
                                    variant="contained" 
                                    sx={{ bgcolor: '#ffbb02', color: 'white' }}
                                    onClick={showRoutine ? handleFindProducts : handleShowRoutine}
                                >
                                    {showRoutine ? "Tìm Sản Phẩm Phù Hợp" : "Xem Quy Trình"}
                                </Button>

                                {!showRoutine && (
                                    <Button 
                                        variant="contained" 
                                        sx={{ bgcolor: '#ff7b02', color: 'white' }}
                                        onClick={handleBuyCombo}
                                    >
                                        Mua cả combo
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Footer />
        </>
    );
};

export default CareDetail;
