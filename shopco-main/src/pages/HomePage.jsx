import { Box } from "@mui/material";
import Header from "../components/Header";
import Banner from "../components/Banner";
import Categories from "../components/Categories";
import NewArrivals from "../components/NewArrivals";
import BrowserBySkin from "../components/BrowserBySkin";
import Footer from "../components/Footer/Footer";

export default function HomePage() {
  return (
    <Box sx={{ width: "99vw", overflowX: "hidden" }}>
      <Header />
      <Banner />
      <Categories />
      <NewArrivals />
      <BrowserBySkin />
      <Footer />
    </Box>
  );
} 