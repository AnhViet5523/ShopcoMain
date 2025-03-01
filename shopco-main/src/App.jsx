import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SigninPage from "./pages/SigninPage";
import MainScreen from "./pages/MainScreen";
import CategoryScreen from "./pages/Category/CategoryScreen";
import ProductDetail from "./pages/Product/ProductDetail";
import SearchResults from "./pages/Product/SearchResults";
import { Box, CssBaseline } from "@mui/material";
import CustomerSp from "./pages/CustomerSp/CustomerSp";
import Info from "./pages/Account/Info";
import Order from "./pages/Account/Order";
import CategoryContent from "./components/CategoryContent";
import DaDau from "./pages/CareProcess/DaDau/DaDau";
import DaKho from "./pages/CareProcess/DaKho/DaKho";
import DaThuong from "./pages/CareProcess/DaThuong/DaThuong";
import DaHonHop from "./pages/CareProcess/DaHonHop/DaHonHop";
import DaNhayCam from "./pages/CareProcess/DaNhayCam/DaNhayCam";
import Intro from "./pages/PagesOfFooter/Intro";
import Buy from "./pages/PagesOfFooter/Buy";
import Term from "./pages/PagesOfFooter/Term";
import PrivacyPolicy from "./pages/PagesOfFooter/Policy";
import Complaint from "./pages/PagesOfFooter/Complaint";
import Return from "./pages/PagesOfFooter/Return";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!user);
  }, []);

  // Hàm xử lý đăng nhập
  const handleSignIn = () => {
    setIsAuthenticated(true);
    localStorage.setItem("user", "logged-in");
  };

  // Hàm xử lý đăng xuất
  const handleSignOut = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainScreen onSignOut={handleSignOut} />
            ) : (
              <Box sx={{ width: "100vw", overflowX: "hidden" }}>
                <CssBaseline />
                <SigninPage onSignIn={handleSignIn} />
              </Box>
            )
          }
        />
        
        {/* Protected Routes - Chỉ truy cập được khi đã đăng nhập */}
        <Route
          path="/category"
          element={isAuthenticated ? <CategoryScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/product/:id"
          element={isAuthenticated ? <ProductDetail /> : <Navigate to="/" />}
        />
        <Route
          path="/search"
          element={<SearchResults />}
        />
        <Route
          path="/customer-support"
          element={isAuthenticated ? <CustomerSp /> : <Navigate to="/" />}
        />
        <Route
          path="/account"
          element={isAuthenticated ? <Info onSignOut={handleSignOut} /> : <Navigate to="/" />}
        />
        <Route
          path="/orders"
          element={isAuthenticated ? <Order onSignOut={handleSignOut} /> : <Navigate to="/" />}
        />
        <Route path="/categories" element={<CategoryContent />} />
        <Route path="/categories/:id" element={<CategoryContent />} />
        
        
        <Route path="/da-dau" element={<DaDau />} />
        <Route path="/da-kho" element={<DaKho />} />
        <Route path="/da-thuong" element={<DaThuong />} />
        <Route path="/da-hon-hop" element={<DaHonHop />} />
        <Route path="/da-nhay-cam" element={<DaNhayCam />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/term" element={<Term />} />
        <Route path="/policy" element={<PrivacyPolicy />} />
        <Route path="/complaint" element={<Complaint />} />
        <Route path="/return" element={<Return />} />
      </Routes>
    </BrowserRouter>
  );
}