import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ChatWidget } from "./components/chat/ChatWidget";
import { MobileNavBar } from "./components/layout/MobileNavBar";

// Public Pages
import { HomePage } from "./pages/public/HomePage";
import { ProductListPage } from "./pages/public/ProductListPage";
import { ProductDetailPage } from "./pages/public/ProductDetailPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import { CartPage } from "./pages/public/CartPage";
import { CheckoutPage } from "./pages/public/CheckoutPage";
import { TermsPage } from "./pages/public/TermsPage";
import { ForgotPasswordPage } from "./pages/public/ForgotPasswordPage";

// Member Pages
import { OrderHistoryPage } from "./pages/member/OrderHistoryPage";
import { ProfilePage } from "./pages/member/ProfilePage";
import { WishlistPage } from "./pages/member/WishlistPage";
import { MessagesPage } from "./pages/member/MessagesPage";

// Admin Pages
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminAllocationPage } from "./pages/admin/AdminAllocationPage";
import { AdminProxyOrderPage } from "./pages/admin/AdminProxyOrderPage";
import { AdminMembersPage } from "./pages/admin/AdminMembersPage";
import { AdminBroadcastPage } from "./pages/admin/AdminBroadcastPage";
import { AdminFinancePage } from "./pages/admin/AdminFinancePage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";

// Public Storefront Layout
function StorefrontLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AnnouncementBar />
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <MobileNavBar />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Storefront & Member Routes */}
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Member Dashboard */}
        <Route path="/member/orders" element={<OrderHistoryPage />} />
        <Route path="/member/account" element={<ProfilePage />} />
        <Route path="/member/profile" element={<ProfilePage />} />
        <Route path="/member/wishlist" element={<WishlistPage />} />
        <Route path="/member/messages" element={<MessagesPage />} />
      </Route>

      {/* Admin Panel Layout & Nested Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="allocation" element={<AdminAllocationPage />} />
        <Route path="proxy-order" element={<AdminProxyOrderPage />} />
        <Route path="members" element={<AdminMembersPage />} />
        <Route path="broadcast" element={<AdminBroadcastPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
}
