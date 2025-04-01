import { Container, Grid, Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import productService from "../apis/productService";
import { useEffect, useState, useRef } from "react";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const requestInProgress = useRef(false);

  useEffect(() => {
    // Đánh dấu component đã mount
    isMounted.current = true;
    
    // Chỉ fetch dữ liệu nếu chưa có yêu cầu đang xử lý
    if (!requestInProgress.current) {
      fetchProducts();
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProducts = async () => {
    // Nếu đã có yêu cầu đang xử lý, không gửi yêu cầu mới
    if (requestInProgress.current) return;
    
    // Đánh dấu đang có yêu cầu đang xử lý
    requestInProgress.current = true;
    
    try {
      setLoading(true);
      console.log('Fetching all products...');
      
      const response = await productService.getAllProducts();
      
      // Kiểm tra xem component còn mounted không trước khi cập nhật state
      if (!isMounted.current) return;
      
      console.log('API Response:', response);
      
      // Xử lý dữ liệu trả về
      let _products = [];
      if (response && response.$values) {
        _products = response.$values;
      } else if (Array.isArray(response)) {
        _products = response;
      } else if (response && response.data) {
        _products = Array.isArray(response.data) ? response.data : [response.data];
      }

      // Xử lý ảnh cho mỗi sản phẩm
      _products = _products.map(product => {
        // Nếu sản phẩm đã có ảnh từ API
        if (product.images && product.images.length > 0) {
          console.log(`Xử lý ảnh cho sản phẩm ID: ${product.productId}, tên: ${product.productName || 'Unknown'}`);
          
          // Kiểm tra xem có ảnh nào được đánh dấu là ảnh đại diện (isMainImage = true) không
          let mainImage = product.images.find(img => img.isMainImage === true);
          
          // Nếu không tìm thấy ảnh đại diện bằng isMainImage, tìm ảnh có displayOrder = 0
          if (!mainImage) {
            mainImage = product.images.find(img => img.displayOrder === 0);
            if (mainImage) {
              console.log(`Product ${product.productId}: Không tìm thấy ảnh có isMainImage=true, nhưng tìm thấy ảnh với displayOrder=0, ID: ${mainImage.imageID}`);
            }
          } else {
            console.log(`Product ${product.productId} (${product.productName || 'Unknown'}): Found main image with isMainImage=true, ID: ${mainImage.imageID}`);
          }
          
          // Nếu tìm thấy ảnh đại diện, sử dụng ảnh đó
          if (mainImage) {
            return {
              ...product,
              mainImage: mainImage.imgUrl || mainImage.imageUrl || '/images/default-product.jpg',
              images: product.images
            };
          }
          
          // Nếu không tìm thấy ảnh đại diện, sắp xếp theo displayOrder và lấy ảnh đầu tiên
          const sortedImages = [...product.images].sort((a, b) => {
            // Nếu cả hai ảnh đều có displayOrder, sắp xếp theo displayOrder
            if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
              return a.displayOrder - b.displayOrder;
            }
            // Nếu chỉ a có displayOrder, a sẽ được ưu tiên
            if (a.displayOrder !== undefined) return -1;
            // Nếu chỉ b có displayOrder, b sẽ được ưu tiên
            if (b.displayOrder !== undefined) return 1;
            // Nếu không có displayOrder, giữ nguyên thứ tự
            return 0;
          });
          
          // Log thông tin về ảnh đã sắp xếp
          if (product.productId) {
            console.log(`Product ${product.productId} (${product.productName || 'Unknown'}): No main image found. Sorted ${sortedImages.length} images by displayOrder`);
            if (sortedImages.length > 0) {
              console.log(`Using image with displayOrder: ${sortedImages[0].displayOrder !== undefined ? sortedImages[0].displayOrder : 'Not set'} as main image`);
            }
          }
          
          // Lấy ảnh đầu tiên sau khi sắp xếp làm ảnh đại diện
          const mainImageUrl = sortedImages[0]?.imgUrl || sortedImages[0]?.imageUrl;
          
          return {
            ...product,
            mainImage: mainImageUrl || '/images/default-product.jpg',
            images: sortedImages
          };
        }
        // Nếu sản phẩm có imgURL
        else if (product.imgURL) {
          return {
            ...product,
            mainImage: product.imgURL,
            images: [{ imgUrl: product.imgURL }]
          };
        }
        // Nếu không có ảnh, sử dụng ảnh mặc định
        return {
          ...product,
          mainImage: '/images/default-product.jpg', // Thay đổi đường dẫn ảnh mặc định của bạn
          images: []
        };
      });
      
      // Lấy điểm đánh giá trung bình cho mỗi sản phẩm
      const productsWithRatings = await Promise.all(
        _products.map(async (product) => {
          const { averageRating, totalReviews } = await productService.getProductAverageRating(product.productId);
          return {
            ...product,
            rating: averageRating,
            ratingCount: totalReviews,
          };
        })
      );
      
      setProducts(productsWithRatings);
      console.log(`Loaded ${productsWithRatings.length} products successfully`);
    } catch (error) {
      // Bỏ qua lỗi CanceledError
      if (error.name === 'CanceledError') {
        console.log('Request was canceled:', error.message);
      } else {
        console.error('Error fetching products:', error);
        if (isMounted.current) {
          setError(error.message || 'Failed to fetch products');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      // Đánh dấu không còn yêu cầu đang xử lý
      requestInProgress.current = false;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Container sx={{ py: 5, maxWidth: "100%" }}>
      <Typography variant="h2" fontWeight="bold" style={{color:"black", fontFamily:"inherit"}} textAlign="center">SẢN PHẨM</Typography>
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {products && products.length > 0 ? (
          products.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id || product.productId || `product-${Math.random()}`}>
              <ProductCard 
                product={{
                  ...product,
                  image: product.mainImage, // Đảm bảo ProductCard nhận được ảnh
                  images: product.images || []
                }} 
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center">Không có sản phẩm nào</Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}