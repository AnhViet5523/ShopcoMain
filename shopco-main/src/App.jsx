import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SigninPage from "./pages/SigninPage";
import MainScreen from "./pages/MainScreen";
import CategoryScreen from "./pages/Category/CategoryScreen";
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
import Cart from "./pages/Cart/Cart";
import ProductScreen from "./pages/Product/ProductScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import BrandProducts from "./components/BrandProducts";
import BlogPage from "./pages/Blog/BlogPage";
import Blog1 from "./pages/Blog/blog1";
import Blog2 from "./pages/Blog/blog2";
import Blog3 from "./pages/Blog/blog3";
import Blog4 from "./pages/Blog/blog4";
import Blog5 from "./pages/Blog/blog5";
import Blog6 from "./pages/Blog/blog6";

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
        {/* Public Routes - Ai cũng truy cập được */}
        <Route
          path="/"
          element={<MainScreen onSignOut={handleSignOut} />}
        />
        <Route path="/product/:id" element={<ProductScreen />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category" element={<CategoryScreen />} />
        <Route path="/categories" element={<CategoryContent />} />
        <Route path="/categories/:id" element={<CategoryContent />} />
        <Route path="/brand/:brandName" element={<BrandProducts />} />
        
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog1" element={<Blog1 />} />
        <Route path="/blog2" element={<Blog2 />} />
        <Route path="/blog3" element={<Blog3 />} />
        <Route path="/blog4" element={<Blog4 />} />
        <Route path="/blog5" element={<Blog5 />} />
        <Route path="/blog6" element={<Blog6 />} />

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
        
        {/* Auth Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <SigninPage onSignIn={handleSignIn} />
        } />
        
        {/* Protected Routes - Chỉ truy cập được khi đã đăng nhập */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-support"
          element={
            <ProtectedRoute>
              <CustomerSp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Info onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Order onSignOut={handleSignOut} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}