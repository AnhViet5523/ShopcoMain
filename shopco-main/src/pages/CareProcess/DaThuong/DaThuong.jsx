
import React from 'react'; 
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaThuong.css';

const DaThuong = () => {
    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6}>
                        <img 
                            src="/images/dathuong.webp" 
                            alt="Da Thường" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                        🌸 Da thường – Duy trì sự cân bằng tự nhiên 🌸
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="list-black">
                            🔹 Đặc điểm:
                            <ul className="list-black">
                                <li>Không quá khô, không quá dầu, kết cấu da mịn màng.</li>
                                <li>Ít mụn, ít nhạy cảm, dễ thích nghi với nhiều loại mỹ phẩm.</li>
                                <li>Chỉ cần duy trì độ ẩm và bảo vệ da hằng ngày.</li>
                            </ul>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
                            ✨ Buổi sáng: Da căng bóng, rạng rỡ cả ngày
                            <ol className="list-black">
                                <li>Sữa rửa mặt – Nhẹ nhàng, không gây kích ứng. </li>
                                <li>Toner – Cấp ẩm và cân bằng pH.</li>
                                <li>Đặc trị – Vitamin C giúp sáng da.</li>
                                <li>Serum – Dưỡng ẩm, giúp da đàn hồi.</li>
                                <li>Kem mắt – Dưỡng ẩm, giảm thâm quầng mắt.</li>
                                <li>Kem dưỡng ẩm – Giữ da mềm mịn, đủ ẩm.</li>
                                <li>Kem chống nắng – Bảo vệ khỏi tia UV.</li>
                            </ol>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
                            🌙 Buổi tối: Nuôi dưỡng làn da từ bên trong
                            <ol className="list-black">
                                <li>Tẩy trang – Loại bỏ bụi bẩn, dầu thừa.</li>
                                <li>Sữa rửa mặt – Làm sạch mà không làm khô.</li>
                                <li>Toner – Giúp hấp thụ dưỡng chất tốt hơn.</li>
                                <li>Tẩy tế bào chết (BHA, AHA) – 2 lần/tuần.</li>
                                <li>Đặc trị – Retinol giúp trẻ hóa làn da.</li>
                                <li>Serum – Cung cấp độ ẩm, phục hồi da.</li>
                                <li>Kem mắt – Ngăn ngừa lão hóa.</li>
                                <li>Kem dưỡng ẩm – Giữ da căng bóng suốt đêm.</li>
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

export default DaThuong;
