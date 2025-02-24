import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';

const CategoryPage = () => {
  const { categorySlug } = useParams();

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>
        {/* Chuyển đổi slug thành tên hiển thị */}
        {categorySlug.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </Typography>
      {/* Thêm nội dung trang category ở đây */}
    </Container>
  );
};

export default CategoryPage; 