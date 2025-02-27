
import React from 'react'; 
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaKho.css';

const DaKho = () => {
    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6}>
                        <img 
                            src="/images/dakho.jpg" 
                            alt="Da Khô" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                        💧 Da khô – Cấp ẩm chuyên sâu, ngăn ngừa lão hóa 💧
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="list-black">
                            🔹 Đặc điểm:
                            <ul className="list-black">
                                <li>Luôn cảm thấy căng, khô ráp, dễ bong tróc.</li>
                                <li>Lỗ chân lông nhỏ, ít dầu nhưng dễ xuất hiện nếp nhăn.</li>
                                <li>Da thiếu sức sống, dễ bị kích ứng khi thời tiết thay đổi.</li>
                            </ul>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
                            ✨ Buổi sáng: Da mềm mịn, tràn đầy sức sống
                            <ol className="list-black">
                                <li>Sữa rửa mặt – Dịu nhẹ, không làm mất độ ẩm tự nhiên.</li>
                                <li>Toner – Cấp nước sâu với Hyaluronic Acid.</li>
                                <li>Đặc trị – Vitamin C giúp da sáng khỏe.</li>
                                <li>Serum – Dưỡng ẩm mạnh với Hyaluronic Acid, Peptide.</li>
                                <li>Kem mắt – Ngăn ngừa nếp nhăn, chống lão hóa.</li>
                                <li>Kem dưỡng ẩm – Dưỡng sâu giúp da căng mọng.</li>
                                <li>Kem chống nắng – Dưỡng ẩm, bảo vệ da khỏi tia UV.</li>
                            </ol>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
                            🌙 Buổi tối: Phục hồi, tái tạo da
                            <ol className="list-black">
                                <li>Tẩy trang – Làm sạch nhưng không gây khô.</li>
                                <li>Sữa rửa mặt – Nhẹ nhàng, không gây kích ứng.</li>
                                <li>Toner – Dưỡng ẩm, giúp hấp thụ dưỡng chất tốt hơn.</li>
                                <li>Tẩy tế bào chết (BHA, AHA) – Làm mềm da (2 lần/tuần).</li>
                                <li>Đặc trị – Retinol giúp chống lão hóa.</li>
                                <li>Serum – Dưỡng ẩm sâu, phục hồi làn da.</li>
                                <li>Kem mắt – Dưỡng ẩm, giảm quầng thâm.</li>
                                <li>Kem dưỡng ẩm – Dưỡng sâu, khóa ẩm suốt đêm.</li>
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

export default DaKho;
