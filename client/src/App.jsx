import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './Layout';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import Orders from './pages/Orders';

// Admin imports
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';
import AdminProductForm from './admin/AdminProductForm';
import AdminCategories from './admin/AdminCategories';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders/:orderNumber" element={<OrderTracking />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<Orders />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
