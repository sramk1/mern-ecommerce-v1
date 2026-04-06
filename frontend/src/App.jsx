import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar  from './components/Navbar.jsx';
import Footer  from './components/Footer.jsx';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';

import HomePage         from './pages/HomePage.jsx';
import ProductsPage     from './pages/ProductsPage.jsx';
import ProductDetail    from './pages/ProductDetail.jsx';
import CartPage         from './pages/CartPage.jsx';
import CheckoutPage     from './pages/CheckoutPage.jsx';
import OrderDetail      from './pages/OrderDetail.jsx';
import MyOrders         from './pages/MyOrders.jsx';
import ProfilePage      from './pages/ProfilePage.jsx';
import LoginPage        from './pages/LoginPage.jsx';
import RegisterPage     from './pages/RegisterPage.jsx';
import ForgotPassword   from './pages/ForgotPassword.jsx';
import ResetPassword    from './pages/ResetPassword.jsx';
import AdminDashboard   from './pages/admin/AdminDashboard.jsx';
import AdminProductForm from './pages/admin/AdminProductForm.jsx';
import NotFound         from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/"                    element={<HomePage />} />
            <Route path="/products"            element={<ProductsPage />} />
            <Route path="/products/:id"        element={<ProductDetail />} />
            <Route path="/cart"                element={<CartPage />} />
            <Route path="/login"               element={<LoginPage />} />
            <Route path="/register"            element={<RegisterPage />} />
            <Route path="/forgot-password"     element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected */}
            <Route path="/checkout"  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders"    element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin"                       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products/new"          element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/:id/edit"     element={<AdminRoute><AdminProductForm /></AdminRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' } }} />
    </BrowserRouter>
  );
}
