import React from 'react'; 
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer/Footer';
import './DaNhayCam.css';

const DaNhayCam = () => {
    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', overflow: 'hidden' }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6}>
                        <img 
                            src="/images/danhaycam.jpg" 
                            alt="Da Nhạy Cảm" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" gutterBottom sx={{ color: '#ffbb02', fontWeight: 'bold', textAlign: 'center' }} className="highlight-yellow">
                        🌿 Da nhạy cảm – Dịu nhẹ, giảm kích ứng 🌿
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="list-black">
                            🔹 Đặc điểm:
                            <ul className="list-black">
                                <li>Dễ bị đỏ, kích ứng khi thay đổi thời tiết hoặc dùng mỹ phẩm lạ.</li>
                                <li>Da mỏng, dễ mất nước, hàng rào bảo vệ da yếu.</li>
                                <li>Cần tránh sản phẩm có hương liệu, cồn, BHA mạnh.</li>
                            </ul>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
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
                        <Typography variant="body1" paragraph sx={{ color: '#ffbb02', fontWeight: 'bold'  }} className="highlight-yellow">
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

export default DaNhayCam;
