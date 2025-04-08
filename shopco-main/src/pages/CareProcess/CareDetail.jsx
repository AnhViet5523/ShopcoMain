import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Typography, Button, CircularProgress } from '@mui/material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import './CareDetail.css';
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
            console.log('Tìm sản phẩm cho loại da:', skinType);
            console.log('Dữ liệu routineData:', routineData);
            
            // Trong thực tế, sẽ gọi API để lấy sản phẩm được đề xuất cho loại da
            // Ví dụ: const response = await productService.getRecommendedProducts(skinType);
            
            // Tạm thởi hiển thị sản phẩm đề xuất từ dữ liệu routineData nếu có
            if (routineData && routineData.recommendedProducts) {
                console.log('Sản phẩm đề xuất:', routineData.recommendedProducts);
                setProducts(routineData.recommendedProducts);
            } else {
                // Nếu không có dữ liệu sản phẩm đề xuất, hiển thị thông báo
                console.log('Không tìm thấy sản phẩm đề xuất');
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

    // Dữ liệu mặc định cho trường hợp không tìm thấy dữ liệu từ API
    const fallbackData = {
        skinType: skinType,
        title: `Quy trình chăm sóc da ${skinType}`,
        content: "Chúng tôi đang cập nhật quy trình chăm sóc chi tiết cho loại da này. Vui lòng quay lại sau!",
        imageUrl: '/images/default-skincare.jpg',
        recommendedProducts: []
    };

    // Sửa fetchRoutineData để nhận signal và cải thiện xử lý lỗi
    const fetchRoutineData = async (signal) => {
        try {
            setLoading(true);
            
            if (skinType) {
                console.log('Đang gọi API với skinType:', skinType);
                // Truyền signal vào hàm gọi API
                const response = await skincareService.getRoutineBySkinType(skinType, signal);
                console.log('Response từ API:', response); 
                console.log('Kiểu dữ liệu của response:', typeof response); 
                console.log('Kiểm tra giá trị boolean của response:', !!response); 

                // Kiểm tra response và lưu vào state
                if (response) { 
                    console.log('>>> Bước 1: Vào khối if (response) thành công'); 
                    // Xử lý dữ liệu trước khi lưu vào state
                    const processedData = {
                        ...response,
                        // Đảm bảo các trường bắt buộc có giá trị mặc định nếu không có
                        title: response.title || `Quy trình chăm sóc da ${skinType}`,
                        content: response.content || 'Không có nội dung',
                        imageUrl: response.imageUrl || '/images/default-skincare.jpg',
                        recommendedProducts: response.recommendedProducts || []
                    };
                    
                    setRoutineData(processedData);
                    console.log('>>> Bước 2: Đã gọi setRoutineData với dữ liệu đã xử lý'); 
                    setError(null);
                    console.log('>>> Bước 3: Đã gọi setError(null)'); 
                    
                    // Lấy dữ liệu sản phẩm đề xuất nếu có
                    if (processedData.recommendedProducts && processedData.recommendedProducts.length > 0) {
                        setRecommendedProducts(processedData.recommendedProducts);
                        console.log('>>> Bước 4: Đã cập nhật recommendedProducts');
                    }
                } else {
                    console.log('>>> LỖI: Khối else được thực thi, response là falsy'); 
                    // Sử dụng dữ liệu mặc định thay vì throw lỗi
                    console.log('Sử dụng dữ liệu mặc định');
                    setRoutineData(fallbackData);
                    setError('Không tìm thấy dữ liệu chi tiết cho loại da này. Hiển thị thông tin cơ bản.');
                }
            } else {
                // Nếu không có loại da, sử dụng dữ liệu mặc định
                console.log('Không có tham số skinType, sử dụng dữ liệu mặc định');
                setRoutineData(fallbackData);
                setError('Không xác định được loại da. Hiển thị thông tin cơ bản.');
            }
        } catch (err) { 
            if (err.name !== 'CanceledError') {
                console.error('>>> LỖI: Bị bắt trong catch block:', err); 
                // Sử dụng dữ liệu mặc định thay vì chỉ hiển thị lỗi
                setRoutineData(fallbackData);
                setError(`Gặp lỗi khi tải dữ liệu: ${err.message}. Hiển thị thông tin cơ bản.`);
            }
        } finally {
            // Chỉ tắt loading nếu yêu cầu không bị hủy
            if (signal && !signal.aborted) { 
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        // Tạo AbortController
        const controller = new AbortController();
        const signal = controller.signal;
        
        // Gọi hàm fetchRoutineData với signal
        fetchRoutineData(signal);
        
        // Kiểm tra xem có nên hiển thị sản phẩm hay không dựa trên sessionStorage
        const shouldShowProducts = sessionStorage.getItem('showProducts') === 'true';
        if (shouldShowProducts) {
            setShowRoutine(false);
        }

        // Cleanup function khi component unmount hoặc skinType thay đổi
        return () => {
            controller.abort(); // Hủy yêu cầu API
            sessionStorage.removeItem('showProducts');
        };
    }, [skinType]); // Chỉ gọi lại khi skinType thay đổi để tránh vòng lặp vô hạn

    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', width: "100vw", overflowX: "hidden" }}>
                <Box className="care-detail-container">
                    {/* Phần ảnh ở trên */}
                    <Box className="image-container">
                        {loading ? (
                            <CircularProgress color="warning" />
                        ) : (
                            <img
                                src={routineData?.imageUrl || '/images/default-skincare.jpg'}
                                alt={`Quy trình chăm sóc da ${skinType}`}
                                className="care-banner-image"
                            />
                        )}
                    </Box>
                    
                    {/* Phần nội dung ở dưới */}
                    <Box className="content-container">
                        <Typography variant="h5" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                            {routineData?.title || 'Quy trình chăm sóc da'} 
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
                                    <div 
                                        dangerouslySetInnerHTML={{ 
                                            __html: routineData.content 
                                                ? routineData.content
                                                    .replace(/\n/g, '<br>')
                                                    .replace(/- /g, '• ')
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                : '' 
                                        }} 
                                        className="routine-content" 
                                    />
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
                </Box>
            </Box>
            <Footer />
        </>
    );
};

export default CareDetail;
