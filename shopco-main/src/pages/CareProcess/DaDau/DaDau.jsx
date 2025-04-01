import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaDau.css';
import orderService from '../../../apis/orderService';

const DaDau = () => {
    const [products, setProducts] = useState([]);
    const [showRoutine, setShowRoutine] = useState(true);
    const navigate = useNavigate();

    const handleFindProducts = () => {
        const productItems = [
            { id: 9, title: "Sữa rửa mặt:", name: "Gel Rửa Mặt La Roche-Posay Dành Cho Da Dầu, Nhạy Cảm 400ml" },
            { id: 18, title: "Toner:", name: "Nước Hoa Hồng Klairs Dành Cho Da Nhạy Cảm 180ml" },
            { id: 16, title: "Đặc trị:", name: "Combo Cocoon Nước Cân Bằng Sen Hậu Giang 310ml + Nước Tẩy Trang Bí Đao 500ml" },
            { id: 56, title: "Kem mắt:", name: "Mặt Nạ Mắt Ngọc Trai Mờ Quầng Thâm, Nếp Nhăn" },
            { id: 81, title: "Kem dưỡng ẩm:", name: "Kem Dưỡng La Roche-Posay Giúp Phục Hồi Da Đa Công Dụng 40ml" },
            { id: 77, title: "Kem chống nắng:", name: "Kem Chống Nắng Vichy Thoáng Nhẹ Không Bóng Dầu SPF 50 50ml" },
            { id: 78, title: "Tẩy trang:", name: "Nước Tẩy Trang La Roche-Posay Cho Da Dầu, Nhạy Cảm 400ml" },
            { id: 15, title: "Tẩy tế bào chết:", name: "Tẩy Tế Bào Chết Rosette Cho Mọi Loại Da 120g Gommage Gentle Peeling Gel" },
            { id: 91, title: "Serum:", name: "Serum Skin1004 Rau Má Làm Dịu & Hỗ Trợ Phục Hồi Da 100ml" },
        ];

        setProducts(productItems);
        setShowRoutine(false); // Ẩn quy trình ngay lập tức
        sessionStorage.setItem('showProducts', 'true'); // Lưu trạng thái hiển thị sản phẩm
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
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.userId) {
                // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
                alert('Vui lòng đăng nhập để mua sản phẩm');
                navigate('/login');
                return;
            }
            
            // Thêm các sản phẩm vào giỏ hàng
            const productIds = products.map(product => product.id);
            
            // Giữ track các sản phẩm đã thêm thành công
            const successItems = [];
            
            // Gọi API để thêm từng sản phẩm vào giỏ hàng
            for (const productId of productIds) {
                try {
                    console.log(`Đang thêm sản phẩm ID: ${productId} vào giỏ hàng`);
                    const result = await orderService.addtocard(user.userId, productId, 1);
                    console.log(`Kết quả thêm sản phẩm ID ${productId}:`, result);
                    
                    if (result) {
                        successItems.push(productId);
                    }
                } catch (itemError) {
                    console.error(`Lỗi khi thêm sản phẩm ID ${productId}:`, itemError);
                }
            }
            
            // Hiển thị thông báo kết quả sau khi hoàn thành
            alert(`Đã thêm ${successItems.length}/${productIds.length} sản phẩm vào giỏ hàng`);
            
            // Kích hoạt sự kiện để báo cho các component khác biết giỏ hàng đã được cập nhật
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Chuyển đến trang giỏ hàng
            navigate('/cart');
            
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
        }
    };

    useEffect(() => {
        const showProducts = sessionStorage.getItem('showProducts');
        if (showProducts === 'true') {
            handleFindProducts(); // Gọi hàm để cập nhật danh sách sản phẩm
        }

        // Xóa trạng thái khi component unmount
        return () => {
            sessionStorage.removeItem('showProducts');
        };
    }, []);

    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', width: "99vw", overflowX: "hidden" }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <Box className="image-container">
                            <img 
                                src="/images/dadau.jpg" 
                                alt="Da Dầu" 
                                className="skin-image"
                            />
                        </Box>
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ pl: { md: 4 }, pr: { md: 2 }, py: 2 }} className="content-container">
                            <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                                🌿 Da dầu – Kiềm dầu, ngăn ngừa mụn 🌿
                            </Typography>
                        
                            {showRoutine ? (
                                <Box className="routine-container">
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="list-black">
                                        🔹 Đặc điểm:
                                        <ul className="list-black">
                                            <li>Lỗ chân lông to, da bóng nhờn, dễ nổi mụn.</li>
                                            <li>Dễ bám bụi bẩn và bít tắc lỗ chân lông.</li>
                                            <li>Da đổ dầu nhiều nhất ở vùng chữ T (trán, mũi, cằm).</li>
                                        </ul>
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="highlight-yellow">
                                        ✨ Buổi sáng: Tươi tắn, không bóng dầu
                                        <ol className="list-black">
                                            <li>Sữa rửa mặt – Kiểm soát dầu thừa, làm sạch sâu.</li>
                                            <li>Toner – Giúp se khít lỗ chân lông, cân bằng độ pH.</li>
                                            <li>Đặc trị – BHA/Niacinamide giảm dầu, ngăn mụn.</li>
                                            <li>Serum – Cấp nước nhẹ nhàng, giữ da căng mịn.</li>
                                            <li>Kem mắt – Dưỡng ẩm, ngăn ngừa nếp nhăn.</li>
                                            <li>Kem dưỡng ẩm – Dạng gel, thấm nhanh, không gây bí.</li>
                                            <li>Kem chống nắng – Kiềm dầu, lâu trôi.</li>
                                        </ol>
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="highlight-yellow">
                                        🌙 Buổi tối: Làm sạch sâu, phục hồi da
                                        <ol className="list-black">
                                            <li>Tẩy trang – Loại bỏ bã nhờn, bụi bẩn.</li>
                                            <li>Sữa rửa mặt – Sạch sâu nhưng dịu nhẹ.</li>
                                            <li>Toner – Hỗ trợ hấp thụ dưỡng chất tốt hơn.</li>
                                            <li>Tẩy tế bào chết (BHA, AHA) – Giúp thông thoáng lỗ chân lông (2-3 lần/tuần).</li>
                                            <li>Đặc trị – Hỗ trợ trị mụn, giảm dầu.</li>
                                            <li>Serum – Cấp ẩm, phục hồi da.</li>
                                            <li>Kem mắt – Dưỡng ẩm vùng da nhạy cảm.</li>
                                            <li>Kem dưỡng ẩm – Kiềm dầu nhưng vẫn đủ ẩm.</li>
                                        </ol>
                                    </Typography>
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

export default DaDau;
