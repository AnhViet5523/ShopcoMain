import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaNhayCam.css';
import orderService from '../../../apis/orderService';

const DaNhayCam = () => {
    const [products, setProducts] = useState([]);
    const [showRoutine, setShowRoutine] = useState(true);
    const navigate = useNavigate();

    const handleFindProducts = () => {
        const productItems = [
            { id: 1, title: "Sữa rửa mặt:", name: "Nước Tẩy Trang L'Oreal Tươi Mát Cho Da Dầu, Hỗn Hợp 400ml" },
            { id: 17, title: "Toner:", name: "Nước Hoa Hồng Simple Làm Dịu Da & Cấp Ẩm 200ml Kind to Skin Soothing Facial Toner" },
            { id: 11, title: "Đặc trị:", name: "Dung Dịch Tẩy Da Chết Paula's Choice 2% BHA 30ml Skin Perfecting 2% BHA Liquid" },
            { id: 57, title: "Kem mắt:", name: "Kem Dưỡng Mắt Ngừa Lão Hóa, Giảm Quầng Thâm 30g" },
            { id: 79, title: "Kem dưỡng ẩm:", name: "Kem Dưỡng Ẩm Neutrogena Cấp Nước Cho Da Dầu 50g" },
            { id: 76, title: "Kem chống nắng:", name: "Kem Chống Nắng La Roche-Posay Kiểm Soát Dầu SPF50+ 50ml" },
            { id: 75, title: "Tẩy trang:", name: "Nước Tẩy Trang Bioderma Dành Cho Da Dầu & Hỗn Hợp 500ml" },
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

    // Thêm hàm xử lý mua combo
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
                                src="/images/danhaycam.jpg" 
                                alt="Da Nhạy Cảm" 
                                className="skin-image"
                            />
                        </Box>
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ pl: { md: 4 }, pr: { md: 2 }, py: 2 }} className="content-container">
                            <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                                🌿 Da nhạy cảm – Dịu nhẹ, giảm kích ứng 🌿
                            </Typography>

                            {showRoutine ? (
                                <Box className="routine-container">
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="list-black">
                                        🔹 Đặc điểm:
                                        <ul className="list-black">
                                            <li>Dễ bị đỏ, kích ứng khi thay đổi thời tiết hoặc dùng mỹ phẩm lạ.</li>
                                            <li>Da mỏng, dễ mất nước, hàng rào bảo vệ da yếu.</li>
                                            <li>Cần tránh sản phẩm có hương liệu, cồn, BHA mạnh.</li>
                                        </ul>
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="highlight-yellow">
                                        ✨ Buổi sáng: Bảo vệ và ngăn kích ứng
                                        <ol className="list-black">
                                            <li>Sữa rửa mặt – Dịu nhẹ, không chứa hương liệu và cồn.</li>
                                            <li>Toner – Làm dịu, giảm đỏ với chiết xuất hoa cúc hoặc lô hội.</li>
                                            <li>Đặc trị – Tinh chất rau má, B5 phục hồi da tổn thương.</li>
                                            <li>Serum – Dưỡng ẩm sâu nhưng không gây bí da.</li>
                                            <li>Kem mắt – Nhẹ nhàng, giảm sưng và quầng thâm.</li>
                                            <li>Kem dưỡng ẩm – Cấp ẩm, khóa nước, giúp da căng khỏe.</li>
                                            <li>Kem chống nắng – Dạng vật lý, không gây kích ứng.</li>
                                        </ol>
                                    </Typography>
                                    <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold' }} className="highlight-yellow">
                                        🌙 Buổi tối: Phục hồi, củng cố hàng rào bảo vệ da
                                        <ol className="list-black">
                                            <li>Tẩy trang – Dạng nước hoặc sữa, không gây kích ứng.</li>
                                            <li>Sữa rửa mặt – Dịu nhẹ, không làm mất độ ẩm tự nhiên.</li>
                                            <li>Toner – Làm dịu, giúp da hấp thụ dưỡng chất tốt hơn.</li>
                                            <li>Tẩy tế bào chết (BHA, AHA) – 1-2 lần/tuần để tránh bào mòn da.</li>
                                            <li>Đặc trị – Tinh chất ceramide, peptide giúp phục hồi da.</li>
                                            <li>Serum – Dưỡng sâu, tăng sức đề kháng cho da.</li>
                                            <li>Kem mắt – Dưỡng ẩm nhẹ nhàng, giúp da thư giãn.</li>
                                            <li>Kem dưỡng ẩm – Thành phần đơn giản, lành tính, khóa ẩm suốt đêm.</li>
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

export default DaNhayCam;
