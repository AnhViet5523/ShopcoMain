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
  const [selectedImage, setSelectedImage] = useState(0);
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

  }, []);

  if (loading) {
    return <Typography>Đang tải sản phẩm...</Typography>;
  }

  if (!product) {
    return <Typography>Không tìm thấy sản phẩm</Typography>;
  }

  return (
    <>
      <Header />
<h1>{product.productName}</h1>


      
      <Footer />
    </>
  );
} 