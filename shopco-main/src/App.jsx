import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SigninPage from "./pages/SigninPage";
import MainScreen from "./pages/MainScreen";
import CategoryScreen from "./pages/CategoryScreen";
import { Box, CssBaseline } from "@mui/material";
import ProductScreen from "./pages/Product/ProductScreen";
import CustomerSp from "./pages/CustomerSp/CustomerSp";
import Info from "./pages/Account/Info";
import Order from "./pages/Account/Order";
import CategoryContent from "./components/CategoryContent";

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
          element={isAuthenticated ? <ProductScreen /> : <Navigate to="/" />}
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
      </Routes>
    </BrowserRouter>
  );
}