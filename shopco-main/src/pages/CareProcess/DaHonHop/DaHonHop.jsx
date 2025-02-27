import React from 'react'; 
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaHonHop.css';

const DaHonHop = () => {
    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6}>
                        <img 
                            src="/images/dahonhop.jpg" 
                            alt="Da Hỗn Hợp" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                        🍀 Da hỗn hợp – Kiểm soát dầu, dưỡng ẩm vùng khô 🍀
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="list-black">
                            🔹 Đặc điểm:
                            <ul className="list-black">
                                <li>Vùng chữ T (trán, mũi, cằm) dầu, nhưng hai bên má lại khô.</li>
                                <li>Dễ bị bít tắc lỗ chân lông ở vùng dầu, bong tróc ở vùng khô.</li>
                                <li>Cần chăm sóc theo từng vùng da riêng biệt.</li>
                            </ul>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
                            ✨ Buổi sáng: Cân bằng da hoàn hảo
                            <ol className="list-black">
                                <li>Sữa rửa mặt – Nhẹ nhàng, không gây khô.</li>
                                <li>Toner – Dưỡng ẩm vùng khô, kiềm dầu vùng chữ T.</li>
                                <li>Đặc trị – Niacinamide giúp kiểm soát dầu.</li>
                                <li>Serum – Cấp ẩm nhưng không gây nhờn dính.</li>
                                <li>Kem mắt – Giữ vùng mắt căng mịn.</li>
                                <li>Kem dưỡng ẩm – Gel cho vùng dầu, kem cho vùng khô.</li>
                                <li>Kem chống nắng – Kiểm soát dầu, thấm nhanh.</li>
                            </ol>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
                            🌙 Buổi tối: Dưỡng da từng vùng thông minh
                            <ol className="list-black">
                                <li>Tẩy trang – Loại bỏ bụi bẩn, dầu thừa.</li>
                                <li>Sữa rửa mặt – Sạch sâu nhưng không khô căng.</li>
                                <li>Toner – Cân bằng dầu và độ ẩm.</li>
                                <li>Tẩy tế bào chết (BHA, AHA) – 2 lần/tuần.</li>
                                <li>Đặc trị – Trị dầu vùng chữ T, dưỡng ẩm vùng má.</li>
                                <li>Serum – Giúp da đều màu, khỏe mạnh.</li>
                                <li>Kem mắt – Ngăn quầng thâm, lão hóa.</li>
                                <li>8.	Kem dưỡng ẩm/dầu dưỡng – Dưỡng sâu vùng khô.</li>
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

export default DaHonHop;
