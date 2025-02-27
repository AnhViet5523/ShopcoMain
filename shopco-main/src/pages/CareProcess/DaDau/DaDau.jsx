 import React from 'react'; 
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaDau.css';

const DaDau = () => {
    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6}>
                        <img 
                            src="/images/dadau.jpg" 
                            alt="Da Dầu" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                            🌿 Da dầu – Kiềm dầu, ngăn ngừa mụn 🌿
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="list-black">
                            🔹 Đặc điểm:
                            <ul className="list-black">
                                <li>Lỗ chân lông to, da bóng nhờn, dễ nổi mụn.</li>
                                <li>Dễ bám bụi bẩn và bít tắc lỗ chân lông.</li>
                                <li>Da đổ dầu nhiều nhất ở vùng chữ T (trán, mũi, cằm).</li>
                            </ul>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
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
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
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
                        <Button 
                            variant="contained" 
                            sx={{ bgcolor: '#ffbb02', color: 'white', mt: 2 }}
                        >
                           Tìm Sản Phẩm Phù Hợp
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Footer />
        </>
    );
};

export default DaDau;
