import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Rating, 
  Button, 
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { Home as HomeIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import productService from '../../apis/productService';

export default function ProductDetail() {
  const { id } = useParams();
  console.log("Product ID: ", id);
  const [quantity, setQuantity] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      const fetchedProduct = await productService.getProductById(id);
      console.log("Product by Id: ", fetchedProduct);

      setProduct(fetchedProduct);
      setLoading(false);
    };

    fetchProduct();

  }, [id]);

//   {
//     "productId": 2,
//     "productCode": "LSD002",
//     "categoryId": 1,
//     "productName": "Nước Tẩy Trang Bioderma Dành Cho Da Nhạy Cảm 500ml",
//     "quantity": 10,
//     "capacity": "110ml, 250ml, 500ml",
//     "price": 525000,
//     "brand": "Bioderma",
//     "origin": "Pháp",
//     "status": "Available",
//     "imgUrl": "2",
//     "skinType": "Da nhạy cảm",
//     "description": "Dành Cho Da Nhạy Cảm Bioderma Sensibio H2O là sản phẩm nước tẩy trang công nghệ Micellar đầu tiên trên thế giới, do thương hiệu dược mỹ phẩm Bioderma nổi tiếng của Pháp phát minh. Dung dịch giúp làm sạch sâu da và loại bỏ lớp trang điểm nhanh chóng mà không cần rửa lại bằng nước. Công thức dịu nhẹ, không kích ứng, không gây khô căng da, đặc biệt phù hợp với làn da nhạy cảm  HSD: ~3 năm (chưa mở), ~6-12 tháng (sau khi mở)",
//     "ingredients": "NULL\"1. Nước Tẩy Trang Bioderma Dành Cho Da Nhạy Cảm\r\n- Thành phần chính: Công nghệ Micellar: Các hạt micelle, có thành phần được lấy cảm hứng từ lipid của da, là những hạt làm sạch vô hình siêu nhỏ. Chúng có khả năng thu giữ các tạp chất trong khi vẫn duy trì lớp màng bảo vệ tự nhiên của da.\r\n- Sáng chế D.A.F: Các tác động từ bên ngoài có thể làm cho da trở nên kích ứng và nhạy cảm. Hợp chất này giúp làm tăng khả năng dung nạp của làn da - bất kể đối với loại da nào - nhằm tăng cường sức đề kháng cho da.\r\n- Thành phần chi tiết: Aqua/Water/Eau, Peg-6 Caprylic/Capric Glycerides, Fructooligosaccharides, Mannitol, Xylitol, Rhamnose, Cucumis Sativus (Cucumber) Fruit Extract, Propylene Glycol, Cetrimonium Bromide, Disodium Edta. [Bi 446]\r\n\r\n2. Nước Tẩy Trang Bioderma Dành Cho Da Dầu & Hỗn Hợp\r\n - Thành phần chính: Công nghệ Micellar: Các hạt micelle, có thành phần được lấy cảm hứng từ lipid của da, là những hạt làm sạch vô hình siêu nhỏ. Chúng có khả năng thu giữ các tạp chất trong khi vẫn duy trì lớp màng bảo vệ tự nhiên của da.\r\n- Sáng chế D.A.F: Các tác động từ bên ngoài có thể làm cho da trở nên kích ứng và nhạy cảm. Hợp chất này giúp làm tăng khả năng dung nạp của làn da - bất kể đối với loại da nào - nhằm tăng cường sức đề kháng cho da.\r\n- Thành phần đầy đủ: Water (Aqua), Peg-6 Caprylic/Capric Glycerides, Sodium Citrate , Zinc Gluconate, Copper Sulfate, Ginkgo Biloba Extract – Chiết Xuất Lá Bạch Quả, Mannitol, Xylitol, Rhamnose, Fructooligosaccharides, Propylene Glycol, Citric Acid, Disodium Edta, Cetrimonium Bromide, Fragrance (Parfum).\"",
//     "usageInstructions": "\"- Thấm nước tẩy trang lên bông tẩy trang.\n- Nhẹ nhàng làm sạch vùng mặt và mắt.\n- Không cần rửa lại với nước.\n- Sử dụng vào hằng ngày để làm sạch da.\"",
//     "manufactureDate": "2024-03-26T00:00:00",
//     "category": null,
//     "orderItems": [],
//     "promotions": [],
//     "reviews": []
// }
console.log("Product: ", product);
console.log("loading",loading);

  if (loading) {
    return <Typography>Đang tải sản phẩm...</Typography>;
  }

  if (!product) {
    return <Typography>Không tìm thấy sản phẩm</Typography>;
  }

  return (
    <>
      <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            <HomeIcon />
          </Link>
          <Link color="inherit" href="/category">
            Danh Mục
          </Link>
          <Typography color="textPrimary">{product?.productName}</Typography>
        </Breadcrumbs>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              {product?.images?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={product.productName}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4">{product?.productName}</Typography>
            <Typography variant="h5" color="secondary">
              {product?.discountedPrice}đ
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Giá gốc: {product?.originalPrice}đ
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tiết kiệm: {product?.savings}đ
            </Typography>
            <Box display="flex" alignItems="center" gap={20}>
              <IconButton onClick={() => setQuantity(quantity - 1)}>
                <RemoveIcon />
              </IconButton>
              <Typography>{quantity}</Typography>
              <IconButton onClick={() => setQuantity(quantity + 1)}>
                <AddIcon />
              </IconButton>
            </Box>
            <Box display={"flex"} gap={2} alignItems={"center"}>
            <Button variant="contained" color="primary">
              Mua Ngay
            </Button>
            <Button variant="outlined" color="primary">
              Thêm vào giỏ
            </Button>
            </Box>
          </Grid>
        </Grid>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Thành Phần" />
          <Tab label="Đánh giá" />
          <Tab label="Cách dùng" />
        </Tabs>
        <Box>
          {tabValue === 0 && <Box style={{
            padding: '20px',
          }} >
            <Typography>{product?.description}</Typography>
            <Typography>{product?.ingredients}</Typography>
          </Box>
            }
          {tabValue === 1 && <Box style={{
            padding: '20px',
          }} >
            {product?.reviews?.map((review, index) => (
              <Paper key={index} style={{ padding: '20px', marginBottom: '10px' }}>
                <Typography>{review.content}</Typography>
                <Rating value={review.rating} readOnly />
              </Paper>
            ))}
            {
              product?.reviews.length === 0 && <Typography>Chưa có đánh giá nào</Typography>
            }
            </Box>
            }
          {tabValue === 2 && <Box style={{
            padding: '20px',
          }}>
            <Typography>{product?.usageInstructions}</Typography>
            </Box>
            }
        </Box>
        <Typography variant="h6">Sản phẩm liên quan</Typography>
        <Grid container spacing={2}>
          {product?.relatedProducts?.map((related, index) => (
            <Grid item key={index} xs={12} md={3}>
              <img src={related.image} alt={related.name} style={{ width: '100%' }} />
              <Typography>{related.name}</Typography>
              <Typography>{related.price}đ</Typography>
            </Grid>
          ))}
        </Grid>
        <Box mt={4}>
          <Typography variant="h6">BEAUTY COSMETICS</Typography>
          <Typography>Địa Chỉ: Khu công nghệ cao - quận 9</Typography>
          <Typography>Điện thoại: 09565497</Typography>
          <Typography>Email: beautycosmetics@gmail.vn</Typography>
        </Box>
      </Container>
    </>
  );
} 