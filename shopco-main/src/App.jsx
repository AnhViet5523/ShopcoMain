import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import SigninPage from "./pages/SigninPage";
import MainScreen from "./pages/MainScreen";
import CategoryScreen from "./pages/Category/CategoryScreen";
import SearchResults from "./pages/Product/SearchResults";
import { CssBaseline } from "@mui/material";
import CustomerSp from "./pages/CustomerSp/CustomerSp";
import Info from "./pages/Account/Info";
import Order from "./pages/Account/Order";
import Support from "./pages/Account/Support";  
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
import CompareProducts from "./pages/Product/CompareProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import userService from "./apis/userService";
import axiosClient from "./apis/axiosClient";
import ErrorBoundary from "./components/ErrorBoundary";
import BrandProducts from "./components/BrandProducts";
import BlogPage from "./pages/Blog/BlogPage";
import BlogDetail from "./pages/Blog/BlogDetail";
import QuizTest from "./pages/Quiz/QuizTest";
import Checkout from "./pages/checkout/checkout";
import ViewOrder from "./pages/Manager/ViewOrder";
import Product from "./pages/Manager/Product";
import Revenue from "./pages/Manager/revenue";
import Staff from "./pages/Manager/staff";
import ViewCustomer from "./pages/Manager/ViewCustomer";
import ViewSupport from "./pages/Manager/ViewSupport";
import Voucher from "./pages/Manager/Voucher";
import Feedback from "./pages/Manager/Feedback";
import OrderStaff from "./pages/Staff/OrderStaff";
import CustomerStaff from "./pages/Staff/CustomerStaff";
import ProductStaff from "./pages/Staff/ProductStaff";
import FeedbackStaff from "./pages/Staff/FeedbackStaff";
import SupportStaff from "./pages/Staff/SupportStaff";
import VoucherStaff from "./pages/Staff/VoucherStaff";
import Unauthorized from "./components/Unauthorized";
import PaymentResult from "./pages/PaymentResult";

import BestSellers from "./components/BestSellers";
import BlogManager from "./pages/Manager/BlogManager";
import BlogStaff from "./pages/Staff/BlogStaff";
import CompareProducts from "./pages/Product/CompareProducts";

// Component để hủy request khi chuyển trang
function NavigationHandler() {
  const location = useLocation();
  
  useEffect(() => {
    // Hủy tất cả request khi chuyển trang
    return () => {
      axiosClient.cancelAllRequests();
    };
  }, [location.pathname]);
  
  return null;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = userService.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        // Hiển thị thông tin người dùng trong console để debug
        if (isAuth) {
          const user = userService.getCurrentUser();
          console.log("Current user in App:", user);
          
          if (user && user.role) {
            console.log("User role in App:", user.role);
            console.log("Normalized role:", String(user.role).trim().toLowerCase());
          } else {
            console.warn("User is authenticated but role is missing");
          }
        }
      } catch (error) {
        console.error("Error checking authentication in App:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    
    // Hủy tất cả request khi component unmount
    return () => {
      window.removeEventListener("storage", checkAuth);
      axiosClient.cancelAllRequests();
    };
  }, []);

  const handleSignIn = () => {
    // Kiểm tra lại thông tin người dùng sau khi đăng nhập
    const user = userService.getCurrentUser();
    console.log("User after sign in:", user);
    
    if (user && user.role) {
      console.log("User role after sign in:", user.role);
    }
    
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    userService.logout();
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {/* Component để hủy request khi chuyển trang */}
        <NavigationHandler />
        <CssBaseline />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainScreen onSignOut={handleSignOut} />} />
          <Route path="/product/:id" element={<ProductScreen />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/category" element={<CategoryScreen />} />
          <Route path="/categories" element={<CategoryContent />} />
          <Route path="/categories/:id" element={<CategoryContent />} />
          <Route path="/brand/:brandName" element={<BrandProducts />} />
          <Route path="/quiz" element={<QuizTest />} />
          
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/bestsellers" element={<BestSellers />} />

          {/* Static Pages */}
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
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <SigninPage onSignIn={handleSignIn} />
              )
            }
          />

          {/* Protected Routes cho người dùng đã đăng nhập */}
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
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support onSignOut={handleSignOut} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/checkout/:orderId" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes cho Manager */}
          <Route
            path="/viewOrder"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ViewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Product />
              </ProtectedRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Revenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewCustomer"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ViewCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewSupport"
            element={
              <ProtectedRoute requiredRole="Manager">
                <ViewSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voucher"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Voucher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute requiredRole="Manager">
                <Feedback />
              </ProtectedRoute>
            }
          />

          <Route
            path="/blogManager"
            element={
              <ProtectedRoute requiredRole="Manager">
                <BlogManager />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes cho Staff */}
          <Route
            path="/blogStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <BlogStaff />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orderStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <OrderStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customerStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <CustomerStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <ProductStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedbackStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <FeedbackStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supportStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <SupportStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voucherStaff"
            element={
              <ProtectedRoute requiredRole="Staff">
                <VoucherStaff />
              </ProtectedRoute>
            }
          />

          {/* Thêm route cho trang kết quả thanh toán */}
          <Route 
            path="/payment-result" 
            element={
              <ProtectedRoute>
                <PaymentResult />
              </ProtectedRoute>
            } 
          />

          <Route path="/compare-products" element={<CompareProducts />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
