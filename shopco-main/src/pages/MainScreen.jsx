import { Box, Divider } from "@mui/material";
import Header from "../components/Header"
import Banner from "../components/Banner";
import Categories from "../components/Categories";
import NewArrivals from "../components/NewArrivals";
import TopSelling from "../components/TopSelling";
import BrowserBySkin from "../components/BrowserBySkin";
import Footer from "../components/Footer/Footer";

const products = [
    { id: 1, name: "Kem Nền Căng Bóng Mỏng", image: "/foundation.jpg", price: 120, rating: 4.5 },
    { id: 2, name: "Serum Top White Perfect D6", image: "/serum.jpg", price: 240, oldPrice: 260, rating: 3.5, discount: 20 },
    { id: 3, name: "Top White Perfect D6", image: "/top-white.jpg", price: 180, rating: 4.5 },
    { id: 4, name: "NOREVA SENSIDIANE SOOTHING SERUM", image: "/noreva.jpg", price: 130, oldPrice: 160, rating: 3.5, discount: 30 },
];

export default function MainScreen() {
  return (
    <Box sx={{ width: "99vw", overflowX: "hidden" }}>
      <Header />
      <Banner />
      <Categories />
      <NewArrivals products={products} />
      <Divider sx={{ mx: 10, my: 3 }} />
      <TopSelling products={products} />
      <Divider sx={{ mx: 10, my: 3 }} />
      <BrowserBySkin />
      <Footer />
    </Box>
  );
}
